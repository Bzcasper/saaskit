// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * AI-Enhanced Music API
 * Centralized route handling for all AI-powered music endpoints
 */

import {
  errorResponse,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

// Import all AI endpoint handlers
import * as recommendations from "./recommendations.ts";
import * as playlists from "./playlists.ts";
import * as analysis from "./analysis.ts";
import * as search from "./search.ts";
import * as context from "./context.ts";

// Re-export all handlers for direct imports
export { analysis, context, playlists, recommendations, search };

/**
 * GET /api/music/ai
 * Overview of available AI endpoints with status
 */

/**
 * POST /api/music/ai
 * Route POST requests to the appropriate handler
 */

/**
 * DELETE /api/music/ai
 * Route DELETE requests to the appropriate handler
 */
export async function DELETE(req: Request, ctx: RouteContext) {
  const url = new URL(req.url);
  const path = url.pathname.split("/ai/")[1];

  if (!path) {
    const response = errorResponse(
      "INVALID_REQUEST",
      "Specify an AI endpoint for DELETE requests",
    );
    return toJson(response, 400);
  }

  if (path.startsWith("playlists")) {
    return await playlists.handler.DELETE(req, ctx);
  }

  const response = errorResponse(
    "METHOD_NOT_ALLOWED",
    "DELETE not supported for this AI endpoint",
  );
  return toJson(response, 405);
}
export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);

    // If accessing a specific AI endpoint, route to the appropriate handler
    const path = url.pathname.split("/ai/")[1];

    if (path) {
      if (path.startsWith("recommendations")) {
        return await recommendations.handler.GET(req, ctx);
      }

      if (path.startsWith("playlists")) {
        return await playlists.handler.GET(req, ctx);
      }

      if (path.startsWith("analysis")) {
        return await analysis.handler.GET(req, ctx);
      }

      if (path.startsWith("search")) {
        return await search.handler.GET(req, ctx);
      }

      if (path.startsWith("context")) {
        return await context.handler.GET(req, ctx);
      }

      // If path doesn't match any known endpoint
      const response = errorResponse(
        "NOT_FOUND",
        "AI endpoint not found",
      );
      return toJson(response, 404);
    }

    // If accessing the root AI endpoint, return overview of available endpoints
    const aiEndpoints = [
      {
        path: "/api/music/ai/recommendations",
        description: "AI-powered music recommendations",
        methods: ["GET", "POST"],
        requiresAuth: true,
        queryParams: ["type", "seed", "limit"],
      },
      {
        path: "/api/music/ai/playlists",
        description: "AI-generated playlist management",
        methods: ["GET", "POST", "DELETE"],
        requiresAuth: true,
        queryParams: ["action"],
      },
      {
        path: "/api/music/ai/analysis",
        description: "Advanced music analysis and insights",
        methods: ["GET"],
        requiresAuth: false,
        queryParams: ["type", "videoId", "refresh"],
      },
      {
        path: "/api/music/ai/search",
        description: "Smart search with semantic understanding",
        methods: ["GET"],
        requiresAuth: false,
        queryParams: ["q", "limit", "semantic"],
      },
      {
        path: "/api/music/ai/context",
        description: "Contextual music recommendations",
        methods: ["GET"],
        requiresAuth: false,
        queryParams: ["mood", "activity", "timeOfDay"],
      },
    ];

    const response = successResponse({
      status: "active",
      endpoints: aiEndpoints,
      documentation: "/api/music/ai/docs",
      aiProviders: ["Groq", "Cerebras"],
    }, "AI-Enhanced Music API");

    return toJson(response);
  },
  async POST(req, ctx) {
    const url = new URL(req.url);
    const path = url.pathname.split("/ai/")[1];

    if (!path) {
      const response = errorResponse(
        "INVALID_REQUEST",
        "Specify an AI endpoint for POST requests",
      );
      return toJson(response, 400);
    }

    if (path.startsWith("recommendations")) {
      return await recommendations.handler.POST(req, ctx);
    }

    if (path.startsWith("playlists")) {
      return await playlists.handler.POST(req, ctx);
    }

    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      "POST not supported for this AI endpoint",
    );
    return toJson(response, 405);
  },
};
