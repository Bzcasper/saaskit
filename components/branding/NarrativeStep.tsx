// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * NarrativeStep - Scroll storytelling component
 * From BRANDING.HTML experimental visuals
 */

export interface StepProps {
  number: string;
  title: string;
  description: string;
}

export function NarrativeStep({ number, title, description }: StepProps) {
  return (
    <div class="mb-16 opacity-30 hover:opacity-100 transition-opacity relative">
      <span class="font-heading text-h1 md:text-h2 text-primary/20 absolute -top-10 -left-5 leading-none select-none">
        {number}
      </span>
      <div class="relative z-10 pl-20">
        <h3 class="font-heading font-bold text-h5 text-white mb-4">{title}</h3>
        <p class="text-foreground-muted text-body leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
