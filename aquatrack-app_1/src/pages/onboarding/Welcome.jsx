// ═════════════════════════════════════════════════════════════════════════
//   <Welcome /> — onboarding step 0
//
//   The 0→1 moment. Brand-leading composition: navy background, abstract
//   pool-water SVG, Lora display headline, single CTA. Mirrors the
//   brochure cover aesthetic exactly.
// ═════════════════════════════════════════════════════════════════════════

export default function Welcome({ onNext, onGuest }) {
  return (
    <div className="h-full bg-ink text-surface flex flex-col relative overflow-hidden">
      {/* Decorative water composition */}
      <svg
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="welcomeWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Decorative concentric circles top-right */}
        <g opacity="0.35">
          <circle cx="340" cy="120" r="70" fill="none" stroke="#06B6D4" strokeWidth="0.4" />
          <circle cx="340" cy="120" r="50" fill="none" stroke="#06B6D4" strokeWidth="0.4" />
          <circle cx="340" cy="120" r="30" fill="none" stroke="#06B6D4" strokeWidth="0.4" />
          <circle cx="340" cy="120" r="12" fill="#06B6D4" opacity="0.5" />
        </g>

        {/* Pool lane stripes bottom */}
        <rect x="0" y="500" width="390" height="344" fill="url(#welcomeWater)" />
        <g opacity="0.6">
          <line x1="0" y1="540" x2="390" y2="540" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="6,4" />
          <line x1="0" y1="580" x2="390" y2="580" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="6,4" />
          <line x1="0" y1="620" x2="390" y2="620" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="6,4" />
          <line x1="0" y1="660" x2="390" y2="660" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="6,4" />
        </g>

        {/* Wave silhouettes */}
        <path
          d="M 0 510 Q 60 502, 120 510 T 240 510 T 390 510 L 390 844 L 0 844 Z"
          fill="#06B6D4"
          opacity="0.04"
        />
        <path
          d="M 0 528 Q 60 518, 120 528 T 240 528 T 390 528 L 390 844 L 0 844 Z"
          fill="#06B6D4"
          opacity="0.06"
        />

        {/* Splash dots */}
        <g fill="#06B6D4" opacity="0.5">
          <circle cx="40" cy="490" r="1.2" />
          <circle cx="80" cy="485" r="1" />
          <circle cx="140" cy="495" r="1.5" />
          <circle cx="200" cy="488" r="1" />
          <circle cx="340" cy="500" r="1.2" />
        </g>
      </svg>

      {/* Brand mark top-left */}
      <div className="px-6 pt-12 z-10 animate-fade-in-up">
        <p className="font-serif font-bold text-base leading-none">
          AquaTrack <span className="text-cyan">/ KE</span>
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-10 z-10">
        <div className="animate-fade-in-up" style={{ animationDelay: '120ms', animationFillMode: 'backwards' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan mb-5">
            Karibu
          </p>
          <h1 className="font-serif font-normal text-[44px] leading-[0.98] tracking-tight mb-5">
            Every race.<br />
            <span className="italic text-cyan">Every parent's</span><br />
            pocket.
          </h1>
          <p className="text-base text-mid-soft leading-snug max-w-[280px] mb-10">
            Live race results, video replays and leaderboards from school
            galas across Kenya — the moment they happen.
          </p>

          <button
            type="button"
            onClick={onNext}
            className="w-full bg-cyan text-ink font-semibold text-sm uppercase tracking-wider py-4 rounded-md active:scale-[0.98] transition-transform"
          >
            Get started
          </button>

          <p className="text-center text-xs text-mid-soft mt-4">
            Already have an account?{' '}
            <button type="button" onClick={onNext} className="text-cyan underline">
              Sign in
            </button>
          </p>

          {/* Guest path — explore on sample data before signing up */}
          <button
            type="button"
            onClick={onGuest}
            className="w-full mt-5 pt-4 border-t border-white/10 text-center text-sm text-surface font-medium active:opacity-70 transition-opacity"
          >
            Just looking? <span className="text-cyan">Browse as a guest →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
