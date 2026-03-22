# Scan It — style guide

This document matches the product direction: **modern, high-contrast, developer-tool aesthetic** with **mint / green accents**, optional **subtle glow**, and **light + dark** themes. Reference mood: dark charcoal bases, neon or mint highlights, monospace for technical lines, generous negative space.

## Themes

- **Default:** `dark` (see `ThemeProvider` in `src/components/theme-provider.tsx`).
- **Toggle:** Header control (`ThemeToggle`) persists with `storageKey="scan-it-theme"` (`next-themes`).
- **Implementation:** CSS variables on `:root` and `.dark` in `src/styles/app.css`, mapped into Tailwind via `@theme inline`.

Do **not** hardcode hex colors in components unless it is for **QR contrast** (e.g. white background behind the QR matrix).

## Color tokens

| Role | Intent |
|------|--------|
| **Background** | Deep charcoal (dark) / near-white (light). |
| **Foreground** | High-contrast body text. |
| **Primary** | Mint / green accent — buttons, focus rings, log accent bar, scanner frame. |
| **Muted** | Secondary text, de-emphasized metadata. |
| **Border** | Hairline dividers; keep subtle. |
| **Destructive** | End session, errors. |

Primary is tuned in **OKLCH** in `app.css` so it stays vivid in both themes (slightly brighter green on dark backgrounds).

## Typography

- **Marketing / page titles:** Bold, uppercase, tight tracking (`tracking-tight` to `tracking-tight` + display scale). Optional **`.text-glow`** in dark mode for hero emphasis (use sparingly).
- **Labels / section headers:** Small, **uppercase**, **wide tracking** (`tracking-[0.2em]`–`0.35em]`), `text-muted-foreground`.
- **Codes, URLs, scan log:** **`font-mono`** (stack includes JetBrains Mono / Fira Code fallbacks via `--font-mono` in `@theme`).

## Layout

- **Breathing room:** Centered hero on home; desk uses a **two-column** layout on wide screens (pairing card + log).
- **Hierarchy:** One clear primary action per surface (e.g. **Start scan session**, **End session**).
- **Borders:** Thin `border-border`; optional **left accent** (`border-l-2 border-primary`) for quoted instructions and log rows (matches “editorial bar” reference style).

## Components (shadcn-style)

- **Buttons:** Pill shape (`rounded-full`), uppercase label, semibold. Primary uses **`.shadow-glow-sm`** for a soft mint glow.
- **Cards:** `rounded-xl`, light border; headers with small uppercase title.
- **Icon buttons:** Ghost variant for theme toggle.

Extend with additional shadcn primitives as needed; keep **radius and uppercase** patterns consistent.

## Scanner UI

- **Pairing QR:** White **padding** behind the code for **reliable scans**; outer container may use **primary-tinted border** (`border-primary/40`) and glow.
- **Phone camera:** `.scanner-frame` wraps the video region — inset border + **corner brackets** using `::before` / `::after` and `var(--primary)` (see `app.css`).
- **Fullscreen / mobile:** Keep controls reachable; avoid clutter over the camera preview.

## Motion & effects

- Prefer **CSS-only** transitions on colors and shadows. Avoid distracting motion on every scan.
- **Glow utilities:** `.shadow-glow-sm`, `.text-glow` — use for **primary CTA** and **hero**, not for every card.

## Accessibility

- Visible **focus** styles: `focus-visible:ring-2` using `ring` token.
- **Theme toggle** must have an accessible **name** (`aria-label`).
- **Color is not the only signal** for errors (use text + border/destructive token).

## Content voice

- Short, direct **instructions** (pairing steps, permission hints).
- Avoid implying enterprise security; be honest that the **link + first claimant** model is **convenience-first**.
