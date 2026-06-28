// ═════════════════════════════════════════════════════════════════════════
//   <Sheet />
//
//   Reusable bottom-sheet overlay. Slides up inside the app shell with a
//   dimmed backdrop. Closes on backdrop tap, the X button, or Escape.
//   Used for every secondary screen the app routes to (upgrade, share,
//   settings, swimmer detail, etc.).
// ═════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';

export default function Sheet({ title, subtitle, onClose, onBack, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 animate-backdrop-in"
      />

      {/* Panel */}
      <div className="relative bg-surface rounded-t-2xl max-h-[88%] flex flex-col animate-sheet-up shadow-2xl">
        {/* Grab handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-mid/30" />
        </div>

        <div className="flex items-start gap-2 px-5 pt-1 pb-3 border-b border-surface-2 shrink-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="shrink-0 -ml-1 w-8 h-8 rounded-full text-ink flex items-center justify-center active:bg-surface-2 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-bold text-lg text-ink leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-mid mt-0.5 leading-snug">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 ml-1 w-8 h-8 rounded-full bg-surface-2 text-ink flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
