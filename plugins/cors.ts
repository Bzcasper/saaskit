// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import { corsMiddleware } from "../middlewares/cors.ts";

export default {
  name: "cors",
  middlewares: [
    {
      path: "/",
      middleware: {
        handler: corsMiddleware(),
      },
    },
  ],
} as Plugin;
