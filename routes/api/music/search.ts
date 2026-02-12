// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { YTMusic } from "@/utils/music_client.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import { logSearch } from "@/utils/music_models.ts";
import { generateCacheKey, getOrSetCache } from "@/utils/cache.ts";
import type { Handlers } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/search
 * Search for songs, albums, artists
 * Query params: q, filter (songs|albums|artists), region, language, continuationToken
 */
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q");
      const filter = url.searchParams.get("filter");
      const continuationToken = url.searchParams.get("continuationToken");
      const region = url.searchParams.get("region") ?? undefined;
      const language = url.searchParams.get("language") ?? undefined;

      if (!query && !continuationToken) {
        const response = errorResponse(
          "MISSING_PARAM",
          "Query parameter 'q' is required",
        );
        return toJson(response, 400);
      }

      // Only cache if no continuation token (first page results)
      let results;
      if (!continuationToken) {
        const cacheKey = generateCacheKey("search", {
          q: query ?? undefined,
          filter: filter ?? undefined,
          region,
          language,
        });

        results = await getOrSetCache(
          cacheKey,
          async () => await ytmusic.search(
            query || "",
            filter || undefined,
            undefined, // no continuation for cached results
            false,
            region || undefined,
            language || undefined,
          ),
          { ttl: 600 }, // 10 minutes
        );
      } else {
        // For continuation requests, don't cache
        results = await ytmusic.search(
          query || "",
          filter || undefined,
          continuationToken || undefined,
          false,
          region || undefined,
          language || undefined,
        );
      }

      // Log search for analytics
      if (query) {
        await logSearch(query, filter || undefined, results.results?.length || 0, "anonymous").catch(
          () => null,
        );
      }

      const response = successResponse({
        query,
        filter,
        region,
        language,
        resultCount: results.results?.length || 0,
        results: results.results || [],
        continuationToken: results.continuationToken,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
