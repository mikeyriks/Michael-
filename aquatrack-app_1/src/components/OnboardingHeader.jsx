// ═════════════════════════════════════════════════════════════════════════
//   <OnboardingHeader />
//
//   Shared header for all onboarding steps. Shows a back button (hidden
//   on first step) and a row of progress dots indicating which step we
//   are on out of the total.
// ═════════════════════════════════════════════════════════════════════════

export default function OnboardingHeader({ step, totalSteps, onBack, dark = false }) {
  const isFirstStep = step === 0;
  const accent = dark ? 'text-surface' : 'text-ink';
  const dim = dark ? 'text-mid-soft' : 'text-mid';
  const dotBase = dark ? 'bg-white/20' : 'bg-mid/30';
  const dotActive = 'bg-cyan';

  return (
    <header className="flex justify-between items-center px-5 pt-4 pb-3 shrink-0">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        aria-label="Go back"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-opacity ${
          isFirstStep ? 'opacity-0 pointer-events-none' : `${accent} hover:bg-white/5`
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Progress dots */}
      <div className="flex gap-1.5" aria-label={`Step ${step + 1} of ${totalSteps}`}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? `w-6 ${dotActive}` : `w-1.5 ${dotBase}`
            }`}
          />
        ))}
      </div>

      {/* Spacer to balance the back button width */}
      <div className="w-9" aria-hidden="true" />
    </header>
  );
}
