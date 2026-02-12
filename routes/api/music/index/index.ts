// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import { batchIndexTracks, indexTrack } from "@/utils/vector.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";
import { getTrack } from "@/utils/music_models.ts";

/**
 * GET /api/music/index - Get indexing status
 * POST /api/music/index - Index tracks for vector search
 */
export const handler: Handlers = {
  async GET() {
    try {
      const { getAllTrackEmbeddings } = await import("@/utils/music_models.ts");
      const embeddings = await getAllTrackEmbeddings();

      const response = successResponse({
        totalIndexed: embeddings.length,
        lastUpdate: embeddings.length > 0
          ? Math.max(...embeddings.map((e) => e.createdAt))
          : null,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },

  async POST(req) {
    try {
      const body = await req.json();
      const { trackId, tracks } = body;

      // Index single track
      if (trackId) {
        const track = await getTrack(trackId);

        if (!track) {
          const response = errorResponse(
            "TRACK_NOT_FOUND",
            `Track with ID ${trackId} not found`,
          );
          return toJson(response, 404);
        }

        const embedding = await indexTrack(
          track.id,
          track.videoId,
          track.title,
          track.artist,
          track.album,
          undefined, // genre - would be analyzed
          undefined, // mood - would be analyzed
          undefined, // themes - would be analyzed
        );

        const response = successResponse({
          trackId: embedding.trackId,
          indexed: true,
          text: embedding.text,
        });

        return toJson(response);
      }

      // Batch index multiple tracks
      if (tracks && Array.isArray(tracks)) {
        const result = await batchIndexTracks(tracks);

        const response = successResponse({
          ...result,
          message: `Indexed ${result.success} tracks, ${result.failed} failed`,
        });

        return toJson(response);
      }

      const response = errorResponse(
        "MISSING_PARAM",
        "Either trackId or tracks array required",
      );
      return toJson(response, 400);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
