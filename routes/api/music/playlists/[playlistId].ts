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
 * GET /api/music/playlists/:playlistId
 * Get playlist details with track list
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const playlistId = ctx.params.playlistId;

      if (!playlistId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "Playlist ID is required",
        );
        return toJson(response, 400);
      }

      const playlist = await ytmusic.getPlaylist(playlistId);

      if (!playlist?.title) {
        const response = errorResponse("NOT_FOUND", "Playlist not found");
        return toJson(response, 404);
      }

      const response = successResponse({
        playlist,
        trackCount: playlist.trackCount,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
