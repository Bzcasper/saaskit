// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { YTMusic } from "@/utils/music_client.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import { generateCacheKey, getOrSetCache } from "@/utils/cache.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/top/tracks?limit=50
 * Get top tracks from YouTube Music charts
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

      const cacheKey = generateCacheKey("top-tracks", { limit: limit.toString() });

      const tracks = await getOrSetCache(
        cacheKey,
        async () => await ytmusic.getTopTracks(limit),
        { ttl: 3600 }, // 1 hour
      );

      if (!tracks || tracks.length === 0) {
        const response = errorResponse("NOT_FOUND", "No top tracks found");
        return toJson(response, 404);
      }

      const response = successResponse({
        trackCount: tracks.length,
        tracks,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
