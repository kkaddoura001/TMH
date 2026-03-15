import { useState, useEffect } from "react"
import { useGetFeaturedPoll, useListPolls, useListProfiles, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Link } from "wouter"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/polls", label: "Polls" },
  { href: "/profiles", label: "The Hustlers" },
  { href: "/rankings", label: "Power Rankings" },
  { href: "/weekly-pulse", label: "Weekly Pulse" },
  { href: "/about", label: "About" },
]

const SUBLINES = [
  (votes: number) => `${votes.toLocaleString()} votes cast this week`,
  () => "New debate every 24 hours",
  () => "The Middle East unfiltered",
]

export default function Home() {
  const { data: featuredPoll, isLoading: featuredLoading } = useGetFeaturedPoll()
  const { data: trendingPolls, isLoading: trendingLoading } = useListPolls({ filter: 'trending', limit: 3 })
  const { data: featuredProfiles, isLoading: profilesLoading } = useListProfiles({ filter: 'featured', limit: 4 })
  const { data: categories, isLoading: categoriesLoading } = useListCategories()

  const [sublineIdx, setSublineIdx] = useState(0)
  const [ctaEmail, setCtaEmail] = useState("")
  const [ctaJoined, setCtaJoined] = useState(() => !!localStorage.getItem("tmh_cta_joined"))

  useEffect(() => {
    const t = setInterval(() => setSublineIdx(i => (i + 1) % SUBLINES.length), 3000)
    return () => clearInterval(t)
  }, [])

  const totalVotes = featuredPoll?.totalVotes ?? 0
  const subline = SUBLINES[sublineIdx](totalVotes)

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaEmail.trim()) return
    localStorage.setItem("tmh_cta_joined", ctaEmail)
    setCtaJoined(true)
  }

  const tickerText = trendingPolls?.polls?.length
    ? trendingPolls.polls.map(p => `${p.question} — ${(p.totalVotes ?? 0).toLocaleString()} votes`).join("  ·  ") + "  ·  "
    : "New debate every 24 hours  ·  400 million people, one voice  ·  The Middle East unfiltered  ·  "

  return (
    <Layout>
      <style>{`
        @keyframes ticker { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        .ticker-animate { animation: ticker 28s linear infinite; }
      `}</style>

      {/* ── MASTHEAD ── */}
      <div className="bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top strip */}
          <div className="flex items-center justify-between py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
            <span>Est. 2024 — Opinion of Record</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {/* Masthead title */}
          <div className="border-t-2 border-b-2 border-foreground py-4 my-2 text-center">
            <h1 className="font-serif font-black text-4xl md:text-5xl uppercase tracking-tight text-foreground leading-none">
              The Middle East Hustle<span className="text-primary">.</span>
            </h1>
          </div>
          {/* Nav strip */}
          <nav className="flex items-center justify-center gap-6 py-2 text-[10px] uppercase tracking-widest">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground font-bold transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <div className="bg-foreground text-background h-9 flex items-center overflow-hidden">
        <span className="flex-shrink-0 bg-primary text-background px-3 h-full flex items-center font-bold text-[10px] uppercase tracking-widest">
          LIVE
        </span>
        <div className="flex-1 overflow-hidden relative">
          <span className="ticker-animate inline-block whitespace-nowrap text-[11px] uppercase tracking-widest font-medium text-background/80 pl-4">
            {tickerText.repeat(3)}
          </span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-background py-20 lg:py-32 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="h-1 w-16 bg-primary mb-6" />
            <h2 className="font-serif font-black uppercase text-6xl md:text-8xl lg:text-9xl leading-none tracking-tight text-foreground mb-8">
              400 Million People.<br />One Voice.
            </h2>
            <div className="text-xl md:text-2xl text-muted-foreground font-serif font-bold uppercase tracking-widest h-8 transition-all">
              {subline}
            </div>
          </div>

          {featuredLoading ? (
            <div className="h-96 bg-secondary animate-pulse border border-border" />
          ) : featuredPoll ? (
            <div className="w-full">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Today's Lead Debate
              </div>
              <PollCard poll={featuredPoll} featured />
            </div>
          ) : null}
        </div>
      </section>

      {/* ── THIS WEEK'S DEBATES ── */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              This Week's Debates
            </h2>
            <Link href="/polls" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-72 bg-secondary animate-pulse border border-border" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trendingPolls?.polls.map((poll, idx) => (
                <div
                  key={poll.id}
                  className={cn(
                    (trendingPolls.polls.length >= 3 && idx === 0) ? "md:col-span-2" : ""
                  )}
                >
                  <PollCard poll={poll} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link href="/polls" className="block text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border py-4">
              View All Debates
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE HUSTLERS ── */}
      <section className="bg-foreground text-background py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif font-black uppercase text-2xl text-background border-b-4 border-primary inline-block pb-2">
                The Hustlers
              </h2>
            </div>
            <Link href="/profiles" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-background/50 hover:text-background">
              Directory
            </Link>
          </div>

          {profilesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-48 bg-background/10 animate-pulse border border-background/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProfiles?.profiles.map(profile => (
                <div key={profile.id}>
                  <div className="dark">
                    <ProfileCard profile={profile} />
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-primary">
                    Their Network Is Voting
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── EXPLORE TOPICS ── */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              Explore Topics
            </h2>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-20 bg-secondary animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/polls?category=${cat.slug}`}
                  className="bg-secondary p-6 flex flex-col justify-between transition-colors hover:bg-foreground hover:text-background group border border-border"
                >
                  <span className="font-serif font-bold uppercase tracking-wider text-lg mb-4">{cat.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-background/50">
                    {cat.pollCount} Debates
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-foreground text-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="flex-1 md:basis-2/3">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3">Join 10,000+ Voices</p>
              <h2 className="font-serif font-black text-4xl md:text-5xl uppercase leading-none tracking-tight text-background mb-4">
                The Region's Opinion.<br />Unfiltered.
              </h2>
              <p className="text-background/60 font-sans text-base leading-relaxed max-w-xl">
                Get the weekly breakdown — where the Middle East actually stands, by country, sector, and seniority. Free during beta.
              </p>
            </div>
            <div className="w-full md:basis-1/3">
              {ctaJoined ? (
                <div className="border-2 border-primary p-8 text-center">
                  <p className="font-serif font-black text-3xl uppercase text-primary tracking-tight">You're In.</p>
                  <p className="text-[10px] uppercase tracking-widest text-background/50 mt-2">Watch your inbox.</p>
                </div>
              ) : (
                <form onSubmit={handleCtaSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={ctaEmail}
                    onChange={e => setCtaEmail(e.target.value)}
                    className="bg-background text-foreground border-none px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-background font-bold uppercase tracking-widest px-6 py-3 text-xs hover:bg-primary/90 transition-colors"
                  >
                    Join The Hustle
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
