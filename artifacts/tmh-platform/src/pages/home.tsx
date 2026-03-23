import { useState, useEffect } from "react"
import { useGetFeaturedPoll, useListPolls, useListProfiles, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Link } from "wouter"
import { cn } from "@/lib/utils"
import { ArrowRight, ChevronRight } from "lucide-react"
import { useVoter } from "@/hooks/use-voter"

const FLAG_MAP: Record<string, string> = {
  AE: "🇦🇪", SA: "🇸🇦", EG: "🇪🇬", JO: "🇯🇴", LB: "🇱🇧", KW: "🇰🇼",
  BH: "🇧🇭", QA: "🇶🇦", OM: "🇴🇲", MA: "🇲🇦", TN: "🇹🇳", IQ: "🇮🇶",
  PS: "🇵🇸", TR: "🇹🇷", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", IN: "🇮🇳", AU: "🇦🇺",
}

interface PlatformStats {
  livePolls: number
  totalVotes: number
  countries: number
  activeThisWeek: number
}

interface ActivityItem {
  countryCode: string | null
  countryName: string | null
  pollId: number
  questionSnippet: string
  secondsAgo: number
}

function formatSecondsAgo(s: number): string {
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function LiveActivity() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL ?? ""
    const fetchActivity = () => {
      fetch(`${baseUrl}/api/activity`)
        .then(r => r.json())
        .then(d => { if (d.activity?.length) setItems(d.activity) })
        .catch(() => {})
    }
    fetchActivity()
    const refresh = setInterval(fetchActivity, 30000)
    return () => clearInterval(refresh)
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => {
      setTick(t => t + 1)
      setActiveIdx(i => (i + 1) % Math.min(items.length, 5))
    }, 4000)
    return () => clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null

  const item = items[activeIdx]

  return (
    <section className="py-10 bg-secondary/20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
          <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground font-serif">
            Live Activity
          </p>
        </div>
        <div key={`${activeIdx}-${tick}`} className="animate-in fade-in duration-500">
          <Link href={`/polls/${item.pollId}`} className="group block">
            <p className="font-sans text-sm text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
              <span className="mr-2">{FLAG_MAP[item.countryCode ?? ""] ?? "🌍"}</span>
              <span className="text-muted-foreground">Someone from </span>
              <span className="font-bold text-foreground">{item.countryName ?? item.countryCode ?? "the region"}</span>
              <span className="text-muted-foreground"> just voted on </span>
              <span className="text-primary font-bold group-hover:underline">"{item.questionSnippet}"</span>
              <span className="text-muted-foreground text-[11px] ml-2">· {formatSecondsAgo(item.secondsAgo)}</span>
            </p>
          </Link>
        </div>
        {items.length > 1 && (
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: Math.min(items.length, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "h-0.5 transition-all duration-300",
                  i === activeIdx ? "w-6 bg-primary" : "w-3 bg-border hover:bg-foreground/40"
                )}
                aria-label={`Activity ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


const OPINION_BUBBLES = [
  { text: "I've been using AI to do my junior analyst's work for 6 months. They have no idea.", likes: "1.4k", pos: { left: "2%", top: "8%" }, rotate: "-2deg", duration: "7s", delay: "0s" },
  { text: "My entire department could be replaced tomorrow. Nobody is talking about it.", likes: "2.3k", pos: { left: "4%", top: "52%" }, rotate: "1.5deg", duration: "8.5s", delay: "1s" },
  { text: "I retrained twice in 10 years. I'll do it again.", likes: "876", pos: { left: "1%", top: "77%" }, rotate: "-1deg", duration: "6s", delay: "2s" },
  { text: "The jobs that survive will require things AI can't fake: relationships, trust, presence.", likes: "1.1k", pos: { right: "2%", top: "6%" }, rotate: "2deg", duration: "9s", delay: "0.5s" },
  { text: "We're not losing jobs. We're losing excuses.", likes: "654", pos: { right: "2%", top: "47%" }, rotate: "-2.5deg", duration: "7.5s", delay: "1.5s" },
  { text: "My company hired 0 people this year. AI did the work. Nobody said it out loud.", likes: "3.2k", pos: { right: "3%", top: "74%" }, rotate: "1deg", duration: "8s", delay: "3s" },
  { text: "The ones who aren't scared should be.", likes: "498", pos: { left: "22%", top: "2%" }, rotate: "0deg", duration: "10s", delay: "0.8s" },
  { text: "In 5 years the question won't be your job. It'll be your entire industry.", likes: "742", pos: { right: "21%", top: "2%" }, rotate: "0deg", duration: "7s", delay: "2.2s" },
]

const PREDICTIONS_DATA = [
  {
    id: 1,
    question: "Saudi Arabia Will Have a Fully Operating Cinema in Every Major City by End of 2026",
    category: "Culture & Policy",
    resolves: "December 2026",
    yesPercent: 71,
    noPercent: 29,
    count: "14,220",
  },
  {
    id: 2,
    question: "A MENA-Founded Startup Will Reach $10B Valuation in 2026",
    category: "Business",
    resolves: "December 2026",
    yesPercent: 44,
    noPercent: 56,
    count: "9,880",
  },
  {
    id: 3,
    question: "UAE Will Introduce Some Form of Personal Income Tax Within 3 Years",
    category: "Economy",
    resolves: "March 2029",
    yesPercent: 38,
    noPercent: 62,
    count: "18,440",
  },
  {
    id: 4,
    question: "Arabic Will Become a Mandatory Subject in All Dubai Private Schools Within 2 Years",
    category: "Education",
    resolves: "September 2027",
    yesPercent: 58,
    noPercent: 42,
    count: "7,610",
  },
]

const STATIC_QUESTIONS = [
  { category: "Society", question: "Should Transgender People Have Legal Recognition Across MENA?" },
  { category: "Identity", question: "Is Islam Holding the Arab World Back — or Is That Question Itself the Problem?" },
  { category: "Business", question: "Is Dubai's Success Real — or Just Very Good Marketing?" },
  { category: "Politics", question: "Should the Arab League Be Disbanded?" },
  { category: "Culture", question: "Is Arranged Marriage Still Relevant in 2026?" },
  { category: "Economy", question: "Is the Gulf's Wealth Distributed Fairly?" },
  { category: "Tech", question: "Should AI Tools Be Available in Arabic Before English in This Region?" },
  { category: "Society", question: "Are Expats in the Gulf Treated as Second-Class?" },
  { category: "Identity", question: "Is There Such a Thing as 'Arab Identity' Anymore?" },
  { category: "Future", question: "Will Any MENA Country Legalise Cannabis Within 10 Years?" },
]

const SENTIMENT_COUNTRIES = [
  { flag: "🇦🇪", name: "UAE", topAnswer: "Probably, but I'm adapting fast", pct: 61 },
  { flag: "🇸🇦", name: "Saudi Arabia", topAnswer: "Absolutely — I'm irreplaceable", pct: 54 },
  { flag: "🇪🇬", name: "Egypt", topAnswer: "Honestly? I'm not sure anymore", pct: 58 },
  { flag: "🇯🇴", name: "Jordan", topAnswer: "Probably not — and I'm doing nothing about it", pct: 43 },
  { flag: "🇱🇧", name: "Lebanon", topAnswer: "Honestly? I'm not sure anymore", pct: 67 },
  { flag: "🇧🇭", name: "Bahrain", topAnswer: "Probably, but I'm adapting fast", pct: 55 },
  { flag: "🇰🇼", name: "Kuwait", topAnswer: "Absolutely — I'm irreplaceable", pct: 62 },
  { flag: "🇶🇦", name: "Qatar", topAnswer: "Absolutely — I'm irreplaceable", pct: 59 },
  { flag: "🇮🇶", name: "Iraq", topAnswer: "Honestly? I'm not sure anymore", pct: 71 },
  { flag: "🇴🇲", name: "Oman", topAnswer: "Probably, but I'm adapting fast", pct: 48 },
]

export default function Home() {
  const { data: featuredPoll, isLoading: featuredLoading } = useGetFeaturedPoll()
  const { data: trendingPolls, isLoading: trendingLoading } = useListPolls({ filter: "trending", limit: 4 })
  const { data: featuredProfiles, isLoading: profilesLoading } = useListProfiles({ filter: "featured", limit: 8 })
  const { data: categories } = useListCategories()
  const { profile, totalVotesAllTime } = useVoter()

  const [ctaEmail, setCtaEmail] = useState("")
  const [ctaJoined, setCtaJoined] = useState(() => !!localStorage.getItem("tmh_cta_joined"))
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL ?? ""
    fetch(`${baseUrl}/api/stats`)
      .then(r => r.json())
      .then(d => setPlatformStats(d))
      .catch(() => {})
  }, [])

  const totalVotes = platformStats?.totalVotes ?? featuredPoll?.totalVotes ?? 0

  const heroSubhead = (() => {
    if (totalVotesAllTime > 0 && profile) {
      return `You've cast ${totalVotesAllTime} vote${totalVotesAllTime !== 1 ? "s" : ""} across the region.`
    }
    return totalVotes > 0
      ? `${totalVotes.toLocaleString()} votes cast — and the region is divided.`
      : "The digital town square the Middle East has never had."
  })()

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaEmail.trim()) return
    localStorage.setItem("tmh_cta_joined", ctaEmail)
    setCtaJoined(true)
  }

  const tickerPolls = trendingPolls?.polls ?? []
  const tickerText = tickerPolls.length
    ? tickerPolls.map(p => `${p.question} — ${(p.totalVotes ?? 0).toLocaleString()} votes`).join("  ·  ") + "  ·  "
    : "New debate every 24 hours  ·  400 million people, one voice  ·  The Middle East unfiltered  ·  "

  const issueDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <Layout>
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-animate { animation: ticker 40s linear infinite; white-space: nowrap; }
        .ticker-animate:hover { animation-play-state: paused; }
        @keyframes fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .section-fadein { animation: fadein 0.5s ease forwards; }
      `}</style>

      {/* ── MASTHEAD ── */}
      <div className="bg-background" style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(220,20,60,0.07) 0%, transparent 65%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border font-serif">
            <span>EST. 2026 · DUBAI · ISSUE NO. 001</span>
            <span className="hidden sm:block">{issueDate}</span>
            <span className="text-primary font-bold">Opinion of Record</span>
          </div>

          <div className="py-5 my-3 text-center" style={{ borderTop: "2px solid #DC143C", borderBottom: "2px solid #DC143C" }}>
            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-foreground leading-none" style={{ lineHeight: 0.95 }}>
              The Middle East Hustle<span style={{ color: "#DC143C" }}>.</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-serif mt-2">
              The voice of 400 million.
            </p>
          </div>

          <nav className="flex items-center justify-center gap-6 py-2 text-[10px] uppercase tracking-widest font-serif">
            {[
              { href: "/polls", label: "Debates" },
              { href: "/#predictions", label: "Predictions" },
              { href: "/profiles", label: "The Voices" },
              { href: "/#sentiment-map", label: "Sentiment Map" },
              { href: "/about", label: "About" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground font-bold transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <div className="h-9 flex items-center overflow-hidden" style={{ background: "#DC143C" }}>
        <span className="flex-shrink-0 bg-white px-3 py-0.5 mx-2 rounded-[20px] font-bold text-[11px] uppercase tracking-[0.07em] font-serif z-10" style={{ color: "#DC143C", fontWeight: 900 }}>
          LIVE
        </span>
        <div className="flex-1 overflow-hidden">
          <span className="ticker-animate inline-block text-[11px] uppercase tracking-[0.07em] font-bold text-white/90 font-serif px-2">
            {(tickerText + tickerText)}
          </span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-background border-b border-border section-fadein relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="mb-10">
            <div className="h-1 w-16 bg-primary mb-6" />
            <h2 className="font-display font-black uppercase text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight text-foreground mb-6">
              400 Million People.<br />One Question.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-sans">
              {heroSubhead}
            </p>
          </div>
        </div>

        {/* Opinion Bubbles + Featured Poll */}
        <div className="relative pb-20">
          {/* Floating opinion bubbles — desktop only */}
          {OPINION_BUBBLES.map((b, i) => (
            <div
              key={i}
              className="hidden md:block absolute z-20 pointer-events-none"
              style={{ ...b.pos, "--r": b.rotate, "--d": b.duration, "--dl": b.delay } as React.CSSProperties}
            >
              <div className="tmh-bubble pointer-events-auto">
                <p>{b.text}</p>
                <div className="tmh-reaction">
                  <span className="tmh-reaction-heart">♥</span>
                  <span className="tmh-reaction-count">{b.likes}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {featuredLoading ? (
              <div className="h-96 bg-secondary animate-pulse border border-border" />
            ) : featuredPoll ? (
              <div className="w-full">
                <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-4 flex items-center gap-2 font-serif">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  Today's Lead Debate
                </div>
                <PollCard poll={featuredPoll} featured />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── QUESTION STRIP ── */}
      <section className="py-12 bg-secondary/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-serif font-black uppercase text-[11px] tracking-[0.3em] text-primary mb-1">
                The Questions Everyone's Avoiding
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-serif">
                Vote on any of them. Share the ones that make people uncomfortable.
              </p>
            </div>
            <Link href="/polls" className="hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground font-serif">
              All Debates <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {STATIC_QUESTIONS.map((q, i) => (
              <Link key={i} href="/polls">
                <div className="flex-shrink-0 w-72 bg-card border border-border p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:border-primary transition-all duration-200 cursor-pointer">
                  <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-primary font-serif">{q.category}</span>
                  <p className="font-serif font-black uppercase text-sm leading-tight text-foreground line-clamp-4">
                    {q.question}
                  </p>
                  <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-serif">Weigh in →</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── THIS WEEK'S DEBATES ── */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              This Week's Debates
            </h2>
            <Link href="/polls" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-serif">
              View All
            </Link>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-72 bg-secondary animate-pulse border border-border" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trendingPolls?.polls.slice(0, 4).map((poll, idx) => (
                <div key={poll.id} className={cn(idx === 0 && trendingPolls.polls.length >= 3 ? "md:col-span-2" : "")}>
                  <PollCard poll={poll} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link href="/polls" className="block text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border py-4 font-serif">
              View All Debates
            </Link>
          </div>
        </div>
      </section>

      {/* ── PREDICTIONS ── */}
      <section id="predictions" className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-l-4 border-primary pl-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-1 font-serif">Predictions</p>
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              What Do You Think Actually Happens?
            </h2>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1 font-serif">
              Not what should happen. What will.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[900px]">
            {PREDICTIONS_DATA.map(pred => (
              <div
                key={pred.id}
                className="bg-card border border-border p-6 rounded-[10px] flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
                style={{ borderWidth: "1.5px" }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-foreground text-background text-[9px] font-bold uppercase tracking-[0.2em] font-serif">
                    {pred.category}
                  </span>
                  <span
                    className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] font-serif rounded-sm"
                    style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#F59E0B" }}
                  >
                    Resolves: {pred.resolves}
                  </span>
                </div>
                <p className="font-serif font-black uppercase text-sm leading-tight text-foreground tracking-tight" style={{ lineHeight: 1.2 }}>
                  {pred.question}
                </p>
                <p className="text-[10px] text-muted-foreground font-serif">{pred.count} predictions locked in</p>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-bold font-serif text-foreground mb-1">
                        Yes {pred.yesPercent}%
                      </p>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pred.yesPercent}%`, background: "#DC143C" }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-bold font-serif text-foreground mb-1">
                        No {pred.noPercent}%
                      </p>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pred.noPercent}%`, background: "rgba(255,255,255,0.2)" }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <button className="flex-1 py-2.5 border font-bold text-[11px] uppercase tracking-[0.12em] font-serif transition-all duration-150 hover:bg-primary hover:text-white hover:border-primary" style={{ borderColor: "#DC143C", color: "#DC143C" }}>
                    Yes
                  </button>
                  <button className="flex-1 py-2.5 border border-border text-foreground/60 font-bold text-[11px] uppercase tracking-[0.12em] font-serif transition-all duration-150 hover:bg-secondary hover:text-foreground">
                    No
                  </button>
                </div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest font-serif group-hover:underline">
                  Lock In Your Prediction →
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE VOICES ── */}
      <section className="bg-foreground text-background py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight text-background leading-none">
                The Voices
              </h2>
              <div className="h-1 w-full bg-primary mt-3" />
            </div>
            <Link href="/profiles" className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-background/50 hover:text-background font-serif">
              View All →
            </Link>
          </div>
          <p className="text-background/60 font-sans text-base mt-4 mb-10 max-w-xl">
            The founders, operators, and change-makers shaping the Middle East. Real people. Real stories.
          </p>

          {profilesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-background/10 animate-pulse border border-background/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProfiles?.profiles.slice(0, 8).map(profile => (
                <div key={profile.id} className="dark">
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link href="/profiles" className="inline-flex items-center gap-2 bg-primary text-white font-bold uppercase tracking-widest text-xs px-8 py-3 hover:bg-primary/90 transition-colors font-serif">
              View All Voices <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SENTIMENT MAP ── */}
      <SentimentMap />

      {/* ── EXPLORE TOPICS ── */}
      {categories?.categories && categories.categories.length > 0 && (
        <section className="py-20 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 border-l-4 border-primary pl-4">
              <h2 className="font-serif font-black uppercase text-2xl text-foreground">
                Explore Topics
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/polls?category=${cat.slug}`}
                  className="bg-secondary p-5 flex flex-col justify-between transition-all hover:bg-foreground hover:text-background group border border-border hover:-translate-y-0.5 hover:shadow-md duration-300"
                >
                  <span className="font-serif font-bold uppercase tracking-wider text-base mb-3 leading-tight">{cat.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-background/50">
                    {cat.pollCount} Debates
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LIVE ACTIVITY ── */}
      <LiveActivity />

      {/* ── NEWSLETTER CTA ── */}
      <section className="bg-foreground text-background py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="flex-1 md:basis-2/3">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3 font-serif">Join 10,000+ Voices</p>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-none tracking-tight text-background mb-4">
                The Region's Opinion.<br />Unfiltered.
              </h2>
              <p className="text-background/60 font-sans text-base leading-relaxed max-w-xl">
                Every Tuesday: one question, one country breakdown, one voice. The pulse of 400 million people — straight to your inbox.
              </p>
            </div>
            <div className="w-full md:basis-1/3">
              {ctaJoined ? (
                <div className="border-2 border-primary p-8 text-center">
                  <p className="font-display font-black text-3xl uppercase text-primary tracking-tight">You're In.</p>
                  <p className="text-[10px] uppercase tracking-widest text-background/50 mt-2 font-serif">Watch your inbox Tuesday.</p>
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
                    className="bg-primary text-white font-bold uppercase tracking-widest px-6 py-3 text-xs hover:bg-primary/90 transition-colors font-serif"
                  >
                    Join The Hustle
                  </button>
                  <p className="text-[9px] text-background/40 font-sans">No spam. Unsubscribe anytime.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

function SentimentMap() {
  return (
    <section id="sentiment-map" className="py-16 bg-secondary/20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="border-l-4 border-primary pl-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-1 font-serif">Split by Country</p>
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              Same Question. Very Different Answers.
            </h2>
          </div>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {SENTIMENT_COUNTRIES.map(c => (
            <div
              key={c.name}
              className="p-4 rounded-lg border border-border hover:border-border/60 transition-colors flex flex-col gap-2"
              style={{ background: "var(--bg2, hsl(var(--card)))" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "2rem" }}>{c.flag}</span>
                <span className="font-bold uppercase tracking-wider text-sm text-foreground font-serif">{c.name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans leading-snug">
                {c.pct}% say: "{c.topAnswer}"
              </p>
              <div className="h-[3px] w-full rounded overflow-hidden bg-border">
                <div className="h-full rounded transition-all" style={{ width: `${c.pct}%`, background: "#DC143C" }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[12px] text-muted-foreground font-sans italic text-center">
          The region agrees on the question. It rarely agrees on the answer.
        </p>
      </div>
    </section>
  )
}

