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
 * GET /api/music/tracks/info
 * Get track information from Last.fm
 * Query params: title, artist
 */
export const handler: Handlers = {
  async GET(req, ctx) {
  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title");
    const artist = url.searchParams.get("artist");

    if (!title || !artist) {
      const response = errorResponse(
        "MISSING_PARAM",
        "title and artist parameters required",
      );
      return toJson(response, 400);
    }

    const info = await LastFM.getTrackInfo(title, artist);

    if (!info.success) {
      const response = errorResponse("NOT_FOUND", "Track not found");
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

