import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Download, Laptop, Smartphone, Zap } from 'lucide-react'
import {
  Button,
  SiteFooter,
  SiteHeader,
} from '@scan-it/features'
import {
  allDesktopDownloadRows,
  detectClientDesktopKind,
  getPrimaryDesktopDownloadHref,
  primaryDesktopDownloadLabel,
  resolveDesktopDownloadUrls,
} from '@scan-it/lib'

export function LandingPage() {
  const desktopKind = detectClientDesktopKind()
  const desktopUrls = resolveDesktopDownloadUrls(import.meta.env)
  const desktopPrimaryHref = getPrimaryDesktopDownloadHref(
    desktopUrls,
    desktopKind,
  )
  const desktopPrimaryLabel = primaryDesktopDownloadLabel(desktopKind)
  const desktopAllRows = allDesktopDownloadRows(desktopUrls)

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary/30">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                Zero setup required
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
              >
                Turn your phone into a <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">wireless barcode scanner</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              >
                No expensive hardware to buy. No clunky drivers to install. 
                Just open the web app, scan a QR code, and start scanning barcodes directly to your computer instantly.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Button asChild size="lg" className="h-14 px-8 text-base shadow-glow-sm">
                  <Link to="/start">
                    Start Scanning Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <div className="flex w-full max-w-md flex-col items-center gap-2 sm:w-auto">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 w-full px-8 text-base border-primary/20 hover:bg-primary/10 sm:w-auto"
                  >
                    <a
                      href={desktopPrimaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-5 w-5" /> {desktopPrimaryLabel}
                    </a>
                  </Button>
                  <details className="w-full text-left text-sm text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      All downloads
                    </summary>
                    <ul className="mt-2 space-y-1.5 list-none pl-0">
                      {desktopAllRows.map((row) => (
                        <li key={row.href}>
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {row.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </motion.div>
            </div>

            {/* Hero Images Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-20 relative mx-auto max-w-5xl"
            >
              <div className="relative rounded-xl border border-border bg-card/50 p-2 shadow-2xl backdrop-blur-sm lg:p-4">
                <img 
                  src="/images/web-log.png" 
                  alt="Scan It Web Interface" 
                  className="rounded-lg border border-border/50 shadow-sm w-full"
                />
                
                {/* Phone Mockup Overlay */}
                <div className="absolute -bottom-10 -right-4 w-48 sm:w-64 lg:-right-12 lg:-bottom-16 lg:w-[280px] z-10" style={{ perspective: '1200px' }}>
                  {/* Subtle Glow effect behind the phone */}
                  <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full" />
                  
                  {/* Phone Body with True 3D Extrusion */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 6, rotateY: -12, rotateZ: 3 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative mx-auto w-full aspect-[9/19.5]"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* 3D Drop Shadow */}
                    <div 
                      className="absolute inset-0 rounded-[2.5rem] bg-black/50 blur-xl"
                      style={{ transform: 'translateZ(-20px) translateX(-10px) translateY(10px)' }}
                    />

                    {/* 3D Extrusion Layers (The metallic frame of the phone) */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`absolute inset-0 rounded-[2.5rem] ${
                          i === 7 ? 'bg-zinc-700' : 'bg-zinc-800'
                        } border border-zinc-700/50`}
                        style={{ transform: `translateZ(-${i}px)` }}
                      />
                    ))}

                    {/* Hardware buttons attached to the middle of the frame */}
                    <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none" style={{ transform: 'translateZ(-4px)', transformStyle: 'preserve-3d' }}>
                      <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l-md bg-zinc-600" />
                      <div className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-md bg-zinc-600" />
                      <div className="absolute -right-[3px] top-28 h-14 w-[3px] rounded-r-md bg-zinc-600" />
                    </div>
                    
                    {/* Front Face (Glass Bezel & Screen) */}
                    <div 
                      className="absolute inset-0 rounded-[2.5rem] border-[6px] border-black bg-black overflow-hidden"
                      style={{ transform: 'translateZ(1px)' }}
                    >
                      {/* Notch / Dynamic Island */}
                      <div className="absolute top-1 inset-x-0 h-6 bg-black rounded-full mx-auto w-[35%] z-20 flex justify-center items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 mr-2" />
                        <div className="h-1.5 w-8 rounded-full bg-zinc-800" />
                      </div>
                      
                      {/* Screen */}
                      <div className="relative h-full w-full rounded-[2rem] overflow-hidden bg-zinc-950 ring-1 ring-white/10">
                        <img 
                          src="/images/phone-scanner.png" 
                          alt="Phone Scanner Interface" 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Realistic Screen Glare */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none" />
                        <div className="absolute -left-[50%] top-0 h-[200%] w-[50%] -rotate-45 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-4 text-lg text-muted-foreground">Get started in seconds, literally.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Laptop className="h-8 w-8 text-primary" />,
                  title: "1. Open the web app",
                  description: "Click 'Start Scanning Now' on your computer. No accounts or sign-ups required."
                },
                {
                  icon: <Smartphone className="h-8 w-8 text-primary" />,
                  title: "2. Scan the QR code",
                  description: "Use your phone's camera to scan the pairing QR code shown on your screen."
                },
                {
                  icon: <Zap className="h-8 w-8 text-primary" />,
                  title: "3. Start scanning",
                  description: "Point your phone at any barcode. It instantly appears on your computer."
                }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50 shadow-sm"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {step.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Desktop App Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Perfect for small businesses
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Whether you're managing an Etsy shop, doing inventory for a retail store, or scanning tickets at an event, Scan It gives you enterprise-grade scanning without the enterprise price tag.
                </p>
                
                <ul className="space-y-5 mb-8">
                  {[
                    "Zero hardware costs - use the phone you already have",
                    "Lightning fast real-time sync",
                    "Copy scans to clipboard automatically",
                    "No apps to install on your phone"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="mr-3 h-6 w-6 text-primary flex-shrink-0" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-primary/20 bg-card p-8 sm:p-10 shadow-glow-sm relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
                  <Download className="h-64 w-64" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Power User? Get the Desktop App</h3>
                <p className="text-muted-foreground mb-8">
                  While the web app is great for copying and pasting, the desktop app
                  for Windows and Mac takes it to the next level.
                </p>
                <div className="space-y-6 mb-8">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Type into any application</h4>
                      <p className="text-muted-foreground mt-1">The desktop app simulates keystrokes, typing barcodes directly into Excel, ERPs, or any focused window.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Background scanning</h4>
                      <p className="text-muted-foreground mt-1">Keep scanning even when the app is minimized or hidden behind other windows.</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild className="h-12 w-full text-base">
                    <a
                      href={desktopPrimaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {desktopPrimaryLabel}
                    </a>
                  </Button>
                  <details className="text-sm text-muted-foreground">
                    <summary className="cursor-pointer font-medium text-foreground">
                      All downloads
                    </summary>
                    <ul className="mt-2 space-y-1.5 list-none pl-0">
                      {desktopAllRows.map((row) => (
                        <li key={row.href}>
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {row.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SEO / guides */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Guides
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
              Short pages for common searches and workflows.
            </p>
            <ul className="mx-auto mt-8 grid max-w-3xl gap-3 text-sm sm:grid-cols-2">
              <li>
                <Link
                  to="/wireless-barcode-scanner"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Wireless barcode scanner for PC
                </Link>
              </li>
              <li>
                <Link
                  to="/barcode-scanner-for-excel"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Barcode scanner for Excel
                </Link>
              </li>
              <li>
                <Link
                  to="/inventory-barcode-scanner"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Inventory barcode scanner
                </Link>
              </li>
              <li>
                <Link
                  to="/compare/phone-barcode-scanner-vs-barcode-to-pc"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Compare with other phone-to-PC tools
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden border-t border-border/50">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="container relative mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Ready to ditch the clunky hardware?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join thousands of small businesses saving time and money with Scan It.
              </p>
              <Button asChild size="lg" className="h-14 px-10 text-lg shadow-glow-sm">
                <Link to="/start">
                  Start Scanning For Free
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <SiteFooter
        termsLink={
          <Link
            to="/terms"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            Terms of Service
          </Link>
        }
        privacyLink={
          <Link
            to="/privacy"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            Privacy
          </Link>
        }
        aboutLink={
          <Link
            to="/about"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            About
          </Link>
        }
      />
    </div>
  )
}
