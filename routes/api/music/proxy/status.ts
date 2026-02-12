// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Proxy Status and Health Monitoring
 * Real-time monitoring of proxy providers and system health
 */

import { getProxyHealth, proxyHub } from "@/utils/proxy_hub.ts";
import {
  errorResponse,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/proxy/status
 * Get real-time proxy system health and statistics
 */

/**
 * POST /api/music/proxy/status/toggle
 * Enable/disable a specific proxy provider (admin only)
 */

export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const url = new URL(req.url);
      const includeHistory = url.searchParams.get("history") === "true";

      // Get current health status
      const healthStatus = getProxyHealth();

      // Get provider statistics
      const stats = proxyHub.getProviderStats();

      // Build response
      const response = successResponse({
        timestamp: Date.now(),
        status: "operational",
        providers: healthStatus,
        statistics: stats,
        summary: {
          totalProviders: healthStatus.length,
          healthy: healthStatus.filter((p) => p.status === "healthy").length,
          degraded: healthStatus.filter((p) => p.status === "degraded").length,
          unhealthy: healthStatus.filter((p) =>
            p.status === "unhealthy"
          ).length,
          enabled: healthStatus.filter((p) => {
            const stat = stats[p.provider];
            return stat && stat.enabled;
          }).length,
        },
        configuration: {
          providers: [
            { name: "direct", priority: 0, type: "direct" },
            {
              name: "proxifly",
              priority: 1,
              type: "proxy",
              pricing: "affordable",
            },
            {
              name: "brightdata",
              priority: 2,
              type: "proxy",
              pricing: "premium",
            },
            {
              name: "smartproxy",
              priority: 3,
              type: "proxy",
              pricing: "budget",
            },
          ],
          fallbackOrder: ["direct", "proxifly", "brightdata", "smartproxy"],
        },
      }, "Proxy system status");

      return toJson(response);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error";
      const response = errorResponse("INTERNAL_ERROR", errorMessage);
      return toJson(response, 500);
    }
  },
  async POST(req, ctx) {
    try {
      // Check admin permissions (implement your auth logic here)
      if (!ctx.state.user || !(ctx.state.user as any).isAdmin) {
        const response = errorResponse("UNAUTHORIZED", "Admin access required");
        return toJson(response, 403);
      }

      const body = await req.json();
      const { provider, enabled } = body;

      if (!provider || typeof enabled !== "boolean") {
        const response = errorResponse(
          "INVALID_REQUEST",
          "Provider and enabled status required",
        );
        return toJson(response, 400);
      }

      const success = proxyHub.setProviderEnabled(provider, enabled);

      if (!success) {
        const response = errorResponse(
          "NOT_FOUND",
          `Provider '${provider}' not found`,
        );
        return toJson(response, 404);
      }

      const response = successResponse(
        { provider, enabled },
        `Provider ${provider} ${enabled ? "enabled" : "disabled"}`,
      );

      return toJson(response);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error";
      const response = errorResponse("INTERNAL_ERROR", errorMessage);
      return toJson(response, 500);
    }
  },
};
