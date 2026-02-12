// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import { monitoringMiddleware } from "../middlewares/monitoring.ts";

export default {
  name: "monitoring",
  middlewares: [
    {
      path: "/",
      middleware: {
        handler: monitoringMiddleware(),
      },
    },
  ],
} as Plugin;