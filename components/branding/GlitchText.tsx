// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * GlitchText - Glitch effect for text
 * From BRANDING.HTML experimental visuals
 *
 * @param text - The text to display with glitch effect
 * @param duration - Animation duration in seconds (default: 2)
 * @param letterSpacing - Letter spacing in pixels (default: 8)
 * @param className - Additional CSS classes for customization
 */

interface GlitchTextProps {
  text: string;
  duration?: number;
  letterSpacing?: number;
  className?: string;
}

const glitchKeyframes = `
  @keyframes glitch {
    0%, 90%, 100% { transform: translate(0); }
    92% { transform: translate(-5px, 0); }
    94% { transform: translate(5px, 0); }
    96% { transform: translate(-5px, 0); }
    98% { transform: translate(5px, 0); }
  }
`;

export function GlitchText({
  text,
  duration = 2,
  letterSpacing = 8,
  className = ""
}: GlitchTextProps) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  return (
    <div class={`relative text-center ${className}`}>
      <span
        class="font-heading font-black text-h1 text-white relative"
        style={{
          animation: `glitch ${duration}s infinite`,
          letterSpacing: `${letterSpacing}px`
        }}
      >
        {text}
      </span>
      <style>{glitchKeyframes}</style>
    </div>
  );
}
