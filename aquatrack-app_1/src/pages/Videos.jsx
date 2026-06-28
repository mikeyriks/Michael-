// ═════════════════════════════════════════════════════════════════════════
//   <VideosPage />
//
//   Mirrors brochure Page 6 — "Every race, on every parent's phone, in
//   90 seconds". Two states:
//   - List view (default): all races as thumbnails, latest first
//   - Player view: when a video is tapped, full-screen player with stats
//
//   In production: thumbnails are real frames, videos stream from a CDN.
//   Slow-mo playback is a Premium-tier feature.
// ═════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { videos, swimmers, currentUser } from '../data.js';
import { useNav } from '../App.jsx';

export default function VideosPage() {
  const nav = useNav();
  const [activeVideoId, setActiveVideoId] = useState(null);
  const child = swimmers[currentUser.swimmers[0]];

  // Deep-link: if another screen asked to open a specific video, honor it
  useEffect(() => {
    if (nav?.videoRequest) {
      setActiveVideoId(nav.videoRequest);
      nav.clearVideoRequest();
    }
  }, [nav?.videoRequest]);

  const activeVideo = videos.find((v) => v.id === activeVideoId);

  if (activeVideo) {
    return <VideoPlayer video={activeVideo} onClose={() => setActiveVideoId(null)} />;
  }

  return (
    <div className="flex flex-col h-full">
      <Header child={child} onAvatarClick={() => nav.openSheet({ type: 'swimmers' })} />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        <div className="px-5 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-1">
            Race videos · {child.name.split(' ')[0]}
          </p>
          <h2 className="font-serif font-semibold text-xl text-ink leading-tight mb-1">
            {videos.length} races, all yours.
          </h2>
          <p className="text-sm text-mid mb-5">
            Every gala, every event. Auto-clipped, ready to share.
          </p>

          <div className="grid gap-3">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => setActiveVideoId(video.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single video card in the list ────────────────────────────────────────
function VideoCard({ video, onPlay }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="bg-white rounded-lg overflow-hidden border border-surface-2 text-left active:scale-[0.98] transition-transform"
    >
      {/* Thumbnail with gradient + play button */}
      <div className={`relative h-32 bg-gradient-to-br ${video.thumbnailGradient} overflow-hidden`}>
        {/* Decorative pool lanes */}
        <svg
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-50"
          aria-hidden="true"
        >
          <line x1="0" y1="20" x2="200" y2="20" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          <line x1="0" y1="40" x2="200" y2="40" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          <line x1="0" y1="60" x2="200" y2="60" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          <line x1="0" y1="80" x2="200" y2="80" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
        </svg>

        {/* Top labels */}
        <div className="absolute top-2.5 left-2.5">
          {video.isLatest && (
            <span className="inline-flex items-center gap-1 bg-coral text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse-live" /> NEW
            </span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5 text-[10px] text-white/80 font-medium text-right">
          {video.cameraAngle}
        </div>

        {/* Duration */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-0 h-0 border-l-[12px] border-l-ink border-y-[8px] border-y-transparent ml-1" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="font-serif font-semibold text-base text-ink leading-tight">{video.title}</h4>
        <p className="text-[10px] uppercase tracking-wider text-mid mt-0.5">
          {video.galaName} · {new Date(video.eventDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-surface-2">
          <Stat label="Time" value={video.stats.time} sub={video.stats.isPB ? `PB · ${video.stats.pbDelta > 0 ? '+' : ''}${video.stats.pbDelta}s` : null} subColor="text-cyan-deep" />
          <Stat label="Position" value={video.stats.position} sub={`of ${video.stats.totalSwimmers}`} suffix={['','st','nd','rd'][video.stats.position] || 'th'} />
          <Stat label="Reaction" value={video.stats.reaction} sub="seconds" />
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value, suffix, sub, subColor = 'text-mid' }) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-mid">{label}</p>
      <p className="font-serif font-semibold text-base text-ink leading-none mt-0.5 tabular-nums">
        {value}
        {suffix && <sup className="text-[8px]">{suffix}</sup>}
      </p>
      {sub && <p className={`text-[9px] mt-0.5 ${subColor}`}>{sub}</p>}
    </div>
  );
}

// ─── Full-screen video player ──────────────────────────────────────────────
function VideoPlayer({ video, onClose }) {
  const nav = useNav();
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Video frame (mocked) */}
      <div className={`relative bg-gradient-to-br ${video.thumbnailGradient} flex-shrink-0`} style={{ aspectRatio: '16/9' }}>
        <svg
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-50"
          aria-hidden="true"
        >
          <line x1="0" y1="20" x2="200" y2="20" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          <line x1="0" y1="40" x2="200" y2="40" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          <line x1="0" y1="60" x2="200" y2="60" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
          <line x1="0" y1="80" x2="200" y2="80" stroke="white" strokeWidth="0.4" strokeDasharray="3,2" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent h-16" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
          aria-label="Close video"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute top-3 right-3 text-[10px] text-white/80 text-right">
          <span className="bg-coral text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">REPLAY</span>
          <p className="mt-1">Heat 4 · Lane 3 · {video.cameraAngle}</p>
        </div>

        {/* Play / pause — overlay must not block the close button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause' : 'Play'}
            className="pointer-events-auto w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-ink">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <div className="w-0 h-0 border-l-[16px] border-l-ink border-y-[10px] border-y-transparent ml-1.5" />
            )}
          </button>
        </div>

        {/* Progress */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-cyan rounded-full" style={{ width: playing ? '60%' : '35%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-white font-medium mt-1.5">
            <span>{playing ? '0:19' : '0:11'}</span>
            <span>0:{video.duration}</span>
          </div>
        </div>
      </div>

      {/* Info panel — bottom sheet style */}
      <div className="flex-1 bg-surface overflow-y-auto no-scrollbar">
        <div className="p-5">
          <h2 className="font-serif font-semibold text-xl text-ink">{video.title}</h2>
          <p className="text-[10px] uppercase tracking-wider text-mid mt-1">
            {video.galaName} · {new Date(video.eventDate).toLocaleDateString('en-KE', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5 py-4 border-y border-surface-2">
            <Stat label="Time" value={video.stats.time} sub={video.stats.isPB ? `PB · ${video.stats.pbDelta > 0 ? '+' : ''}${video.stats.pbDelta}s` : null} subColor="text-cyan-deep" />
            <Stat label="Position" value={video.stats.position} sub={`of ${video.stats.totalSwimmers}`} suffix={['','st','nd','rd'][video.stats.position] || 'th'} />
            <Stat label="Reaction" value={video.stats.reaction} sub="seconds" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={() => nav.openSheet({ type: 'upgrade' })}
              className="bg-ink text-surface text-xs font-semibold uppercase tracking-wider py-3 rounded-md active:scale-[0.98] transition-transform"
            >
              ▶ Slow-motion
            </button>
            <button
              type="button"
              onClick={() => nav.openSheet({ type: 'share', videoTitle: video.title })}
              className="border border-ink text-ink text-xs font-semibold uppercase tracking-wider py-3 rounded-md active:scale-[0.98] transition-transform"
            >
              ↗ Share
            </button>
          </div>

          <div className="mt-6 bg-cyan-pale rounded-md p-4">
            <p className="font-serif italic text-sm text-ink leading-snug">
              "Sarah's reaction time is 0.08s faster than her last race. The 2nd 25m
              looked stronger — her stroke rate dropped and her glide extended."
            </p>
            <p className="text-[10px] uppercase tracking-wider text-cyan-deep font-semibold mt-2">
              — Auto-coach insight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
