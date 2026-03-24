import { Link, useLocation } from "wouter"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [location] = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Pulse", href: "/mena-pulse" },
    { label: "Debates", href: "/polls" },
    { label: "Predictions", href: "/predictions" },
    { label: "Voices", href: "/profiles" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-border shadow-sm"
          : "bg-background border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col leading-none group">
              <span className="font-display font-black text-2xl uppercase tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
                The Tribunal<span className="text-primary">.</span>
              </span>
              <span className="text-[8px] font-serif tracking-[0.2em] uppercase text-muted-foreground leading-none mt-0.5">
                by The Middle East Hustle
              </span>
            </Link>

          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.2em] font-bold transition-all font-serif",
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/apply"
              className="hidden sm:flex items-center gap-2 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 hover:bg-primary/90 transition-colors font-serif"
            >
              Join The Voices
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-xl z-50">
          <div className="px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "py-3 border-b border-border font-serif font-bold uppercase tracking-wider text-base transition-colors",
                  location === link.href ? "text-primary" : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              <Link
                href="/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-primary text-white font-bold uppercase tracking-[0.2em] text-sm py-3 font-serif hover:bg-primary/90 transition-colors"
              >
                Join The Voices
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
