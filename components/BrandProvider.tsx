// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * BrandProvider - Root wrapper for brand variants
 */

import { ComponentChildren } from "preact";

interface BrandProviderProps {
  children: ComponentChildren;
  variant?: "default" | "experimental" | "minimal";
}

export function BrandProvider({ children, variant = "default" }: BrandProviderProps) {
  return (
    <div class={`brand-root brand-variant-${variant}`}>
      {children}
    </div>
  );
}
