import { Link } from "wouter"

const NAV = [
  { label: "About", href: "/about" },
  { label: "Pulse", href: "/mena-pulse" },
  { label: "Debates", href: "/polls" },
  { label: "Predictions", href: "/predictions" },
  { label: "Voices", href: "/profiles" },
  { label: "Join The Voices", href: "/apply" },
]

const SOCIALS = [
  { label: "X", href: "https://x.com/tmhustle" },
  { label: "LinkedIn", href: "https://linkedin.com/company/the-middle-east-hustle" },
  { label: "Instagram", href: "https://instagram.com/tmhustle" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8 border-t-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12 pb-12 border-b border-background/10">
          <div className="flex-1">
            <Link href="/">
              <span className="font-display font-black text-3xl uppercase tracking-tight text-background leading-none block hover:text-primary transition-colors">
                The Tribunal<span className="text-primary">.</span>
              </span>
              <span className="text-[9px] font-serif tracking-[0.2em] uppercase text-background/40 mt-1 block">
                by The Middle East Hustle
              </span>
            </Link>
            <p className="text-background/50 font-sans text-sm mt-4 max-w-xs leading-relaxed">
              The voice of 541 million. Real people. Real hustle. Real change.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-widest font-bold text-background/40 hover:text-background transition-colors font-serif"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-3">
              {NAV.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] uppercase tracking-[0.15em] font-bold text-background/60 hover:text-background transition-colors font-serif"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="max-w-xs">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-background/30 mb-4 font-serif">Stay Informed</h4>
            <p className="text-sm text-background/50 font-sans leading-relaxed mb-4">
              The questions no one else asks. The data no one else collects. Straight to your inbox.
            </p>
            <Link
              href="/about"
              className="inline-block bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 hover:bg-primary/90 transition-colors font-serif"
            >
              Learn More →
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-widest text-background/30 font-serif">
            © {new Date().getFullYear()} The Tribunal, by The Middle East Hustle. Founded by Kareem Kaddoura.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/faq" className="text-[11px] uppercase tracking-[0.15em] font-bold text-background/50 hover:text-background transition-colors font-serif">FAQ</Link>
            <Link href="/terms" className="text-[11px] uppercase tracking-[0.15em] font-bold text-background/50 hover:text-background transition-colors font-serif">Terms</Link>
            <a href="mailto:hello@themiddleeasthustle.com" className="text-[11px] uppercase tracking-[0.15em] font-bold text-background/50 hover:text-background transition-colors font-serif">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
