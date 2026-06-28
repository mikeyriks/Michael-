// ═════════════════════════════════════════════════════════════════════════
//   <Onboarding /> — state machine for the 6-step flow
//
//   Holds the accumulated data as the user progresses. Provides back
//   navigation. Calls onComplete with the full user record at the end.
//
//   Step 0 — Welcome      (no header, no progress dots)
//   Step 1 — Phone         ┐
//   Step 2 — OTP            │
//   Step 3 — FindSwimmer    │  Standard layout with header + dots
//   Step 4 — Relationship  ┘
//   Step 5 — Done          (no header, success state)
// ═════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import OnboardingHeader from '../../components/OnboardingHeader.jsx';
import Welcome from './Welcome.jsx';
import Phone from './Phone.jsx';
import OTP from './OTP.jsx';
import FindSwimmer from './FindSwimmer.jsx';
import Relationship from './Relationship.jsx';
import Done from './Done.jsx';

// Steps that show the standard header (back button + progress dots) on light background
const HEADER_STEPS = new Set([1, 2, 3, 4]);
const TOTAL_TRACKED_STEPS = 4; // shown in progress dots

export default function Onboarding({ onComplete, onGuest }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState('fwd');
  const [data, setData] = useState({});

  function advance(partial) {
    setDir('fwd');
    setData((prev) => ({ ...prev, ...partial }));
    setStep((s) => s + 1);
  }

  function goBack() {
    setDir('back');
    setStep((s) => Math.max(0, s - 1));
  }

  function finish() {
    onComplete(data);
  }

  const showHeader = HEADER_STEPS.has(step);
  // Progress dots map: step 1 → dot 0, step 2 → dot 1, etc.
  const progressIndex = step - 1;

  return (
    <div className="h-full flex flex-col bg-surface">
      {showHeader && (
        <OnboardingHeader
          step={progressIndex}
          totalSteps={TOTAL_TRACKED_STEPS}
          onBack={goBack}
        />
      )}

      <div className="flex-1 overflow-hidden relative">
        {/* Keyed on step so each transition replays; direction picks the slide */}
        <div
          key={step}
          className={`h-full ${dir === 'fwd' ? 'animate-slide-fwd' : 'animate-slide-back'}`}
        >
          {step === 0 && <Welcome onNext={() => advance({})} onGuest={onGuest} />}
          {step === 1 && <Phone onNext={(d) => advance(d)} />}
          {step === 2 && <OTP phone={data.phone} onNext={(d) => advance(d)} />}
          {step === 3 && <FindSwimmer onNext={(d) => advance(d)} />}
          {step === 4 && <Relationship swimmer={data.swimmer} onNext={(d) => advance(d)} />}
          {step === 5 && <Done swimmer={data.swimmer} onFinish={finish} />}
        </div>
      </div>
    </div>
  );
}
