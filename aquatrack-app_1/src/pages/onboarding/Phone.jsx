// ═════════════════════════════════════════════════════════════════════════
//   <Phone /> — onboarding step 1
//
//   Phone number entry. Country code locked to +254. Accepts 9 digits
//   after the country code (Kenyan mobile format). Auto-strips leading
//   zero if the user types it.
// ═════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';

export default function Phone({ onNext }) {
  const [number, setNumber] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Format as "7XX XXX XXX" while typing
  const formatted = number.replace(/(\d{3})(\d{3})(\d{0,3})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(' '),
  );

  const isValid = number.length === 9 && number[0] !== '0';

  function handleChange(e) {
    // Strip non-digits; max 9 digits; if first char is 0, drop it
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('0')) v = v.slice(1);
    if (v.length > 9) v = v.slice(0, 9);
    setNumber(v);
  }

  function handleSubmit() {
    if (!isValid) return;
    onNext({ phone: `+254 ${formatted}` });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-6 pt-4">
        <h1 className="font-serif font-medium text-3xl leading-tight text-ink tracking-tight mb-2">
          What's your <span className="italic text-cyan-deep">number</span>?
        </h1>
        <p className="text-sm text-mid leading-snug mb-10">
          We'll text you a 6-digit code to confirm it's you. The number you
          use here becomes your AquaTrack login.
        </p>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-mid mb-2 block">
            Mobile number
          </span>
          <div className="flex items-center gap-3 bg-white border border-surface-2 rounded-md px-4 py-3 focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20 transition-all">
            <span className="font-serif font-semibold text-ink text-lg">+254</span>
            <div className="w-px h-6 bg-surface-2" />
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={formatted}
              onChange={handleChange}
              placeholder="7XX XXX XXX"
              className="flex-1 bg-transparent outline-none font-serif text-lg text-ink tabular-nums placeholder:text-mid-soft placeholder:font-sans placeholder:text-base"
            />
          </div>
        </label>

        <p className="text-xs text-mid mt-3 leading-snug">
          Standard Safaricom SMS rates apply. We never share your number with
          schools or other parents.
        </p>

        <div className="mt-8 bg-cyan-pale border border-cyan/20 rounded-md p-3 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-cyan-deep text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            i
          </div>
          <p className="text-xs text-ink-2 leading-snug">
            <strong className="text-ink">Pilot phase.</strong> AquaTrack is currently
            free. Premium features (slow-mo video, splits, family follow up to
            4 swimmers) become a paid tier from August 2026.
          </p>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="px-6 pb-6 pt-3 bg-surface">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full font-semibold text-sm uppercase tracking-wider py-4 rounded-md transition-all ${
            isValid
              ? 'bg-ink text-surface active:scale-[0.98]'
              : 'bg-surface-2 text-mid cursor-not-allowed'
          }`}
        >
          Send code
        </button>
      </div>
    </div>
  );
}
