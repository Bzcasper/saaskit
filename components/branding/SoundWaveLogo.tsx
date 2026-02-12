// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * SoundWaveLogo - Animated equalizer bars
 * From BRANDING.HTML sound wave design
 */

interface SoundWaveLogoProps {
  bars?: number;
  showLabel?: boolean;
  label?: string;
}

export function SoundWaveLogo({ bars = 9, showLabel = true, label = "trendradar" }: SoundWaveLogoProps) {
  return (
    <div class="flex flex-col items-center gap-6">
      {/* Wave Bars */}
      <div class="flex items-center justify-center gap-1 h-30">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            class="w-2 bg-gradient-logo rounded"
            style={{
              animation: 'wave-dance 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <div
          class="font-heading font-black gradient-text lowercase"
          style={{
            fontSize: '48px',
            letterSpacing: '4px'
          }}
        >
          {label}
        </div>
      )}

      <style>{`
        @keyframes wave-dance {
          0%, 100% { height: 30px; }
          50% { height: 100px; }
        }
      `}</style>
    </div>
  );
}
