// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from "$fresh/server.ts";
import type { SignedInState } from "@/plugins/session.ts";
import { isStripeEnabled } from "@/utils/stripe.ts";
import Head from "@/components/Head.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import { PremiumBadge } from "@/components/PremiumBadge.tsx";
import IconUser from "@preact-icons/tb/TbUser";
import IconCreditCard from "@preact-icons/tb/TbCreditCard";
import IconLogout from "@preact-icons/tb/TbLogout";
import IconExternalLink from "@preact-icons/tb/TbExternalLink";
import IconRadar from "@preact-icons/tb/TbRadar";
import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";
import {
  Logo,
  BrandSlogan,
  BrandButton,
  LogoHolographic,
  RadarLogo,
  SoundWaveLogo,
  Banner,
  BrandProvider,
  TurntableAnimation
} from "@/components/branding";

export default defineRoute<SignedInState>((_req, ctx) => {
  const { sessionUser } = ctx.state;
  const action = sessionUser.isSubscribed ? "Manage" : "Upgrade";

  return (
    <>
      <Head title="Account" href={ctx.url.href} />
      <main class="flex-1 section-padding-lg bg-grid-pattern">
        <div class="container-narrow">
          {/* Brand Header */}
          <div class="text-center mb-16">
            <div class="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            <h1 class="font-heading font-black text-h2 gradient-text mb-4">
              {SITE_NAME}
            </h1>
            <p class="text-foreground-muted text-body">
              {SITE_TAGLINE}
            </p>
          </div>

          {/* User Profile Card */}
          <div class="text-center mb-16">
            <GitHubAvatarImg
              login={sessionUser.login}
              size={120}
              class="mx-auto ring-4 ring-primary/30"
            />
            <h2 class="font-heading font-bold text-h4 text-foreground mb-6">
              {sessionUser.login}
            </h2>
            <p class="text-foreground-muted text-body">
              Manage your account settings
            </p>
          </div>

          {/* Account Details Card */}
          <div class="card space-y-0">
            <div class="flex items-center justify-between py-6 border-b border-border">
              <div class="flex items-center gap-3">
                <IconUser class="size-5 text-primary" />
                <span class="text-foreground font-medium">Username</span>
              </div>
              <a
                href={`/users/${sessionUser.login}`}
                class="link-styles text-body-sm flex items-center gap-2"
              >
                View Profile
                <IconExternalLink class="size-4" />
              </a>
            </div>

            <div class="flex items-center justify-between py-6 border-b border-border">
              <div class="flex items-center gap-3">
                <IconCreditCard class="size-5 text-primary" />
                <span class="text-foreground font-medium">Subscription</span>
              </div>
              <div class="flex items-center gap-3">
                {sessionUser.isSubscribed
                  ? (
                    <span class="flex items-center gap-2 text-success font-medium">
                      Premium
                      <PremiumBadge class="size-5" />
                    </span>
                  )
                  : (
                    <span class="text-foreground-muted">Free</span>
                  )}
                {isStripeEnabled() && (
                  <a
                    class="link-styles text-body-sm"
                    href={`/account/${action.toLowerCase()}`}
                  >
                    {action}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <a
            href="/signout?success_url=/"
            class="btn-secondary w-full justify-center inline-flex items-center gap-2"
          >
            <IconLogout class="size-4" />
            Sign out
          </a>
        </div>
      </main>
    </>
  );
});
