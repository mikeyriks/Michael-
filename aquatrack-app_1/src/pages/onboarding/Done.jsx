// ═════════════════════════════════════════════════════════════════════════
//   <Done /> — onboarding step 5
//
//   Success moment. Confirms what was set up, shows the swimmer they
//   now follow, and lands them into the Live tab.
// ═════════════════════════════════════════════════════════════════════════

export default function Done({ swimmer, onFinish }) {
  const firstName = swimmer?.name?.split(' ')[0] || 'your swimmer';
  const initials = (swimmer?.name || 'YS')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="h-full bg-ink text-surface flex flex-col relative overflow-hidden">
      {/* Decorative water bottom */}
      <svg
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="doneWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <rect x="0" y="500" width="390" height="344" fill="url(#doneWater)" />
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
      </svg>

      {/* Big checkmark — celebratory */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        <div className="relative mb-6 flex items-center justify-center">
          {/* Expanding ripple rings */}
          <span
            className="absolute w-24 h-24 rounded-full border border-cyan/40 animate-ripple-out"
            style={{ animationDelay: '250ms' }}
            aria-hidden="true"
          />
          <span
            className="absolute w-24 h-24 rounded-full border border-cyan/30 animate-ripple-out"
            style={{ animationDelay: '500ms' }}
            aria-hidden="true"
          />
          <div className="w-24 h-24 rounded-full bg-cyan/15 flex items-center justify-center animate-pop-in">
            <div className="w-16 h-16 rounded-full bg-cyan flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-ink">
                <path
                  className="check-draw"
                  d="M5 12l5 5L20 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="text-center animate-fade-in-up"
          style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan mb-4">
            You're all set
          </p>
          <h1 className="font-serif font-normal text-4xl leading-[1.05] tracking-tight mb-6">
            Now following<br />
            <span className="italic text-cyan">{firstName}.</span>
          </h1>
        </div>

        {/* Swimmer card */}
        <div
          className="bg-white/5 border border-white/10 rounded-md p-4 flex items-center gap-3 w-full max-w-[280px] animate-fade-in-up"
          style={{ animationDelay: '280ms', animationFillMode: 'backwards' }}
        >
          <div className="w-12 h-12 rounded-full bg-cyan-pale text-cyan-deep flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-surface leading-tight truncate">{swimmer.name}</p>
            <p className="text-xs text-mid-soft mt-0.5 truncate">
              {swimmer.schoolName || 'School'}
              {swimmer.age ? ` · Age ${swimmer.age}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="px-6 pb-10 z-10 animate-fade-in-up"
        style={{ animationDelay: '420ms', animationFillMode: 'backwards' }}
      >
        <button
          type="button"
          onClick={onFinish}
          className="w-full bg-cyan text-ink font-semibold text-sm uppercase tracking-wider py-4 rounded-md active:scale-[0.98] transition-transform"
        >
          Open the app
        </button>
        <p className="text-center text-xs text-mid-soft mt-4 leading-snug">
          You can add more swimmers any time from your profile.
        </p>
      </div>
    </div>
  );
}
