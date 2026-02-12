// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Proxy Test Endpoint
 * Tests proxy connectivity and fallback behavior
 */

import { fetchWithProxy, proxyHub } from "@/utils/proxy_hub.ts";
import {
  errorResponse,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/proxy/test
 * Test proxy connectivity with a simple request
 */

/**
 * POST /api/music/proxy/test/music
 * Test proxy with actual music API endpoints
 */

export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const url = new URL(req.url);
      const testUrl = url.searchParams.get("url") || "https://httpbin.org/ip";
      const forceProxy = url.searchParams.get("forceProxy") === "true";

      const results: {
        testUrl: string;
        providers: string[];
        responses: {
          provider: string;
          success: boolean;
          latency: number;
          statusCode?: number;
          error?: string;
          providerUsed?: string;
        }[];
        summary: {
          total: number;
          successful: number;
          failed: number;
          fastestProvider: string;
          fastestLatency: number;
        };
      } = {
        testUrl,
        providers: ["direct", "proxifly", "brightdata", "smartproxy"],
        responses: [],
        summary: {
          total: 0,
          successful: 0,
          failed: 0,
          fastestProvider: "",
          fastestLatency: Infinity,
        },
      };

      // Test each provider individually (if not forcing proxy)
      if (!forceProxy) {
        // Test with ProxyHub (auto-fallback)
        const startTime = performance.now();
        const response = await proxyHub.fetch({
          url: testUrl,
          method: "GET",
          timeout: 15000,
        });
        const latency = performance.now() - startTime;

        results.responses.push({
          provider: "auto-fallback",
          success: response.success,
          latency,
          statusCode: response.statusCode,
          error: response.error,
          providerUsed: response.provider,
        });

        results.summary.total++;
        if (response.success) {
          results.summary.successful++;
          if (latency < results.summary.fastestLatency) {
            results.summary.fastestLatency = latency;
            results.summary.fastestProvider = response.provider;
          }
        } else {
          results.summary.failed++;
        }
      }

      // Test individual providers
      for (const provider of results.providers) {
        const startTime = performance.now();

        try {
          // Use fetchWithProxy which goes through ProxyHub
          const response = await fetchWithProxy(testUrl, {
            method: "GET",
            timeout: 15000,
          });

          const latency = performance.now() - startTime;

          results.responses.push({
            provider,
            success: response.success,
            latency,
            statusCode: response.statusCode,
            error: response.error,
            providerUsed: response.provider,
          });

          results.summary.total++;
          if (response.success) {
            results.summary.successful++;
            if (latency < results.summary.fastestLatency) {
              results.summary.fastestLatency = latency;
              results.summary.fastestProvider = response.provider;
            }
          } else {
            results.summary.failed++;
          }
        } catch (error) {
          const latency = performance.now() - startTime;
          const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";

          results.responses.push({
            provider,
            success: false,
            latency,
            error: errorMessage,
          });

          results.summary.total++;
          results.summary.failed++;
        }
      }

      // Update fastest provider
      if (results.summary.fastestLatency === Infinity) {
        results.summary.fastestLatency = 0;
      }

      const response = successResponse(
        results,
        results.summary.successful > 0
          ? "Proxy tests completed"
          : "All proxy tests failed",
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
  async POST(req, ctx) {
    try {
      const body = await req.json();
      const { videoId = "dQw4w9WgXcQ", testType = "streaming" } = body;

      const testResults: {
        testType: string;
        videoId: string;
        providers: Record<
          string,
          {
            success: boolean;
            latency: number;
            error?: string;
            data?: unknown;
          }
        >;
      } = {
        testType,
        videoId,
        providers: {},
      };

      // Test streaming endpoint with different providers
      if (testType === "streaming") {
        const pipeInstances = [
          "https://api.piped.private.coffee",
          "https://pipedapi.darkness.services",
          "https://pipedapi.r4fo.com",
        ];

        for (const instance of pipeInstances) {
          const startTime = performance.now();

          try {
            const url = `${instance}/streams/${videoId}`;
            const response = await proxyHub.fetch({
              url,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              timeout: 30000,
            });

            const latency = performance.now() - startTime;

            testResults.providers[instance] = {
              success: response.success,
              latency,
              error: response.error,
              data: response.success
                ? {
                  statusCode: response.statusCode,
                  hasAudioStreams:
                    JSON.parse(response.body || "{}").audioStreams?.length > 0,
                }
                : undefined,
            };
          } catch (error) {
            const latency = performance.now() - startTime;
            const errorMessage = error instanceof Error
              ? error.message
              : "Unknown error";

            testResults.providers[instance] = {
              success: false,
              latency,
              error: errorMessage,
            };
          }
        }
      }

      // Test lyrics endpoint
      if (testType === "lyrics") {
        const startTime = performance.now();

        try {
          const url = `https://lrclib.net/api/search?q=${
            encodeURIComponent("Never Gonna Give You Up Rick Astley")
          }`;
          const response = await proxyHub.fetch({
            url,
            timeout: 15000,
          });

          const latency = performance.now() - startTime;

          testResults.providers["lrclib"] = {
            success: response.success,
            latency,
            error: response.error,
            data: response.success
              ? {
                resultCount: JSON.parse(response.body || "[]").length,
              }
              : undefined,
          };
        } catch (error) {
          const latency = performance.now() - startTime;
          const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";

          testResults.providers["lrclib"] = {
            success: false,
            latency,
            error: errorMessage,
          };
        }
      }

      const response = successResponse(
        testResults,
        "Music API proxy tests completed",
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
