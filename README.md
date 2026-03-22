# Scan It

Phone-as-a-scanner for your desktop: open the app on a computer, start a session, scan a pairing QR code with your phone, then scan barcodes and QR codes with the phone camera. Decodings show up on the desktop in real time (Convex subscriptions), with optional clipboard copy for the latest scan.

**Stack:** [Convex](https://convex.dev) (backend + realtime), [TanStack Start](https://tanstack.com/start) + React (frontend), [Tailwind CSS](https://tailwindcss.com) v4, shadcn-style UI primitives (Radix Slot + CVA), [react-qr-code](https://www.npmjs.com/package/react-qr-code) (pairing QR on the desk), [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) (camera scanning on the phone).

## Product rules

| Topic | Decision |
|--------|-----------|
| Auth | None. Security is **session secrets**, not user accounts. |
| Session lifetime | Until the **desktop ends the session** (or clears storage and loses the desk token). |
| Phones per session | **One.** The first successful pairing wins; other devices see “already paired”. |
| Deployment | **Single cloud** origin; the pairing URL in the QR is `${origin}/s/${publicId}`. |
| History | **Full log** for the session (all scans), ordered oldest → newest on the desk. |
| Pairing trust | **`publicId` in the QR** lets a device open the session page. **Stable `deviceId` in `localStorage`** on the phone is sent on claim and on every scan; the server stores the first claimant and rejects others. |

### Security notes

- Anyone who can open the pairing URL **before** the real phone pairs could occupy the slot (same as sharing a secret link). Mitigations for later: short TTL, optional numeric PIN shown on the desk, etc.
- The **desk token** is returned once from `createSession` and kept in **sessionStorage** for that tab; it is required to read the session or end it from the desk UI.
- Clipboard auto-copy on new scans may be **blocked by the browser** without a prior user gesture; “Copy latest” is the reliable fallback.

## Routes

- `/` — Start a session (desktop).
- `/desk/$publicId` — Desk: pairing QR, log, end session (requires desk token in sessionStorage).
- `/s/$publicId` — Phone: pair (first visit claims slot), then live camera scanner.

## Development

Prerequisites: Node.js, a Convex project (`npx convex dev`).

```bash
npm install
npx convex dev   # in one terminal — deploys functions & updates env
npm run dev      # TanStack Start + Convex (see package.json)
```

Set `VITE_CONVEX_URL` in `.env.local` (Convex dashboard / `npx convex dev` output).

## Style

See [docs/STYLEGUIDE.md](./docs/STYLEGUIDE.md) for theme tokens, light/dark behavior, and UI patterns (mint green accent, scanner frame, log typography).

## Roadmap (out of scope for this repo phase)

- **Tauri** desktop app: virtual keyboard injection, “append Enter after each scan”, power-user options.

## Agent / contributor docs

See [AGENTS.md](./AGENTS.md) for how we expect Convex and frontend work to be done in this repository.
