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
 * GET /api/music/trending?country=US
 * Get trending music by country
 */
export const handler: Handlers = {
  async GET(req) {
  try {
    const url = new URL(req.url);
    const country = url.searchParams.get("country") || "US";

    // Validate country code (2-letter ISO)
    if (country.length !== 2 || !/^[A-Z]{2}$/.test(country.toUpperCase())) {
      const response = errorResponse(
        "INVALID_PARAM",
        "Country must be a 2-letter ISO country code (e.g., US, GB, CA)",
      );
      return toJson(response, 400);
    }

    const cacheKey = generateCacheKey("trending", { country: country.toUpperCase() });

    const trending = await getOrSetCache(
      cacheKey,
      async () => await ytmusic.getTrendingMusic(country.toUpperCase()),
      { ttl: 1800 }, // 30 minutes
    );

    if (!trending || trending.length === 0) {
      const response = errorResponse("NOT_FOUND", "No trending music found");
      return toJson(response, 404);
    }

    const response = successResponse({
      country: country.toUpperCase(),
      trackCount: trending.length,
      tracks: trending,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
  },
};