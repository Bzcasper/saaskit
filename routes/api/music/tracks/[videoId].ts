// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { YTMusic } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/tracks/:videoId
 * Get track details by video ID
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const videoId = ctx.params.videoId;

      if (!videoId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "Video ID is required",
        );
        return toJson(response, 400);
      }

      const song = await ytmusic.getSong(videoId);

      if (!song?.videoId) {
        const response = errorResponse("NOT_FOUND", "Track not found");
        return toJson(response, 404);
      }

      const response = successResponse({
        track: song,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
