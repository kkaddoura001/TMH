import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/Layout"
import { LiveNumber } from "@/components/live-counter/FlipDigit"

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000
const BASE_DATE = new Date("2026-01-01T00:00:00Z").getTime()

interface TopicCard {
  id: string
  tag: string
  tagColor: string
  title: string
  stat: string
  delta: string
  deltaUp: boolean
  blurb: string
  source: string
  sparkData: number[]
  live?: { baseValue: number; annualGrowth: number; prefix?: string }
}

const EXPLODING_TOPICS: TopicCard[] = [
  {
    id: "creator-economy",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "MENA Creator Economy",
    stat: "$1.2B",
    delta: "+42%",
    deltaUp: true,
    blurb: "Arabic is now the 4th most-used language on TikTok. Saudi Arabia alone has 28M+ active TikTok users. The average MENA influencer earns 3x more per post than their European counterpart.",
    source: "Arab Social Media Report / TikTok 2025",
    sparkData: [0.3, 0.4, 0.5, 0.55, 0.6, 0.7, 0.78, 0.85, 0.92, 1.0, 1.1, 1.2],
  },
  {
    id: "ai-adoption",
    tag: "TECHNOLOGY",
    tagColor: "#3B82F6",
    title: "AI Adoption Rate",
    stat: "68%",
    delta: "+31% YoY",
    deltaUp: true,
    blurb: "UAE ranks #1 globally in government AI readiness. Saudi Arabia's $100B AI fund is the largest sovereign AI bet on earth. Over 1,200 Arabic-language AI startups founded since 2023.",
    source: "Oxford Insights / PIF / SDAIA",
    sparkData: [22, 28, 31, 35, 39, 42, 48, 52, 55, 59, 63, 68],
  },
  {
    id: "women-workforce",
    tag: "SOCIETY",
    tagColor: "#EC4899",
    title: "Women in the Workforce",
    stat: "33.4%",
    delta: "+9.2pp since 2019",
    deltaUp: true,
    blurb: "Saudi female workforce participation jumped from 17% to 33% in 6 years — the fastest rise in recorded history for any G20 nation. UAE boards now require 30% female representation.",
    source: "GASTAT / ILO 2025",
    sparkData: [17, 19, 21, 23, 25, 26, 28, 29, 30, 31, 32, 33.4],
  },
  {
    id: "crypto-volume",
    tag: "FINANCE",
    tagColor: "#F59E0B",
    title: "Crypto Trading Volume",
    stat: "$338B",
    delta: "+74%",
    deltaUp: true,
    blurb: "UAE is now the world's 3rd largest crypto market by volume. Dubai issued more crypto licenses in 2025 than the entire EU combined. Bahrain became the first MENA nation to regulate stablecoins.",
    source: "Chainalysis MENA Report 2025",
    sparkData: [89, 110, 125, 145, 160, 180, 210, 240, 268, 295, 318, 338],
  },
  {
    id: "mental-health",
    tag: "HEALTH",
    tagColor: "#10B981",
    title: "Mental Health Search Volume",
    stat: "312% increase",
    delta: "+312%",
    deltaUp: true,
    blurb: "\"Anxiety\" in Arabic is now the most-searched health term in 14 MENA countries. Saudi Arabia launched 1,600 mental health clinics. UAE made therapy sessions tax-deductible in 2025. Still: 1 psychiatrist per 250,000 people in Egypt.",
    source: "Google Trends MENA / WHO EMRO",
    sparkData: [30, 42, 55, 68, 82, 95, 110, 135, 168, 210, 265, 312],
  },
  {
    id: "gaming",
    tag: "ENTERTAINMENT",
    tagColor: "#8B5CF6",
    title: "MENA Gaming Market",
    stat: "$6.8B",
    delta: "+28%",
    deltaUp: true,
    blurb: "Saudi Arabia is now the world's largest gaming investor through Savvy Games Group ($38B deployed). 85% of Saudi youth play daily. Riyadh hosts the world's largest esports arena (capacity: 500+ gamers).",
    source: "Newzoo / Savvy Games Group",
    sparkData: [2.1, 2.5, 2.9, 3.3, 3.7, 4.0, 4.5, 5.0, 5.5, 6.0, 6.4, 6.8],
  },
  {
    id: "expat-exodus",
    tag: "MIGRATION",
    tagColor: "#EF4444",
    title: "Nationalization vs. Expat Workforce",
    stat: "1.2M jobs nationalized",
    delta: "Since 2021",
    deltaUp: false,
    blurb: "Saudi Nitaqat reforms displaced 800K+ expat workers. UAE's Emiratisation mandate: 2% annual private sector targets. Kuwait proposed a 30% expat cap. Lebanon lost 40% of its doctors since 2020.",
    source: "HRDF / MOHRE / IOM",
    sparkData: [120, 250, 380, 470, 560, 650, 740, 830, 920, 1010, 1100, 1200],
  },
  {
    id: "food-security",
    tag: "SURVIVAL",
    tagColor: "#F97316",
    title: "Food Import Dependency",
    stat: "85% imported",
    delta: "Zero change",
    deltaUp: false,
    blurb: "GCC imports 85% of its food. Saudi Arabia spent $2.4B on vertical farming — the world's largest investment. Qatar built 70% food self-sufficiency from 0% after the 2017 blockade. Yemen: 17M food-insecure.",
    source: "FAO / KAUST / Qatar Ministry of Municipality",
    sparkData: [87, 87, 86, 86, 86, 85, 85, 85, 85, 85, 85, 85],
  },
  {
    id: "youth-bulge",
    tag: "DEMOGRAPHICS",
    tagColor: "#06B6D4",
    title: "Population Under 30",
    stat: "60%",
    delta: "~325M people",
    deltaUp: true,
    blurb: "MENA has the youngest population on earth relative to its economy. Median age: 26 (vs. Europe: 44). Egypt adds 2M people per year. Gaza's median age is 18. Youth unemployment still 26%.",
    source: "UN Population Division / ILO",
    sparkData: [63, 63, 62, 62, 62, 61, 61, 61, 61, 60, 60, 60],
    live: { baseValue: 325_000_000, annualGrowth: 0.016 },
  },
  {
    id: "tourism-boom",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "Saudi Tourism Revolution",
    stat: "109M visits",
    delta: "+23%",
    deltaUp: true,
    blurb: "Saudi Arabia went from 0 tourist visas to 109M visits in 5 years. NEOM's Sindalah island opens 2026. AlUla saw 500,000 visitors. Vision 2030 target: 150M by 2030. Alcohol now served in diplomatic zones.",
    source: "Saudi Tourism Authority / MoT",
    sparkData: [18, 27, 39, 51, 62, 70, 78, 85, 92, 98, 104, 109],
  },
  {
    id: "brain-drain",
    tag: "MIGRATION",
    tagColor: "#EF4444",
    title: "MENA Brain Drain",
    stat: "1 in 3 graduates leave",
    delta: "Accelerating",
    deltaUp: false,
    blurb: "Lebanon lost 50% of its physicians. 77% of Tunisian engineers want to emigrate. Iraq lost 23,000 academics since 2003. Counter-trend: UAE attracting 2.5M+ skilled workers. Saudi Arabia poaching Silicon Valley AI talent.",
    source: "IOM / World Bank / Arab Barometer",
    sparkData: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  },
  {
    id: "cannabis-debate",
    tag: "POLITICS",
    tagColor: "#22C55E",
    title: "Cannabis Reform Momentum",
    stat: "3 countries decriminalizing",
    delta: "Morocco, Lebanon, Tunisia",
    deltaUp: true,
    blurb: "Morocco legalized medical cannabis and became Africa's largest legal exporter ($420M in 2025). Lebanon passed cultivation laws for export. Tunisia is debating personal use decriminalization. Still: UAE punishes possession with prison.",
    source: "INCB / Reuters / Morocco Ministry of Interior",
    sparkData: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3],
  },
]

