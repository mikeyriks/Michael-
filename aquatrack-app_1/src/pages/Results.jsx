// ═════════════════════════════════════════════════════════════════════════
//   <ResultsPage />
//
//   Mirrors brochure Page 7 — "Standings that update themselves". Three
//   tabs: Event (per-race rankings), School (team standings), Season
//   (cumulative rankings across the year).
//
//   In production this page reads from the same gala WebSocket plus a
//   REST endpoint for season aggregates.
// ═════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import Header from '../components/Header.jsx';
import { eventLeaderboards, schoolStandings, seasonRankings } from '../data.js';
import { useNav } from '../App.jsx';

export default function ResultsPage() {
  const [tab, setTab] = useState('event');

  return (
    <div className="flex flex-col h-full">
      <Header title="Leaderboards" />

      {/* ─── Sub-tabs ─── */}
      <div className="flex gap-4 px-5 border-b border-surface-2 shrink-0">
        {[
          { id: 'event', label: 'Event' },
          { id: 'school', label: 'School' },
          { id: 'season', label: 'Season' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t.id ? 'text-ink border-b-2 border-cyan' : 'text-mid'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {tab === 'event' && <EventTab />}
        {tab === 'school' && <SchoolTab />}
        {tab === 'season' && <SeasonTab />}
      </div>
    </div>
  );
}

// ─── Event leaderboards ────────────────────────────────────────────────────
function EventTab() {
  return (
    <div className="px-5 pt-4 space-y-6 animate-fade-in-up">
      {eventLeaderboards
        .filter((e) => e.isComplete)
        .map((event) => (
          <section key={event.eventId}>
            <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-1">
              {event.eventType === 'final' ? 'Final standings' : 'Heats'}
            </p>
            <h3 className="font-serif font-semibold text-base text-ink leading-tight mb-3">
              {event.title}
            </h3>

            <div className="space-y-1">
              {event.rankings.map((swimmer) => (
                <RankingRow key={swimmer.position} {...swimmer} />
              ))}
            </div>
          </section>
        ))}

      {eventLeaderboards.some((e) => !e.isComplete) && (
        <section className="opacity-60">
          <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-1">
            Up next
          </p>
          {eventLeaderboards
            .filter((e) => !e.isComplete)
            .map((event) => (
              <div key={event.eventId} className="bg-white rounded-md p-3 border border-surface-2">
                <p className="text-sm font-medium text-ink">{event.title}</p>
                <p className="text-xs text-mid mt-0.5">Awaiting final times</p>
              </div>
            ))}
        </section>
      )}
    </div>
  );
}

function RankingRow({ position, name, school, age, time, isPB, isCurrentChild }) {
  const nav = useNav();
  const wrapClass =
    position === 1
      ? 'bg-gradient-to-r from-amber-50 to-transparent'
      : position === 2
      ? 'bg-gradient-to-r from-gray-100 to-transparent'
      : position === 3
      ? 'bg-gradient-to-r from-orange-50 to-transparent'
      : 'bg-white';

  const positionColor =
    position === 1
      ? 'text-sun-deep'
      : position === 2
      ? 'text-gray-600'
      : position === 3
      ? 'text-orange-700'
      : 'text-mid';

  return (
    <button
      type="button"
      onClick={() =>
        nav.openSheet({
          type: 'swimmer',
          name,
          detail: isCurrentChild ? 'Your child' : `${school} · Age ${age}`,
          time,
          position,
          isPB,
        })
      }
      className={`w-full text-left grid grid-cols-[24px_1fr_56px] gap-2 items-center px-3 py-2 rounded-md active:scale-[0.99] transition-transform ${wrapClass}`}
    >
      <span className={`font-serif italic font-bold text-lg leading-none ${positionColor}`}>
        {position}
      </span>
      <div className="overflow-hidden">
        <p className="text-sm font-semibold text-ink leading-tight truncate">
          {name}
          {isCurrentChild && <span className="ml-1.5 text-cyan-deep">★</span>}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-mid">
          {school} · Age {age}
          {isPB && <span className="ml-2 text-cyan-deep font-semibold">PB</span>}
        </p>
      </div>
      <span className="font-serif font-semibold text-sm text-right text-ink tabular-nums">
        {time}
      </span>
    </button>
  );
}

// ─── School standings ──────────────────────────────────────────────────────
function SchoolTab() {
  const nav = useNav();
  return (
    <div className="px-5 pt-4 animate-fade-in-up">
      <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-1">
        Team standings · live
      </p>
      <h3 className="font-serif font-semibold text-base text-ink leading-tight mb-4">
        PIPSSA Invitational
      </h3>

      <div className="bg-ink text-surface rounded-md py-1 px-2">
        {schoolStandings.map((s, i) => (
          <button
            key={s.rank}
            type="button"
            onClick={() => nav.openSheet({ type: 'school', name: s.name, rank: s.rank, points: s.points })}
            className={`w-full flex items-center gap-3 py-2 px-2 rounded-md text-left active:bg-white/5 transition-colors ${
              i < schoolStandings.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            <span className={`font-serif italic font-bold text-base w-5 ${s.isOurSchool ? 'text-cyan' : 'text-mid-soft'}`}>
              {s.rank}
            </span>
            <span className={`flex-1 text-sm ${s.isOurSchool ? 'font-semibold text-surface' : 'text-mid-soft'}`}>
              {s.name}
              {s.isOurSchool && <span className="ml-2 text-cyan text-xs">★ Yours</span>}
            </span>
            <span className="text-xs text-mid-soft tabular-nums">
              {s.change > 0 && <span className="text-green-400">↑{s.change}</span>}
              {s.change < 0 && <span className="text-coral">↓{Math.abs(s.change)}</span>}
              {s.change === 0 && <span>—</span>}
            </span>
            <span className="font-serif font-semibold text-cyan tabular-nums w-14 text-right">
              {s.points}
              <span className="text-[10px] text-mid-soft font-sans ml-0.5">pts</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-mid-soft shrink-0">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-mid mt-3 text-center">
        Tap a school for its competitions · updated after every heat
      </p>
    </div>
  );
}

// ─── Season-long rankings ──────────────────────────────────────────────────
function SeasonTab() {
  const nav = useNav();
  return (
    <div className="px-5 pt-4 space-y-6 animate-fade-in-up">
      {seasonRankings.map((event) => (
        <section key={event.eventId}>
          <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-1">
            Aggregated · 2026 season
          </p>
          <h3 className="font-serif font-semibold text-base text-ink leading-tight mb-3">
            {event.title}
          </h3>

          <div className="space-y-1">
            {event.rankings.map((swimmer) => (
              <button
                key={swimmer.position}
                type="button"
                onClick={() =>
                  nav.openSheet({
                    type: 'swimmer',
                    name: swimmer.name,
                    detail: swimmer.isCurrentChild
                      ? 'Your child'
                      : `${swimmer.school} · ${swimmer.galas} galas`,
                    time: swimmer.time,
                    position: swimmer.position,
                  })
                }
                className={`w-full text-left grid grid-cols-[24px_1fr_56px] gap-2 items-center px-3 py-2 rounded-md active:scale-[0.99] transition-transform ${
                  swimmer.isCurrentChild ? 'bg-cyan-pale border border-cyan/30' : 'bg-white'
                }`}
              >
                <span className="font-serif italic font-bold text-base text-mid leading-none">
                  {swimmer.position}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink leading-tight">
                    {swimmer.name}
                    {swimmer.isCurrentChild && <span className="ml-1.5 text-cyan-deep">★</span>}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-mid">
                    {swimmer.school} · {swimmer.galas} galas
                  </p>
                </div>
                <span className="font-serif font-semibold text-sm text-right text-ink tabular-nums">
                  {swimmer.time}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-surface-2 rounded-md p-4 text-center mx-2">
        <p className="text-xs text-mid leading-relaxed">
          Season rankings update after each AquaTrack-timed gala on the
          PIPSSA, NCAA, KCAA and Kenya Aquatics circuits.
        </p>
      </div>
    </div>
  );
}
