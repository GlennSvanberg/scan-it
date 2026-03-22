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

### Convex conventions here

- Public API lives in `convex/scanSessions.ts` (and schema in `convex/schema.ts`).
- **Validators** on every function; return `null` for “not found / wrong token” on desk read where appropriate.
- **`Date.now()`** is acceptable in **mutations** for `createdAt`; avoid time-dependent logic in **queries** that should stay pure/cache-friendly (see Convex guideline on `Date.now()` in queries).
- After schema changes, run **`npx convex dev`** or **`npx convex codegen`** so `_generated` types stay in sync.

### Frontend conventions

- **TanStack Start** file routes under `src/routes/`. Desk and phone routes use **`ssr: false`** because they depend on `sessionStorage` / `localStorage` and the camera APIs.
- UI: **Tailwind v4** + tokens in `src/styles/app.css`; compose with primitives in `src/components/ui/*` (shadcn-style, not necessarily the full CLI install).
- **Theme:** `next-themes` in root (`ThemeProvider` in `src/routes/__root.tsx`); default **dark**; user can switch light/dark. Follow **`docs/STYLEGUIDE.md`** for accents and layout.

### QR and scanner libraries

- **Pairing QR (desktop):** `react-qr-code` only (per project decision).
- **Phone camera:** `html5-qrcode`. Keep scanner lifecycle in a client-only component (`PhoneScanner`); clean up `stop()` on unmount.

### When editing docs

- Product decisions and security tradeoffs → **README.md**.
- Visual / UX tokens → **`docs/STYLEGUIDE.md`**.
- Agent workflow and architecture expectations → **this file**.
