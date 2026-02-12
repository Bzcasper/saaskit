// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * Banner - Marketing and social media banners
 * From BRANDING#2.html banner designs
 */

import { ComponentChildren } from "preact";

interface BannerProps {
  variant?: "gradient" | "dark" | "sound-wave" | "radar-circle";
  title?: string;
  slogan?: string;
  children?: ComponentChildren;
  class?: string;
}

export function Banner({
  variant = "gradient",
  title = "trendradar",
  slogan = "Detecting pulse of music trends",
  children,
  class: className = "",
}: BannerProps) {
  const banners = {
    gradient: (
      <div
        class="relative rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%)",
        }}
      >
        {/* Animated ripple effect */}
        <div
          class="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.1)",
            transform: "translate(-50%, -50%)",
            animation: "ripple 3s ease-out infinite",
          }}
        />
        <div class="relative z-10 p-16 text-center">
          <div
            class="font-heading font-black mb-4"
            style={{
              fontSize: "64px",
              letterSpacing: "4px",
              textTransform: "lowercase",
              color: "#050508",
            }}
          >
            {title}
          </div>
          <div
            class="font-body text-body-lg"
            style={{ color: "#050508", opacity: 0.9 }}
          >
            {slogan}
          </div>
          {children}
        </div>
      </div>
    ),

    dark: (
      <div
        class="relative rounded-2xl overflow-hidden border-2 border-primary/30"
        style={{ background: "#0F172A" }}
      >
        <div
          class="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
          }}
        />
        <div class="relative z-10 p-16 text-center">
          <div
            class="font-heading font-black gradient-text mb-4"
            style={{
              fontSize: "64px",
              letterSpacing: "4px",
              textTransform: "lowercase",
            }}
          >
            {title}
          </div>
          <div class="text-foreground-muted text-body-lg">
            {slogan}
          </div>
          {children}
        </div>
      </div>
    ),

    "sound-wave": (
      <div
        class="relative rounded-2xl overflow-hidden border-2 border-primary/20"
        style={{
          background: "linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%)",
        }}
      >
        <div class="relative z-10 p-16 text-center">
          {/* Sound Wave Visual */}
          <div class="flex justify-center gap-0.5 mb-8 h-20">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                class="w-1.5 bg-gradient-logo rounded-t"
                style={{
                  animation: "wave-dance 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div
            class="font-heading font-black gradient-text"
            style={{
              fontSize: "56px",
              letterSpacing: "4px",
              textTransform: "lowercase",
            }}
          >
            {title}
          </div>
          <div class="text-foreground-muted text-body-lg mt-2">
            {slogan}
          </div>
          {children}
        </div>
      </div>
    ),

    "radar-circle": (
      <div
        class="relative rounded-2xl overflow-hidden border-2 border-primary/20 p-10 text-center"
        style={{ background: "#0F172A" }}
      >
        {/* Radar Circle Visual */}
        <div class="relative w-50 h-50 mx-auto mb-6">
          <div
            class="absolute top-1/2 left-1/2 border-2 border-primary/30 rounded-full"
            style={{
              width: "100%",
              height: "100%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            class="absolute top-1/2 left-1/2 border-2 border-secondary/30 rounded-full"
            style={{
              width: "65%",
              height: "65%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            class="absolute top-1/2 left-1/2 rounded-full flex items-center justify-center shadow-glow"
            style={{
              width: "35%",
              height: "35%",
              transform: "translate(-50%, -50%)",
              background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            }}
          >
            <span style={{ fontSize: "36px" }}>♪</span>
          </div>
        </div>
        <div
          class="font-heading font-black gradient-text"
          style={{
            fontSize: "48px",
            letterSpacing: "4px",
            textTransform: "lowercase",
          }}
        >
          {title}
        </div>
        <div class="text-foreground-muted text-body-lg mt-2">
          {slogan}
        </div>
        {children}
      </div>
    ),
  };

  return (
    <div class={className}>
      {banners[variant]}
      <style>
        {`
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes wave-dance {
          0%, 100% { height: 30px; }
          50% { height: 80px; }
        }
      `}
      </style>
    </div>
  );
}
