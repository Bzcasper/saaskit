// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { getLyrics } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/lyrics
 * Get synced and plain lyrics for a track
 * Query params: title, artist, duration (optional)
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const url = new URL(req.url);
      const title = url.searchParams.get("title");
      const artist = url.searchParams.get("artist");
      const durationStr = url.searchParams.get("duration");

      if (!title || !artist) {
        const response = errorResponse(
          "MISSING_PARAM",
          "title and artist parameters required",
        );
        return toJson(response, 400);
      }

      const duration = durationStr ? parseInt(durationStr) : undefined;
      const lyrics = await getLyrics(title, artist, duration);

      if (!lyrics.success) {
        const response = errorResponse("NOT_FOUND", "Lyrics not found");
        return toJson(response, 404);
      }

      const response = successResponse(lyrics);
      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
