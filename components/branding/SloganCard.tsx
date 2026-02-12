// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * SloganCard - Slogan cards with descriptions
 * From BRANDING#2.html slogan section
 */

import { ComponentChildren } from "preact";

interface SloganCardProps {
  variant?: "primary" | "technical" | "product" | "visionary" | "community";
  title?: string;
  description?: string;
  useCase?: string;
  children?: ComponentChildren;
}

export function SloganCard({
  variant = "primary",
  title,
  description,
  useCase,
  children,
}: SloganCardProps) {
  const slogans = {
    primary: {
      title: "Detecting pulse of music trends",
      description:
        "Our primary tagline that captures essence of real-time music trend detection and analysis. Emphasizes dynamic, living nature of music data.",
      useCase:
        "Use for: Hero sections, main marketing materials, primary brand messaging",
      borderColor: "#8B5CF6",
    },
    technical: {
      title: "Real-time music trend intelligence",
      description:
        "Technical tagline emphasizing real-time data processing and intelligent analytics capabilities of platform.",
      useCase:
        "Use for: Developer documentation, API marketing, technical audiences",
      borderColor: "#06B6D4",
    },
    product: {
      title: "Data-driven music discovery",
      description:
        "Focuses on the discovery aspect, highlighting how data powers better music recommendations and trend forecasting.",
      useCase:
        "Use for: Product features, user-facing applications, discovery tools",
      borderColor: "#EC4899",
    },
    visionary: {
      title: "The future of music analytics",
      description:
        "Visionary tagline positioning trendradar as industry leader in music analytics and trend prediction technology.",
      useCase: "Use for: Press releases, investor materials, vision statements",
      borderColor: "#F59E0B",
    },
    community: {
      title: "By developers, for developers",
      description:
        "Community-focused tagline emphasizing our developer-first approach and commitment to developer community.",
      useCase: "Use for: Developer community, open-source projects, hackathons",
      borderColor: "#10B981",
    },
  };

  const config = slogans[variant];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayUseCase = useCase || config.useCase;

  return (
    <div
      class="bg-background-card/40 rounded-2xl p-8 border-l-4"
      style={{ borderLeftColor: config.borderColor }}
    >
      <h3 class="font-heading font-bold text-h3 text-white mb-3">
        "{displayTitle}"
      </h3>
      <p class="text-foreground-muted text-body leading-relaxed mb-3">
        {displayDescription}
      </p>
      {children}
      <p class="text-foreground-dark text-body-sm mt-3 italic">
        {displayUseCase}
      </p>
    </div>
  );
}
