# Scan It

Phone-as-a-scanner for your desktop: open Scan It on a computer, scan a pairing QR code with your phone, then scan barcodes and QR codes with the phone camera. Decodings show up on the desk in real time (Convex subscriptions). Clipboard auto-copy for new scans is **off by default**; turn on **Scan to clipboard** on the desk when you want it. Closing the desk tab (or leaving via the Scan It header) ends the desk on the server; the client also sends a best-effort **HTTP beacon** to `POST /desk/end` on your deployment’s **`.convex.site`** origin so the phone disconnects when the tab is closed.

**Stack:** [Convex](https://convex.dev) (backend + realtime), [TanStack Start](https://tanstack.com/start) + React (web app), [Tauri 2](https://v2.tauri.app) + React (optional Windows/macOS desktop), [Tailwind CSS](https://tailwindcss.com) v4, shadcn-style UI primitives (Radix Slot + CVA), [react-qr-code](https://www.npmjs.com/package/react-qr-code) (pairing QR on the desk), [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) (camera scanning on the phone).

## Monorepo layout

| Path | Purpose |
|------|---------|
| [`apps/web`](./apps/web) | TanStack Start app: `/` (landing), `/start`, `/desk/$publicId`, `/s/$publicId` (phone). Deploy on Vercel. |
| [`apps/marketing`](./apps/marketing) | Static landing + download CTA. Deploy on Vercel (second project). |
| [`apps/desktop`](./apps/desktop) | Tauri shell: same desk/home flows + **type into focused app** (Windows & macOS). |
| [`packages/lib`](./packages/lib) | Shared helpers (`deskToken`, `deviceId`, `cn`, `getPairingOrigin`, `convexHttpSiteOrigin` for tab-close beacon). |
| [`packages/features`](./packages/features) | Shared Home + Desk UI used by web and desktop. |
| [`convex/`](./convex) | Convex schema and functions (stays at repo root). |

### What is shared where

| Asset / concern | Location | Consumed by |
|-----------------|----------|-------------|
| Theme tokens, `ThemeProvider`, desk/home screens, header, button/card | `packages/features` | `apps/web`, `apps/desktop` |
| Session/device helpers, `cn()`, pairing URL helper | `packages/lib` | `packages/features`, `apps/web` (phone route), `apps/desktop` |
| Convex API types / `api` object | `convex/_generated/api` | Via Vite alias `@scan-it/convex-api` in apps; TS path in `packages/features` |
| Phone scanner, portrait gate, scanner CSS utilities | `apps/web` only | Web app (not shipped in desktop) |
| Marketing styles | Imports `packages/features` CSS for the same look | `apps/marketing` |

## Environment variables

**Convex CLI** reads `.env.local` at the **repository root** (where you run `npx convex dev`). Keep `CONVEX_DEPLOYMENT` and any Convex-managed keys there.

**Vite** (`apps/web`, `apps/desktop`, `apps/marketing`) is configured with **`envDir` = monorepo root**, so a single **root `.env.local`** next to the root `package.json` is enough for all `VITE_*` variables in local development. You do not have to duplicate files under each `apps/*` folder unless you prefer to.

| Variable | Required by | Purpose |
|----------|-------------|---------|
| `CONVEX_DEPLOYMENT` | Convex CLI (root `.env.local`) | Dev deployment binding for `npx convex dev`. |
| `VITE_CONVEX_URL` | Web, desktop | Convex client HTTP URL. |
| `VITE_PAIRING_ORIGIN` | Web, desktop | Base URL encoded in the desk QR so phones open `…/s/<publicId>` on your **web** deployment (use your real web origin in prod; for LAN dev use your machine URL + port, e.g. `https://host:3000`). |
| `VITE_DEV_HTTPS` | Web (optional) | Set to `1` or `true` to prefer HTTPS in Vite dev. |
| `VITE_DEV_SSL_DOMAINS` | Web (optional) | Extra hostnames for the dev TLS certificate (comma-separated). |
| `VITE_DEV_PUBLIC_HOST` | Web, desktop (optional) | Hostname you open in the browser for dev (e.g. `fiwe-gsg3` or a LAN IP). Sets Vite HMR to use that host so hot reload works when you are not on `localhost`. |
| `VITE_DESKTOP_WINDOWS_INSTALLER_URL` | Marketing, **web** landing, desk | Optional override for Windows NSIS installer URL. |
| `VITE_DESKTOP_WINDOWS_PORTABLE_URL` | Marketing, **web** landing, desk | Optional override for Windows portable ZIP URL. |
| `VITE_DESKTOP_MAC_DMG_URL` | Marketing, **web** landing, desk | Optional override for macOS DMG URL. |
| `VITE_DESKTOP_DOWNLOAD_URL` | Marketing, **web** landing, desk | Legacy: sets **primary** download button only; “All downloads” still use the three URLs above or GitHub `latest` defaults. |
| `VITE_WEB_APP_URL` | Marketing | Public URL of the web app for the “Open web app” button. |

Templates: [`.env.example`](./.env.example) (root, recommended), plus per-app reminders in [`apps/web/.env.example`](./apps/web/.env.example), [`apps/desktop/.env.example`](./apps/desktop/.env.example), and [`apps/marketing/.env.example`](./apps/marketing/.env.example).

## Product rules

| Topic | Decision |
|--------|-----------|
| Auth | None. Security is **session secrets**, not user accounts. |
| Desk lifetime | Until the **desk tab is closed** (best-effort `sendBeacon` to [`convex/http.ts`](./convex/http.ts) `POST /desk/end`), the user taps **Scan It** in the header (ends then navigates home), uses **New pairing code**, or clears storage and loses the desk token. |
| Phones per desk | **One.** The first successful pairing wins; other devices see “already connected”. |
| Deployment | **Single cloud** origin for the phone; the pairing URL in the QR is `${pairingOrigin}/s/${publicId}` (`VITE_PAIRING_ORIGIN` or current origin). |
| History | **Full log** (all scans), ordered oldest → newest on the desk. |
| Desk UI | **Pairing QR** is shown until a phone connects; after that, the desk focuses on the scan log, with an optional **Phone link & QR** section to reopen the scanner on the same phone. |
| Pairing trust | **`publicId` in the QR** lets a device open the session page. **Stable `deviceId` in `localStorage`** on the phone is sent on claim and on every scan; the server stores the first claimant and rejects others. |

### Security notes

- Anyone who can open the pairing URL **before** the real phone pairs could occupy the slot (same as sharing a secret link). Mitigations for later: short TTL, optional numeric PIN shown on the desk, etc.
- The **desk token** is returned once from `createSession` and kept in **sessionStorage** for that tab; it is required to read the session or end it from the desk UI.
- Clipboard auto-copy runs only when **Scan to clipboard** is enabled (the browser may prompt then). Auto-copy on new scans may still be **blocked** in some environments; **Copy latest** is the reliable fallback.

## Routes (web app)

- `/` — Landing: download desktop CTA and **Use in browser** → `/start`.
- `/start` — Creates a desk and redirects to `/desk/$publicId` (same as the desktop app home).
- `/desk/$publicId` — Desk: pairing QR, log, optional scan-to-clipboard; desk token in **sessionStorage**; closing the tab ends the desk via beacon + header **Scan It** ends explicitly.
- `/s/$publicId` — Phone: pair (first visit claims slot), then live camera scanner.

## Development

Prerequisites: **Node.js**, **Rust** (for `apps/desktop`), a **Convex** project.

### Web + Convex (most day-to-day work)

```bash
npm install
# Terminal 1 — deploy functions, keep codegen fresh
npx convex dev

# Terminal 2 — TanStack Start (port 3000) + Convex file watcher from root script
npm run dev
```

Ensure root **`.env.local`** defines at least `VITE_CONVEX_URL` (and usually `VITE_PAIRING_ORIGIN` when testing phones on the LAN).

**LAN / hostname dev:** When HTTPS is on (often implied by `VITE_PAIRING_ORIGIN` starting with `https://`), open the **https** URL Vite prints (e.g. `https://fiwe-gsg3:3000`), not `http://`. Add every hostname and LAN IP you use to **`VITE_DEV_SSL_DOMAINS`** so the dev certificate is accepted. If hot reload misbehaves when using a non-localhost host, set **`VITE_DEV_PUBLIC_HOST`** to that same hostname (no `https://`).

### Marketing site locally

```bash
npm run dev -w @scan-it/marketing
```

Optional: set `VITE_WEB_APP_URL` and desktop download overrides in root `.env.local` (see env table).

### Desktop (Tauri) locally

Needs the same `VITE_*` values as web; `VITE_PAIRING_ORIGIN` must point at wherever the **web** app is reachable for QR pairing (often the same as your `npm run dev` web URL).

The desktop Vite server **listens on all interfaces** (not only `localhost`), so you can open **`http://fiwe-gsg3:1420`** in a browser on your LAN for quick checks. If hot reload disconnects when using a hostname, set **`VITE_DEV_PUBLIC_HOST`** to that hostname in root `.env.local` (same idea as the web app on port 3000).

```bash
# Terminal 1 — Vite dev server on 1420 (used by the webview)
npm run dev -w @scan-it/desktop

# Terminal 2 — from repo root
cd apps/desktop && npx tauri dev
```

### Verify builds and lint

From the repository root:

```bash
npm run verify
```

This runs production builds for web and marketing, TypeScript check for the desktop UI, and ESLint on shared source. It is the recommended check before pushing.

Other useful commands:

```bash
npm run build -w @scan-it/web
npm run build -w @scan-it/marketing
npm run build -w @scan-it/desktop    # Vite bundle only
npm run build:desktop                 # Full Tauri build → scan-it.exe + NSIS (Windows) or DMG (macOS)
npm start                             # Run built SSR server (after web build)
```

## Vercel

Use **two** projects, both with **Root Directory** set in the Vercel UI:

1. **Web app** — Root Directory `apps/web`. The included [`apps/web/vercel.json`](./apps/web/vercel.json) installs from the monorepo root and builds `@scan-it/web`. Set **`VITE_CONVEX_URL`**, **`VITE_PAIRING_ORIGIN`** (production URL of this web deployment or your canonical URL), optional **`VITE_DESKTOP_*`** URL overrides for download links, and any dev/SSL vars if needed.
2. **Marketing** — Root Directory `apps/marketing`. See [`apps/marketing/vercel.json`](./apps/marketing/vercel.json). Set **`VITE_WEB_APP_URL`** and optional **`VITE_DESKTOP_*`** overrides.

On Vercel, environment variables are configured in the project settings (there is no root `.env.local`); names are the same as in the table above.

## Desktop releases (GitHub Actions)

Pushing a tag `v*` runs [`.github/workflows/release-desktop.yml`](./.github/workflows/release-desktop.yml). It builds on **Windows** and **macOS** and uploads:

| Asset | Contents |
|-------|-----------|
| `scan-it-windows-portable.zip` | `scan-it.exe` (no installer) |
| `scan-it-windows-setup.exe` | NSIS installer (x64) |
| `scan-it-macos.dmg` | macOS app (universal binary when the workflow succeeds) |

Stable filenames are required for `https://github.com/<owner>/<repo>/releases/latest/download/<filename>` links on the marketing site and landing page.

Configure repository **Variables** **`VITE_CONVEX_URL`** and **`VITE_PAIRING_ORIGIN`** so the embedded UI points at your Convex deployment and phone pairing URLs are correct.

**macOS:** CI builds are **not** code-signed or notarized; users may need to right-click → Open the first time. Add Apple signing in CI later if you want a smoother Gatekeeper experience.

## Style

See [docs/STYLEGUIDE.md](./docs/STYLEGUIDE.md) for theme tokens, light/dark behavior, and UI patterns (mint green accent, scanner frame, log typography).

## Agent / contributor docs

See [AGENTS.md](./AGENTS.md) for monorepo boundaries, import conventions, and how we expect Convex and frontend work to be done.
