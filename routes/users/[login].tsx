// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { State } from "@/plugins/session.ts";
import { getUser } from "@/utils/db.ts";
import IconBrandGithub from "@preact-icons/tb/TbBrandGithub";
import IconMusic from "@preact-icons/tb/TbMusic";
import IconRadar from "@preact-icons/tb/TbRadar";
import Head from "@/components/Head.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import ItemsList from "@/islands/ItemsList.tsx";
import { defineRoute } from "$fresh/server.ts";
import { PremiumBadge } from "@/components/PremiumBadge.tsx";
import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";

interface UserProfileProps {
  login: string;
  isSubscribed: boolean;
}

function UserProfile(props: UserProfileProps) {
  return (
    <div class="card p-32 flex flex-col items-center w-full max-w-[280px]">
      <GitHubAvatarImg
        login={props.login}
        size={140}
        class="ring-4 ring-primary/20 mb-24"
      />
      <div class="flex items-center gap-8 mb-8">
        <h1 class="font-heading font-bold text-h4 text-foreground">
          {props.login}
        </h1>
        {props.isSubscribed && <PremiumBadge class="size-24" />}
      </div>
      <a
        href={`https://github.com/${props.login}`}
        aria-label={`${props.login}'s GitHub profile`}
        class="text-foreground-muted hover:text-primary transition-colors duration-fast flex items-center gap-8 text-body-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconBrandGithub class="size-18" />
        View on GitHub
      </a>
      {props.isSubscribed && (
        <div class="mt-24 pt-24 border-t border-border w-full">
          <span class="inline-flex items-center gap-8 text-success font-medium text-body-sm">
            <IconMusic class="size-16" />
            Premium Member
          </span>
        </div>
      )}
    </div>
  );
}

export default defineRoute<State>(
  async (_req, ctx) => {
    const { login } = ctx.params;
    const user = await getUser(login);
    if (user === null) return await ctx.renderNotFound();

    const isSignedIn = ctx.state.sessionUser !== undefined;
    const endpoint = `/api/users/${login}/items`;

    return (
      <>
        <Head title={user.login} href={ctx.url.href}>
          <link
            as="fetch"
            crossOrigin="anonymous"
            href={endpoint}
            rel="preload"
          />
          {isSignedIn && (
            <link
              as="fetch"
              crossOrigin="anonymous"
              href="/api/me/votes"
              rel="preload"
            />
          )}
        </Head>
        <main class="flex-1 p-16 lg:p-24 flex flex-col lg:flex-row gap-32">
          {/* Brand Header */}
          <div class="lg:hidden text-center mb-24">
            <div class="inline-flex items-center gap-12">
              <div class="w-48 h-48 rounded-lg bg-gradient-logo flex items-center justify-center shadow-glow">
                <IconRadar class="size-24 text-background-dark" />
              </div>
              <span class="font-heading font-black text-h3 gradient-text lowercase">
                {SITE_NAME}
              </span>
            </div>
          </div>

          <div class="flex justify-center lg:justify-start">
            <UserProfile {...user} />
          </div>

          <div class="flex-1">
            <h2 class="font-heading font-bold text-h4 text-foreground mb-24">
              Submissions
            </h2>
            <ItemsList
              endpoint={endpoint}
              isSignedIn={isSignedIn}
            />
          </div>
        </main>
      </>
    );
  },
);
