// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import {
  batchIndexTracks,
  findSimilarTracks,
  indexTrack,
  vectorSearch,
} from "@/utils/vector.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";
import { getTrack } from "@/utils/music_models.ts";

/**
 * POST /api/music/search/vector
 * Semantic search using vector embeddings
 * Body: { query: string, limit?: number, threshold?: number, metric?: "cosine" | "euclidean" | "manhattan" }
 */
export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();

      const { query, limit, threshold, metric } = body;

      if (!query) {
        const response = errorResponse(
          "MISSING_PARAM",
          "query parameter required",
        );
        return toJson(response, 400);
      }

      const results = await vectorSearch(query, {
        limit: limit || 20,
        threshold: threshold || 0.5,
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
        query,
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
