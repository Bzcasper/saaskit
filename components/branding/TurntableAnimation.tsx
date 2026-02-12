// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * TurntableAnimation - Vinyl record turntable with spinning animation
 * From BRANDING.HTML experimental visuals
 */

export function TurntableAnimation() {
  return (
    <div class="relative w-[400px] h-[400px] mx-auto my-12">
      {/* Base */}
      <div class="absolute inset-0 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] shadow-2xl"></div>

      {/* Vinyl */}
      <div
        class="absolute top-1/2 left-1/2 w-[85%] h-[85%] rounded-full"
        style={{
          background: `repeating-radial-gradient(circle at center,
            #000 0%, #1a1a2e 20%, #000 20%, #0a0a0a 40%,
            #000 40%, #1a1a2e 60%, #000 60%, #0a0a0a 80%, #000 80%)`,
          transform: 'translate(-50%, -50%)',
          animation: 'vinyl-spin 3s linear infinite'
        }}
      >
        {/* Label */}
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-gradient-logo flex items-center justify-center shadow-glow">
          <span class="font-heading font-black text-xl">TR</span>
        </div>
      </div>

      {/* Tonearm */}
      <div
        class="absolute top-[10%] right-[10%] w-40 h-2 bg-gradient-to-r from-[#333] via-[#666] to-[#333] origin-right"
        style={{ animation: 'tonearm-play 8s ease-in-out infinite' }}
      >
        <div class="absolute -left-5 -top-1.5 w-10 h-5 bg-[#444] rounded-l"></div>
        <div class="absolute -right-5 -top-4 w-10 h-10 rounded-full bg-gradient-radial from-[#444] to-[#222]"></div>
      </div>

      <style>{`
        @keyframes vinyl-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes tonearm-play {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}
