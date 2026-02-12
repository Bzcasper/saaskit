// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import { findSimilarTracks } from "@/utils/vector.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";
import { getTrack } from "@/utils/music_models.ts";

/**
 * GET /api/music/tracks/[trackId]/similar
 * Find tracks similar to a given track using vector similarity
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const { trackId } = ctx.params;

      if (!trackId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "trackId parameter required",
        );
        return toJson(response, 400);
      }

      const url = new URL(req.url);
      const limit = url.searchParams.get("limit");
      const threshold = url.searchParams.get("threshold");
      const metric = url.searchParams.get("metric") as "cosine" | "euclidean" | "manhattan" | null;

      const results = await findSimilarTracks(trackId, {
        limit: limit ? parseInt(limit) : 20,
        threshold: threshold ? parseFloat(threshold) : 0.6,
        metric: metric || "cosine",
      });

      // Enrich results with track details
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const track = await getTrack(result.trackId);
          return {
            ...result,
            track,
          };
        }),
      );

      const response = successResponse({
        trackId,
        metric: metric || "cosine",
        count: enrichedResults.length,
        results: enrichedResults,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
