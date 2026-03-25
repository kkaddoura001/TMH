import { useState, useEffect, useRef, useCallback } from "react"
import { useGetFeaturedPoll, useListPolls, useListProfiles, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Link } from "wouter"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"

import { LiveNumber } from "@/components/live-counter/FlipDigit"
import { PREDICTIONS, type PredictionCard } from "@/data/predictions-data"

const MENA_POP_BASE = 525_000_000
const MENA_POP_BASE_DATE = new Date("2026-01-01T00:00:00Z").getTime()
const MENA_GROWTH_RATE = 0.0156
const MENA_POP_PER_MS = (MENA_POP_BASE * MENA_GROWTH_RATE) / (365.25 * 24 * 60 * 60 * 1000)

function usePopulationCounter() {
  const calcPop = useCallback(() => {
    const elapsed = Date.now() - MENA_POP_BASE_DATE
    return Math.floor(MENA_POP_BASE + elapsed * MENA_POP_PER_MS)
  }, [])
  const [pop, setPop] = useState(calcPop)
  useEffect(() => {
    const id = setInterval(() => setPop(calcPop()), 1000)
    return () => clearInterval(id)
  }, [calcPop])
  return pop
}

const FLAG_MAP: Record<string, string> = {
  AE: "🇦🇪", SA: "🇸🇦", EG: "🇪🇬", JO: "🇯🇴", LB: "🇱🇧", KW: "🇰🇼",
  BH: "🇧🇭", QA: "🇶🇦", OM: "🇴🇲", MA: "🇲🇦", TN: "🇹🇳", IQ: "🇮🇶",
  PS: "🇵🇸", TR: "🇹🇷", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", IN: "🇮🇳", AU: "🇦🇺",
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
  const { t } = useI18n()

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
            {t("Live Activity")}
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




export default function Home() {
  const { data: featuredPoll, isLoading: featuredLoading } = useGetFeaturedPoll()
  const { data: trendingPolls, isLoading: trendingLoading } = useListPolls({ filter: "trending", limit: 5 })
  const { data: featuredProfiles, isLoading: profilesLoading } = useListProfiles({ filter: "featured", limit: 8 })
  const { data: categories } = useListCategories()
  const [ctaEmail, setCtaEmail] = useState("")
  const [ctaJoined, setCtaJoined] = useState(() => !!localStorage.getItem("tmh_cta_joined"))
  const menaPop = usePopulationCounter()
  const { t, isAr } = useI18n()

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaEmail.trim()) return
    localStorage.setItem("tmh_cta_joined", ctaEmail)
    setCtaJoined(true)
  }

  const tickerPolls = trendingPolls?.polls ?? []
  const debateItems = tickerPolls.slice(0, 8).map(p => ({
    topic: p.question?.length > 38 ? p.question.substring(0, 36) + "…" : p.question ?? "Debate",
    badge: "DEBATE" as const,
    stat: `${(p.totalVotes ?? 0).toLocaleString()} votes`,
  }))
  const predictionItems = [
    { topic: "NEOM's Line will have residents by 2030?", badge: "PREDICTION" as const, stat: "36% yes" },
    { topic: "Saudi non-oil GDP to exceed 50%?", badge: "PREDICTION" as const, stat: "62% yes" },
    { topic: "UAE income tax within 3 years?", badge: "PREDICTION" as const, stat: "38% yes" },
    { topic: "$10B MENA startup in 2026?", badge: "PREDICTION" as const, stat: "44% yes" },
    { topic: "Arabic mandatory in Dubai schools?", badge: "PREDICTION" as const, stat: "58% yes" },
    { topic: "Riyadh Metro fully operational?", badge: "PREDICTION" as const, stat: "64% yes" },
    { topic: "Saudi 2034 World Cup confirmed?", badge: "PREDICTION" as const, stat: "91% yes" },
    { topic: "Oil above $85 all of 2026?", badge: "PREDICTION" as const, stat: "52% yes" },
  ]
  const pulseItems = [
    { topic: "Youth unemployment across MENA", badge: "PULSE" as const, stat: "↑ 23%" },
    { topic: "Fintech adoption in GCC", badge: "PULSE" as const, stat: "↑ 340%" },
    { topic: "Renewable energy investment", badge: "PULSE" as const, stat: "$15.2B" },
    { topic: "Golden visa applications surge", badge: "PULSE" as const, stat: "↑ 67%" },
    { topic: "Arabic content digital deficit", badge: "PULSE" as const, stat: "4% of web" },
    { topic: "MENA cinema box office boom", badge: "PULSE" as const, stat: "↑ 54%" },
    { topic: "Diabetes crisis in the Gulf", badge: "PULSE" as const, stat: "↑ 17%" },
    { topic: "GCC military spending", badge: "PULSE" as const, stat: "$105B" },
  ]
  const maxLen = Math.max(debateItems.length, predictionItems.length, pulseItems.length)
  const interleaved: typeof debateItems = []
  for (let i = 0; i < maxLen; i++) {
    if (debateItems[i]) interleaved.push(debateItems[i])
    if (predictionItems[i]) interleaved.push(predictionItems[i])
    if (pulseItems[i]) interleaved.push(pulseItems[i])
  }
  const tickerDoubled = [...interleaved, ...interleaved]

  const issueDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <Layout>
      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .section-fadein { animation: fadein 0.5s ease forwards; }
        @keyframes bubble-float-1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes bubble-float-2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes bubble-float-3 { 0%,100% { transform: translateY(-4px); } 50% { transform: translateY(6px); } }
        .bubble-float-1 { animation: bubble-float-1 5s ease-in-out infinite; }
        .bubble-float-2 { animation: bubble-float-2 7s ease-in-out infinite; }
        .bubble-float-3 { animation: bubble-float-3 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bubble-float-1, .bubble-float-2, .bubble-float-3 { animation: none; }
        }
        @keyframes digit-flip-in {
          0% { transform: translateY(-100%); opacity: 0; }
          60% { transform: translateY(5%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* ── MASTHEAD ── */}
      <div className="bg-background" style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(220,20,60,0.07) 0%, transparent 65%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border font-serif">
            <span>{t("EST. 2026 · ISSUE NO. 001")}</span>
            <span className="hidden sm:block">{issueDate}</span>
            <span className="text-primary font-bold">{t("Opinion of Record")}</span>
          </div>

          <div className="py-5 my-3 text-center" style={{ borderTop: "2px solid #DC143C", borderBottom: "2px solid #DC143C" }}>
            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-foreground leading-none" style={{ lineHeight: 0.95 }}>
              The Tribunal<span className="text-primary">.</span>
            </h1>
            <p className="text-[10px] font-serif tracking-[0.25em] uppercase text-muted-foreground mt-1">{t("by The Middle East Hustle")}</p>
            <p className="uppercase tracking-[0.22em] text-muted-foreground font-serif mt-3 flex flex-col items-center gap-1">
              <span className="text-[10px]">{t("The voice of")}</span>
              <LiveNumber
                value={menaPop}
                className="font-display font-black tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#DC143C", letterSpacing: "-0.02em" }}
              />
            </p>
          </div>

        </div>
      </div>

      {/* ── MIXED TICKER ── */}
      <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div className="tmh-ticker-scroll">
          {tickerDoubled.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.7rem 2rem",
                borderRight: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.55rem",
                textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap",
                padding: "2px 6px",
                background: item.badge === "DEBATE" ? "rgba(220,20,60,0.15)" : item.badge === "PREDICTION" ? "rgba(59,130,246,0.15)" : "rgba(34,197,94,0.15)",
                color: item.badge === "DEBATE" ? "#DC143C" : item.badge === "PREDICTION" ? "#3B82F6" : "#22C55E",
                border: `1px solid ${item.badge === "DEBATE" ? "rgba(220,20,60,0.25)" : item.badge === "PREDICTION" ? "rgba(59,130,246,0.25)" : "rgba(34,197,94,0.25)"}`,
              }}>
                {item.badge}
              </span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(250,250,250,0.5)", whiteSpace: "nowrap" }}>
                {item.topic}
              </span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#fff", whiteSpace: "nowrap" }}>
                {item.stat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION HOOKS ── */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 gap-0 divide-x divide-border">
            {[
              { href: "/polls", label: t("Debates"), desc: "Vote on the questions shaping MENA", count: "422", accent: "#DC143C" },
              { href: "/predictions", label: t("Predictions"), desc: "Bet on what actually happens next", count: "230", accent: "#3B82F6" },
              { href: "/mena-pulse", label: t("The Pulse"), desc: "Real trends backed by real data", count: "78", accent: "#10B981" },
            ].map(item => (
              <Link key={item.href} href={item.href} className="group flex flex-col items-center justify-center gap-1 py-3 px-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span style={{ width: 3, height: 20, background: item.accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--foreground)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.85rem", color: item.accent }}>
                    {item.count}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                </div>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.6rem", color: "var(--muted-foreground)", letterSpacing: "0.02em" }}>
                  {item.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRONT PAGE: Lead Debate + Sidebar ── */}
      <section className="py-8 bg-background border-b border-border section-fadein relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">

            {/* LEFT: Today's Lead Debate */}
            <div className="lg:pr-8 lg:border-r lg:border-border pb-8 lg:pb-0">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-5 flex items-center gap-2 font-serif">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                {t("TODAY'S LEAD DEBATE")}
              </div>
              {featuredLoading ? (
                <div className="h-96 bg-secondary animate-pulse border border-border" />
              ) : featuredPoll ? (
                <PollCard poll={featuredPoll} featured />
              ) : null}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="lg:pl-8 pt-8 lg:pt-0 border-t lg:border-t-0 border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground font-serif">
                  {t("Latest Debates")}
                </p>
                <Link href="/polls" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-serif transition-colors">
                  {t("View All")}
                </Link>
              </div>

              {trendingLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 bg-secondary animate-pulse" />)}
                </div>
              ) : (
                <div>
                  {trendingPolls?.polls.slice(0, 5).map((poll) => (
                    <Link key={poll.id} href={`/polls/${poll.id}`}>
                      <div className="py-3 border-b border-border group cursor-pointer">
                        <p className="text-[9px] uppercase tracking-widest text-primary font-serif font-bold">{poll.categoryName}</p>
                        <p className="font-serif font-black uppercase text-[13px] leading-tight text-foreground mt-1 group-hover:text-primary transition-colors">
                          {poll.question.length > 90 ? poll.question.slice(0, 90) + "…" : poll.question}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-serif">{(poll.totalVotes ?? 0).toLocaleString()} votes</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>


      {/* ── PREDICTIONS ── */}
      <section id="predictions" className="py-8 bg-background border-b border-border section-fadein relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">

            {/* LEFT: Today's Featured Prediction */}
            <div className="lg:pr-8 lg:border-r lg:border-border pb-8 lg:pb-0">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#3B82F6] mb-5 flex items-center gap-2 font-serif">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                {t("TODAY'S FEATURED PREDICTION")}
              </div>
              {(() => {
                const featured = PREDICTIONS[0]
                return (
                  <Link href="/predictions" className="block">
                    <div className="bg-card border border-border p-6 rounded-[4px] flex flex-col gap-4 group hover:-translate-y-0.5 transition-all" style={{ borderWidth: "1.5px" }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-foreground text-background text-[9px] font-bold uppercase tracking-[0.2em] font-serif">
                          {featured.category}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] font-serif rounded-sm" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#3B82F6" }}>
                          Resolves: {featured.resolves}
                        </span>
                      </div>
                      <p className="font-serif font-black uppercase text-lg leading-tight text-foreground tracking-tight" style={{ lineHeight: 1.15 }}>
                        {featured.question}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-serif">{featured.count} predictions locked in</p>

                      {/* Sparkline Chart */}
                      <div className="relative h-20 w-full mt-1">
                        <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={`M${featured.data.map((v, i) => `${(i / (featured.data.length - 1)) * 200},${60 - (v / 100) * 55}`).join(" L")} L200,60 L0,60 Z`} fill="url(#predGrad)" />
                          <polyline points={featured.data.map((v, i) => `${(i / (featured.data.length - 1)) * 200},${60 - (v / 100) * 55}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2" />
                          <circle cx="200" cy={60 - (featured.data[featured.data.length - 1] / 100) * 55} r="3" fill="#3B82F6" />
                        </svg>
                        <div className="absolute top-0 right-0 flex items-center gap-1">
                          <span className={cn("text-[9px] font-bold font-serif", featured.up ? "text-[#10B981]" : "text-[#DC143C]")}>
                            {featured.up ? "▲" : "▼"} {featured.momentum}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-[0.15em] font-bold font-serif text-foreground mb-1">
                            Yes {featured.yes}%
                          </p>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${featured.yes}%`, background: "#10B981" }} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-[0.15em] font-bold font-serif text-foreground mb-1">
                            No {featured.no}%
                          </p>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${featured.no}%`, background: "#DC143C" }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button className="flex-1 py-2.5 border font-bold text-[11px] uppercase tracking-[0.12em] font-serif transition-all duration-150 hover:bg-[#10B981] hover:text-white hover:border-[#10B981]" style={{ borderColor: "#10B981", color: "#10B981" }}>
                          Yes
                        </button>
                        <button className="flex-1 py-2.5 border font-bold text-[11px] uppercase tracking-[0.12em] font-serif transition-all duration-150 hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C]" style={{ borderColor: "#DC143C", color: "#DC143C" }}>
                          No
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })()}
            </div>

            {/* RIGHT: Latest Predictions Sidebar */}
            <div className="lg:pl-8 pt-8 lg:pt-0 border-t lg:border-t-0 border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground font-serif">
                  {t("Latest Predictions")}
                </p>
                <Link href="/predictions" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-serif transition-colors">
                  {t("View All")}
                </Link>
              </div>

              <div>
                {PREDICTIONS.slice(1, 7).map((pred) => (
                  <Link key={pred.id} href="/predictions">
                    <div className="py-3 border-b border-border group cursor-pointer">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] uppercase tracking-widest text-[#3B82F6] font-serif font-bold">{pred.category}</p>
                          <p className="font-serif font-black uppercase text-[12px] leading-tight text-foreground mt-1 group-hover:text-[#3B82F6] transition-colors">
                            {pred.question.length > 70 ? pred.question.slice(0, 70) + "…" : pred.question}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-16 h-8">
                          <svg viewBox="0 0 60 24" className="w-full h-full" preserveAspectRatio="none">
                            <polyline
                              points={pred.data.map((v, i) => `${(i / (pred.data.length - 1)) * 60},${24 - (v / 100) * 20}`).join(" ")}
                              fill="none"
                              stroke={pred.up ? "#10B981" : "#DC143C"}
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] font-bold font-serif" style={{ color: "#10B981" }}>Yes {pred.yes}%</span>
                        <span className="text-[9px] font-bold font-serif" style={{ color: "#DC143C" }}>No {pred.no}%</span>
                        <span className={cn("text-[8px] font-bold font-serif ml-auto", pred.up ? "text-[#10B981]" : "text-[#DC143C]")}>
                          {pred.up ? "▲" : "▼"}{pred.momentum}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── THE VOICES ── */}
      <section className="bg-foreground text-background py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight text-background leading-none">
                {t("The Voices")}
              </h2>
              <div className="h-1 w-full bg-primary mt-3" />
            </div>
            <Link href="/profiles" className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-background/70 hover:text-background font-serif">
              {t("View All →")}
            </Link>
          </div>
          <p className="text-background/75 font-sans text-base mt-4 mb-10 max-w-xl">
            {t("The founders, operators, and change-makers shaping the Middle East. Real people. Real stories.")}
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
              {t("View All Voices")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>


      {/* ── EXPLORE TOPICS ── */}
      {categories?.categories && categories.categories.length > 0 && (
        <section className="py-20 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 border-l-4 border-primary pl-4">
              <h2 className="font-serif font-black uppercase text-2xl text-foreground">
                {t("Explore Topics")}
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
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3 font-serif">{t("Join 10,000+ Voices")}</p>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-none tracking-tight text-background mb-4">
                {t("The Region's Opinion.")}<br />{t("Unfiltered.")}
              </h2>
              <p className="text-background/75 font-sans text-base leading-relaxed max-w-xl">
                The questions no one else asks. The data no one else collects. The pulse of <LiveNumber value={menaPop} className="tabular-nums" /> people — straight to your inbox.
              </p>
            </div>
            <div className="w-full md:basis-1/3">
              {ctaJoined ? (
                <div className="border-2 border-primary p-8 text-center">
                  <p className="font-display font-black text-3xl uppercase text-background tracking-tight">{t("You're In")}<span className="text-primary">.</span></p>
                  <p className="text-[10px] uppercase tracking-widest text-background/70 mt-2 font-serif">{t("Welcome to the conversation.")}</p>
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
                    {t("Join The Hustle")}
                  </button>
                  <p className="text-[9px] text-background/60 font-sans">{t("No spam. Unsubscribe anytime.")}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

