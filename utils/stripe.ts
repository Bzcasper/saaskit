// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import Stripe from "stripe";
import { AssertionError } from "@std/assert/assertion-error";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

export function isStripeEnabled() {
  return Deno.env.has("STRIPE_SECRET_KEY");
}

export function getStripePremiumPlanPriceId() {
  return Deno.env.get(
    "STRIPE_PREMIUM_PLAN_PRICE_ID",
  );
}

// Lazy initialization - only create stripe client when needed
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
      // Use the Fetch API instead of Node's HTTP client.
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return _stripe;
}

// Export stripe for backwards compatibility, but it will throw if accessed before checking isStripeEnabled()
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = client[prop as keyof Stripe];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Asserts that the value is strictly a {@linkcode Stripe.Price} object.
 *
 * @example
 * ```ts
 * import { assertIsPrice } from "@/utils/stripe.ts";
 *
 * assertIsPrice(undefined); // Throws AssertionError
 * assertIsPrice(null); // Throws AssertionError
 * assertIsPrice("not a price"); // Throws AssertionError
 * ```
 */
export function assertIsPrice(value: unknown): asserts value is Stripe.Price {
  if (value === undefined || value === null || typeof value === "string") {
    throw new AssertionError(
      "Default price must be of type `Stripe.Price`. Please run the `deno task init:stripe` as the README instructs.",
    );
  }
}
