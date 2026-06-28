# Deploying AquaTrack

One Node service hosts everything — the parent app (`/`), the admin console
(`/admin`), the REST API (`/api`), and the live-race WebSocket (`/ws`) — backed by
a managed PostgreSQL database. Verified locally on Node 22 + PostgreSQL 16.

Recommended host: **Render** (free to start, managed Postgres, WebSockets, no card
to begin). Railway notes are at the bottom.

---

## Render — with the blueprint (easiest)

**1. Put the project on GitHub.** Create a repo and push this folder:
```bash
git init && git add . && git commit -m "AquaTrack"
git branch -M main
git remote add origin https://github.com/<you>/aquatrack.git
git push -u origin main
```

**2. Create the services from the blueprint.**
- Render dashboard → **New → Blueprint** → connect your repo.
- Render reads `render.yaml` and proposes a **web service** + a **PostgreSQL** db.
- Click **Apply**. `JWT_SECRET` is generated automatically and `DATABASE_URL` is
  wired to the database for you.

**3. Initialise the database (one time).** After the first deploy finishes, open the
web service → **Shell** and run:
```bash
cd server && npm run db:setup
```
You'll see "Database ready" (it loads the schema, seed data, and the admin logins).

**4. Open it.** Your app is at `https://aquatrack.onrender.com` (your name will vary);
the admin console is at `https://aquatrack.onrender.com/admin`.

**5. Lock it down.** Sign in to `/admin` with the demo master
(`admin@aquatrack.co.ke` / `ChangeMe123!`), then create real school admins and change
the demo passwords:
```bash
# in the Render Shell
cd server && node scripts/create-admin.mjs you@yourdomain.com 'a-strong-password' 'Your Name'
```
Then remove the demo accounts (or change their passwords) in `psql`.

---

## Render — manual (no blueprint)

1. **New → PostgreSQL** (free). Copy its **Internal Connection String**.
2. **New → Web Service** → connect the repo, then set:
   - **Build command:** `npm install && npm run build && npm --prefix server install`
   - **Start command:** `node server/index.js`
   - **Health check path:** `/api/health`
   - **Environment:** `DATABASE_URL` = the connection string from step 1;
     `JWT_SECRET` = a long random string (e.g. `openssl rand -hex 32`).
3. Deploy, then run `cd server && npm run db:setup` in the service **Shell**.

---

## Railway (alternative)

1. railway.app → **New Project → Deploy from GitHub repo**.
2. **+ New → Database → PostgreSQL** (Railway injects `DATABASE_URL`).
3. On the service → **Variables**, add `JWT_SECRET`. **Settings → Build/Deploy:**
   - Build: `npm install && npm run build && npm --prefix server install`
   - Start: `node server/index.js`
4. Once live, open the service shell (or run locally against the public
   `DATABASE_URL`): `cd server && npm run db:setup`.

> Railway has no permanent free tier — a one-time trial credit, then ~$5/mo.

---

## Notes

- **Free Render web services sleep after ~15 min idle** (first request then waits
  30–50s). Upgrade the web service to **Starter ($7/mo)** for always-on; that also
  removes cold starts that would interrupt the live-race WebSocket.
- **Render's free PostgreSQL expires after ~30 days.** Upgrade the database to keep
  data beyond that.
- **Custom domain:** add it under the web service → **Settings → Custom Domains**;
  Render issues the TLS certificate automatically.
- **HTTPS + WebSocket** both work out of the box; the app's `/ws` upgrades over
  `wss://` on your domain with no extra config.
- If the DB connection fails with an SSL error, set `PGSSL=disable` (only for hosts
  that don't use SSL); managed Postgres normally needs SSL, which is the default here.
- The parent app currently renders from `src/data.js` (sample data); the admin
  console + API are fully live against the database. Wiring the parent app's reads
  to the live API is the one remaining step to make it fully dynamic.
