// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * LogoVariations - Horizontal, stacked, light versions
 * From BRANDING#2.html logo variations
 */

import { ComponentChildren } from "preact";

interface LogoVariationsProps {
  variant?: "horizontal" | "stacked" | "light" | "icon-only";
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: { icon: "w-10 h-10", iconText: "text-xl", text: "text-2xl" },
  md: { icon: "w-15 h-15", iconText: "text-2xl", text: "text-3xl" },
  lg: { icon: "w-20 h-20", iconText: "text-4xl", text: "text-5xl" }
};

export function LogoVariations({
  variant = "horizontal",
  size = "md",
  href = "/"
}: LogoVariationsProps) {
  const sizeClasses = sizes[size];
  const iconSize = size === "sm" ? 28 : size === "md" ? 32 : 56;
  const textSize = size === "sm" ? 24 : size === "md" ? 28 : 32;

  const variants = {
    horizontal: (
      <div class="flex items-center justify-center gap-4">
        <div
          class={`${sizeClasses.icon} rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow`}
        >
          <span class="font-heading font-black" style={{ fontSize: `${iconSize / 4}rem`, color: '#050508' }}>
            TR
          </span>
        </div>
        <div
          class={`font-heading font-black gradient-text lowercase ${sizeClasses.text}`}
          style={{ letterSpacing: '2px' }}
        >
          trendradar
        </div>
      </div>
    ),

    stacked: (
      <div class="flex flex-col items-center gap-3">
        <div
          class={`${sizeClasses.icon} rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow`}
        >
          <span class="font-heading font-black" style={{ fontSize: `${iconSize / 4}rem`, color: '#050508' }}>
            TR
          </span>
        </div>
        <div
          class={`font-heading font-black gradient-text lowercase ${sizeClasses.text}`}
          style={{ letterSpacing: '2px' }}
        >
          trendradar
        </div>
      </div>
    ),

    light: (
      <div class="flex items-center justify-center gap-4 bg-white rounded-xl p-6 border border-gray-200">
        <div
          class={`${sizeClasses.icon} rounded-xl flex items-center justify-center`}
          style={{ background: '#8B5CF6' }}
        >
          <span class="font-heading font-black" style={{ fontSize: `${iconSize / 4}rem`, color: '#F8FAFC' }}>
            TR
          </span>
        </div>
        <div
          class={`font-heading font-black ${sizeClasses.text}`}
          style={{ letterSpacing: '2px', color: '#8B5CF6' }}
        >
          trendradar
        </div>
      </div>
    ),

    "icon-only": (
      <div class="flex justify-center">
        <div
          class={`${sizeClasses.icon} rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow`}
        >
          <span class="font-heading font-black" style={{ fontSize: `${iconSize / 4}rem`, color: '#050508' }}>
            TR
          </span>
        </div>
      </div>
    )
  };

  const content = variants[variant];

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
