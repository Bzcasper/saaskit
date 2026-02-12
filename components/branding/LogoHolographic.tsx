// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * LogoHolographic - 3D holographic rotating logo
 * From BRANDING.HTML experimental visuals
 */

export function LogoHolographic() {
  return (
    <div class="relative w-80 h-80 mx-auto perspective-1000">
      <div class="w-full h-full" style="transform-style: preserve-3d; animation: hologram-rotate 20s linear infinite;">
        <div class="absolute inset-0 border-2 border-primary/60 rounded-full" style="animation: pulse-ring 3s ease-in-out infinite"></div>
        <div class="absolute inset-[12.5%] border-2 border-secondary/60 rounded-full" style="animation: pulse-ring 3s ease-in-out infinite 0.5s"></div>
        <div class="absolute inset-[25%] border-2 border-accent/60 rounded-full" style="animation: pulse-ring 3s ease-in-out infinite 1s"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-logo rounded-2xl flex items-center justify-center shadow-glow">
          <span class="font-heading font-black text-4xl">TR</span>
        </div>
      </div>

      <style>{`
        @keyframes hologram-rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
