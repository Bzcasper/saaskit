// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/utils/constants.ts";
import IconBrandDiscord from "@preact-icons/tb/TbBrandDiscord";
import IconBrandGithub from "@preact-icons/tb/TbBrandGithub";
import IconBrandTwitter from "@preact-icons/tb/TbBrandTwitter";
import IconRss from "@preact-icons/tb/TbRss";
import IconRadar from "@preact-icons/tb/TbRadar";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 lg:px-16 py-8 lg:py-12 mt-auto border-t border-border gap-6">
      {/* Brand */}
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-logo flex items-center justify-center shadow-glow">
          <IconRadar class="size-5 text-black" />
        </div>
        <div>
          <span class="font-heading font-bold text-base gradient-text lowercase block">
            {SITE_NAME}
          </span>
          <p class="text-foreground-muted text-xs mt-0.5">
            © {currentYear}
          </p>
        </div>
      </div>

      {/* Slogan */}
      <div class="hidden lg:block text-center">
        <p class="font-heading text-primary-300 text-sm">
          "{SITE_TAGLINE}"
        </p>
        <p class="text-foreground-muted text-xs mt-1">
          {SITE_DESCRIPTION}
        </p>
      </div>

      {/* Brand Values - Mobile */}
      <div class="flex md:hidden justify-center gap-4 text-foreground-muted text-xs">
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-gradient-logo"></span>
          Innovation
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-gradient-logo"></span>
          Data Integrity
        </span>
      </div>

      {/* Links */}
      <nav class="flex items-center gap-6">
        <a
          href="/blog"
          class="text-foreground-muted hover:text-primary transition-colors duration-fast text-sm"
          aria-label="Blog"
        >
          Blog
        </a>
        <a
          href="/feed"
          aria-label="RSS Feed"
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconRss class="size-5" />
        </a>
        <a
          href="https://discord.gg/trendradar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandDiscord class="size-5" />
        </a>
        <a
          href="https://github.com/trendradar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandGithub class="size-5" />
        </a>
        <a
          href="https://twitter.com/trendradar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandTwitter class="size-5" />
        </a>
      </nav>
    </footer>
  );
}
