// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * ScanningLogo - Active detection with scan line
 * From BRANDING.HTML scanning logo design
 */

interface ScanningLogoProps {
  size?: number;
  label?: string;
  icon?: string;
}

export function ScanningLogo({ size = 280, label = "trendradar", icon = "♫" }: ScanningLogoProps) {
  return (
    <div
      class="relative overflow-hidden rounded-2xl border-2 border-primary/30"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Scan Line */}
      <div
        class="absolute left-0 w-full h-0.5 z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)',
          animation: 'scan-move 3s ease-in-out infinite'
        }}
      />

      {/* Background Icon */}
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary opacity-30"
        style={{ fontSize: '80px' }}
      >
        {icon}
      </div>

      {/* Bottom Text */}
      <div
        class="absolute bottom-5 left-1/2 -translate-x-1/2 font-heading font-black gradient-text"
        style={{ fontSize: '24px' }}
      >
        {label}
      </div>

      <style>{`
        @keyframes scan-move {
          0%, 100% { top: 0; opacity: 1; }
          50% { top: calc(100% - 3px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
