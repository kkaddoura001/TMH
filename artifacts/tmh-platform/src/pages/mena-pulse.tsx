import { useState, useEffect, useCallback, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import { LiveNumber } from "@/components/live-counter/FlipDigit"

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000
const BASE_DATE = new Date("2026-01-01T00:00:00Z").getTime()

interface StatConfig {
  id: string
  label: string
  category: string
  baseValue: number
  annualGrowth: number
  prefix?: string
  trend: "up" | "down"
  trendLabel: string
  description: string
  source: string
  sparkData: number[]
}

const MENA_COUNTRIES = [
  { code: "AE", name: "UAE", flag: "\u{1F1E6}\u{1F1EA}", pop: 10_280_000, gdpB: 509, growth: 4.3 },
  { code: "SA", name: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}", pop: 37_400_000, gdpB: 1069, growth: 3.6 },
  { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}", pop: 109_300_000, gdpB: 395, growth: 4.4 },
  { code: "IQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}", pop: 44_500_000, gdpB: 268, growth: 2.1 },
  { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}", pop: 37_800_000, gdpB: 152, growth: 3.8 },
  { code: "DZ", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}", pop: 46_300_000, gdpB: 240, growth: 2.9 },
  { code: "SD", name: "Sudan", flag: "\u{1F1F8}\u{1F1E9}", pop: 48_100_000, gdpB: 51, growth: -1.2 },
  { code: "YE", name: "Yemen", flag: "\u{1F1FE}\u{1F1EA}", pop: 34_400_000, gdpB: 22, growth: 0.5 },
  { code: "SY", name: "Syria", flag: "\u{1F1F8}\u{1F1FE}", pop: 23_200_000, gdpB: 12, growth: 1.8 },
  { code: "TN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}", pop: 12_500_000, gdpB: 49, growth: 2.6 },
  { code: "JO", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}", pop: 11_500_000, gdpB: 50, growth: 2.8 },
  { code: "LB", name: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}", pop: 5_600_000, gdpB: 18, growth: 1.2 },
  { code: "LY", name: "Libya", flag: "\u{1F1F1}\u{1F1FE}", pop: 7_100_000, gdpB: 45, growth: 3.1 },
  { code: "OM", name: "Oman", flag: "\u{1F1F4}\u{1F1F2}", pop: 4_700_000, gdpB: 105, growth: 3.5 },
  { code: "KW", name: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}", pop: 4_400_000, gdpB: 165, growth: 2.6 },
  { code: "QA", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}", pop: 2_700_000, gdpB: 220, growth: 4.9 },
  { code: "BH", name: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}", pop: 1_600_000, gdpB: 46, growth: 3.2 },
  { code: "PS", name: "Palestine", flag: "\u{1F1F5}\u{1F1F8}", pop: 5_500_000, gdpB: 19, growth: 1.5 },
  { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}", pop: 89_200_000, gdpB: 402, growth: 2.0 },
  { code: "MR", name: "Mauritania", flag: "\u{1F1F2}\u{1F1F7}", pop: 4_900_000, gdpB: 10, growth: 4.2 },
]

const STATS: StatConfig[] = [
  {
    id: "population", label: "MENA POPULATION", category: "DEMOGRAPHICS",
    baseValue: 541_000_000, annualGrowth: 0.0156,
    trend: "up", trendLabel: "+1.56%",
    description: "Total population across 20 MENA countries. Growing by ~8.2M per year \u2014 roughly 1 new person every 4 seconds.",
    source: "UN World Population Prospects 2025",
    sparkData: [510, 515, 518, 520, 523, 525, 528, 530, 533, 536, 539, 541],
  },
  {
    id: "gdp", label: "COMBINED GDP", category: "ECONOMY",
    baseValue: 3_850_000_000_000, annualGrowth: 0.033, prefix: "$",
    trend: "up", trendLabel: "+3.3%",
    description: "Total nominal GDP. Outpacing global growth \u2014 fastest expansion since 2016 excluding post-Covid rebound.",
    source: "World Bank / IMF WEO 2026",
    sparkData: [3200, 3350, 3420, 3500, 3580, 3620, 3680, 3720, 3780, 3810, 3840, 3850],
  },
  {
    id: "oil", label: "OIL PRODUCTION", category: "ENERGY",
    baseValue: 31_000_000, annualGrowth: 0.018,
    trend: "up", trendLabel: "+1.8%",
    description: "~31M barrels/day. OPEC+ voluntary cuts phasing out, led by Saudi Arabia at 9.6M bpd.",
    source: "OPEC Monthly Oil Market Report",
    sparkData: [28.5, 29.0, 29.2, 29.8, 30.0, 30.1, 30.3, 30.5, 30.7, 30.8, 30.9, 31.0],
  },
  {
    id: "internet", label: "INTERNET USERS", category: "DIGITAL",
    baseValue: 357_000_000, annualGrowth: 0.048,
    trend: "up", trendLabel: "+4.8%",
    description: "Mobile internet users. GCC penetration leads at 92%. Bahrain near 100% mobile internet penetration.",
    source: "GSMA Mobile Economy MENA 2025",
    sparkData: [290, 305, 315, 322, 330, 335, 340, 345, 348, 352, 355, 357],
  },
  {
    id: "tourism", label: "TOURIST ARRIVALS", category: "TOURISM",
    baseValue: 100_000_000, annualGrowth: 0.035,
    trend: "up", trendLabel: "+3.5%",
    description: "MENA is the world's strongest-performing tourism region, 39% above pre-pandemic 2019 levels.",
    source: "UNWTO World Tourism Barometer 2026",
    sparkData: [72, 78, 82, 85, 88, 90, 92, 94, 96, 97, 99, 100],
  },
  {
    id: "startups", label: "STARTUP FUNDING", category: "INNOVATION",
    baseValue: 7_500_000_000, annualGrowth: 0.225, prefix: "$",
    trend: "up", trendLabel: "+22.5%",
    description: "647 funded startups in 2025. Equity funding up 77% YoY. UAE and Saudi Arabia lead the ecosystem.",
    source: "Wamda / MAGNiTT 2025",
    sparkData: [2.5, 3.0, 3.2, 3.5, 4.0, 4.5, 5.0, 5.2, 5.8, 6.3, 6.8, 7.5],
  },
  {
    id: "remittances", label: "REMITTANCES", category: "ECONOMY",
    baseValue: 67_000_000_000, annualGrowth: 0.04, prefix: "$",
    trend: "up", trendLabel: "+4.0%",
    description: "Annual remittance inflows. Egypt is the largest recipient at $32B+. Lebanon's remittances = 27.5% of GDP.",
    source: "World Bank Migration & Remittances Report",
    sparkData: [52, 54, 56, 58, 59, 60, 61, 63, 64, 65, 66, 67],
  },
  {
    id: "fdi", label: "FDI INFLOWS", category: "ECONOMY",
    baseValue: 65_000_000_000, annualGrowth: 0.06, prefix: "$",
    trend: "up", trendLabel: "+6.0%",
    description: "Foreign direct investment. UAE and Saudi Arabia attract the majority, driven by Vision 2030.",
    source: "UNCTAD World Investment Report 2025",
    sparkData: [48, 50, 52, 53, 55, 56, 58, 59, 61, 62, 64, 65],
  },
  {
    id: "smartphones", label: "SMARTPHONES", category: "DIGITAL",
    baseValue: 652_000_000, annualGrowth: 0.035,
    trend: "up", trendLabel: "+3.5%",
    description: "Active smartphone subscriptions. GCC penetration exceeds 90%, 5G at 17% of total connections.",
    source: "GSMA Intelligence 2025",
    sparkData: [530, 550, 565, 580, 590, 600, 610, 620, 630, 638, 645, 652],
  },
]

const TICKER_ITEMS = [
  { label: "MENA POP", value: "541M", delta: "+1.56%", up: true },
  { label: "GDP", value: "$3.85T", delta: "+3.3%", up: true },
  { label: "OIL", value: "31M bbl", delta: "+1.8%", up: true },
  { label: "INTERNET", value: "357M", delta: "+4.8%", up: true },
  { label: "TOURISM", value: "100M", delta: "+3.5%", up: true },
  { label: "VC FUNDING", value: "$7.5B", delta: "+22.5%", up: true },
  { label: "REMITTANCES", value: "$67B", delta: "+4.0%", up: true },
  { label: "FDI", value: "$65B", delta: "+6.0%", up: true },
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

function MiniSparkline({ data, color = "#DC143C" }: { data: number[]; color?: string }) {
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
        <linearGradient id={`spark-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-grad)`}
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

function formatHumanReadable(v: number, isCurrency: boolean) {
  if (isCurrency) {
    if (v >= 1_000_000_000_000) return `$${(v / 1_000_000_000_000).toFixed(2)}T`
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    return `$${v.toLocaleString()}`
  }
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  return v.toLocaleString()
}

function StatCard({ stat, index }: { stat: StatConfig; index: number }) {
  const value = useLiveCounter(stat.baseValue, stat.annualGrowth)
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80)
    return () => clearTimeout(t)
  }, [index])

  const displayValue = stat.id === "oil" ? stat.baseValue : value
  const isCurrency = stat.prefix === "$"
  const humanLabel = formatHumanReadable(displayValue, isCurrency)

  const scaleVal = (v: number) => {
    if (v >= 1_000_000_000) return { n: Math.floor(v / 1_000_000), s: "M" }
    if (v >= 1_000_000) return { n: Math.floor(v / 1_000), s: "K" }
    return { n: v, s: "" }
  }

  const showFull = displayValue < 1_000_000_000
  const { n: scaledNum, s: scaleSuffix } = scaleVal(displayValue)

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(220,20,60,0.08)",
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,20,60,0.35)"
        ;(e.currentTarget as HTMLElement).style.background = "rgba(220,20,60,0.03)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,20,60,0.08)"
        ;(e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #DC143C, transparent)", opacity: 0.3 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(220,20,60,0.5)" }}>
          {stat.category}
        </span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
          color: stat.trend === "up" ? "#10B981" : "#DC143C",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {stat.trend === "up" ? "\u25B2" : "\u25BC"} {stat.trendLabel}
        </span>
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
        {stat.label}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
          {stat.prefix || ""}
          <LiveNumber
            value={showFull ? displayValue : scaledNum}
            className="tabular-nums"
            style={{ fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
          />
        </span>
        {!showFull && scaleSuffix && (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
            {scaleSuffix}
          </span>
        )}
        {stat.id === "oil" && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>bbl/day</span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
          {humanLabel}
        </span>
        <MiniSparkline data={stat.sparkData} />
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(220,20,60,0.1)" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 8 }}>
            {stat.description}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Source: {stat.source}
          </p>
        </div>
      )}
    </div>
  )
}

