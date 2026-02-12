// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Brand System Utilities
 *
 * Centralized brand configuration and helper functions for trendradar
 * Ensures consistent brand application across all pages and components
 */

import {
  BRAND_COLORS,
  SITE_DESCRIPTION,
  SITE_MISSION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_VISION,
} from "@/utils/constants.ts";

/**
 * Official Brand Identity
 */
export const BRAND = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  tagline: SITE_TAGLINE,
  mission: SITE_MISSION,
  vision: SITE_VISION,
} as const;

/**
 * Logo Variants
 */
export const LOGOS = {
  /** Primary gradient wordmark */
  wordmark: {
    text: SITE_NAME,
    class:
      "font-heading font-black text-h2 gradient-text lowercase tracking-wide",
  },
  /** Icon mark (TR abbreviation) */
  icon: {
    text: "TR",
    class: "font-heading font-black text-2xl",
    containerClass:
      "w-64 h-64 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow",
  },
  /** Horizontal layout (icon + wordmark) */
  horizontal: {
    class: "flex items-center gap-16",
    iconClass:
      "w-48 h-48 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow",
    textClass:
      "font-heading font-black text-h5 gradient-text lowercase tracking-wide hidden sm:block",
  },
} as const;

/**
 * Official Slogans for Different Contexts
 */
export const SLOGANS = {
  /** Primary - Hero sections, main messaging */
  primary: {
    text: "Detecting the pulse of music trends",
    class:
      "text-h5 font-heading text-primary-300 border-l-4 border-primary pl-20",
    useCase: "Hero sections, main marketing materials, primary brand messaging",
  },
  /** Technical - Developer-facing pages */
  technical: {
    text: "Real-time music trend intelligence",
    class: "text-h5 font-heading text-secondary",
    useCase: "Developer documentation, API marketing, technical audiences",
  },
  /** Product - Feature-focused */
  product: {
    text: "Data-driven music discovery",
    class: "text-h5 font-heading text-accent",
    useCase: "Product features, user-facing applications, discovery tools",
  },
  /** Visionary - Press and investor materials */
  visionary: {
    text: "The future of music analytics",
    class: "text-h5 font-heading text-primary-300",
    useCase: "Press releases, investor materials, vision statements",
  },
  /** Community - Developer community */
  community: {
    text: "By developers, for developers",
    class: "text-h5 font-heading text-success",
    useCase: "Developer community, open-source projects, hackathons",
  },
} as const;

/**
 * Typography Scale
 */
export const TYPOGRAPHY = {
  h1: {
    class: "font-heading font-black text-h1 gradient-text",
    useCase: "Main page headings",
  },
  h2: {
    class: "font-heading font-black text-h2 gradient-text",
    useCase: "Section headings",
  },
  h3: {
    class: "font-heading font-bold text-h3 text-foreground",
    useCase: "Subsections",
  },
  h4: {
    class: "font-heading font-bold text-h4 text-foreground",
    useCase: "Card titles",
  },
  body: { class: "text-body text-foreground-muted", useCase: "Body text" },
  bodyLarge: {
    class: "text-body-lg text-foreground-muted",
    useCase: "Lead paragraphs",
  },
} as const;

/**
 * Layout Standards
 */
export const LAYOUT = {
  pagePadding: "p-16 lg:p-24",
  maxWidth: "max-w-container",
  cardPadding: "p-32",
  sectionGap: "gap-32",
} as const;

/**
 * Color Applications
 */
export const COLORS = {
  gradientText: "gradient-text",
  gradientBg: "bg-gradient-logo",
  primaryText: "text-primary",
  primaryBg: "bg-primary",
  mutedText: "text-foreground-muted",
  darkBg: "bg-background",
} as const;

/**
 * Brand Component Patterns
 */
export const PATTERNS = {
  /** Hero section with logo and slogan */
  hero: {
    container: "max-w-4xl mb-48",
    logo: "flex items-center gap-16 mb-24",
    title: TYPOGRAPHY.h1.class,
    description: TYPOGRAPHY.bodyLarge.class + " max-w-lg",
    slogan: SLOGANS.primary.class + " mt-16",
  },
  /** Page header with brand identity */
  pageHeader: {
    container: "text-center mb-48",
    logo: "flex justify-center mb-16",
    icon: LOGOS.icon.containerClass,
    title: TYPOGRAPHY.h2.class,
    description: TYPOGRAPHY.bodyLarge.class + " max-w-lg mx-auto",
    slogan: "text-h5 font-heading text-primary-300 mt-16",
  },
  /** Card with brand styling */
  card: {
    base: "card",
    elevated: "card card-elevated",
    withBorder: "card border-2 border-primary",
  },
  /** Button variants */
  button: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
  },
} as const;

/**
 * Get appropriate slogan for page context
 */
export function getSloganForContext(
  context: "hero" | "technical" | "product" | "visionary" | "community",
): string {
  return SLOGANS[context].text;
}

/**
 * Get brand colors for chart/data visualization
 */
export function getChartColors(): string[] {
  return [
    BRAND_COLORS.primary.electricPurple,
    BRAND_COLORS.secondary.neonCyan,
    BRAND_COLORS.secondary.accentPink,
    BRAND_COLORS.secondary.teal,
  ];
}

/**
 * Check if brand classes are properly applied
 */
export function validateBrandClasses(classes: string): boolean {
  const requiredPatterns = [
    "font-heading",
    "gradient-text",
    "text-foreground",
  ];
  return requiredPatterns.some((pattern) => classes.includes(pattern));
}

/**
 * Brand voice guidelines for microcopy
 */
export const VOICE = {
  buttons: {
    primary: "Get Started",
    secondary: "Learn More",
    submit: "Submit Discovery",
    upgrade: "Upgrade Now",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    notFound: "We couldn't detect that trend.",
    server: "Our radar is experiencing interference.",
  },
  success: {
    submit: "Your discovery has been shared.",
    upgrade: "Welcome to Premium!",
  },
} as const;

export default {
  BRAND,
  LOGOS,
  SLOGANS,
  TYPOGRAPHY,
  LAYOUT,
  COLORS,
  PATTERNS,
  VOICE,
  getSloganForContext,
  getChartColors,
  validateBrandClasses,
};
