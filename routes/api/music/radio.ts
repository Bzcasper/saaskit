// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { YTMusic } from "@/utils/music_client.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/radio?videoId=VIDEO_ID&limit=25
 * Generate a radio playlist from a seed track
 */
export const handler: Handlers = {
  async GET(req) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const limit = parseInt(url.searchParams.get("limit") || "25");

    if (!videoId) {
      const response = errorResponse(
        "MISSING_PARAM",
        "Video ID is required",
      );
      return toJson(response, 400);
    }

    if (limit < 1 || limit > 100) {
      const response = errorResponse(
        "INVALID_PARAM",
        "Limit must be between 1 and 100",
      );
      return toJson(response, 400);
    }

    const radio = await ytmusic.getRadio(videoId, limit);

    if (!radio || radio.length === 0) {
      const response = errorResponse("NOT_FOUND", "No radio tracks found");
      return toJson(response, 404);
    }

    const response = successResponse({
      seedVideoId: videoId,
      trackCount: radio.length,
      tracks: radio,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
  },
};