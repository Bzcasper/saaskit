// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * RadarLogo - Dynamic scanning radar with music detection
 * From BRANDING.HTML radar logo design
 */

interface RadarLogoProps {
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export function RadarLogo(
  { size = 280, showLabel = true, label = "TR" }: RadarLogoProps,
) {
  return (
    <div class="relative" style={{ width: `${size}px`, height: `${size}px` }}>
      {/* Circle 1 - Outer */}
      <div
        class="absolute top-1/2 left-1/2 border-2 border-primary/30 rounded-full"
        style={{
          width: "100%",
          height: "100%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Circle 2 - Middle */}
      <div
        class="absolute top-1/2 left-1/2 border-2 border-secondary/30 rounded-full"
        style={{
          width: "70%",
          height: "70%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Circle 3 - Inner */}
      <div
        class="absolute top-1/2 left-1/2 border-2 border-accent/30 rounded-full"
        style={{
          width: "40%",
          height: "40%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Radar Sweep */}
      <div
        class="absolute top-0 left-1/2"
        style={{
          width: "50%",
          height: "50%",
          background:
            "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4))",
          transformOrigin: "bottom left",
          animation: "radar-spin 4s linear infinite",
        }}
      />

      {/* Center */}
      {showLabel && (
        <div
          class="absolute top-1/2 left-1/2 rounded-xl flex items-center justify-center font-heading font-black shadow-glow z-10"
          style={{
            width: "60px",
            height: "60px",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            color: "#050508",
            fontSize: "28px",
          }}
        >
          {label}
        </div>
      )}

      {/* Music Dots */}
      <div
        class="absolute w-3 h-3 bg-secondary rounded-full shadow-glow-secondary"
        style={{
          top: "30%",
          left: "70%",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      <div
        class="absolute w-3 h-3 bg-accent rounded-full"
        style={{
          top: "60%",
          right: "25%",
          boxShadow: "0 0 15px rgba(236, 72, 153, 0.8)",
          animation: "pulse 2s ease-in-out infinite 0.5s",
        }}
      />
      <div
        class="absolute w-3 h-3 bg-primary rounded-full shadow-glow"
        style={{
          bottom: "35%",
          left: "30%",
          animation: "pulse 2s ease-in-out infinite 1s",
        }}
      />

      <style>
        {`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}
      </style>
    </div>
  );
}
