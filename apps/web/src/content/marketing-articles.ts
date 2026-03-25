import type { MarketingArticle } from '~/components/marketing-article-page'

export const marketingArticles: Array<MarketingArticle> = [
  {
    path: '/wireless-barcode-scanner',
    title: 'Wireless barcode scanner for PC | Scan It',
    description:
      'Use your phone as a wireless barcode scanner for your computer. Real-time scans in the browser—no USB scanner, no phone app install.',
    h1: 'Wireless barcode scanner for PC',
    intro:
      'Scan It turns the phone you already carry into a fast wireless scanner that sends barcodes and QR codes to your computer in real time.',
    sections: [
      {
        paragraphs: [
          'Instead of buying dedicated hardware, you open the Scan It web app on your PC, pair your phone with a QR code, and start scanning. Scans appear instantly on your desk—ready to copy, route into workflows, or (with the desktop app) type into the focused window.',
          'Because pairing happens in the browser, you can get started without installing anything on your phone.',
        ],
      },
      {
        heading: 'When a wireless phone scanner beats USB hardware',
        paragraphs: [
          'Handheld USB scanners are great on a fixed packing station, but they are another device to charge, cable, and replace. A phone camera plus Scan It is ideal for occasional scanning, mobile inventory passes, and small teams that do not want shared hardware.',
        ],
      },
      {
        heading: 'Try Scan It',
        paragraphs: [
          'Open the web app from the Scan It home page, scan the pairing QR with your phone, and send your first barcode to your computer in under a minute.',
        ],
      },
    ],
  },
  {
    path: '/barcode-scanner-for-excel',
    title: 'Barcode scanner for Excel & spreadsheets | Scan It',
    description:
      'Scan barcodes into Excel and other spreadsheets using your phone as the scanner. Optional desktop app types each scan into the active cell.',
    h1: 'Barcode scanner for Excel and spreadsheets',
    intro:
      'If your workflow lives in Microsoft Excel, Google Sheets, or similar tools, Scan It can feed scans straight into your sheet without manual typing.',
    sections: [
      {
        paragraphs: [
          'With the web app, scans land on your computer in real time so you can paste or automate from there. With the Windows or Mac desktop app, you can go further: each new scan can be sent as keystrokes to whatever application is focused—so the active spreadsheet cell updates as fast as you scan.',
        ],
      },
      {
        heading: 'Good fit for stock counts and receiving',
        paragraphs: [
          'Many small businesses use Excel as the system of record for short tasks: counting stock, receiving cartons, or logging returns. Scan It keeps the workflow lightweight—phone as scanner, PC as spreadsheet.',
        ],
      },
    ],
  },
  {
    path: '/qr-scanner-to-pc',
    title: 'QR scanner to PC — send scans to your computer | Scan It',
    description:
      'Pair your phone once, then scan QR codes and barcodes to your PC in real time. Built for fast desk workflows in the browser.',
    h1: 'QR scanner to PC',
    intro:
      'Scan It is built for the moment you need to read QR codes or barcodes quickly and have the value show up on your computer—not trapped on your phone.',
    sections: [
      {
        paragraphs: [
          'After you pair by scanning a QR code on your monitor, your phone stays in camera mode while your desk session receives each scan. That makes it easy to work through a list of codes without emailing yourself photos or retyping strings.',
        ],
      },
      {
        heading: 'Works alongside barcodes',
        paragraphs: [
          'The same flow handles common retail and logistics barcodes, not only QR—so one tool covers mixed label environments.',
        ],
      },
    ],
  },
  {
    path: '/inventory-barcode-scanner',
    title: 'Inventory barcode scanner (phone + PC) | Scan It',
    description:
      'Use your phone as an inventory barcode scanner while your PC captures every scan in real time. No dedicated scanner hardware required.',
    h1: 'Inventory barcode scanner for counts and stocktakes',
    intro:
      'For periodic counts and small-warehouse sweeps, Scan It gives you a straightforward path: scan with your phone, see results immediately on the computer running your sheet or tool.',
    sections: [
      {
        paragraphs: [
          'Accuracy improves when the scanner and the log live on separate screens: your phone aims at labels while your monitor shows the running list, exceptions, and duplicates.',
        ],
      },
      {
        heading: 'Practical expectations',
        paragraphs: [
          'Scan It is ideal for teams that want to avoid hardware spend and move quickly. If you need industrial scanning speed in continuous high-volume lines, dedicated imagers may still win—but for many SMB inventory passes, a modern phone camera is enough.',
        ],
      },
    ],
  },
  {
    path: '/barcode-scanner-for-small-business',
    title: 'Barcode scanner for small business | Scan It',
    description:
      'Affordable barcode scanning for small businesses: use phones you already own, pair once, and scan to your PC in real time.',
    h1: 'Barcode scanning for small businesses',
    intro:
      'Scan It is aimed at shops, online sellers, warehouses, and events that need reliable scanning without enterprise contracts or proprietary hardware.',
    sections: [
      {
        paragraphs: [
          'You can start in the browser with no accounts required for basic pairing, then add the desktop app when you want deeper integration like typing into line-of-business software.',
        ],
      },
      {
        heading: 'Keep costs predictable',
        paragraphs: [
          'Replacing a lost USB scanner often means another purchase order. With Scan It, replacements are as simple as grabbing another phone—while your desk workflow stays the same.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/inventory-counting',
    title: 'Inventory counting with a phone scanner | Scan It',
    description:
      'Walk the floor and scan item barcodes while your PC captures the session. Built for quick counts and spot checks.',
    h1: 'Inventory counting',
    intro:
      'Counting stock is repetitive: read label, record value, repeat. Scan It removes the middle step of typing or photographing labels.',
    sections: [
      {
        paragraphs: [
          'Keep your spreadsheet or tool open on the computer while you move through bins. Each scan lands on the desk side in order, so you can sort, dedupe, or reconcile as you go.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/retail-stocktakes',
    title: 'Retail stocktakes — phone to PC scanning | Scan It',
    description:
      'Run a retail stocktake faster: scan shelf labels with your phone while a laptop records the session in real time.',
    h1: 'Retail stocktakes',
    intro:
      'Small retail teams often run counts after hours. Scan It keeps the hardware light—phones instead of a pool of laser scanners.',
    sections: [
      {
        paragraphs: [
          'Pair once, then scan continuously. If your process includes both QR promo codes and EAN product barcodes, one camera workflow covers both.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/excel-barcode-entry',
    title: 'Excel barcode entry from your phone | Scan It',
    description:
      'Get barcodes into Excel faster: scan with your phone, paste or type into cells with the desktop app focused on your workbook.',
    h1: 'Excel barcode entry',
    intro:
      'Excel is still the default “database” for many teams. Scan It meets that reality by making capture fast and the transfer to cells deterministic.',
    sections: [
      {
        paragraphs: [
          'Use the web app if you prefer copy-and-paste control, or the desktop app when you want each scan committed as keystrokes into the active cell.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/event-check-in',
    title: 'Event check-in scanning (QR to computer) | Scan It',
    description:
      'Scan attendee QR codes and send codes to a laptop in real time for lightweight check-in and verification workflows.',
    h1: 'Event check-in',
    intro:
      'For volunteer-run events and small venues, you may only need to verify a code and mark arrival—not run a full ticketing platform.',
    sections: [
      {
        paragraphs: [
          'Scan It gives you a simple capture path: phone reads the QR, computer receives the payload immediately so your staff can compare against a list or script the next step.',
        ],
      },
    ],
  },
  {
    path: '/use-cases/warehouse-picking',
    title: 'Warehouse picking assistance — scan to PC | Scan It',
    description:
      'Confirm picks and scan location or SKU barcodes while your workstation records each scan in order.',
    h1: 'Warehouse picking',
    intro:
      'Not every lane needs a fixed-mount scanner. For ad hoc stations or training, Scan It can bridge the gap until you standardize hardware.',
    sections: [
      {
        paragraphs: [
          'Keep eyes on labels and hands on product while the PC side maintains the authoritative log. Pair that with your WMS or spreadsheet rules on the computer.',
        ],
      },
    ],
  },
  {
    path: '/compare/phone-barcode-scanner-vs-barcode-to-pc',
    title: 'Phone barcode scanner vs Barcode to PC (alternatives) | Scan It',
    description:
      'How Scan It compares to common “phone to computer” barcode tools: web-first pairing, real-time desk session, optional desktop typing.',
    h1: 'Phone barcode scanner vs typical Wi‑Fi scanner apps',
    intro:
      'There are several mature apps that send barcodes from a phone to a PC. Scan It focuses on a fast web pairing flow and a desk experience that feels native to browser-first teams.',
    sections: [
      {
        heading: 'What many alternatives share',
        paragraphs: [
          'Most competitors solve the same core problem: the phone camera reads the code, the network carries the payload, the PC receives it. Differences show up in pairing friction, pricing, offline behavior, and how deeply the desktop side integrates with your apps.',
        ],
      },
      {
        heading: 'Where Scan It fits',
        paragraphs: [
          'Scan It is built around a simple web desk session: open the app, scan a pairing QR, start scanning. If you need keystroke injection into arbitrary Windows or Mac apps, the optional desktop download extends the same flow.',
          'Try the web experience first; add the desktop app when you want “type into focused app” behavior for spreadsheets and LOB tools.',
        ],
      },
    ],
  },
]

export function getMarketingArticle(path: string): MarketingArticle | undefined {
  return marketingArticles.find((a) => a.path === path)
}