const TICKER_ITEMS = [
  { label: "CREATOR ECONOMY", value: "$1.2B", delta: "+42%", up: true },
  { label: "AI ADOPTION", value: "68%", delta: "+31%", up: true },
  { label: "WOMEN IN WORK", value: "33.4%", delta: "+9.2pp", up: true },
  { label: "CRYPTO VOL", value: "$338B", delta: "+74%", up: true },
  { label: "GAMING", value: "$6.8B", delta: "+28%", up: true },
  { label: "YOUTH <30", value: "60%", delta: "325M", up: true },
  { label: "TOURISM KSA", value: "109M", delta: "+23%", up: true },
  { label: "BRAIN DRAIN", value: "1 in 3", delta: "LEAVING", up: false },
  { label: "MENTAL HEALTH", value: "+312%", delta: "SEARCHES", up: true },
  { label: "FOOD IMPORTS", value: "85%", delta: "NO CHANGE", up: false },
]

function useLiveCounter(baseValue: number, annualGrowth: number, tickMs = 1000) {
  const perMs = (baseValue * annualGrowth) / MS_PER_YEAR
  const calc = useCallback(() => {
    const elapsed = Date.now() - BASE_DATE
    return Math.floor(baseValue + elapsed * perMs)
  }, [baseValue, perMs])
  const [value, setValue] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setValue(calc()), tickMs)
    return () => clearInterval(id)
  }, [calc, tickMs])
  return value
}

