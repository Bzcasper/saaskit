// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
import { SITE_NAME } from "@/utils/constants.ts";
import { isStripeEnabled } from "@/utils/stripe.ts";
import IconX from "@preact-icons/tb/TbX";
import IconMenu from "@preact-icons/tb/TbMenu2";
import IconRadar from "@preact-icons/tb/TbRadar";
import { User } from "@/utils/db.ts";

export interface HeaderProps {
  sessionUser?: User;
  url: URL;
}

export default function Header(props: HeaderProps) {
  return (
    <header class="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 lg:px-16 py-4 gap-4 bg-background/95 backdrop-blur-sm border-b border-border">
      <input type="checkbox" id="nav-toggle" class="hidden peer" />

      {/* Logo */}
      <div class="flex justify-between items-center peer-checked:[&_>div>label]#IconMenu]:hidden peer-checked:[&_>div>label]#IconX]:block">
        <a href="/" class="shrink-0 flex items-center gap-3 group">
          <div class="w-12 h-12 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-fast">
            <IconRadar class="size-7 text-black" />
          </div>
          <span class="font-heading font-black text-xl gradient-text lowercase tracking-wide hidden sm:block">
            {SITE_NAME}
          </span>
        </a>
        <div class="flex gap-2 items-center sm:hidden">
          <label tabIndex={0} class="sm:hidden p-2 -mr-2 rounded-lg hover:bg-primary/10 transition-colors" id="nav-toggle-label" htmlFor="nav-toggle">
            <IconMenu class="size-6" id="IconMenu" />
            <IconX class="hidden size-6" id="IconX" />
          </label>
        </div>
      </div>

      <script>{`
        const navToggleLabel = document.getElementById('nav-toggle-label');
        navToggleLabel.addEventListener('keydown', () => {
          if (event.code === 'Space' || event.code === 'Enter') {
            navToggleLabel.click();
            event.preventDefault();
          }
        });
      `}</script>

      {/* Navigation */}
      <nav class="hidden flex-col gap-x-6 sm:flex sm:items-center sm:flex-row peer-checked:flex">
        <a href="/dashboard" class="text-foreground-muted hover:text-primary transition-colors duration-fast font-medium py-3 sm:py-0 relative after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
          Dashboard
        </a>
        {isStripeEnabled() && (
          <a href="/pricing" class="text-foreground-muted hover:text-primary transition-colors duration-fast font-medium py-3 sm:py-0 relative after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
            Pricing
          </a>
        )}
        {props.sessionUser ? (
          <a href="/account" class="text-foreground-muted hover:text-primary transition-colors duration-fast font-medium py-3 sm:py-0 relative after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
            Account
          </a>
        ) : (
          <a href="/signin" class="text-foreground-muted hover:text-primary transition-colors duration-fast font-medium py-3 sm:py-0 relative after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
            Sign in
          </a>
        )}
        <a href="/submit" class="btn-primary text-sm">
          Submit
        </a>
      </nav>
    </header>
  );
}
