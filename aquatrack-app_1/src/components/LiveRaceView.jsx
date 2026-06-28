// ═════════════════════════════════════════════════════════════════════════
//   <LiveRaceView />
//
//   An immersive, "live" race screen. A clock runs (sped up for the demo);
//   each lane is "in the water" until it passes its finish time, then locks
//   in a final time and position. The leaderboard re-orders live, and a
//   FINAL state appears when everyone has touched the wall.
//
//   In production the clock + finishes come from a WebSocket stream; the
//   rendering logic here stays identical.
// ═════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

const SPEED = 2.5; // demo playback multiplier (race ~34s → ~14s)

export default function LiveRaceView({ race, onClose, onWatchVideo }) {
  const maxFinish = Math.max(...race.lanes.map((l) => l.finish));
  const [clock, setClock] = useState(0);
  const [running, setRunning] = useState(true);
  const [streaming, setStreaming] = useState(true); // live video feed playing

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setClock((c) => {
        const next = c + 0.05 * SPEED;
        if (next >= maxFinish + 1.4) {
          clearInterval(id);
          setRunning(false);
          return maxFinish + 1.4;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [running, maxFinish]);

  // Live state per lane
  const lanes = race.lanes.map((l) => {
    const finished = clock >= l.finish;
    const progress = Math.min(clock / l.finish, 1);
    return { ...l, finished, progress };
  });

  // Live ranking: furthest-along first; ties broken by faster finish time
  const ranked = [...lanes].sort(
    (a, b) => b.progress - a.progress || a.finish - b.finish,
  );
  ranked.forEach((l, i) => (l.livePos = i + 1));

  const allDone = lanes.every((l) => l.finished);
  const child = lanes.find((l) => l.isCurrentChild);

  return (
    <div className="flex flex-col h-full bg-ink text-surface">
      {/* Header */}
      <div className="px-5 pt-3 pb-4 shrink-0 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-9 h-9 -ml-1 rounded-full text-surface flex items-center justify-center active:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {allDone ? (
            <span className="bg-white/10 text-surface px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Final
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-coral text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-live" />
              Live · Heat {race.heat} of {race.totalHeats}
            </span>
          )}

          {/* Race clock */}
          <span className="font-serif font-semibold text-lg tabular-nums text-cyan w-16 text-right">
            {clock.toFixed(1)}s
          </span>
        </div>

        <h2 className="font-serif font-semibold text-2xl leading-tight">{race.event}</h2>
        <p className="text-[10px] uppercase tracking-wider text-mid-soft mt-1">
          {race.gala} · {race.venue}
        </p>
      </div>

      {/* Live lanes (leaderboard order) */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {/* ─── Live video feed ─── */}
        <div
          className="relative rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-cyan-deep via-cyan to-ink"
          style={{ aspectRatio: '16 / 9' }}
        >
          <svg
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-40"
            aria-hidden="true"
          >
            <line x1="0" y1="25" x2="200" y2="25" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
            <line x1="0" y1="50" x2="200" y2="50" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
            <line x1="0" y1="75" x2="200" y2="75" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-transparent h-14" />

          {/* Top labels */}
          <div className="absolute top-2.5 left-2.5">
            {allDone ? (
              <span className="bg-white/15 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                Replay ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-coral text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse-live" /> Live
              </span>
            )}
          </div>
          <div className="absolute top-2.5 right-2.5 text-[10px] text-white/80">Camera 1 · Pool deck</div>

          {/* Center control */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {allDone ? (
              <button
                type="button"
                onClick={onWatchVideo}
                className="pointer-events-auto bg-white/95 text-ink text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-md shadow-lg active:scale-95 transition-transform"
              >
                ▶ Watch full replay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStreaming((s) => !s)}
                aria-label={streaming ? 'Pause live feed' : 'Play live feed'}
                className="pointer-events-auto w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                {streaming ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-ink">
                    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <div className="w-0 h-0 border-l-[14px] border-l-ink border-y-[9px] border-y-transparent ml-1" />
                )}
              </button>
            )}
          </div>

          {/* Live status bar */}
          {!allDone && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2">
              <span className="text-[10px] text-white font-semibold uppercase tracking-wider">
                {streaming ? 'Streaming live' : 'Paused'}
              </span>
              <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-coral rounded-full animate-pulse-live" style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {ranked.map((l) => (
            <div
              key={l.lane}
              className={`rounded-md px-3 py-2.5 transition-colors ${
                l.isCurrentChild
                  ? 'bg-cyan/15 border border-cyan/40'
                  : l.finished && l.livePos === 1
                  ? 'bg-sun/10 border border-sun/30'
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Position */}
                <span
                  className={`w-6 text-center font-serif italic font-bold text-lg leading-none ${
                    l.finished && l.livePos === 1 ? 'text-sun' : l.isCurrentChild ? 'text-cyan' : 'text-mid-soft'
                  }`}
                >
                  {l.livePos}
                </span>

                {/* Name + lane */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {l.name}
                    {l.isCurrentChild && <span className="ml-1.5 text-cyan">★</span>}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-mid-soft">
                    Lane {l.lane} · {l.school}
                  </p>
                </div>

                {/* Time / status */}
                <div className="text-right shrink-0 w-16">
                  {l.finished ? (
                    <>
                      <p className="font-serif font-semibold text-base tabular-nums text-cyan leading-none">
                        {l.finish.toFixed(2)}
                      </p>
                      {l.isPB && <p className="text-[9px] text-cyan-deep font-semibold mt-0.5">PB</p>}
                    </>
                  ) : (
                    <p className="text-[10px] uppercase tracking-wider text-mid-soft">In the water</p>
                  )}
                </div>
              </div>

              {/* Progress bar (only while racing) */}
              {!l.finished && (
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan rounded-full transition-[width] duration-75"
                    style={{ width: `${(l.progress * 100).toFixed(1)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Child PB celebration on completion */}
        {allDone && child?.isPB && (
          <div className="mt-4 bg-cyan/10 border border-cyan/30 rounded-md p-4 text-center animate-fade-in-up">
            <p className="text-cyan text-xs font-semibold uppercase tracking-wider mb-1">
              New personal best for {child.name.split(' ')[0]}
            </p>
            <p className="font-serif italic text-2xl text-cyan leading-none">
              {child.finish.toFixed(2)}
              <span className="text-sun text-sm ml-2">−1.4s</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="px-5 pb-6 pt-3 shrink-0 border-t border-white/10">
        {allDone ? (
          <div className="space-y-2">
            {onWatchVideo && (
              <button
                type="button"
                onClick={onWatchVideo}
                className="w-full bg-cyan text-ink font-semibold text-sm uppercase tracking-wider py-3.5 rounded-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <span className="text-base leading-none">▶</span> Watch race video
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setClock(0);
                setRunning(true);
              }}
              className="w-full border border-white/20 text-surface font-semibold text-sm uppercase tracking-wider py-3 rounded-md active:scale-[0.98] transition-transform"
            >
              ↻ Replay race
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-mid-soft">
            Live results stream in as each swimmer touches the wall.
          </p>
        )}
      </div>
    </div>
  );
}
