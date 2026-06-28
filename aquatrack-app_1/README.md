# AquaTrack Kenya — Parent App

The parent-facing web app for AquaTrack Kenya. Live race results, video
replays, leaderboards, and personal-best tracking.

This is a **Progressive Web App (PWA)** — it installs to a home screen on
iOS and Android (looks and feels like a native app), and also runs in any
desktop browser.

> **Status:** Phase 1 — UI complete with mock data. Backend integration is
> Phase 2 (see [What's next](#whats-next)).

---

## Quick start

```bash
# 1. Install
npm install

# 2. Run development server (hot reload at http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Requires Node 18+. Tested on Node 22.

---

## What's in here

```
aquatrack-parent-app/
├── public/                       # Static assets — copied as-is to dist/
│   ├── favicon.svg
│   ├── icon-192.png              # PWA icon (Android)
│   ├── icon-512.png              # PWA icon (Android, splash)
│   └── apple-touch-icon.png      # iOS home-screen icon
├── src/
│   ├── App.jsx                   # Root: auth gate, routes to onboarding or main app
│   ├── main.jsx                  # React entry point
│   ├── index.css                 # Tailwind + custom utilities
│   ├── data.js                   # ⚠ MOCK DATA — replace with API calls
│   ├── lib/
│   │   └── onboarding.js         # localStorage helpers (replace with auth API)
│   ├── components/
│   │   ├── Header.jsx            # Top bar
│   │   ├── TabBar.jsx            # Bottom navigation
│   │   ├── OnboardingHeader.jsx  # Shared back-button + progress dots
│   │   └── LaneRow.jsx           # Single race-result row
│   └── pages/
│       ├── Live.jsx              # Live race in progress
│       ├── Results.jsx           # Leaderboards (Event/School/Season tabs)
│       ├── Videos.jsx            # Video gallery + player
│       ├── Profile.jsx           # Swimmer profile, PBs, family follow, sign-out
│       └── onboarding/
│           ├── Onboarding.jsx    # State machine — orchestrates the 6 steps
│           ├── Welcome.jsx       # Step 0 — brand splash
│           ├── Phone.jsx         # Step 1 — +254 number entry
│           ├── OTP.jsx           # Step 2 — 6-digit code
│           ├── FindSwimmer.jsx   # Step 3 — school → swimmer search
│           ├── Relationship.jsx  # Step 4 — relationship + ODPC consent
│           └── Done.jsx          # Step 5 — success screen
├── index.html                    # Includes PWA meta tags + Google Fonts
├── vite.config.js                # Vite + PWA plugin configuration
├── tailwind.config.js            # Brand colors, fonts, animations
├── postcss.config.js
└── package.json
```

---

## How to install on a phone (PWA)

After deploying:

**iOS (Safari):**
1. Open the deployed URL in Safari.
2. Tap the Share button → "Add to Home Screen".
3. The app appears as an icon. Tap to launch full-screen.

**Android (Chrome):**
1. Open the deployed URL in Chrome.
2. Chrome shows an "Install app" banner automatically, or use menu →
   "Install app".
3. The app appears in the app drawer.

The app works **offline** for content already viewed (PWA service worker
caches the app shell + recently fetched data).

---

## Deployment

The `dist/` folder is a static site — deploy to any static host:

| Host | Command |
|---|---|
| Vercel | `vercel deploy --prod` (auto-detects Vite) |
| Netlify | `netlify deploy --prod --dir=dist` |
| Cloudflare Pages | `wrangler pages deploy dist` |
| GitHub Pages | Push `dist/` to `gh-pages` branch |
| Your own server | Copy `dist/` to your nginx/Apache document root |

**Important for PWA:**
- Must be served over **HTTPS** (PWAs don't install on HTTP).
- Set the correct `manifest.webmanifest` MIME type if your host doesn't
  auto-detect (`application/manifest+json`).

---

## Brand system

All design tokens are in `tailwind.config.js` and consumed via Tailwind
utility classes throughout the app.

**Colors** (matches brochure exactly):
- `ink` `#0A1628` — primary navy
- `cyan` `#06B6D4` — accent (pool water)
- `cyan-deep` `#0891B2` — accent darker (text on light bg)
- `cyan-pale` `#CFFAFE` — accent lightest (highlights)
- `sun` `#F59E0B` — gold (premium / PB highlight)
- `surface` `#F8F6F1` — bone white background
- `coral` `#EF4444` — live indicator, attention

**Typography:**
- Display: **Lora** (serif, italic for accents)
- Body: **Poppins** (300/400/500/600/700)
- Both loaded from Google Fonts in `index.html`.

---

## What's mocked vs. what's real

### What's real (production-ready)
- Component structure
- Responsive design (mobile-first, scales to laptop)
- PWA manifest, service worker, offline caching
- Brand system, typography, animations
- Tab navigation, page routing
- Family-follow swimmer switcher (working)
- Tab-bar active states, transitions
- **Onboarding flow** (6 screens — Welcome → Phone → OTP → School → Swimmer → Relationship → Done) with localStorage session persistence and sign-out lifecycle. Includes direction-aware slide transitions between steps, a celebratory pop-in / ripple / self-drawing checkmark on the success screen, and a full OTP error state (coral inputs + shake + retry message). All motion respects `prefers-reduced-motion`. In demo mode, any 6-digit OTP is accepted except `000000`, which is reserved to demonstrate the error state.

### What's mocked (replace with API calls)
All data is hardcoded in `src/data.js`. The shape of the objects there is
the **API contract** — your backend should return JSON in those exact
shapes, and the components will work without modification.

| Component | Data needed | Suggested endpoint |
|---|---|---|
| `<LivePage>` | `currentGala`, `currentRace` | WS subscription `wss://api/galas/:id/live` |
| `<ResultsPage>` | `eventLeaderboards`, `schoolStandings`, `seasonRankings` | `GET /galas/:id/results`, `GET /seasons/:year/rankings` |
| `<VideosPage>` | `videos` | `GET /swimmers/:id/videos?gala=:id` |
| `<ProfilePage>` | `swimmers`, `pbHistory`, `currentUser` | `GET /me`, `GET /swimmers/:id/pbs` |

---

## What's next (Phase 2)

In rough priority order:

### 1. Backend API (~6 weeks)
Stack suggestion: **Node.js + TypeScript + PostgreSQL**.
- REST API for galas, swimmers, results, videos, PBs.
- WebSocket for live race updates (use Socket.IO or native ws).
- JWT auth with refresh tokens.
- File storage on **AWS S3** or **Cloudflare R2** for video clips.
- Hosted on **Render** or **Railway** for simple deploy from a Kenyan ops
  perspective (both have low-latency African CDN).

### 2. Auth flow (~1 week)
The onboarding UI is **already built** (6 screens). Backend work remaining:
- Wire phone-OTP login to **Africa's Talking SMS gateway** in place of the mock acceptance of any 6 digits.
- Add JWT issuance on successful OTP — store in httpOnly cookie + refresh token.
- Replace `lib/onboarding.js` localStorage calls with API calls (`POST /auth/request-otp`, `POST /auth/verify-otp`, `POST /users/me/swimmers`).
- Fallback email magic link for parents without Kenyan numbers.
- "Family follow": already in the UI on the Profile page — add backend support for up to 4 swimmers per parent.
- ODPC-compliant consent flow is **already in the UI** (Relationship step) — backend just needs to persist the consent record with a timestamp.

### 3. Timing-system bridge (~3 weeks)
- Local app at the gala that reads from the Zhongke timing equipment
  (CSV / TCP socket — confirm protocol with Lira at Yaolong).
- Pushes events to backend WebSocket as races complete.
- Heat-sheet upload (Excel/PDF parser).

### 4. Video pipeline (~4 weeks)
- Camera units (3 per gala) record continuously.
- Auto-clip per race (start signal → finish signal + 3 sec buffer).
- Auto-tag swimmers by lane → upload per-swimmer clips to S3.
- Slow-motion is a separate transcoded variant (Premium-only).

### 5. Push notifications (~1 week)
- Firebase Cloud Messaging (FCM) for cross-platform.
- Per-swimmer subscription model.
- "Race starting in 5 min" + "Race complete" + "PB!" templates.

### 6. Premium subscription (~2 weeks)
- M-Pesa Daraja API integration (KES 4,500/year or KES 500/month).
- Stripe fallback for international card payments.
- Feature flags: split times, video downloads, slow-mo playback,
  family-follow > 2 swimmers, ad-free.

### 7. Coach dashboard (~separate codebase, ~6 weeks)
The coach dashboard is **a separate web app** — different audience (sports
staff, not parents), different UX (data-dense desktop layouts), different
auth model (per-school accounts with role-based access). Build it as its
own React app sharing this design system via a published npm package.

---

## Questions / next steps

The shortest path forward:

1. **Run `npm run dev`** and see the app in your browser.
2. **Show this to two friendly schools** (Brookhouse and Hillcrest are
   ideal — both already in the financial model). Get reactions before
   investing in backend.
3. **Hire one full-stack developer** to build the backend per the spec
   above. Budget: ~KES 800k–1.2M for Phase 2 (4–6 months part-time, or
   2–3 months full-time at Nairobi senior rates).
4. **Run the first gala on paper-tracked timing** with this app showing
   "Coming soon" placeholders — proves the concept without needing the
   full backend.

This codebase is structured so that swapping `data.js` for real API calls
is the only frontend change required for Phase 2. Everything else stays.

---

*Built with React 18, Vite 5, Tailwind 3, and the vite-plugin-pwa plugin.
Code style matches the AquaTrack brochure design system.*
