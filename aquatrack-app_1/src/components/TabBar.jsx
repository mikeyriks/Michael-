// ═════════════════════════════════════════════════════════════════════════
//   <TabBar />
//
//   Bottom tab bar — Live, Results, Videos, Profile. Sticks to bottom
//   of viewport, respects iOS safe-area-inset-bottom.
// ═════════════════════════════════════════════════════════════════════════

const TABS = [
  {
    id: 'live',
    label: 'Live',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M3 12L12 3l9 9M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'results',
    label: 'Results',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M5 4h14v16H5z M9 8h6 M9 12h6 M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M3 5l8 5-8 5V5z M14 5h6v14h-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 22c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav
      className="bg-white border-t border-surface-2 flex justify-around items-stretch shrink-0"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-1 transition-colors ${
              isActive ? 'text-cyan-deep' : 'text-mid'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium uppercase tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { TABS };
