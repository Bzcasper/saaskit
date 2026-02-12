// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { fetchFromPiped, fetchFromInvidious } from "@/utils/music_client.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/stream
 * Get streaming URLs for audio playback
 * Query params: videoId
 */
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const videoId = url.searchParams.get("videoId");

      if (!videoId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "videoId parameter required",
        );
        return toJson(response, 400);
      }

      // Try Piped first
      let stream = await fetchFromPiped(videoId);

      // If Piped fails, try Invidious as fallback
      if (!stream.success) {
        stream = await fetchFromInvidious(videoId);
      }

      if (!stream.success) {
        const response = errorResponse(
          "STREAM_NOT_FOUND",
          "Could not find streaming source from any backend",
        );
        return toJson(response, 404);
      }

      const response = successResponse(stream);
      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
