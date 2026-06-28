// ═════════════════════════════════════════════════════════════════════════
//   <Header />
//
//   Top bar inside the app. Shows the AquaTrack wordmark and the current
//   child's avatar. Tapping the avatar (in production) opens swimmer
//   switcher modal.
// ═════════════════════════════════════════════════════════════════════════

export default function Header({ title = null, child = null, onAvatarClick }) {
  return (
    <header className="px-5 pt-3 pb-3 flex justify-between items-center border-b border-surface-2 bg-white shrink-0">
      {title ? (
        <h1 className="font-serif font-bold text-lg text-ink leading-none">{title}</h1>
      ) : (
        <div className="font-serif font-bold text-lg text-ink leading-none tracking-tight">
          AquaTrack <span className="text-cyan-deep">/ KE</span>
        </div>
      )}

      {child && (
        <button
          type="button"
          onClick={onAvatarClick}
          aria-label={`Switch swimmer · current ${child.name}`}
          className="w-9 h-9 rounded-full bg-ink text-cyan flex items-center justify-center text-xs font-bold ring-2 ring-cyan/20 active:scale-95 transition-transform"
        >
          {child.avatar}
        </button>
      )}
    </header>
  );
}
