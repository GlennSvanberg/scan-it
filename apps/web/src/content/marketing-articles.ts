import type { MarketingArticle } from '~/components/marketing-article-page'

export const marketingArticles: Array<MarketingArticle> = [
  {
    path: '/wireless-barcode-scanner',
    title: 'Wireless barcode scanner for PC | Scan It',
    description:
      'Turn your phone into a wireless barcode and QR scanner for your PC. Real-time desk log, optional clipboard and desktop typing—no USB scanner or phone app store install.',
    h1: 'Wireless barcode scanner for PC',
    intro:
      'Scan It turns the phone you already carry into a scanner that sends barcodes and QR codes to your computer in real time over the network. There are no user accounts: you start a desk session, pair once with a QR code on your monitor, and scan.',
    sections: [
      {
        heading: 'What you get',
        paragraphs: [
          'The desk side shows a live log of everything the phone reads. You can enable Scan to clipboard on the desk when you want each new decode copied automatically (it is off by default). The optional Windows or macOS desktop app can also type scans into whichever app is focused—useful for spreadsheets and line-of-business tools.',
        ],
        bullets: [
          'Works in the browser: no app install required on the phone for pairing and scanning.',
          'One phone per desk session—the first device to complete pairing owns the slot until the session ends.',
          'Closing the desk tab or leaving via the Scan It header ends the session on the server so the phone disconnects.',
        ],
      },
      {
        heading: 'How a session works',
        orderedSteps: [
          'On your computer, open Scan It and start a desk (for example from the home page or /start).',
          'Scan the pairing QR with your phone camera; the phone opens the scanner page and claims the session.',
          'Point the phone at barcodes or QR codes; each successful read appears on the desk in order.',
        ],
        paragraphs: [
          'Treat the pairing link like a short-lived secret: anyone who opens it before your phone pairs could occupy the slot. For most desk workflows that is acceptable; if you need stricter control, pair immediately after creating the session.',
        ],
      },
      {
        heading: 'When a phone beats a USB scanner',
        paragraphs: [
          'Dedicated USB or Bluetooth imagers excel on fixed, high-volume lines. Phones shine when you want zero extra hardware spend, occasional scanning, or a spare device after something breaks. One workflow covers both QR and common product barcodes, which matters in mixed-label environments.',
        ],
        bullets: [
          'Good fit: stock counts, receiving, events, small retail, prototyping integrations.',
          'Less ideal: continuous conveyor scanning or harsh lighting without a modern phone camera.',
        ],
      },
      {
        heading: 'Try it',
        paragraphs: [
          'Open Scan It on your PC, start a desk, scan the pairing QR with your phone, and send your first code in under a minute. Add the desktop build when you need enrichment or keystrokes into another app.',
        ],
      },
    ],
    faq: [
      {
        question: 'Do I need to install an app on my phone?',
        answer:
          'No. Pairing and scanning run in the phone browser after you scan the desk QR code. The optional desktop app is for your computer when you want typing into focused apps or scan enrichment—not for the phone.',
      },
      {
        question: 'Can multiple phones scan into one desk?',
        answer:
          'No. Only one phone can bind to a session; the first successful pairing wins. Start a new desk if you need a different device.',
      },
      {
        question: 'Does Scan It work without an account?',
        answer:
          'Yes. Security is session-based (pairing URL and desk token), not login-based. There are no user accounts for this product phase.',
      },
      {
        question: 'Will scans type directly into Excel?',
        answer:
          'In the browser desk you copy from the log or use Scan to clipboard. The Windows and macOS desktop app can send each scan as keystrokes into the focused application, including Excel and other spreadsheets.',
      },
    ],
  },
  {
    path: '/barcode-scanner-for-excel',
    title: 'Barcode scanner for Excel & spreadsheets | Scan It',
    description:
      'Scan barcodes into Excel, Google Sheets, and other spreadsheets from your phone. Browser desk for log + clipboard; desktop app types into the active cell and can expand rows with book or product metadata.',
    h1: 'Barcode scanner for Excel and spreadsheets',
    intro:
      'Spreadsheets are still where a huge amount of operational data lands. Scan It separates capture (phone camera) from recording (PC) so you are not retyping labels or juggling photos.',
    sections: [
      {
        heading: 'Browser desk vs desktop app',
        paragraphs: [
          'In the web app, every scan appears in a chronological log on the desk. Turn on Scan to clipboard when you want the latest decode on the clipboard for pasting into a cell. That keeps you in control of where each value lands.',
          'The Scan It desktop app adds keystroke injection: with your workbook focused, each scan can be typed into the active cell as if you had typed it yourself. For multi-column rows, you can use tab-separated values so one scan fills several adjacent columns.',
        ],
        bullets: [
          'Desktop-only: optional scan enrichment (books via Open Library, food or beauty products via Open * Facts) turns a single barcode into a full row of metadata—still one scan from the phone.',
          'Separator and “after each scan” settings matter: with tab-separated columns, avoid an extra Tab after the row if it would skip past the last cell in Excel.',
        ],
      },
      {
        heading: 'Typical workflows',
        orderedSteps: [
          'Open the workbook and select the starting cell (desktop app) or keep the sheet visible beside the desk (browser).',
          'Start a desk, pair the phone, scan items in walk order.',
          'In the browser, paste from the log or from the clipboard; on desktop, let keystrokes advance the sheet or paste the log column-wise later.',
        ],
      },
      {
        heading: 'Honest limits',
        paragraphs: [
          'Clipboard auto-copy can be blocked by some browsers until you interact with the page. The Copy latest control on the desk is the reliable fallback. Unknown barcodes still record the raw scan string even when enrichment cannot resolve a product.',
        ],
      },
    ],
    faq: [
      {
        question: 'Can Scan It fill multiple Excel columns from one barcode?',
        answer:
          'Yes, when you use the desktop app with scan enrichment and a tab (or comma) column separator. Each scan can produce one row of multiple fields. The browser desk does not offer enrichment; it shows the raw scan log.',
      },
      {
        question: 'Does Google Sheets work the same as Excel?',
        answer:
          'The browser flow works the same: you paste into the sheet from the log or clipboard. Keystroke injection targets whichever app is focused on Windows or macOS, including a browser tab with Sheets if that is where you work.',
      },
      {
        question: 'Is there a login?',
        answer:
          'No. You pair the phone with a session QR code; the desk holds a session token in the browser. There are no user accounts.',
      },
    ],
  },
  {
    path: '/qr-scanner-to-pc',
    title: 'QR scanner to PC — send scans to your computer | Scan It',
    description:
      'Pair your phone once with a desk QR code, then stream QR and barcode decodes to your PC in real time. Full session log, optional clipboard, optional desktop typing.',
    h1: 'QR scanner to PC',
    intro:
      'Scan It is for the moment you need QR or barcode content on your computer immediately—tickets, asset tags, 2FA setup codes on a label, or a long URL you do not want to retype.',
    sections: [
      {
        heading: 'Why not just use the phone?',
        paragraphs: [
          'Because the authoritative record, spreadsheet, or ticketing tool often lives on the PC. The desk shows every decode in order, which makes it easy to compare against a list, script imports, or copy specific entries after the fact.',
        ],
      },
      {
        heading: 'Same flow for QR and barcodes',
        paragraphs: [
          'After pairing, the phone stays in camera mode. Common 1D retail symbologies and QR codes are handled in one tool, which helps when shelves mix formats.',
        ],
        bullets: [
          'Pairing is a QR on your monitor; scanning is live camera decode on the phone.',
          'Session ends when you close the desk or navigate away via the app header, which clears server-side state for that desk.',
        ],
      },
      {
        heading: 'Tips for reliable reads',
        bullets: [
          'Hold steady and let autofocus finish; glare on laminated passes can confuse any camera.',
          'If a code is dense, increase distance slightly so the full pattern fits in frame.',
          'For repeated similar codes, watch the desk log for duplicates before you commit data downstream.',
        ],
      },
    ],
  },
  {
    path: '/inventory-barcode-scanner',
    title: 'Inventory barcode scanner (phone + PC) | Scan It',
    description:
      'Run stock counts with your phone as the scanner and your PC as the system of record. Live ordered log, optional clipboard, desktop typing and product metadata for SMB warehouses.',
    h1: 'Inventory barcode scanner for counts and stocktakes',
    intro:
      'Periodic counts and aisle sweeps go faster when capture is frictionless. Scan It keeps the phone on the labels and the computer on the truth: a running list you can reconcile, dedupe, or paste into an ERP or sheet.',
    sections: [
      {
        heading: 'Why split phone and PC?',
        paragraphs: [
          'When the scanner and the log share one small screen, mistakes creep in: wrong bin, missed duplicate, fat-fingered quantity. A monitor-sized log makes it obvious when the same SKU fired twice or when a read failed.',
        ],
        bullets: [
          'Oldest-to-newest ordering on the desk matches walk-the-floor sequences.',
          'Desktop enrichment (optional) can resolve GTINs to product names for sanity checks while you still store the raw code.',
        ],
      },
      {
        heading: 'Run a count',
        orderedSteps: [
          'Prepare your destination: spreadsheet, WMS staging table, or scratch pad on the desk.',
          'Start a desk, pair one phone, walk locations in a defined path.',
          'Review the log for gaps or duplicates before you post numbers.',
        ],
      },
      {
        heading: 'Expectations',
        paragraphs: [
          'Modern phone cameras handle typical warehouse lighting and label sizes well. Continuous high-speed lines and damaged labels are where dedicated imagers still earn their cost. Scan It is MIT-licensed open source—you can self-host and tune deployment if your IT policy requires it.',
        ],
      },
    ],
  },
  {
    path: '/barcode-scanner-for-small-business',
    title: 'Barcode scanner for small business | Scan It',
    description:
      'No-login phone-to-PC scanning for shops, sellers, and ops teams. Use hardware you already own; optional desktop app types into QuickBooks, Excel, and other Windows or Mac apps.',
    h1: 'Barcode scanning for small businesses',
    intro:
      'Enterprise scanner programs are overkill when you need reliable capture a few hours a week. Scan It is built for teams that want to move now: pair a phone, log scans on a PC, optionally type into the app you already use.',
    sections: [
      {
        heading: 'What small teams actually need',
        paragraphs: [
          'Most SMB workflows are variations on the same theme: read a code, record it somewhere, maybe look up a product. Scan It skips proprietary handheld fleets and per-device licenses for that middle layer.',
        ],
        bullets: [
          'No user accounts—onboarding is “open desk, scan QR, go”.',
          'Replace a broken scanner by pairing another phone; the desk workflow stays identical.',
          'Desktop app optional: use the browser alone, add typing or enrichment when ROI is clear.',
        ],
      },
      {
        heading: 'Cost and operations',
        paragraphs: [
          'USB scanners walk away or fail at the worst time. Phones are already amortized, charged nightly, and familiar to staff. Your main operational habit should be pairing immediately after creating a session so the QR link is not left hanging.',
        ],
      },
      {
        heading: 'Security in plain language',
        paragraphs: [
          'Sessions are protected by unguessable tokens, not passwords. Anyone with the pairing URL before you connect could claim the phone slot—same risk class as sharing an unlisted Zoom link. End the desk when finished.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is Scan It free for commercial use?',
        answer:
          'The project is open source under the MIT License. You can use it for commercial operations; hosting and Convex usage are your operational costs if you deploy your own backend.',
      },
      {
        question: 'Can we use it for POP or retail without a POS integration?',
        answer:
          'Yes. The desk gives you a raw log and optional clipboard or desktop typing. You decide whether that feeds a POS, a sheet, or a manual checklist.',
      },
      {
        question: 'Do employees need training?',
        answer:
          'Pairing is one QR scan; scanning is camera-based like paying with a wallet app. The bigger training point is your internal process: which sheet row or field receives each scan.',
      },
    ],
  },
  {
    path: '/use-cases/inventory-counting',
    title: 'Inventory counting with a phone scanner | Scan It',
    description:
      'Walk bins and scan barcodes while your PC records every decode in order. Tips for deduping, lighting, and moving data into sheets or lightweight inventory tools.',
    h1: 'Inventory counting',
    intro:
      'Counting is repetition: identify the item, record the identifier, repeat. Scan It removes manual transcription so the limiting factor is physical walk speed, not keyboard speed.',
    sections: [
      {
        heading: 'Suggested setup',
        orderedSteps: [
          'Define count zones and sequence (for example Aisle A top-to-bottom) before you start.',
          'Open your tally destination on the PC; start a desk and pair the phone.',
          'Scan each unit or location label once per your procedure; watch the desk for accidental double-reads.',
        ],
      },
      {
        heading: 'Using the log',
        paragraphs: [
          'The desk log is append-only for the session, which preserves audit order. Export is manual today: copy ranges you need, or use desktop typing to stream directly into a sheet cell-by-cell.',
        ],
        bullets: [
          'If your process counts each facing, decide whether one scan means one unit or one shelf strip.',
          'Pause between bins if you batch-verify against the log before moving on.',
        ],
      },
      {
        heading: 'When to pick different tooling',
        paragraphs: [
          'If you need cycle counts integrated into a live ERP with automatic variance posts, you will still use Scan It as a capture front-end or adopt native WMS mobile flows. Scan It shines when the bottleneck is “get accurate codes off the floor fast.”',
        ],
      },
    ],
  },
  {
    path: '/use-cases/retail-stocktakes',
    title: 'Retail stocktakes — phone to PC scanning | Scan It',
    description:
      'After-hours retail counts with phones instead of a shared laser pool. Mixed QR promos and EAN product codes in one camera flow; PC keeps the authoritative list.',
    h1: 'Retail stocktakes',
    intro:
      'Small stores often run counts when the shop is closed. Carrying a laptop and a phone beats juggling a clipboard, pen, and separate scanner—especially when shelf tags mix QR campaigns with standard product barcodes.',
    sections: [
      {
        heading: 'Floor workflow',
        paragraphs: [
          'Station the laptop where someone can glance at exceptions, or use a cart mount. The phone stays aimed at shelf labels; the desk shows each read immediately so a teammate can flag duplicates or missing expectations.',
        ],
        orderedSteps: [
          'Print or export your expected SKU list if you reconcile against planograms.',
          'Pair once per desk session; keep the phone awake with a full battery or charger.',
          'Work shelf-by-shelf left-to-right to reduce skipped facings.',
        ],
      },
      {
        heading: 'Mixed symbologies',
        paragraphs: [
          'Promotional QR codes and standard EAN-13 product codes often sit side by side. Scan It handles both in the same session, so staff do not switch apps mid-aisle.',
        ],
      },
      {
        heading: 'Customer-facing caution',
        bullets: [
          'Run sensitive counts after hours so pairing QR codes are not visible to shoppers.',
          'End the desk when the count is done so the session cannot be reused accidentally.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/excel-barcode-entry',
    title: 'Excel barcode entry from your phone | Scan It',
    description:
      'Stream barcodes into Excel: browser log plus clipboard, or desktop keystrokes into the active cell. Tab-separated enrichment for multi-column rows from one scan.',
    h1: 'Excel barcode entry',
    intro:
      'Excel rewards deterministic input. Scan It makes each decode a single event you can paste, copy, or type—so formulas and tables update predictably.',
    sections: [
      {
        heading: 'Choose your integration depth',
        bullets: [
          'Browser: enable Scan to clipboard or copy from the log when you want full manual placement.',
          'Desktop: focus the target cell, enable typing mode, and let each scan commit like keyboard input.',
          'Desktop + enrichment: map ISBN or GTIN scans to title, brand, or other columns in one row.',
        ],
      },
      {
        heading: 'Column discipline',
        paragraphs: [
          'When enrichment outputs multiple fields separated by tabs, Excel treats them as adjacent columns if the selection is a single cell. Avoid configuring an extra trailing Tab keystroke after the row if it would move the cursor past your last intended column.',
        ],
      },
      {
        heading: 'Quick start',
        orderedSteps: [
          'Open the workbook, click the first data cell.',
          'Start Scan It desktop (for typing) or web desk (for log/clipboard).',
          'Pair the phone and scan; verify the first few rows before a long run.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/event-check-in',
    title: 'Event check-in scanning (QR to computer) | Scan It',
    description:
      'Lightweight volunteer check-in: scan attendee QR codes to a laptop in real time. Compare payloads against a door list without a full ticketing stack.',
    h1: 'Event check-in',
    intro:
      'Large platforms make sense when you sell thousands of tickets. For community events, school functions, or internal offsites, you may only need to verify a code and mark someone present.',
    sections: [
      {
        heading: 'How volunteers use it',
        paragraphs: [
          'One person holds the phone as the scanner; another watches the desk or spreadsheet. Each successful read lands as text you can match against a pre-exported CSV or simple script.',
        ],
        orderedSteps: [
          'Pre-load your attendee identifiers in a sheet or tool on the laptop.',
          'Create a desk, display the pairing QR where only staff can scan it.',
          'Scan tickets or badges; resolve “not on list” at the desk before waving people through.',
        ],
      },
      {
        heading: 'Operational notes',
        bullets: [
          'Glare and low light at venue doors affect every camera—have a backup printed list.',
          'If two volunteers need two scanners, run two desk sessions (two laptops or browser windows), each with its own pairing.',
          'This is capture plumbing, not fraud-proof ticketing; pair QR secrecy matters.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'Scanned payloads may include personal identifiers. Close the desk when the event ends and avoid projecting the live log toward public sightlines.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/warehouse-picking',
    title: 'Warehouse picking assistance — scan to PC | Scan It',
    description:
      'Ad hoc pick verification: scan location or SKU barcodes while a workstation records the sequence. Bridge until you standardize fixed scanners or WMS mobile.',
    h1: 'Warehouse picking',
    intro:
      'Not every bench gets a corded imager on day one. Scan It is a practical bridge for training lanes, pop-up stations, or pilots before you buy hardware.',
    sections: [
      {
        heading: 'Typical pattern',
        paragraphs: [
          'The authoritative business rules stay on the PC—WMS client, spreadsheet macros, or checklist. The phone is only the optical wedge. That separation keeps picking logic where IT already maintains it.',
        ],
        bullets: [
          'Confirm pick-to-light or voice picks by scanning the outbound carton label into the desk log.',
          'Use desktop typing to feed a telnet or green-screen session if that is still your stack.',
        ],
      },
      {
        heading: 'Throughput reality',
        paragraphs: [
          'Phones are slower than purpose-built scanners for all-day continuous picking. Plan for short bursts, training, or low-SKU pilots. Upgrade to rugged scanners when the pain of missed reads exceeds hardware cost.',
        ],
      },
      {
        heading: 'Session hygiene',
        orderedSteps: [
          'Start a fresh desk per shift or operator if you want clean logs.',
          'Pair immediately to reduce the window where the URL is unused.',
          'End the session during breaks so scans do not land in the wrong context.',
        ],
      },
    ],
  },
  {
    path: '/compare/phone-barcode-scanner-vs-barcode-to-pc',
    title: 'Phone barcode scanner vs Barcode to PC (alternatives) | Scan It',
    description:
      'Compare Scan It to typical phone-to-PC barcode apps: web-first pairing, Convex realtime desk, no login, MIT open source, optional desktop typing and enrichment.',
    h1: 'Phone barcode scanner vs typical Wi‑Fi scanner apps',
    intro:
      'Many apps move camera decodes from a phone to a desktop. The core transport is similar; differences are in pairing friction, pricing, accounts, desktop integration, and whether you can inspect or self-host the stack.',
    sections: [
      {
        heading: 'What most tools have in common',
        paragraphs: [
          'Nearly every solution uses the phone camera, a network path, and a listener on the PC. Quality varies by symbology support, latency, and how pairing secrets are generated.',
        ],
        bullets: [
          'Pairing: QR on PC, numeric code, or account-linked device lists.',
          'Delivery: websocket, LAN broadcast, or cloud relay.',
          'Desktop behavior: text field only, global hotkey paste, or full keystroke injection.',
        ],
      },
      {
        heading: 'Where Scan It leans',
        paragraphs: [
          'Scan It is web-first: you open the site, create a desk, scan a pairing QR with the phone browser—no app store install on the phone. The desk is a realtime session backed by Convex subscriptions, so the log updates as scans arrive.',
          'There is no end-user login. The optional desktop build adds OS-level typing and optional metadata enrichment (books, food, beauty) from public APIs.',
        ],
        bullets: [
          'Open source (MIT): you can audit code and run your own deployment.',
          'One phone per session by design—simple security model, not multi-gun receiving.',
        ],
      },
      {
        heading: 'Choosing honestly',
        paragraphs: [
          'If you need offline LAN-only operation, long-range Bluetooth wedges, or enterprise MDM deployment templates, evaluate tools built for those constraints. If you want a fast browser path with optional deep desktop integration, Scan It is built explicitly for that ladder: web now, desktop when you need more.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is Scan It the same as a Bluetooth barcode scanner?',
        answer:
          'No. Bluetooth scanners emulate a keyboard over radio. Scan It uses your phone camera and network connectivity to send decodes to a desk session, with optional desktop keystroke injection on Windows and macOS.',
      },
      {
        question: 'Why no login?',
        answer:
          'The product phase targets frictionless desk workflows. Access control is based on session secrets (pairing URL and desk token) rather than user accounts.',
      },
      {
        question: 'Can I self-host?',
        answer:
          'The repository is MIT-licensed. Running your own instance implies hosting the web app, configuring Convex or your backend deployment, and supplying environment variables such as pairing origin and Convex URL.',
      },
    ],
  },
]

export function getMarketingArticle(path: string): MarketingArticle | undefined {
  return marketingArticles.find((a) => a.path === path)
}
