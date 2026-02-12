// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { LastFM } from "@/utils/music_client.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/artists/info
 * Get artist information from Last.fm
 * Query params: artist
 */
export const handler: Handlers = {
  async GET(req, ctx) {
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

    const info = await LastFM.getArtistInfo(artist);

    if (!info.success) {
      const response = errorResponse("NOT_FOUND", "Artist not found");
      return toJson(response, 404);
    }

    const response = successResponse(info);
    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}
};

