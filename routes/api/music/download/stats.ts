// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import { cleanupOldDownloadJobs, getDownloadStats } from "@/utils/download.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/download/stats - Get download statistics
 * DELETE /api/music/download/stats - Clean up old download jobs
 */
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId"); // Would be from session in production

      const stats = await getDownloadStats(userId || undefined);

      const response = successResponse(stats);
      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },

  async DELETE(req) {
    try {
      const url = new URL(req.url);
      const maxAge = url.searchParams.get("maxAge");

      const deleted = await cleanupOldDownloadJobs(
        maxAge ? parseInt(maxAge) : undefined,
      );

      const response = successResponse({
        deleted,
        message: `Cleaned up ${deleted} old download jobs`,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
