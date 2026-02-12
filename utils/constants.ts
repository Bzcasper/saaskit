// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

// Brand Identity
export const SITE_NAME = "trendradar";
export const SITE_DESCRIPTION =
  "Empower developers and music platforms with real-time trend intelligence, enabling data-driven decisions that shape the future of music discovery.";
export const SITE_TAGLINE = "Detecting the pulse of music trends";
export const SITE_MISSION =
  "Empower developers and music platforms with real-time trend intelligence, enabling data-driven decisions that shape the future of music discovery.";
export const SITE_VISION =
  "To become the world's leading music trend intelligence platform, connecting artists, developers, and listeners through the power of data.";

// Brand Colors
export const BRAND_COLORS = {
  primary: {
    electricPurple: "#8B5CF6",
    neonCyan: "#06B6D4",
    deepViolet: "#6D28D9",
  },
  secondary: {
    accentPink: "#EC4899",
    teal: "#14B8A6",
  },
  neutral: {
    darkBackground: "#0F172A",
    darkerBackground: "#050508",
    softWhite: "#F8FAFC",
    mutedGray: "#94A3B8",
    darkGray: "#64748B",
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
} as const;

// Gradients
export const BRAND_GRADIENTS = {
  primary: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%)",
  logo: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
  radial: "radial-gradient(circle, #8B5CF6 0%, #0F172A 100%)",
  subtle:
    "linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)",
} as const;

// Typography
export const BRAND_FONTS = {
  heading: "Orbitron",
  body: "Plus Jakarta Sans",
  ui: "DM Sans",
  code: "JetBrains Mono",
} as const;

// Layout
export const LAYOUT = {
  maxWidth: "1280px",
  containerPadding: "24px",
  gridColumns: 12,
  baseUnit: 8,
} as const;

// Animation Durations
export const ANIMATION = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

// Social Links
export const SOCIAL_LINKS = {
  github: "https://github.com/trendradar",
  discord: "https://discord.gg/trendradar",
  twitter: "https://twitter.com/trendradar",
} as const;

// API Configuration
export const API_VERSION = "v1";
export const API_BASE_URL = "/api";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