function PulseTicker() {
  const tickerRef = useRef<HTMLDivElement>(null)
  const text = TICKER_ITEMS.map(t => `${t.label}  ${t.value}  ${t.up ? "\u25B2" : "\u25BC"} ${t.delta}`).join("    \u00B7    ")

  return (
    <div style={{ background: "rgba(220,20,60,0.06)", borderTop: "1px solid rgba(220,20,60,0.15)", borderBottom: "1px solid rgba(220,20,60,0.15)", height: 36, display: "flex", alignItems: "center", overflow: "hidden", position: "relative" }}>
      <div style={{ flexShrink: 0, background: "#DC143C", padding: "3px 12px", marginLeft: 8, marginRight: 12, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", zIndex: 2 }}>
        LIVE
      </div>
      <div ref={tickerRef} style={{ flex: 1, overflow: "hidden" }}>
        <span className="ticker-animate" style={{ display: "inline-block", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", paddingLeft: 8 }}>
          {text + "    \u00B7    " + text}
        </span>
      </div>
    </div>
  )
}

function CountryRow({ country, maxGdp, index }: { country: typeof MENA_COUNTRIES[0]; maxGdp: number; index: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400 + index * 30)
    return () => clearTimeout(t)
  }, [index])

  const gdpPerCap = Math.round((country.gdpB * 1_000_000_000) / country.pop)
  const barWidth = (country.gdpB / maxGdp) * 100

  return (
    <tr
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateX(0)" : "translateX(-8px)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,20,60,0.03)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "10px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
        <span style={{ marginRight: 8 }}>{country.flag}</span>
        {country.name}
      </td>
      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
        {(country.pop / 1_000_000).toFixed(1)}M
      </td>
      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
        ${country.gdpB}B
      </td>
      <td className="hidden sm:table-cell" style={{ padding: "10px 16px", textAlign: "right", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
        ${gdpPerCap.toLocaleString()}
      </td>
      <td className="hidden sm:table-cell" style={{ padding: "10px 16px", textAlign: "right", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: country.growth >= 0 ? "#10B981" : "#DC143C" }}>
        {country.growth >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(country.growth)}%
      </td>
      <td className="hidden md:table-cell" style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
            <div style={{ width: mounted ? `${barWidth}%` : "0%", height: "100%", background: "linear-gradient(90deg, #DC143C, rgba(220,20,60,0.4))", transition: "width 1s cubic-bezier(0.23,1,0.32,1)" }} />
          </div>
        </div>
      </td>
    </tr>
  )
}

function CountryTable() {
  const sorted = [...MENA_COUNTRIES].sort((a, b) => b.gdpB - a.gdpB)
  const maxGdp = sorted[0].gdpB
  const totalPop = MENA_COUNTRIES.reduce((s, c) => s + c.pop, 0)
  const totalGdp = MENA_COUNTRIES.reduce((s, c) => s + c.gdpB, 0)

  return (
    <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(220,20,60,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(220,20,60,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff" }}>
            20 Countries
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
            One Region
          </span>
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)" }}>
          {(totalPop / 1_000_000).toFixed(0)}M people · ${(totalGdp / 1000).toFixed(1)}T GDP
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(220,20,60,0.1)" }}>
              {["Country", "Population", "GDP", "GDP/Cap", "Growth", ""].map((h, i) => (
                <th
                  key={h || i}
                  className={i >= 3 && i <= 4 ? "hidden sm:table-cell" : i === 5 ? "hidden md:table-cell" : ""}
                  style={{
                    padding: "8px 16px",
                    textAlign: i === 0 ? "left" : "right",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "rgba(220,20,60,0.4)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <CountryRow key={c.code} country={c} maxGdp={maxGdp} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function MenaPulse() {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Layout>
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(220,20,60,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>

            <div style={{ paddingTop: 40, paddingBottom: 24, borderBottom: "1px solid rgba(220,20,60,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC143C", animation: "pulse-glow 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#DC143C" }}>
                  Live Data Terminal
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.2)", marginLeft: "auto", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {dateStr} · {timeStr} · T+{seconds}s
                </span>
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2.5rem, 5vw, 4rem)", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.95, marginBottom: 12 }}>
                <span style={{ color: "var(--foreground)" }}>The </span>
                <span style={{ color: "#DC143C" }}>Pulse</span>
              </h1>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 580, lineHeight: 1.6 }}>
                Real-time economic and demographic indicators across 20 countries in the Middle East & North Africa. Every number ticks live.
              </p>
            </div>
          </div>

          <PulseTicker />

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {STATS.map((stat, i) => (
                <StatCard key={stat.id} stat={stat} index={i} />
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 48px" }}>
            <CountryTable />
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 48px", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.12)", textTransform: "uppercase", letterSpacing: "0.12em", maxWidth: 540, margin: "0 auto", lineHeight: 1.8 }}>
              Data compiled from World Bank, IMF, OPEC, GSMA, UNWTO, Wamda, MAGNiTT & UNCTAD. Growth rates applied to Jan 2026 baselines. Click any card for source attribution.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
