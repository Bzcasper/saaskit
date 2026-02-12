// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { getAlbumComplete } from "@/utils/music_client.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import { generateCacheKey, getOrSetCache } from "@/utils/cache.ts";
import type { RouteContext } from "$fresh/server.ts";

/**
 * GET /api/music/albums/complete
 * Get complete album information with all tracks enhanced with metadata
 * Query params: browseId
 */
export default async function handler(req: Request, ctx: RouteContext) {
  try {
    const url = new URL(req.url);
    const browseId = url.searchParams.get("browseId");

    if (!browseId) {
      const response = errorResponse(
        "MISSING_PARAM",
        "browseId parameter required",
      );
      return toJson(response, 400);
    }

    const cacheKey = generateCacheKey("albums-complete", { browseId });

    const albumData = await getOrSetCache(
      cacheKey,
      async () => await getAlbumComplete(browseId),
      { ttl: 7200 }, // 2 hours
    );

    if (!albumData.success) {
      const response = errorResponse("NOT_FOUND", albumData.error || "Album not found");
      return toJson(response, 404);
    }

    const response = successResponse(albumData);
    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}