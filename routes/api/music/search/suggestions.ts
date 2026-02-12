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
 * GET /api/music/search/suggestions
 * Get search suggestions for autocomplete
 * Query params: q
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q");

      if (!query) {
        const response = errorResponse(
          "MISSING_PARAM",
          "Query parameter 'q' is required",
        );
        return toJson(response, 400);
      }

      const suggestions = await ytmusic.getSearchSuggestions(query);

      const response = successResponse({
        query,
        suggestions,
        count: suggestions.length,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
