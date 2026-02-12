// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { getPlaylist, getTrack } from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/playlists/public/:playlistId
 * Get public playlist details with track information (no authentication required)
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

      const playlist = await getPlaylist(playlistId);

      if (!playlist) {
        const response = errorResponse("NOT_FOUND", "Playlist not found");
        return toJson(response, 404);
      }

      // Only allow access to public playlists
      if (!playlist.isPublic) {
        const response = errorResponse("FORBIDDEN", "This playlist is private");
        return toJson(response, 403);
      }

      // Get full track details for the playlist
      const tracks = [];
      for (const trackId of playlist.trackIds) {
        const track = await getTrack(trackId);
        if (track) {
          tracks.push(track);
        }
      }

      const response = successResponse({
        ...playlist,
        tracks,
        trackCount: tracks.length,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
