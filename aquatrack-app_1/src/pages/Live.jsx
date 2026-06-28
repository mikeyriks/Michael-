// ═════════════════════════════════════════════════════════════════════════
//   <LivePage />
//
//   Mirrors brochure Page 5 — "Live results, even if you're stuck at
//   the office". Shows the race currently being timed, with the parent's
//   child highlighted, and a PB banner if applicable.
//
//   In production this page subscribes to a WebSocket channel for the
//   active gala. The `currentRace` object below is the same shape as the
//   server payload.
// ═════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import Header from '../components/Header.jsx';
import LaneRow from '../components/LaneRow.jsx';
import LiveRaceView from '../components/LiveRaceView.jsx';
import { currentRace, currentGala, swimmers, currentUser, liveRace } from '../data.js';
import { useNav } from '../App.jsx';

export default function LivePage() {
  const nav = useNav();
  const [showLive, setShowLive] = useState(false);
  const child = swimmers[currentUser.swimmers[0]];
  const childRace = currentRace.lanes.find((l) => l.swimmerId === child.id);

  // Sort by position for display
  const sortedLanes = [...currentRace.lanes].sort((a, b) => a.position - b.position);

  if (showLive) {
    return (
      <LiveRaceView
        race={liveRace}
        onClose={() => setShowLive(false)}
        onWatchVideo={() => nav.openVideo(liveRace.videoId)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header child={child} onAvatarClick={() => nav.openSheet({ type: 'swimmers' })} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-4 pb-6">
          {/* ─── Live indicator (tap to watch) ─── */}
          <button
            type="button"
            onClick={() => setShowLive(true)}
            className="inline-flex items-center gap-1.5 bg-coral text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 active:scale-95 transition-transform"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-live" />
            Live · Heat {currentGala.currentHeat} of {currentGala.totalHeats}
          </button>

          {/* ─── Race title ─── */}
          <h2 className="font-serif font-semibold text-xl text-ink leading-tight mb-1">
            {currentRace.event}
          </h2>
          <p className="text-[10px] uppercase tracking-wider text-mid mb-3">
            {currentGala.name} · {currentGala.venue}
          </p>

          {/* ─── Watch live entry ─── */}
          <button
            type="button"
            onClick={() => setShowLive(true)}
            className="w-full bg-ink text-surface rounded-md px-4 py-3 flex items-center justify-between mb-4 active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-coral rounded-full animate-pulse-live" />
              <span className="text-sm font-semibold">Watch live results</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-cyan">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* ─── Lane rows ─── */}
          <div className="flex flex-col gap-1">
            {sortedLanes.map((lane) => (
              <LaneRow
                key={lane.lane}
                lane={lane.lane}
                name={lane.name}
                school={lane.school}
                time={lane.time}
                position={lane.position}
                isPB={lane.isPB}
                isMine={lane.isCurrentChild}
                isFirst={lane.position === 1}
                onClick={() =>
                  nav.openSheet({
                    type: 'swimmer',
                    name: lane.name,
                    detail: lane.isCurrentChild ? 'Your child' : lane.school,
                    time: lane.time,
                    position: lane.position,
                    isPB: lane.isPB,
                  })
                }
              />
            ))}
          </div>

          {/* ─── Watch this race ─── */}
          <button
            type="button"
            onClick={() => nav.openVideo(liveRace.videoId)}
            className="mt-4 w-full bg-white border border-surface-2 rounded-md px-4 py-3 flex items-center justify-between active:bg-surface-2 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-cyan-pale text-cyan-deep flex items-center justify-center text-sm">▶</span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink leading-tight">Watch this race</span>
                <span className="block text-xs text-mid mt-0.5">Replay · stats · auto-coach insight</span>
              </span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-mid">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* ─── PB Banner ─── */}
          {childRace?.isPB && (
            <div className="mt-4 bg-ink rounded-md p-4 text-center animate-fade-in-up">
              <p className="text-cyan text-xs font-semibold uppercase tracking-wider mb-2">
                New personal best for {child.name.split(' ')[0]}
              </p>
              <p className="font-serif italic text-3xl text-cyan leading-none">
                {childRace.time}<span className="text-sun text-base ml-2">−1.4s</span>
              </p>
              <p className="text-mid-soft text-xs mt-2">
                beat previous PB by 1.4 seconds
              </p>
            </div>
          )}

          {/* ─── Up next ─── */}
          <div className="mt-6 border-t border-surface-2 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-2">
              Up next
            </p>
            <button
              type="button"
              onClick={() =>
                nav.openSheet({
                  type: 'reminder',
                  name: child.name,
                  subtitle: 'Girls 12 · 50m Backstroke · Heat 8',
                })
              }
              className="w-full flex justify-between items-center text-sm text-left active:opacity-70 transition-opacity"
            >
              <div>
                <p className="font-medium text-ink">Girls 12 · 50m Backstroke</p>
                <p className="text-xs text-mid">Heat 5 · in approximately 6 min</p>
              </div>
              <div className="text-cyan-deep text-xs font-semibold text-right">
                {child.name.split(' ')[0]} →
                <br />
                <span className="text-mid font-normal">Heat 8</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
