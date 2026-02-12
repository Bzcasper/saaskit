// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * AudioReactiveCard - Card with audio-reactive visual animations
 * From BRANDING.HTML experimental visuals
 */

interface CardProps {
  title: string;
  description: string;
  visualType: "circular" | "spectrum" | "waveform" | "particles";
}

export function AudioReactiveCard({ title, description, visualType }: CardProps) {
  const visuals = {
    circular: (
      <div class="absolute inset-0 flex items-center justify-center">
        {[0, 0.4, 0.8].map((delay, i) => (
          <div
            key={i}
            class="absolute border-2 border-primary rounded-full"
            style={{
              animation: "cv-expand 2s ease-out infinite",
              animationDelay: `${delay}s`
            }}
          />
        ))}
      </div>
    ),
    spectrum: (
      <div class="absolute inset-0 flex items-end justify-center gap-1 pb-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            class="w-3 bg-gradient-to-t from-primary via-secondary to-accent rounded-t"
            style={{
              height: "30%",
              animation: "spectrum-dance 0.6s ease-in-out infinite",
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>
    ),
    waveform: (
      <div class="absolute inset-0 flex items-center overflow-hidden">
        <div
          class="w-[200%] h-0.5 bg-gradient-to-r from-transparent via-primary via-secondary via-accent to-transparent"
          style={{ animation: "wave-flow 2s linear infinite" }}
        />
      </div>
    ),
    particles: (
      <div class="absolute inset-0">
        {[0, 1, 2].map((delay) => (
          <div
            key={delay}
            class="absolute w-2 h-2 bg-primary rounded-full shadow-glow"
            style={{
              animation: "particle-orbit 4s linear infinite",
              animationDelay: `${delay}s`
            }}
          />
        ))}
      </div>
    )
  };

  return (
    <div class="bg-background-card/40 border-2 border-primary/30 rounded-2xl p-8 relative overflow-hidden hover:-translate-y-1 hover:border-primary/60 transition-all group">
      <div class="h-40 relative mb-6">
        {visuals[visualType]}
      </div>
      <h3 class="font-heading font-bold text-h3 text-white mb-2">{title}</h3>
      <p class="text-foreground-muted text-body">{description}</p>

      <style>{`
        @keyframes cv-expand {
          0% { width: 20px; height: 20px; opacity: 1; }
          100% { width: 150px; height: 150px; opacity: 0; }
        }
        @keyframes spectrum-dance {
          0%, 100% { height: 30%; }
          50% { height: 80%; }
        }
        @keyframes wave-flow {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes particle-orbit {
          0% { top: 50%; left: 10%; transform: scale(1); }
          25% { top: 10%; left: 50%; transform: scale(1.5); }
          50% { top: 50%; left: 90%; transform: scale(1); }
          75% { top: 90%; left: 50%; transform: scale(0.5); }
          100% { top: 50%; left: 10%; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
