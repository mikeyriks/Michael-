// ═════════════════════════════════════════════════════════════════════════
//   <Relationship /> — onboarding step 4
//
//   The legal step. Parent must confirm their relationship to the swimmer
//   and consent to receiving the child's data. Required for ODPC
//   compliance (Kenya's Data Protection Act, 2019).
// ═════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

const OPTIONS = [
  {
    id: 'parent',
    label: 'Parent',
    sub: 'I am the swimmer\'s mother or father',
  },
  {
    id: 'guardian',
    label: 'Legal guardian',
    sub: 'I have legal authority over the swimmer',
  },
  {
    id: 'family',
    label: 'Other family member',
    sub: 'With the parent\'s permission',
  },
  {
    id: 'coach',
    label: 'Coach or sports staff',
    sub: 'Authorised by the school',
  },
];

export default function Relationship({ swimmer, onNext }) {
  const [selected, setSelected] = useState(null);
  const [consent, setConsent] = useState(false);

  const firstName = swimmer?.name?.split(' ')[0] || 'the swimmer';
  const isValid = selected && consent;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-6 pt-4 overflow-y-auto no-scrollbar">
        <h1 className="font-serif font-medium text-3xl leading-tight text-ink tracking-tight mb-2">
          What's your relationship to{' '}
          <span className="italic text-cyan-deep">{firstName}</span>?
        </h1>
        <p className="text-sm text-mid leading-snug mb-6">
          We have to ask. Kenya's Data Protection Act says only authorised
          adults can access a child's race results and videos.
        </p>

        <div className="space-y-2 mb-6">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              className={`w-full p-4 rounded-md text-left transition-all border-2 ${
                selected === opt.id
                  ? 'bg-cyan-pale border-cyan-deep'
                  : 'bg-white border-surface-2 active:border-cyan-deep/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    selected === opt.id ? 'border-cyan-deep bg-cyan-deep' : 'border-mid'
                  }`}
                >
                  {selected === opt.id && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
                      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink leading-tight">{opt.label}</p>
                  <p className="text-xs text-mid mt-0.5 leading-snug">{opt.sub}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Consent block */}
        <button
          type="button"
          onClick={() => setConsent(!consent)}
          className={`w-full p-4 rounded-md text-left transition-all border-2 ${
            consent
              ? 'bg-cyan-pale border-cyan-deep'
              : 'bg-white border-surface-2'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                consent ? 'border-cyan-deep bg-cyan-deep' : 'border-mid'
              }`}
            >
              {consent && (
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="flex-1 text-xs text-ink-2 leading-snug">
              I confirm I have authority to receive {firstName}'s race
              results and videos, and I agree to AquaTrack's{' '}
              <span className="text-cyan-deep font-semibold underline">
                Privacy Policy
              </span>
              {' '}and{' '}
              <span className="text-cyan-deep font-semibold underline">
                Terms of Service
              </span>
              . I can withdraw consent and delete this account at any time.
            </p>
          </div>
        </button>

        <p className="text-[10px] text-mid mt-4 text-center leading-snug">
          AquaTrack Kenya is registered with the Office of the Data Protection
          Commissioner (ODPC). Children's data is stored encrypted and never
          sold or shared with advertisers.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3 bg-surface shrink-0">
        <button
          type="button"
          onClick={() => isValid && onNext({ relationship: selected, consent: true })}
          disabled={!isValid}
          className={`w-full font-semibold text-sm uppercase tracking-wider py-4 rounded-md transition-all ${
            isValid
              ? 'bg-ink text-surface active:scale-[0.98]'
              : 'bg-surface-2 text-mid cursor-not-allowed'
          }`}
        >
          Finish setup
        </button>
      </div>
    </div>
  );
}
