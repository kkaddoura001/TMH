import { Link, useLocation } from "wouter"
import { Menu, X, Moon, Sun, Flame } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/use-theme"
import { useVoter } from "@/hooks/use-voter"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [location] = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const { totalVotesAllTime, currentStreak, profile } = useVoter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Debates", href: "/polls" },
    { label: "Predictions", href: "/predictions" },
    { label: "The Voices", href: "/profiles" },
    { label: "Sentiment Map", href: "/#sentiment-map" },
    { label: "About", href: "/about" },
  ]

  const categoryCount = profile ? Object.keys(profile.categories).length : 0

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
              <span className="font-display font-black text-3xl uppercase tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
                TMH
              </span>
              <span className="text-[9px] font-serif tracking-[0.3em] uppercase text-muted-foreground leading-none mt-0.5">
                The Middle East Hustle
              </span>
            </Link>

            {totalVotesAllTime > 0 && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                  className="flex items-center gap-1 px-2 py-1 border border-border bg-secondary/50 hover:bg-secondary transition-colors"
                  aria-label={`You've cast ${totalVotesAllTime} votes`}
                >
                  {currentStreak >= 2 ? (
                    <Flame className="w-3 h-3 text-primary flex-shrink-0" />
                  ) : null}
                  <span className="text-[10px] font-bold font-serif text-foreground tabular-nums">
                    {totalVotesAllTime}
                  </span>
                </button>
                {showTooltip && (
                  <div className="absolute left-0 top-full mt-2 z-50 bg-foreground text-background px-3 py-2 text-[10px] font-sans whitespace-nowrap shadow-lg min-w-max">
                    <p className="font-bold">
                      {totalVotesAllTime} vote{totalVotesAllTime !== 1 ? "s" : ""} across{" "}
                      {categoryCount > 0 ? `${categoryCount} topic${categoryCount !== 1 ? "s" : ""}` : "TMH"}
                    </p>
                    {currentStreak >= 2 && (
                      <p className="text-primary font-bold mt-0.5">{currentStreak}-day streak 🔥</p>
                    )}
                  </div>
                )}
              </div>
            )}
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
