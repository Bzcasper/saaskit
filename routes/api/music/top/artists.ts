// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { YTMusic } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import { generateCacheKey, getOrSetCache } from "@/utils/cache.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/top/artists?limit=50
 * Get top artists from YouTube Music charts
 */
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "50");

      if (limit < 1 || limit > 100) {
        const response = errorResponse(
          "INVALID_PARAM",
          "Limit must be between 1 and 100",
        );
        return toJson(response, 400);
      }

      const cacheKey = generateCacheKey("top-artists", {
        limit: limit.toString(),
      });

      const artists = await getOrSetCache(
        cacheKey,
        async () => await ytmusic.getTopArtists(limit),
        { ttl: 3600 }, // 1 hour
      );

      if (!artists || artists.length === 0) {
        const response = errorResponse("NOT_FOUND", "No top artists found");
        return toJson(response, 404);
      }

      const response = successResponse({
        artistCount: artists.length,
        artists,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
