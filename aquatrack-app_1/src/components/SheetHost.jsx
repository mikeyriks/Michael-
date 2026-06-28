// ═════════════════════════════════════════════════════════════════════════
//   <SheetHost />
//
//   Maps a sheet descriptor { type, ...props } to the right content and
//   renders it inside <Sheet>. This is where most secondary screens live,
//   so every button in the app has somewhere to go. All actions are mock
//   (no backend) but behave realistically.
// ═════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import Sheet from './Sheet.jsx';
import { swimmers, currentUser, getSchoolCompetitions } from '../data.js';

export default function SheetHost({ sheet, nav, onBack }) {
  const close = nav.closeSheet;

  switch (sheet.type) {
    case 'upgrade':
      return (
        <Sheet title="AquaTrack Premium" subtitle="KES 4,500 / year" onClose={close} onBack={onBack}>
          <UpgradeBody onClose={close} />
        </Sheet>
      );
    case 'share':
      return (
        <Sheet title="Share this race" subtitle={sheet.videoTitle} onClose={close} onBack={onBack}>
          <ShareBody />
        </Sheet>
      );
    case 'swimmers':
      return (
        <Sheet title="Your swimmers" subtitle="Switch or add a swimmer" onClose={close} onBack={onBack}>
          <SwimmersBody onClose={close} />
        </Sheet>
      );
    case 'notifications':
      return (
        <Sheet title="Notifications" subtitle="How we reach you" onClose={close} onBack={onBack}>
          <NotificationsBody />
        </Sheet>
      );
    case 'privacy':
      return (
        <Sheet title="Privacy & data" subtitle="Your child's data, your control" onClose={close} onBack={onBack}>
          <PrivacyBody />
        </Sheet>
      );
    case 'help':
      return (
        <Sheet title="Help & contact" subtitle="We usually reply within a few hours" onClose={close} onBack={onBack}>
          <HelpBody />
        </Sheet>
      );
    case 'reminder':
      return (
        <Sheet title="Race reminder" subtitle={sheet.subtitle} onClose={close} onBack={onBack}>
          <ReminderBody name={sheet.name} onClose={close} />
        </Sheet>
      );
    case 'swimmer':
      return (
        <Sheet title={sheet.name} subtitle={sheet.detail} onClose={close} onBack={onBack}>
          <SwimmerBody sheet={sheet} nav={nav} />
        </Sheet>
      );
    case 'school':
      return (
        <Sheet
          title={sheet.name}
          subtitle={sheet.rank ? `Season rank #${sheet.rank} · ${sheet.points} pts` : 'Competition history'}
          onClose={close}
          onBack={onBack}
        >
          <SchoolBody sheet={sheet} nav={nav} />
        </Sheet>
      );
    case 'competition':
      return (
        <Sheet
          title={sheet.comp.name}
          subtitle={`${formatDate(sheet.comp.date)} · ${sheet.comp.venue}`}
          onClose={close}
          onBack={onBack}
        >
          <CompetitionBody school={sheet.school} comp={sheet.comp} nav={nav} />
        </Sheet>
      );
    default:
      return (
        <Sheet title={sheet.title || 'Coming soon'} onClose={close} onBack={onBack}>
          <p className="text-sm text-mid leading-relaxed">
            {sheet.message || 'This part of the app is on the way.'}
          </p>
        </Sheet>
      );
  }
}

// ─── Primitives ────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-ink text-surface font-semibold text-sm uppercase tracking-wider py-3.5 rounded-md active:scale-[0.98] transition-transform"
    >
      {children}
    </button>
  );
}

function Row({ icon, label, sub, onClick, trailing }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-1 py-3 text-left active:opacity-70 transition-opacity"
    >
      {icon && (
        <span className="w-9 h-9 rounded-full bg-cyan-pale text-cyan-deep flex items-center justify-center text-sm shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-ink leading-tight">{label}</span>
        {sub && <span className="block text-xs text-mid mt-0.5 leading-snug">{sub}</span>}
      </span>
      {trailing}
    </button>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${on ? 'bg-cyan-deep' : 'bg-mid/30'}`}
    >
      <span
        className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`}
      />
    </button>
  );
}

