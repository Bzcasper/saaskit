// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { fetchFromPiped, YTMusic } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/tracks/:videoId/related
 * Get related tracks for a given video
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

      const related = await ytmusic.getRelated(videoId);

      if (!related || related.length === 0) {
        const response = errorResponse("NOT_FOUND", "No related tracks found");
        return toJson(response, 404);
      }

      const response = successResponse({
        videoId,
        relatedCount: related.length,
        related,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
