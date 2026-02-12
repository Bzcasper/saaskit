// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { SITE_NAME } from "@/utils/constants.ts";
import IconRadar from "@preact-icons/tb/TbRadar";
import {
  BrandSlogan,
  Logo,
  type LogoProps,
  LogoVariations,
} from "@/components/branding/index.ts";

export default function NotFoundPage() {
  return (
    <main class="flex-1 p-4 flex flex-col justify-center items-center text-center min-h-[60vh]">
      <div class="bg-background-card/60 border border-border rounded-2xl max-w-lg w-full py-12 px-8">
        {/* Brand Logo */}
        <div class="flex justify-center mb-8">
          <div class="w-20 h-20 rounded-2xl bg-gradient-logo flex items-center justify-center shadow-glow">
            <IconRadar class="size-10 text-black" />
          </div>
        </div>

        <h1 class="font-heading font-black text-6xl gradient-text mb-4">
          404
        </h1>
        <h2 class="font-heading font-bold text-2xl text-foreground mb-4">
          Signal Lost
        </h2>
        <p class="text-foreground-muted mb-8">
          We couldn't detect that trend. The page you're looking for doesn't
          exist.
        </p>
        <BrandSlogan variant="primary" className="mb-8" />
        <Logo size="lg" className="mb-8" />
        <a
          href="/"
          class="inline-flex items-center py-3 px-6 bg-gradient-logo text-black font-heading font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-all"
        >
          Return to {SITE_NAME}
          <span class="ml-2">→</span>
        </a>
      </div>
    </main>
  );
}
