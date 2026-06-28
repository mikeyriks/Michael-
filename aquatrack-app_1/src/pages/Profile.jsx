// ═════════════════════════════════════════════════════════════════════════
//   <ProfilePage />
//
//   Personal best history per stroke, family-follow swimmer switcher,
//   account settings. Premium-tier upgrades surface here.
// ═════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import Header from '../components/Header.jsx';
import { swimmers, currentUser, pbHistory } from '../data.js';
import { useAuth, useNav } from '../App.jsx';

export default function ProfilePage() {
  const [activeChild, setActiveChild] = useState(currentUser.swimmers[0]);
  const child = swimmers[activeChild];
  const { signOut, isGuest } = useAuth() || {};
  const nav = useNav();

  return (
    <div className="flex flex-col h-full">
      <Header title="Profile" />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* ─── Guest banner ─── */}
        {isGuest && (
          <div className="bg-cyan-pale border-b border-cyan/30 px-5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink leading-tight">
                You're browsing as a guest
              </p>
              <p className="text-[11px] text-ink-2 leading-snug mt-0.5">
                Showing sample data. Create an account to follow your own swimmer.
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="shrink-0 bg-ink text-surface text-xs font-semibold px-3 py-2 rounded-md active:scale-[0.98] transition-transform"
            >
              Create account
            </button>
          </div>
        )}

        {/* ─── Hero / swimmer card ─── */}
        <div className="bg-ink text-surface px-5 py-6">
          <p className="text-[10px] uppercase tracking-wider text-cyan font-semibold mb-1">
            {isGuest ? 'Sample swimmer' : 'Following'}
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-cyan-pale text-cyan-deep flex items-center justify-center font-bold text-lg">
              {child.avatar}
            </div>
            <div>
              <h2 className="font-serif font-semibold text-xl leading-tight">{child.name}</h2>
              <p className="text-xs text-mid-soft mt-0.5">
                {child.school} · Age {child.age}
              </p>
            </div>
          </div>

          {/* Family switcher */}
          {currentUser.swimmers.length > 1 && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              {currentUser.swimmers.map((id) => {
                const s = swimmers[id];
                const isActive = id === activeChild;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveChild(id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan text-ink'
                        : 'bg-white/10 text-mid-soft border border-white/10'
                    }`}
                  >
                    {s.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Personal bests ─── */}
        <div className="px-5 pt-5">
          <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-3">
            Personal bests
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(child.pbs).map(([event, pb]) => (
              <div
                key={event}
                className="bg-white border border-surface-2 rounded-md p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-mid font-semibold">
                  {formatEvent(event)}
                </p>
                <p className="font-serif font-semibold text-lg text-ink mt-1 leading-none tabular-nums">
                  {pb.time}
                </p>
                <p className="text-[10px] mt-1.5 text-cyan-deep font-semibold">
                  ▼ {Math.abs(pb.delta)}s improvement
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Trend chart ─── */}
        <div className="px-5 pt-6">
          <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-3">
            50m Freestyle · last 6 galas
          </p>
          <div className="bg-white border border-surface-2 rounded-md p-4">
            <TrendChart data={pbHistory['50FR']} />
          </div>
        </div>

        {/* ─── Premium upsell ─── */}
        <div className="px-5 pt-6">
          <div className="bg-gradient-to-br from-ink to-ink-soft text-surface rounded-md p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full -translate-y-12 translate-x-12" />
            <p className="text-[10px] uppercase tracking-wider text-cyan font-semibold mb-2">
              Upgrade
            </p>
            <h3 className="font-serif font-semibold text-xl mb-2 leading-tight">
              Premium for <span className="italic text-cyan">KES 4,500</span>/year
            </h3>
            <p className="text-sm text-mid-soft mb-4 leading-snug">
              Slow-mo replays, splits, downloadable videos, ad-free, family follow up to 4 swimmers.
            </p>
            <button
              type="button"
              onClick={() => nav.openSheet({ type: 'upgrade' })}
              className="bg-cyan text-ink px-5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider active:scale-[0.98] transition-transform"
            >
              Try free for 14 days
            </button>
          </div>
        </div>

        {/* ─── Account links ─── */}
        <div className="px-5 pt-6">
          <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-3">
            Account
          </p>
          <div className="bg-white border border-surface-2 rounded-md divide-y divide-surface-2">
            <AccountLink
              label="Notifications"
              sub="Push, SMS, email preferences"
              onClick={() => nav.openSheet({ type: 'notifications' })}
            />
            <AccountLink
              label="Manage swimmers"
              sub={`${currentUser.swimmers.length} swimmers · Add another`}
              onClick={() => nav.openSheet({ type: 'swimmers' })}
            />
            <AccountLink
              label="Subscription"
              sub="Free tier · upgrade to Premium"
              onClick={() => nav.openSheet({ type: 'upgrade' })}
            />
            <AccountLink
              label="Privacy & data"
              sub="Children's data settings"
              onClick={() => nav.openSheet({ type: 'privacy' })}
            />
            <AccountLink
              label="Help & contact"
              sub="WhatsApp +254 716 426 081"
              onClick={() => nav.openSheet({ type: 'help' })}
            />
            <AccountLink
              label="Visit aquatrack.co.ke"
              sub="Pricing, dates, school sign-up"
              onClick={() => window.open('https://aquatrack.co.ke', '_blank', 'noopener')}
            />
            <AccountLink
              label={isGuest ? 'Create account or sign in' : 'Sign out'}
              onClick={signOut}
            />
          </div>

          <p className="text-center text-[10px] text-mid mt-6">
            AquaTrack Kenya · v0.1.0 · Made in Nairobi
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountLink({ label, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-surface-2 transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-ink leading-tight">{label}</p>
        {sub && <p className="text-xs text-mid mt-0.5">{sub}</p>}
      </div>
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-mid">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── Inline SVG line chart for trend ──────────────────────────────────────
function TrendChart({ data }) {
  const W = 320;
  const H = 100;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const times = data.map((d) => d.time);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const range = max - min || 1;

  const xStep = innerW / (data.length - 1);
  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    // Faster times (lower numbers) sit at the BOTTOM of the chart so an
    // improving trend reads as a downward line — matches the brochure.
    y: padding.top + ((max - d.time) / range) * innerH,
    ...d,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${points[points.length - 1].x},${H - padding.bottom} L${points[0].x},${H - padding.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      <line x1={padding.left} y1={padding.top} x2={W - padding.right} y2={padding.top} stroke="#EFEAE0" strokeWidth="0.5" />
      <line x1={padding.left} y1={H - padding.bottom} x2={W - padding.right} y2={H - padding.bottom} stroke="#EFEAE0" strokeWidth="0.5" />

      {/* Area */}
      <path d={area} fill="#06B6D4" fillOpacity="0.12" />
      {/* Line */}
      <path d={path} fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isLast ? 5 : 3.5}
              fill={isLast ? '#F59E0B' : 'white'}
              stroke={isLast ? 'white' : '#06B6D4'}
              strokeWidth={isLast ? 2 : 1.5}
            />
            {isLast && (
              <text
                x={p.x}
                y={p.y - 9}
                fontSize="9"
                fontFamily="Lora, serif"
                fontStyle="italic"
                fontWeight="700"
                fill="#B45309"
                textAnchor="middle"
              >
                PB {p.time.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - 6}
          fontSize="8"
          fontFamily="Poppins, sans-serif"
          fill="#94A3B8"
          textAnchor="middle"
        >
          {p.gala}
        </text>
      ))}
    </svg>
  );
}

function formatEvent(eventCode) {
  // '50FR' → '50m Freestyle'
  const distance = eventCode.match(/^\d+/)[0];
  const stroke = eventCode.replace(/^\d+/, '');
  const strokes = { FR: 'Freestyle', BK: 'Backstroke', BR: 'Breaststroke', FL: 'Butterfly', IM: 'Medley' };
  return `${distance}m ${strokes[stroke] || stroke}`;
}
