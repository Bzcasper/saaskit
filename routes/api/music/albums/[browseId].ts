// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { LastFM, YTMusic } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/albums/:browseId
 * Get album details with track list
 * Query params: complete (boolean) - include Last.fm metadata for tracks
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const browseId = ctx.params.browseId;
      const url = new URL(req.url);
      const complete = url.searchParams.get("complete") === "true";

      if (!browseId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "Browse ID is required",
        );
        return toJson(response, 400);
      }

      const album = await ytmusic.getAlbum(browseId);

      if (!album?.title) {
        const response = errorResponse("NOT_FOUND", "Album not found");
        return toJson(response, 404);
      }

      let enhancedAlbum = album;

      if (complete && album.tracks) {
        // Enhance tracks with Last.fm info
        const enhancedTracks = await Promise.all(
          (album.tracks as Record<string, unknown>[]).map(
            async (track: Record<string, unknown>) => {
              const trackInfo = await LastFM.getTrackInfo(
                track.title as string,
                album.artist as string,
              );
              return {
                ...track,
                lastfm: trackInfo.success ? trackInfo : null,
              };
            },
          ),
        );
        enhancedAlbum = {
          ...album,
          tracks: enhancedTracks,
        };
      }

      const response = successResponse({
        album: enhancedAlbum,
        trackCount: album.trackCount,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
