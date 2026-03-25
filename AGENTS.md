<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Scan It — what we are building

A **minimal, no-login** scanner bridge:

1. **Desktop** creates a Convex-backed **session** and shows a **pairing QR** (`react-qr-code`) and URL.
2. **Phone** opens `/s/$publicId`, generates or reuses a **`deviceId` in `localStorage`**, and calls **`claimPhone`** so only the **first** phone binds to the session.
3. Phone runs **`html5-qrcode`** and sends decodings with **`submitScan`** (must match bound `deviceId`).
4. **Desktop** on `/desk/$publicId` subscribes with **`getDeskView`** using **`publicId` + `deskToken`** (sessionStorage). Session ends with **`endSession`** (invalidates phone + desk reads).

Do **not** add user auth for this product phase unless the human explicitly asks. Prefer extending the session + scan tables and documented security notes in README.

## Monorepo map (where to edit)

| If you are changing… | Edit here |
|---------------------|-----------|
| Convex schema / mutations / queries | `convex/` (repo root — never move) |
| Shared TS utilities (tokens, device id, `cn`, pairing URL) | `packages/lib` — import as `@scan-it/lib` |
| Home + Desk UI, theme, site chrome, shadcn-style primitives | `packages/features` — import as `@scan-it/features` |
| Phone scanner, `/s/*` route, scanner-only CSS | `apps/web` only |
| Start routes, SSR/router wiring, web-only assets | `apps/web` |
| Tauri shell, Rust commands (`inject_text`), window config | `apps/desktop` |
| Landing, SEO guides, legal pages | `apps/web` (`/`, `/privacy`, `/about`, `/wireless-barcode-scanner`, …) |

**Rule of thumb:** If both the browser desk and the Tauri desk need the same screen or styling, put it in **`packages/features`** (or **`packages/lib`** for pure functions). If only the phone or only the web server needs it, keep it in **`apps/web`**.

## Convex conventions here

- Public API lives in `convex/scanSessions.ts` (and schema in `convex/schema.ts`).
- **Validators** on every function; return `null` for “not found / wrong token” on desk read where appropriate.
- **`Date.now()`** is acceptable in **mutations** for `createdAt`; avoid time-dependent logic in **queries** that should stay pure/cache-friendly (see Convex guideline on `Date.now()` in queries).
- After schema changes, run **`npx convex dev`** or **`npx convex codegen`** so `_generated` types stay in sync.

## Imports and build tooling

### `@scan-it/lib`

- **Allowed:** any package or app.
- **Must not:** import from `convex`, `react`, or `packages/features` (keep it small and portable).

### `@scan-it/features`

- May import **`convex/react`**, **`@tanstack/react-router`**, **`@scan-it/lib`**, and **`@scan-it/convex-api`** (path alias in `packages/features/tsconfig.json` → `convex/_generated/api`).
- **Bundling:** `apps/web` and `apps/desktop` Vite configs alias `@scan-it/convex-api` to the real generated file at repo root so `packages/features` resolves during app builds.
- **Do not** import from `apps/web` or `apps/desktop` (no upward dependency).

### `apps/web` and `apps/desktop`

- Use **`~/...`** for local app source only.
- Import shared UI from **`@scan-it/features`**, helpers from **`@scan-it/lib`**, Convex **`api`** from **`@scan-it/convex-api`** in web phone code; features re-export primitives if routes need `Button`/`Card` without duplicating.

### Environment variables

- **Convex CLI:** expects `.env.local` at **repo root** when running `npx convex dev` from root.
- **Vite:** `apps/web` and `apps/desktop` set **`envDir`** to the **repo root**, so one root `.env.local` supplies `VITE_*` for both. Document new `VITE_*` names in README and the relevant `apps/*/.env.example`.

## Frontend conventions

- **TanStack Start** file routes under `apps/web/src/routes/`. Desk and phone routes use **`ssr: false`** where they depend on `sessionStorage` / `localStorage` or the camera APIs.
- **TanStack Router (SPA)** in `apps/desktop` defines the same **`/`** and **`/desk/$publicId`** tree programmatically in `apps/desktop/src/router.tsx` and passes **`inject`** into `DeskScreen` for Tauri keyboard injection. Keep the **`inject` object referentially stable** (e.g. `useMemo` in `DeskPage`); `DeskScreen` uses **`injectRef`** so scan-side effects do not depend on `inject` identity and abort async enrichment on unrelated re-renders.

