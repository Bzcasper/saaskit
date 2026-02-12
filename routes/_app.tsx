// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import type { State } from "@/plugins/session.ts";
import { defineApp } from "$fresh/server.ts";

export default defineApp<State>((_, ctx) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="color-scheme" content="dark" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body class="bg-background text-foreground antialiased custom-scrollbar">
        <div class="min-h-screen flex flex-col">
          <Header
            url={ctx.url}
            sessionUser={ctx.state?.sessionUser}
          />
          <main class="flex-1">
            <ctx.Component />
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
});
