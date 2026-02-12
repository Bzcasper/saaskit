// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * VUMeter - Analog VU meter visualization
 * From BRANDING.HTML mixed media visuals
 */

interface VUMeterProps {
  bars?: number;
}

export function VUMeter({ bars = 10 }: VUMeterProps) {
  return (
    <div class="flex gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          class="flex-1 h-28 bg-black rounded relative overflow-hidden"
        >
          <div
            class="absolute bottom-0 w-full bg-gradient-to-t from-red-500 via-amber-500 to-emerald-500"
            style={{
              height: "30%",
              animation: `vu-dance 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