// ─── Upgrade ─────────────────────────────────────────────────────────────
function UpgradeBody({ onClose }) {
  const [started, setStarted] = useState(false);
  const features = [
    'Slow-motion replays & frame-by-frame',
    'Full split times for every length',
    'Downloadable, shareable video clips',
    'Ad-free experience',
    'Follow up to 4 swimmers',
  ];
  if (started) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-cyan/15 flex items-center justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-ink">
              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h4 className="font-serif font-semibold text-lg text-ink mb-1">Trial started</h4>
        <p className="text-sm text-mid leading-snug mb-5">
          14 days of Premium, free. We'll remind you 3 days before it renews — cancel anytime.
        </p>
        <PrimaryButton onClick={onClose}>Done</PrimaryButton>
      </div>
    );
  }
  return (
    <div>
      <ul className="space-y-2.5 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-cyan-deep shrink-0 mt-0.5">
              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <div className="bg-surface-2 rounded-md p-3 mb-4 text-center">
        <p className="font-serif font-semibold text-2xl text-ink leading-none">
          KES 4,500<span className="text-sm text-mid font-sans">/year</span>
        </p>
        <p className="text-xs text-mid mt-1">Pay by M-Pesa · cancel anytime</p>
      </div>
      <PrimaryButton onClick={() => setStarted(true)}>Start 14-day free trial</PrimaryButton>
    </div>
  );
}

// ─── Share ───────────────────────────────────────────────────────────────
function ShareBody() {
  const [toast, setToast] = useState(null);
  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }
  const link = 'https://aquatrack.co.ke/r/sarah-50fr';
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <ShareTile
          label="WhatsApp"
          icon="💬"
          onClick={() => {
            window.open(
              `https://wa.me/?text=${encodeURIComponent('Watch this race on AquaTrack: ' + link)}`,
              '_blank',
              'noopener',
            );
            flash('Opening WhatsApp…');
          }}
        />
        <ShareTile
          label="Copy link"
          icon="🔗"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              flash('Link copied');
            } catch {
              flash('Copy this: ' + link);
            }
          }}
        />
        <ShareTile label="Download clip" icon="⬇" premium onClick={() => flash('Downloads are a Premium feature')} />
        <ShareTile label="More…" icon="⋯" onClick={() => flash('Opening system share…')} />
      </div>
      <p className="text-[11px] text-mid leading-snug">
        Sharing sends a private link to this single clip. The recipient does not need an account.
      </p>
      {toast && (
        <div className="mt-4 bg-ink text-surface text-sm text-center py-2.5 rounded-md">{toast}</div>
      )}
    </div>
  );
}

function ShareTile({ label, icon, onClick, premium }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white border border-surface-2 rounded-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.98] transition-transform"
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-xs font-medium text-ink">{label}</span>
      {premium && <span className="text-[9px] uppercase tracking-wider text-sun-deep font-semibold">Premium</span>}
    </button>
  );
}