function MiniSparkline({ data, color = "#DC143C", id }: { data: number[]; color?: string; id: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 120
  const h = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-${id})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TopicCardComponent({ topic, index }: { topic: TopicCard; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const liveValue = useLiveCounter(
    topic.live?.baseValue ?? 0,
    topic.live?.annualGrowth ?? 0
  )

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${topic.tagColor}55`
        ;(e.currentTarget as HTMLElement).style.background = `${topic.tagColor}08`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"
        ;(e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${topic.tagColor}, transparent)`, opacity: 0.4 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 9,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: topic.tagColor,
          background: `${topic.tagColor}15`,
          padding: "2px 8px",
        }}>
          {topic.tag}
        </span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
          color: topic.deltaUp ? "#10B981" : "#EF4444",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {topic.deltaUp ? "\u25B2" : "\u25BC"} {topic.delta}
        </span>
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
        {topic.title}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        {topic.live ? (
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>
            <LiveNumber
              value={liveValue}
              className="tabular-nums"
              style={{ fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
            />
          </span>
        ) : (
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>
            {topic.stat}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
          {topic.live ? `${(liveValue / 1_000_000).toFixed(1)}M people` : topic.stat}
        </span>
        <MiniSparkline data={topic.sparkData} color={topic.tagColor} id={topic.id} />
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${topic.tagColor}20` }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 8 }}>
            {topic.blurb}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Source: {topic.source}
          </p>
        </div>
      )}
    </div>
  )
}

function PulseTicker() {
  const text = TICKER_ITEMS.map(t => `${t.label}  ${t.value}  ${t.up ? "\u25B2" : "\u25BC"} ${t.delta}`).join("    \u00B7    ")

  return (
    <div style={{ background: "rgba(220,20,60,0.06)", borderTop: "1px solid rgba(220,20,60,0.12)", borderBottom: "1px solid rgba(220,20,60,0.12)", height: 38, display: "flex", alignItems: "center", overflow: "hidden", position: "relative" }}>
      <div style={{ flexShrink: 0, background: "#DC143C", padding: "3px 10px", marginLeft: 8, marginRight: 12, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", zIndex: 2 }}>
        LIVE
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <span
          className="tmh-ticker-scroll"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            paddingLeft: 8,
          }}
        >
          <span>{text}</span>
          <span style={{ marginLeft: 60 }}>{text}</span>
        </span>
      </div>
    </div>
  )
}

function BigNumber() {
  const pop = useLiveCounter(541_000_000, 0.0156, 500)

  return (
    <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(220,20,60,0.08)", padding: "28px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #DC143C, transparent)", opacity: 0.3 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC143C", animation: "pulse-glow 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#DC143C" }}>
          Live Counter
        </span>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
        MENA Population Right Now
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#DC143C", letterSpacing: "-0.02em", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          <LiveNumber
            value={pop}
            className="tabular-nums"
            style={{ fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
          />
        </span>
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, lineHeight: 1.5 }}>
        Growing by ~8.2 million per year — roughly 1 new person every 4 seconds. 60% are under 30.
      </p>
    </div>
  )
}

export default function MenaPulse() {
  return (
    <Layout>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            The Pulse
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            What's Actually<br />Happening in MENA.
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            The trends nobody's tracking. Until now.
          </p>
        </div>

        <PulseTicker />

        <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0.65rem 0", display: "flex", alignItems: "center", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{EXPLODING_TOPICS.length}</span> Trends
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>20</span> Countries
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>541M</span> People
          </span>
        </div>
      </div>

      <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(220,20,60,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
            <BigNumber />
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, background: "#DC143C" }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
                Exploding Trends
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.2)", marginLeft: 8, letterSpacing: "0.05em" }}>
                Click any card for the full story
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {EXPLODING_TOPICS.map((topic, i) => (
                <TopicCardComponent key={topic.id} topic={topic} index={i} />
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 16px 48px", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.12)", textTransform: "uppercase", letterSpacing: "0.12em", maxWidth: 640, margin: "0 auto", lineHeight: 1.8 }}>
              Data compiled from World Bank, IMF, Chainalysis, GSMA, Google Trends, ILO, IOM, INCB, FAO, Newzoo, Saudi Tourism Authority & Arab Social Media Report. Click any card for source attribution.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
