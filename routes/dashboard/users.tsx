// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import Head from "@/components/Head.tsx";
import TabsBar from "@/components/TabsBar.tsx";
import UsersTable from "@/islands/UsersTable.tsx";
import { defineRoute } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
import IconRadar from "@preact-icons/tb/TbRadar";
import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";

export default defineRoute((_req, ctx) => {
  const endpoint = "/api/users";

  return (
    <>
      <Head title="Users" href={ctx.url.href}>
        <link
          as="fetch"
          crossOrigin="anonymous"
          href={endpoint}
          rel="preload"
        />
      </Head>
      <main class="flex-1 p-16 lg:p-24 f-client-nav">
        {/* Brand Header */}
        <div class="flex items-center gap-16 mb-24">
          <div class="w-48 h-48 rounded-lg bg-gradient-logo flex items-center justify-center shadow-glow">
            <IconRadar class="size-24 text-background-dark" />
          </div>
          <div>
            <h1 class="font-heading font-black text-h2 gradient-text">
              Dashboard
            </h1>
            <p class="text-h5 font-heading text-primary-300 mt-8">
              "Real-time music trend intelligence"
            </p>
          </div>
        </div>

        <TabsBar
          links={[{
            path: "/dashboard/stats",
            innerText: "Stats",
          }, {
            path: "/dashboard/users",
            innerText: "Users",
          }]}
          currentPath={ctx.url.pathname}
        />

        <Partial name="users">
          <UsersTable endpoint={endpoint} />
        </Partial>
      </main>
    </>
  );
});
