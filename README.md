# Scan It

Licensed under the [MIT License](./LICENSE).

Phone-as-a-scanner for your desktop: open Scan It on a computer, scan a pairing QR code with your phone, then scan barcodes and QR codes with the phone camera. Decodings show up on the desk in real time (Convex subscriptions). Clipboard auto-copy for new scans is **off by default**; turn on **Scan to clipboard** on the desk when you want it. Closing the desk tab (or leaving via the Scan It header) ends the desk on the server; the client also sends a best-effort **HTTP beacon** to `POST /desk/end` on your deployment’s **`.convex.site`** origin so the phone disconnects when the tab is closed.

**Stack:** [Convex](https://convex.dev) (backend + realtime), [TanStack Start](https://tanstack.com/start) + React (web app), [Tauri 2](https://v2.tauri.app) + React (optional Windows/macOS desktop), [Tailwind CSS](https://tailwindcss.com) v4, shadcn-style UI primitives (Radix Slot + CVA), [react-qr-code](https://www.npmjs.com/package/react-qr-code) (pairing QR on the desk), [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) (camera scanning on the phone).

## Monorepo layout

| Path | Purpose |
|------|---------|
| [`apps/web`](./apps/web) | TanStack Start app: `/` (landing), SEO guide pages, `/privacy`, `/about`, `/terms`, `/start`, `/desk/$publicId`, `/s/$publicId` (phone). Single deploy on Vercel. |
| [`apps/desktop`](./apps/desktop) | Tauri shell: same desk/home flows + **type into focused app** (Windows & macOS); optional **scan enrichment** on the desk (books via [Open Library](https://openlibrary.org/), food/beauty via [Open Food Facts](https://world.openfoodfacts.org/) / [Open Beauty Facts](https://world.openbeautyfacts.org/)). |
| [`packages/lib`](./packages/lib) | Shared helpers (`deskToken`, `deviceId`, `cn`, pairing, beacon) plus desk enrichment: ISBN → [`open-library.ts`](./packages/lib/src/open-library.ts), GTIN → [`open-facts-product.ts`](./packages/lib/src/open-facts-product.ts). |
| [`packages/features`](./packages/features) | Shared Home + Desk UI used by web and desktop. |
| [`convex/`](./convex) | Convex schema and functions (stays at repo root). |

### What is shared where

| Asset / concern | Location | Consumed by |
|-----------------|----------|-------------|
| Theme tokens, `ThemeProvider`, desk/home screens, header, button/card; desk **scan enrichment** UI (Open Library + Open * Facts) when `inject` is passed | `packages/features` | `apps/web`, `apps/desktop` |
| Session/device helpers, `cn()`, pairing URL helper | `packages/lib` | `packages/features`, `apps/web` (phone route), `apps/desktop` |
| Convex API types / `api` object | `convex/_generated/api` | Via Vite alias `@scan-it/convex-api` in apps; TS path in `packages/features` |
| Phone scanner, portrait gate, scanner CSS utilities | `apps/web` only | Web app (not shipped in desktop) |

## Environment variables

**Convex CLI** reads `.env.local` at the **repository root** (where you run `npx convex dev`). Keep `CONVEX_DEPLOYMENT` and any Convex-managed keys there.

**Vite** (`apps/web`, `apps/desktop`) is configured with **`envDir` = monorepo root**, so a single **root `.env.local`** next to the root `package.json` is enough for all `VITE_*` variables in local development. You do not have to duplicate files under each `apps/*` folder unless you prefer to.

| Variable | Required by | Purpose |
|----------|-------------|---------|
| `CONVEX_DEPLOYMENT` | Convex CLI (root `.env.local`) | Dev deployment binding for `npx convex dev`. |
| `VITE_CONVEX_URL` | Web, desktop | Convex client HTTP URL. |
| `VITE_PAIRING_ORIGIN` | Web, desktop | Base URL encoded in the desk QR so phones open `…/s/<publicId>` on your **web** deployment (use your real web origin in prod; for LAN dev use your machine URL + port, e.g. `https://host:3000`). |
| `VITE_DEV_HTTPS` | Web (optional) | Set to `1` or `true` to prefer HTTPS in Vite dev. |
| `VITE_DEV_SSL_DOMAINS` | Web (optional) | Extra hostnames for the dev TLS certificate (comma-separated). |
| `VITE_DEV_PUBLIC_HOST` | Web, desktop (optional) | Hostname you open in the browser for dev (e.g. `fiwe-gsg3` or a LAN IP). Sets Vite HMR to use that host so hot reload works when you are not on `localhost`. |
| `VITE_DESKTOP_WINDOWS_INSTALLER_URL` | **Web** landing, desk | Optional override for Windows NSIS installer URL. |
| `VITE_DESKTOP_WINDOWS_PORTABLE_URL` | **Web** landing, desk | Optional override for Windows portable ZIP URL. |
| `VITE_DESKTOP_MAC_DMG_URL` | **Web** landing, desk | Optional override for macOS DMG URL. |
| `VITE_DESKTOP_DOWNLOAD_URL` | **Web** landing, desk | Legacy: sets **primary** download button only; “All downloads” still use the three URLs above or GitHub `latest` defaults. |

Templates: [`.env.example`](./.env.example) (root, recommended), plus per-app reminders in [`apps/web/.env.example`](./apps/web/.env.example) and [`apps/desktop/.env.example`](./apps/desktop/.env.example).

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
- **Desktop desk:** optional **scan enrichment** uses third-party read APIs ([Open Library](https://openlibrary.org/) for ISBN; [Open Food Facts](https://world.openfoodfacts.org/) / [Open Beauty Facts](https://world.openbeautyfacts.org/) for GTIN). See each project’s terms and [Open Food Facts data reuse](https://support.openfoodfacts.org/help/en-gb/12-api-data-reuse/94-are-there-conditions-to-use-the-api).

## Desktop scan enrichment (Open Library + Open * Facts)

The **Tauri desktop app** can turn each scan into **multiple columns** of metadata for Excel and other tools. You pick **one** enrichment source at a time: **Off**, **Books** (ISBN), **Food** (GTIN), or **Beauty** (GTIN). The **browser desk** does not offer this UI (it has no `inject` prop); enrichment is desktop-only.

### What it does

- **Books:** scans are normalized to **ISBN-13** when possible, then looked up with the [Books API](https://openlibrary.org/dev/docs/api/books) (`jscmd=data`, no API key). Canonical fields (title, authors, publishers, etc.) live in [`packages/lib/src/open-library.ts`](./packages/lib/src/open-library.ts).
- **Food / beauty:** scans are normalized to a **GTIN** (EAN-8, EAN-13, GTIN-14, or UPC-A as 12 digits with a leading `0`), then looked up with the Product Opener JSON API: `GET …/api/v0/product/{code}.json` on [`world.openfoodfacts.org`](https://world.openfoodfacts.org/) or [`world.openbeautyfacts.org`](https://world.openbeautyfacts.org/) (no API key). Field IDs and labels are in [`packages/lib/src/open-facts-product.ts`](./packages/lib/src/open-facts-product.ts).
- **Output** for every mode is a single line of values joined by **Tab** (default, for Excel columns) or **Comma**. Cell text is sanitized so tabs, commas, and newlines do not break the row.
- **Clipboard:** if **Scan to clipboard** is on, that resolved line is what gets copied on each new scan.
- **Typing:** if **Type into focused app** is on, the app uses **`inject_sequence`** in Rust to type each column and send **Tab** between cells when Tab is the separator and there is more than one column (see [`apps/desktop/src-tauri/src/lib.rs`](./apps/desktop/src-tauri/src/lib.rs)). Otherwise it types one string via **`inject_text`**.
- **Log:** while enrichment is on, the log shows the **resolved line** as the main line; if it differs from the raw scan text, a **Raw scan** line appears underneath.

### How to use it

1. Open the **desktop** app, start a desk, pair the phone.
2. Under **Scan enrichment**, choose **Books**, **Food**, or **Beauty** (or **Off**). Column settings are separate per mode and persist in `localStorage`. Legacy “book enrichment enabled” is migrated to **Books** when you first open the desk after updating.
3. Choose **column separator** (Tab or comma) and **columns** (order, add/remove).
4. Enable **Scan to clipboard** and/or **Type into focused app** as needed. For **multiple Excel columns** with Tab separation, set **After each scan** to **Nothing** or **Enter**, not **Tab**, or the extra Tab moves past the last cell (the UI explains this).
5. Scan barcodes; invalid codes or unknown products still fill **Scanned code** and leave other columns empty where data is missing.

### Implementation notes (for contributors)

- **Convex** still stores only the raw scan string; all enrichment runs in the **desk WebView** (`fetch` to Open Library / Open * Facts). Use a descriptive app identity for Open * Facts requests where the runtime allows (see comment in [`open-facts-product.ts`](./packages/lib/src/open-facts-product.ts)); expect browser/WebView limits on custom `User-Agent` and keep volume modest.
- The desk pipeline uses **`injectRef`** so a stable Tauri `inject` object does not retrigger effects and abort in-flight lookups on every render. The desktop router wraps `inject` in **`React.useMemo`** ([`apps/desktop/src/router.tsx`](./apps/desktop/src/router.tsx)).
- **More categories** (music, games, etc.) should follow the same shape: **canonical field IDs + mapper + resolver** in `@scan-it/lib`, mode option in `DeskScreen` gated on `inject`, async resolution merged with clipboard/inject, and new Tauri commands only if keystroke behavior needs something beyond typing a joined string. Document new APIs’ terms of use in README and in-app where appropriate.

## Routes (web app)

- `/` — Landing: download desktop CTA and **Use in browser** → `/start`; SEO “Guides” links to topic pages.
- `/terms`, `/privacy`, `/about` — Legal and about.
- `/wireless-barcode-scanner`, `/barcode-scanner-for-excel`, … — SEO guide pages (see `apps/web/src/content/marketing-articles.ts`).
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

This runs a production build for the web app, TypeScript check for the desktop UI, and ESLint on shared source. It is the recommended check before pushing.

Other useful commands:

```bash
npm run build -w @scan-it/web
npm run build -w @scan-it/desktop    # Vite bundle only
npm run build:desktop                 # Full Tauri build → scan-it.exe + NSIS (Windows) or DMG (macOS)
npm start                             # Run built SSR server (after web build)
```

## Vercel

Use **one** project with **Root Directory** `apps/web`. The included [`apps/web/vercel.json`](./apps/web/vercel.json) installs from the monorepo root and builds `@scan-it/web`. Set **`VITE_CONVEX_URL`**, **`VITE_PAIRING_ORIGIN`** (production URL of this deployment—used for canonical URLs and phone pairing), optional **`VITE_DESKTOP_*`** URL overrides for download links, and any dev/SSL vars if needed.

Static SEO files live in [`apps/web/public`](./apps/web/public) (`robots.txt`, `sitemap.xml`). Update the hostname there if your production domain is not `https://scan.glennsvanberg.se`.

On Vercel, environment variables are configured in the project settings (there is no root `.env.local`); names are the same as in the table above.

## Desktop releases (GitHub Actions)

Pushing a tag `v*` runs [`.github/workflows/release-desktop.yml`](./.github/workflows/release-desktop.yml). It builds on **Windows** and **macOS** and uploads:

| Asset | Contents |
|-------|-----------|
| `scan-it-windows-portable.zip` | `scan-it.exe` (no installer) |
| `scan-it-windows-setup.exe` | NSIS installer (x64) |
| `scan-it-macos.dmg` | macOS app (universal binary when the workflow succeeds) |

Stable filenames are required for `https://github.com/<owner>/<repo>/releases/latest/download/<filename>` links on the landing page.

Configure repository **Variables** **`VITE_CONVEX_URL`** and **`VITE_PAIRING_ORIGIN`** so the embedded UI points at your Convex deployment and phone pairing URLs are correct.

**macOS:** CI builds are **not** code-signed or notarized; users may need to right-click → Open the first time. Add Apple signing in CI later if you want a smoother Gatekeeper experience.

## Style

See [docs/STYLEGUIDE.md](./docs/STYLEGUIDE.md) for theme tokens, light/dark behavior, and UI patterns (mint green accent, scanner frame, log typography).

## Agent / contributor docs

See [AGENTS.md](./AGENTS.md) for monorepo boundaries, import conventions, and how we expect Convex and frontend work to be done.
