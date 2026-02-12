// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing for API security
 */

import { MiddlewareHandlerContext } from "$fresh/server.ts";

interface CORSConfig {
  origin: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_CORS_CONFIG: CORSConfig = {
  origin: [
    "https://trendradar.com",
    "https://www.trendradar.com",
    "https://app.trendradar.com",
    "https://docs.trendradar.com",
    "http://localhost:8000", // Development
    "http://localhost:3000", // Development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Origin",
    "User-Agent",
    "X-Request-ID",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "X-Request-ID",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

function isOriginAllowed(origin: string, config: CORSConfig): boolean {
  if (typeof config.origin === "string") {
    return config.origin === origin;
  }

  if (Array.isArray(config.origin)) {
    return config.origin.includes(origin);
  }

  if (typeof config.origin === "function") {
    return config.origin(origin);
  }

  return false;
}

export function corsMiddleware(
  config: CORSConfig = DEFAULT_CORS_CONFIG,
): (
  req: Request,
  ctx: MiddlewareHandlerContext,
) => Response | Promise<Response> {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const origin = req.headers.get("Origin");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      const headers = new Headers();

      if (origin && isOriginAllowed(origin, config)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set(
          "Access-Control-Allow-Methods",
          config.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS",
        );
        headers.set(
          "Access-Control-Allow-Headers",
          config.allowedHeaders?.join(", ") || "",
        );
        headers.set(
          "Access-Control-Expose-Headers",
          config.exposedHeaders?.join(", ") || "",
        );

        if (config.credentials) {
          headers.set("Access-Control-Allow-Credentials", "true");
        }

        if (config.maxAge) {
          headers.set("Access-Control-Max-Age", config.maxAge.toString());
        }
      }

      return new Response(null, {
        status: 204,
        headers,
      });
    }

    // Handle actual requests
    const response = await ctx.next();

    if (response instanceof Response) {
      if (origin && isOriginAllowed(origin, config)) {
        response.headers.set("Access-Control-Allow-Origin", origin);

        if (config.credentials) {
          response.headers.set("Access-Control-Allow-Credentials", "true");
        }

        if (config.exposedHeaders && config.exposedHeaders.length > 0) {
          response.headers.set(
            "Access-Control-Expose-Headers",
            config.exposedHeaders.join(", "),
          );
        }
      }
    }

    return response;
  };
}