### Desk scan enrichment (books + Open * Facts)

- **Books (Open Library):** [`packages/lib/src/open-library.ts`](./packages/lib/src/open-library.ts) — ISBN normalization, `fetch` to Open Library `jscmd=data`, canonical **`BookFieldId`** list, **`resolveOpenLibraryEnrichmentLine`**. Cell sanitization via [`packages/lib/src/enrichment-cell.ts`](./packages/lib/src/enrichment-cell.ts).
- **Food / beauty (Open Food Facts / Open Beauty Facts):** [`packages/lib/src/open-facts-product.ts`](./packages/lib/src/open-facts-product.ts) — GTIN normalization, `fetch` to `api/v0/product/{code}.json`, canonical **`ProductFieldId`** list, **`resolveOpenFactsEnrichmentLine`**. Same `{ line, values, found }` shape as books.
- **Desk UI + pipeline:** [`packages/features/src/screens/desk-screen.tsx`](./packages/features/src/screens/desk-screen.tsx) — **one** enrichment mode at a time (`off` | `book` | `food` | `beauty`), column order per mode in `localStorage`, **`enrichedLogLineByScanId`** for log display, unified async path for clipboard + **`injectScan` / `injectFieldParts`**. Enrichment UI runs only when **`inject`** is defined (desktop).
- **Tauri:** [`apps/desktop/src-tauri/src/lib.rs`](./apps/desktop/src-tauri/src/lib.rs) — **`inject_text`**, **`inject_sequence`** (type segment, Tab, …, then suffix).
- **Adding another category:** add a small module in `packages/lib` (field IDs, API client, `resolve*Line` returning `{ line, values, found }`), add a mode to `DeskScreen`, branch **`resolveDeskEnrichment`** (or equivalent), reuse the same clipboard/inject/log pattern; add Rust commands only if needed. Do not put third-party fetch secrets in the client for production APIs — prefer Convex actions or env-backed server routes if keys are required later.
- **UI tokens:** `packages/features/src/styles/features.css`. **Web-only scanner utilities:** `apps/web/src/styles/app.css` (`@source` globs must reach the **repo root** from `apps/*/src/styles/`, e.g. `../../../../packages/features/src/**/*.{tsx,ts}` — three `..` segments incorrectly resolve to `apps/` and Tailwind will not see shared components). **Global CSS in apps:** side-effect `import '~/styles/app.css'` in **`apps/web`** `__root.tsx` and **`apps/desktop`** `main.tsx` — do not wire `app.css?url` into `<link rel="stylesheet">`; in dev Vite serves `/src/.../app.css` as JavaScript (HMR), so the browser ignores it and Tailwind looks “broken”. **`@scan-it/features` declares `sideEffects` for `**/*.css`** so bundlers do not drop shared styles.
- **Desktop dev server:** `apps/desktop/vite.config.ts` uses `server.host: true` (all interfaces) unless `TAURI_DEV_HOST` is set; optional `VITE_DEV_PUBLIC_HOST` for HMR over a LAN hostname (see README).
- **Theme:** `next-themes` via `ThemeProvider` in `@scan-it/features`; default **dark**. Follow **`docs/STYLEGUIDE.md`** (paths there point at `packages/features` and `apps/web`).

## QR and scanner libraries

- **Pairing QR (desk):** `react-qr-code` only (used inside `DeskScreen` in features).
- **Phone camera:** `html5-qrcode`. Lifecycle stays in **`apps/web/src/components/phone-scanner.tsx`**; clean up `stop()` on unmount.

## Testing and checks before merge

From repo root:

```bash
npm run verify
```

This runs a web production build, desktop `tsc`, and ESLint on `apps/web/src`, `packages/*`, and `convex/`. Fix all failures before merging.

For a full desktop binary (local, Windows or macOS):

```bash
npm run build:desktop
```

Requires Rust toolchain. **Windows:** WebView2 runtime. **macOS:** system WebKit (no extra install).

## When editing docs

- Product decisions and security tradeoffs → **README.md**.
- Visual / UX tokens → **`docs/STYLEGUIDE.md`**.
- Agent workflow, monorepo boundaries, import rules → **this file**.
