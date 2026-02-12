// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import { clusterTracks } from "@/utils/vector.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/cluster
 * Get track clusters for playlist generation
 */
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const numClusters = url.searchParams.get("clusters");

      const clusters = await clusterTracks(
        numClusters ? parseInt(numClusters) : 5,
      );

      const response = successResponse({
        clusterCount: clusters.length,
        clusters,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
