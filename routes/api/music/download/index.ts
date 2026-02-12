// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import {
  createDownloadJob,
  getDownloadJob,
  getUserDownloadJobs,
  cancelDownloadJob,
  deleteDownloadJob,
  getDownloadStats,
  processDownloadJob,
  cleanupOldDownloadJobs,
  getDownloadJobByVideoId,
} from "@/utils/download.ts";
import {
  successResponse,
  errorResponse,
  toJson,
  handleApiError,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * POST /api/music/download
 * Create a new download job
 * Body: { videoId, title, artist, format?, quality? }
 */
export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { videoId, title, artist, format, quality } = body;

      if (!videoId || !title || !artist) {
        const response = errorResponse(
          "MISSING_PARAMS",
          "videoId, title, and artist are required",
        );
        return toJson(response, 400);
      }

      // Check for existing job
      const existingJob = await getDownloadJobByVideoId(videoId);
      if (existingJob && existingJob.status !== "failed" && existingJob.status !== "cancelled") {
        const response = successResponse({
          jobId: existingJob.id,
          status: existingJob.status,
          progress: existingJob.progress,
          message: "Download job already exists",
        });
        return toJson(response);
      }

      // Create new download job
      const job = await createDownloadJob(videoId, title, artist, undefined, {
        format,
        quality,
      });

      // Start processing asynchronously (don't await)
      processDownloadJob(job.id).catch((error) => {
        console.error(`Download job ${job.id} failed:`, error);
      });

      const response = successResponse({
        jobId: job.id,
        status: job.status,
        message: "Download job created",
      });

      return toJson(response, 201);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },

  /**
   * GET /api/music/download
   * Get download jobs for user
   */
  async GET(req) {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId"); // Would be from session in production
      const limit = url.searchParams.get("limit");

      const jobs = await getUserDownloadJobs(
        userId || "anonymous",
        limit ? parseInt(limit) : 50,
      );

      const response = successResponse({
        count: jobs.length,
        jobs,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
