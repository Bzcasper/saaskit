// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
import type { State } from "@/plugins/session.ts";
import { assertIsPrice, isStripeEnabled, stripe } from "@/utils/stripe.ts";
import { formatCurrency } from "@/utils/display.ts";
import Stripe from "stripe";
import IconCheckCircle from "@preact-icons/tb/TbCircleCheck";
import IconSparkles from "@preact-icons/tb/TbSparkles";
import IconBolt from "@preact-icons/tb/TbBolt";
import Head from "@/components/Head.tsx";
import { defineRoute } from "$fresh/server.ts";
import { PremiumBadge } from "@/components/PremiumBadge.tsx";
import { BrandSlogan, Logo, LogoVariations, TurntableAnimation } from "@/components/branding";

const CARD_STYLES = "card p-8 flex flex-col transition-all duration-normal hover-lift";
const CHECK_STYLES = "size-5 text-primary shrink-0 inline-block mr-3";
const FEATURE_STYLES = "flex items-center text-foreground-muted";

function FreePlanCard() {
  return (
    <div class={CARD_STYLES}>
      <div class="flex-1 space-y-4">
        <div>
          <h2 class="font-heading font-bold text-h3 text-foreground mb-2">Free</h2>
          <p class="text-foreground-muted text-body">Perfect for getting started with music trend discovery.</p>
        </div>
        <p class="py-4">
          <span class="font-heading font-black text-h1 text-foreground">Free</span>
        </p>
        <div class="space-y-3">
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Browse trending music</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Basic search & discovery</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Community participation</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Standard analytics</p>
        </div>
      </div>
      <div class="text-center pt-6 mt-6 border-t border-border">
        <a href="/account/manage" class="btn-secondary w-full justify-center">
          Manage Account
        </a>
      </div>
    </div>
  );
}

function PremiumPlanCard({ product, isSubscribed }: { product: Stripe.Product; isSubscribed?: boolean }) {
  assertIsPrice(product.default_price);
  return (
    <div class={`${CARD_STYLES} border-2 border-primary relative glow-logo`}>
      <div class="absolute -top-3 left-1/2 -translate-x-1/2">
        <span class="inline-flex items-center bg-gradient-logo text-black px-4 py-1.5 rounded-full text-body-sm font-bold shadow-glow">
          <IconSparkles class="size-4 mr-2" />
          RECOMMENDED
        </span>
      </div>
      <div class="flex-1 space-y-4 pt-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h2 class="font-heading font-bold text-h3 text-foreground">{product.name}</h2>
            <PremiumBadge class="size-6" />
          </div>
          <p class="text-foreground-muted text-body">{product.description}</p>
        </div>
        <p class="py-4">
          <span class="font-heading font-black text-h1 gradient-text">
            {formatCurrency(product.default_price.unit_amount! / 100, product.default_price?.currency)}
          </span>
          <span class="text-foreground-muted text-body"> / {product.default_price.recurring?.interval}</span>
        </p>
        <div class="space-y-3">
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Everything in Free</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Advanced trend analytics</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> AI-powered recommendations</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Premium user badge</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Priority API access</p>
        </div>
      </div>
      <div class="text-center pt-6 mt-6 border-t border-border">
        {isSubscribed ? (
          <a href="/account/manage" class="btn-secondary w-full justify-center">
            Manage Subscription
          </a>
        ) : (
          <a href="/account/upgrade" class="btn-primary w-full justify-center">
            Upgrade Now
          </a>
        )}
      </div>
    </div>
  );
}

function EnterprisePlanCard() {
  return (
    <div class={CARD_STYLES}>
      <div class="flex-1 space-y-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <IconBolt class="size-6 text-accent" />
            <h2 class="font-heading font-bold text-h3 text-foreground">Enterprise</h2>
          </div>
          <p class="text-foreground-muted text-body">Custom solutions for large teams and organizations.</p>
        </div>
        <p class="py-4">
          <span class="font-heading font-black text-h1 text-foreground">Custom</span>
        </p>
        <div class="space-y-3">
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Everything in Premium</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Custom API limits</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Dedicated support</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> SLA guarantee</p>
          <p class={FEATURE_STYLES}><IconCheckCircle class={CHECK_STYLES} /> Custom integrations</p>
        </div>
      </div>
      <div class="text-center pt-6 mt-6 border-t border-border">
        <a href="mailto:contact@trendradar.io" class="btn-ghost w-full justify-center">
          Contact Sales
        </a>
      </div>
    </div>
  );
}

export default defineRoute<State>(async (_req, ctx) => {
  if (!isStripeEnabled()) return await ctx.renderNotFound();

  const { data } = await stripe.products.list({
    expand: ["data.default_price"],
    active: true,
  });

  if (data.length === 0) {
    throw new Error("No Stripe products found. Please run 'deno task init:stripe' first.");
  }

  return (
    <>
      <Head title="Pricing" href={ctx.url.href} />
      <main class="flex-1 section-padding-lg bg-grid-pattern">
        <div class="container-max">
          {/* Header */}
          <div class="text-center mb-16">
            <div class="mb-8">
              <LogoVariations variant="horizontal" size="lg" />
            </div>
            <h1 class="font-heading font-black text-h1 md:text-h2 gradient-text mb-6">
              Simple Pricing
            </h1>
            <p class="text-foreground-muted text-body-lg max-w-2xl mx-auto mb-8">
              Choose the plan that fits your music intelligence needs
            </p>
            <BrandSlogan variant="technical" />
          </div>

          {/* Pricing Cards */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FreePlanCard />
            <PremiumPlanCard product={data[0]} isSubscribed={ctx.state.sessionUser?.isSubscribed} />
            <EnterprisePlanCard />
          </div>

          {/* Trust Signals */}
          <div class="mt-16 text-center">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-4 8 8 8 4-8 8-4-4-4-4m4-4h6m-6 0h6m-6 0v6m0-6v6" />
                  </svg>
                </div>
                <p class="text-body-sm text-foreground-muted">Secure Payments</p>
              </div>
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
                  <svg class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0m-9 10h9" />
                  </svg>
                </div>
                <p class="text-body-sm text-foreground-muted">Cancel Anytime</p>
              </div>
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg class="size-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m1.414 1.414a9 9 0 01012.728 0M21 12a9 9 0 11-18 0 9 9 0 0118 0" />
                  </svg>
                </div>
                <p class="text-body-sm text-foreground-muted">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
});
