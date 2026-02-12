// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * CircularEqualizer - Rotating rings radar effect
 * From BRANDING.HTML circular equalizer design
 */

interface CircularEqualizerProps {
  size?: number;
  showCenter?: boolean;
  centerLabel?: string;
}

export function CircularEqualizer({
  size = 280,
  showCenter = true,
  centerLabel = "♪",
}: CircularEqualizerProps) {
  return (
    <div class="relative" style={{ width: `${size}px`, height: `${size}px` }}>
      {/* Ring 1 - Outer */}
      <div
        class="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: "100%",
          height: "100%",
          borderStyle: "solid",
          borderWidth: "0",
          borderTopWidth: "8px",
          borderRightWidth: "8px",
          borderColor: "#8B5CF6",
          transform: "translate(-50%, -50%)",
          animation: "spin-slow 8s linear infinite",
        }}
      />

      {/* Ring 2 - Middle */}
      <div
        class="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: "75%",
          height: "75%",
          borderStyle: "solid",
          borderWidth: "0",
          borderTopWidth: "8px",
          borderRightWidth: "8px",
          borderColor: "#06B6D4",
          transform: "translate(-50%, -50%)",
          animation: "spin-reverse 6s linear infinite",
        }}
      />

      {/* Ring 3 - Inner */}
      <div
        class="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: "50%",
          height: "50%",
          borderStyle: "solid",
          borderWidth: "0",
          borderTopWidth: "8px",
          borderRightWidth: "8px",
          borderColor: "#EC4899",
          transform: "translate(-50%, -50%)",
          animation: "spin-slow 4s linear infinite",
        }}
      />

      {/* Center */}
      {showCenter && (
        <div
          class="absolute top-1/2 left-1/2 rounded-full flex items-center justify-center"
          style={{
            width: "60px",
            height: "60px",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)",
            fontSize: "28px",
          }}
        >
          {centerLabel}
        </div>
      )}

      <style>
        {`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
      `}
      </style>
    </div>
  );
}