// ─── Swimmers (switcher / manage) ────────────────────────────────────────
function SwimmersBody({ onClose }) {
  const [selected, setSelected] = useState(currentUser.swimmers[0]);
  return (
    <div>
      <div className="space-y-2 mb-4">
        {currentUser.swimmers.map((id) => {
          const s = swimmers[id];
          const isSel = id === selected;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-md border-2 text-left transition-all ${
                isSel ? 'bg-cyan-pale border-cyan-deep' : 'bg-white border-surface-2'
              }`}
            >
              <span className="w-10 h-10 rounded-full bg-cyan-pale text-cyan-deep flex items-center justify-center font-bold text-sm">
                {s.avatar}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink leading-tight">{s.name}</span>
                <span className="block text-xs text-mid mt-0.5">{s.school} · Age {s.age}</span>
              </span>
              {isSel && (
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cyan-deep">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full border-2 border-dashed border-cyan-deep/40 text-cyan-deep rounded-md p-3 text-sm font-semibold active:bg-cyan-pale transition-colors"
      >
        + Add another swimmer
      </button>
      <p className="text-[11px] text-mid mt-3 leading-snug text-center">
        Premium parents can follow up to 4 swimmers across different schools.
      </p>
    </div>
  );
}

// ─── Notifications (working toggles) ─────────────────────────────────────
function NotificationsBody() {
  const [prefs, setPrefs] = useState({
    push: true,
    raceStart: true,
    pb: true,
    sms: false,
    email: false,
  });
  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const items = [
    ['push', 'Push notifications', 'Live updates on this device'],
    ['raceStart', "Race-start alerts", "Ping me ~5 min before my swimmer's heat"],
    ['pb', 'Personal-best alerts', 'Celebrate every new PB'],
    ['sms', 'SMS', 'Texts via Safaricom (data-light)'],
    ['email', 'Email digests', 'A summary after each gala'],
  ];
  return (
    <div className="divide-y divide-surface-2">
      {items.map(([key, label, sub]) => (
        <div key={key} className="flex items-center gap-3 py-3">
          <span className="flex-1">
            <span className="block text-sm font-medium text-ink leading-tight">{label}</span>
            <span className="block text-xs text-mid mt-0.5 leading-snug">{sub}</span>
          </span>
          <Toggle on={prefs[key]} onClick={() => toggle(key)} />
        </div>
      ))}
    </div>
  );
}

// ─── Privacy ─────────────────────────────────────────────────────────────
function PrivacyBody() {
  const [toast, setToast] = useState(null);
  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };
  return (
    <div>
      <p className="text-sm text-mid leading-relaxed mb-4">
        AquaTrack is registered with the Office of the Data Protection Commissioner (ODPC).
        Your child's race data is encrypted, never sold, and never shared with advertisers.
      </p>
      <div className="divide-y divide-surface-2">
        <Row icon="↓" label="Request a data export" sub="We email a copy within 48 hours" onClick={() => flash('Export requested — check your email')} />
        <Row icon="✓" label="Manage consent" sub="You consented as Parent on 18 May 2026" onClick={() => flash('Consent record is up to date')} />
        <Row icon="👤" label="Who can see my swimmer" sub="Only you · not other parents or schools" onClick={() => flash('Visibility is private to your account')} />
        <Row icon="⚠" label="Delete my account & data" sub="Permanent — handled by our team" onClick={() => flash('We will email you to confirm before deleting')} />
      </div>
      {toast && <div className="mt-4 bg-ink text-surface text-sm text-center py-2.5 rounded-md">{toast}</div>}
    </div>
  );
}

// ─── Help ────────────────────────────────────────────────────────────────
function HelpBody() {
  return (
    <div className="divide-y divide-surface-2">
      <Row
        icon="💬"
        label="WhatsApp us"
        sub="+254 716 426 081"
        onClick={() => window.open('https://wa.me/254716426081', '_blank', 'noopener')}
      />
      <Row
        icon="✉"
        label="Email support"
        sub="help@aquatrack.co.ke"
        onClick={() => window.open('mailto:help@aquatrack.co.ke', '_blank')}
      />
      <Row
        icon="?"
        label="FAQ & guides"
        sub="Setup, billing, schools"
        onClick={() => window.open('https://aquatrack.co.ke/help', '_blank', 'noopener')}
      />
    </div>
  );
}

// ─── Race reminder ─────────────────────────────────────────────────────────
function ReminderBody({ name, onClose }) {
  const [on, setOn] = useState(false);
  const first = (name || 'your swimmer').split(' ')[0];
  return (
    <div>
      <div className="flex items-center gap-3 py-2 mb-2">
        <span className="flex-1 text-sm text-ink leading-snug">
          Notify me about 5 minutes before <strong>{first}'s</strong> next heat.
        </span>
        <Toggle on={on} onClick={() => setOn((v) => !v)} />
      </div>
      <div
        className={`text-sm text-center py-2.5 rounded-md mb-4 transition-colors ${
          on ? 'bg-cyan-pale text-cyan-deep' : 'bg-surface-2 text-mid'
        }`}
      >
        {on ? `Reminder set — we'll ping you before ${first} swims` : 'Reminder off'}
      </div>
      <PrimaryButton onClick={onClose}>Done</PrimaryButton>
    </div>
  );
}

// ─── Swimmer detail (from a result row) ─────────────────────────────────────
function SwimmerBody({ sheet, nav }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Mini label="Latest time" value={sheet.time || '—'} />
        <Mini label="Best finish" value={sheet.position ? ordinal(sheet.position) : '—'} />
      </div>
      {sheet.isPB && (
        <div className="bg-cyan-pale text-cyan-deep text-xs font-semibold text-center py-2 rounded-md mb-4">
          Personal best in this event
        </div>
      )}
      <div className="space-y-2">
        <PrimaryButton
          onClick={() => {
            nav.setTab('videos');
            nav.closeSheet();
          }}
        >
          Watch their videos
        </PrimaryButton>
        <button
          type="button"
          onClick={() => {
            nav.setTab('profile');
            nav.closeSheet();
          }}
          className="w-full border border-ink text-ink font-semibold text-sm uppercase tracking-wider py-3.5 rounded-md active:scale-[0.98] transition-transform"
        >
          View full profile
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="bg-white border border-surface-2 rounded-md p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-mid font-semibold">{label}</p>
      <p className="font-serif font-semibold text-lg text-ink mt-1 leading-none tabular-nums">{value}</p>
    </div>
  );
}

// ─── School detail → list of competitions ───────────────────────────────────
function SchoolBody({ sheet, nav }) {
  const comps = getSchoolCompetitions(sheet.name);
  const bestPlacement = Math.min(...comps.map((c) => c.placement));
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Mini label="Competitions" value={comps.length} />
        <Mini label="Best finish" value={ordinal(bestPlacement)} />
        <Mini label="Season pts" value={sheet.points ?? comps.reduce((a, c) => a + c.points, 0)} />
      </div>

      <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-2">
        Competitions this season
      </p>
      <div className="space-y-2">
        {comps.map((comp) => (
          <button
            key={comp.id}
            type="button"
            onClick={() => nav.openSheet({ type: 'competition', school: sheet.name, comp })}
            className="w-full bg-white border border-surface-2 rounded-md p-3 flex items-center gap-3 text-left active:bg-cyan-pale transition-colors"
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center font-serif italic font-bold text-base shrink-0 ${
                comp.placement === 1
                  ? 'bg-sun/15 text-sun-deep'
                  : 'bg-surface-2 text-mid'
              }`}
            >
              {comp.placement}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-ink leading-tight truncate">
                {comp.name}
              </span>
              <span className="block text-xs text-mid mt-0.5">
                {formatDate(comp.date)} · {ordinal(comp.placement)} of {comp.schoolsCount} · {comp.points} pts
              </span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-mid shrink-0">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Competition detail → results breakdown (flows to swimmer) ──────────────
function CompetitionBody({ school, comp, nav }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Mini label="Finish" value={ordinal(comp.placement)} />
        <Mini label="Of schools" value={comp.schoolsCount} />
        <Mini label="Points" value={comp.points} />
      </div>

      <p className="text-[10px] uppercase tracking-wider text-mid font-semibold mb-2">
        {school} · results
      </p>
      <div className="space-y-1.5">
        {comp.results.map((r, i) => {
          const isRelay = /relay/i.test(r.event);
          return (
            <button
              key={i}
              type="button"
              disabled={isRelay}
              onClick={
                isRelay
                  ? undefined
                  : () =>
                      nav.openSheet({
                        type: 'swimmer',
                        name: r.swimmer,
                        detail: `${school} · ${r.event}`,
                        time: r.time,
                        position: r.place,
                        isPB: r.isPB,
                      })
              }
              className={`w-full grid grid-cols-[28px_1fr_auto] gap-2 items-center px-3 py-2 rounded-md text-left bg-white border border-surface-2 ${
                isRelay ? '' : 'active:bg-cyan-pale transition-colors'
              }`}
            >
              <span
                className={`font-serif italic font-bold text-base leading-none ${
                  r.place === 1 ? 'text-sun-deep' : 'text-mid'
                }`}
              >
                {r.place}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink leading-tight truncate">
                  {r.swimmer}
                  {r.isPB && <span className="ml-1.5 text-[10px] text-cyan-deep font-semibold">PB</span>}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-mid truncate">
                  {r.event}
                </span>
              </span>
              <span className="font-serif font-semibold text-sm text-ink tabular-nums text-right">
                {r.time}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-mid mt-3 leading-snug text-center">
        Tap an individual result to see that swimmer.
      </p>
    </div>
  );
}

function ordinal(n) {
  return `${n}${['', 'st', 'nd', 'rd'][n] || 'th'}`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
