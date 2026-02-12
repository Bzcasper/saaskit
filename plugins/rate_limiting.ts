// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import { rateLimitingMiddleware } from "../middlewares/rate_limiting.ts";

export default {
  name: "rate-limiting",
  middlewares: [
    {
      path: "/",
      middleware: {
        handler: rateLimitingMiddleware(),
      },
    },
  ],
} as Plugin;