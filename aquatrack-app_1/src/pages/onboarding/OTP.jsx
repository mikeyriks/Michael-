// ═════════════════════════════════════════════════════════════════════════
//   <OTP /> — onboarding step 2
//
//   6-digit one-time password entry. Each digit is its own focusable
//   input that auto-advances. Resend countdown starts at 30s.
//
//   In the mock: ANY 6 digits are accepted EXCEPT "000000", which is
//   reserved to demonstrate the error state. In production: the backend
//   validates against the code SMS'd via Africa's Talking and this same
//   error UI fires on a mismatch.
// ═════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';

// Reserved code that triggers the "wrong code" UI in demo mode.
// In production, replace the check below with the backend verify call.
const DEMO_REJECT_CODE = '000000';

export default function OTP({ phone, onNext }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // Verify when all 6 digits are entered
  useEffect(() => {
    if (digits.every((d) => d !== '')) {
      const code = digits.join('');
      // Small delay so the user sees the last digit appear
      const t = setTimeout(() => {
        if (code === DEMO_REJECT_CODE) {
          // Wrong code: shake, clear, refocus — do NOT advance
          setError(true);
          setShakeKey((k) => k + 1);
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          onNext({ otp: code });
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [digits, onNext]);

  function handleChange(idx, value) {
    if (!/^\d?$/.test(value)) return;
    if (error) setError(false); // clear error as soon as the user retypes
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = pasted.split('').concat(Array(6 - pasted.length).fill(''));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(30);
    setError(false);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-6 pt-4">
        <h1 className="font-serif font-medium text-3xl leading-tight text-ink tracking-tight mb-2">
          Check your <span className="italic text-cyan-deep">texts</span>.
        </h1>
        <p className="text-sm text-mid leading-snug mb-2">
          We sent a 6-digit code to
        </p>
        <p className="text-base font-semibold text-ink tabular-nums mb-10">{phone}</p>

        <div
          key={shakeKey}
          className={`flex justify-between gap-2 mb-4 ${error ? 'animate-shake' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-invalid={error}
              className={`w-12 h-14 text-center font-serif font-semibold text-2xl bg-white border-2 rounded-md tabular-nums outline-none transition-all ${
                error
                  ? 'border-coral text-coral'
                  : d
                    ? 'border-cyan-deep text-ink'
                    : 'border-surface-2 text-mid focus:border-cyan-deep'
              }`}
            />
          ))}
        </div>

        {/* Error message — reserves no extra layout when hidden */}
        <p
          role="alert"
          className={`text-center text-sm text-coral mb-4 transition-opacity ${
            error ? 'opacity-100' : 'opacity-0'
          }`}
        >
          That code didn't match. Check your texts and try again.
        </p>

        <div className="text-center">
          {secondsLeft > 0 ? (
            <p className="text-sm text-mid">
              Resend code in <span className="font-semibold text-ink tabular-nums">{secondsLeft}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-cyan-deep font-semibold underline"
            >
              Resend code
            </button>
          )}
        </div>

        <div className="mt-12 bg-surface-2 rounded-md p-4">
          <p className="text-xs text-mid leading-snug">
            <strong className="text-ink">Demo mode:</strong> Any 6 digits are
            accepted — except <span className="font-semibold text-ink tabular-nums">000000</span>,
            which shows the "wrong code" state. The real app verifies against an
            SMS sent via Safaricom.
          </p>
        </div>
      </div>
    </div>
  );
}
