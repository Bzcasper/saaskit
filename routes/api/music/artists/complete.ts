// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { getArtistComplete } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import { generateCacheKey, getOrSetCache } from "@/utils/cache.ts";
import type { RouteContext } from "$fresh/server.ts";

/**
 * GET /api/music/artists/complete
 * Get complete artist information with full discography
 * Query params: artist
 */
export default async function handler(req: Request, ctx: RouteContext) {
  try {
    const url = new URL(req.url);
    const artist = url.searchParams.get("artist");

    if (!artist) {
      const response = errorResponse(
        "MISSING_PARAM",
        "artist parameter required",
      );
      return toJson(response, 400);
    }

    const cacheKey = generateCacheKey("artists-complete", { artist });

    const artistData = await getOrSetCache(
      cacheKey,
      async () => await getArtistComplete(artist),
      { ttl: 7200 }, // 2 hours
    );

    if (!artistData.success) {
      const response = errorResponse("NOT_FOUND", "Artist not found");
      return toJson(response, 404);
    }

    const response = successResponse(artistData);
    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}
