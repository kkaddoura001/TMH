import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LineChart,
} from "recharts"

// ─── DATA ───────────────────────────────────────────────────────────────────

const FEATURED_RAW = [58, 59, 60, 61, 62, 63, 64, 62, 65, 67, 69, 71]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const FEATURED_DATA = FEATURED_RAW.map((yes, i) => {
  const slice = FEATURED_RAW.slice(Math.max(0, i - 2), i + 1)
  const ma = slice.reduce((s, v) => s + v, 0) / slice.length
  return { month: MONTHS[i], yes, ma: Math.round(ma * 10) / 10 }
})

const TICKER_DATA = [
  { label: "CINEMA SAUDI", yes: 71, delta: 2.1, up: true },
  { label: "$10B STARTUP", yes: 44, delta: 1.3, up: false },
  { label: "UAE INCOME TAX", yes: 38, delta: 0.8, up: true },
  { label: "ARABIC SCHOOLS", yes: 58, delta: 1.4, up: true },
  { label: "MENA CANNABIS", yes: 29, delta: 0.6, up: false },
  { label: "JOB SURVIVAL", yes: 71, delta: 2.1, up: true },
]

const GRID_CARDS = [
  {
    id: 1,
    category: "Culture & Policy",
    resolves: "Dec 2026",
    question: "Saudi Arabia Will Have a Fully Operating Cinema in Every Major City by End of 2026",
    count: "12,847",
    yes: 71, no: 29,
    momentum: 2.1, up: true,
    data: [62, 63, 65, 64, 66, 68, 70, 71],
  },
  {
    id: 2,
    category: "Business",
    resolves: "Dec 2026",
    question: "A MENA-Founded Startup Will Reach $10B Valuation in 2026",
    count: "9,231",
    yes: 44, no: 56,
    momentum: 1.3, up: false,
    data: [48, 47, 46, 48, 46, 45, 44, 44],
  },
  {
    id: 3,
    category: "Economy",
    resolves: "Mar 2029",
    question: "UAE Will Introduce Some Form of Personal Income Tax Within 3 Years",
    count: "15,603",
    yes: 38, no: 62,
    momentum: 0.8, up: true,
    data: [35, 35, 36, 36, 37, 37, 38, 38],
  },
  {
    id: 4,
    category: "Education",
    resolves: "Sep 2027",
    question: "Arabic Will Become a Mandatory Subject in All Dubai Private Schools Within 2 Years",
    count: "8,094",
    yes: 58, no: 42,
    momentum: 1.4, up: true,
    data: [51, 52, 53, 54, 55, 56, 57, 58],
  },
]

const CLOSED_RAW = [55, 58, 60, 62, 63, 65, 67, 67, 67, 80]
const CLOSED_DATA = CLOSED_RAW.map((yes, i) => ({ week: i + 1, yes }))

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

function FeaturedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const curr = payload[0]?.value
  const prev = FEATURED_DATA.find(d => d.month === label)
  const prevIdx = FEATURED_DATA.findIndex(d => d.month === label)
  const prevVal = prevIdx > 0 ? FEATURED_DATA[prevIdx - 1].yes : curr
  const change = curr - prevVal
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(220,20,60,0.3)", borderRadius: 6, padding: "10px 14px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 2 }}>{label} 2026</p>
      <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{curr}% YES</p>
      {prevIdx > 0 && (
        <p style={{ color: change >= 0 ? "#10B981" : "#DC143C", fontSize: 11 }}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  )
}

// ─── SPARKLINE ───────────────────────────────────────────────────────────────

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const chartData = data.map((yes, i) => ({ i, yes }))
  const color = up ? "#DC143C" : "rgba(255,255,255,0.3)"
  return (
    <ResponsiveContainer width="100%" height={56}>
      <LineChart data={chartData} margin={{ top: 6, right: 4, bottom: 6, left: 4 }}>
        <Line
          type="monotone"
          dataKey="yes"
          stroke={color}
          strokeWidth={1}
          dot={false}
          isAnimationActive={true}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── CONFIDENCE BARS ─────────────────────────────────────────────────────────

function ConfidenceBars({ yes, no, up, momentum, compact = false }: {
  yes: number; no: number; up: boolean; momentum: number; compact?: boolean
}) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t) }, [])
  const h = compact ? "h-2" : "h-3"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "var(--foreground)" }}>YES</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "var(--foreground)" }}>{yes}%</span>
        </div>
        <div className={`w-full ${h} rounded-sm overflow-hidden`} style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className={`${h} rounded-sm transition-all duration-1000`}
            style={{ width: animated ? `${yes}%` : "0%", background: "#DC143C" }}
          />
        </div>
        {!compact && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: up ? "#10B981" : "#DC143C", marginTop: 3 }}>
            {up ? "▲" : "▼"} {up ? "Up" : "Down"} {momentum}% this week
          </p>
        )}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "var(--foreground)" }}>NO</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "var(--foreground)" }}>{no}%</span>
        </div>
        <div className={`w-full ${h} rounded-sm overflow-hidden`} style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className={`${h} rounded-sm transition-all duration-1000`}
            style={{ width: animated ? `${no}%` : "0%", background: "rgba(255,255,255,0.15)" }}
          />
        </div>
        {compact && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: up ? "#10B981" : "#DC143C", marginTop: 3 }}>
            {up ? "▲" : "▼"} {up ? "UP" : "DOWN"} {momentum}% this week
          </p>
        )}
      </div>
    </div>
  )
}

// ─── VOTE BUTTONS ────────────────────────────────────────────────────────────

function VoteButtons({ height = 52, locked = false }: { height?: number; locked?: boolean }) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null)
  if (locked) return null
  return (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      <button
        onClick={() => setVoted(v => v === "yes" ? null : "yes")}
        style={{
          flex: 1, height, border: `1.5px solid #DC143C`,
          background: voted === "yes" ? "#DC143C" : "transparent",
          color: voted === "yes" ? "#fff" : "#DC143C",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: "pointer", transition: "all 0.15s", borderRadius: 4,
        }}
      >
        {voted === "yes" ? "✓ YES — LOCKED" : "YES"}
      </button>
      <button
        onClick={() => setVoted(v => v === "no" ? null : "no")}
        style={{
          flex: 1, height, border: `1.5px solid var(--border)`,
          background: voted === "no" ? "rgba(255,255,255,0.08)" : "transparent",
          color: voted === "no" ? "var(--foreground)" : "var(--muted-foreground)",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: "pointer", transition: "all 0.15s", borderRadius: 4,
        }}
      >
        {voted === "no" ? "✓ NO — LOCKED" : "NO"}
      </button>
    </div>
  )
}

// ─── MOMENTUM TICKER ─────────────────────────────────────────────────────────

function MomentumTicker() {
  const doubled = [...TICKER_DATA, ...TICKER_DATA]
  return (
    <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div className="tmh-ticker-scroll">
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.7rem 2rem",
              borderRight: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(250,250,250,0.5)" }}>
              {item.label}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
              YES {item.yes}%
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: item.up ? "#10B981" : "#DC143C" }}>
              {item.up ? "▲" : "▼"} {item.up ? "+" : "-"}{item.delta}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FEATURED PREDICTION ─────────────────────────────────────────────────────

function FeaturedPrediction() {
  const firstVal = FEATURED_DATA[0].yes
  const lastVal = FEATURED_DATA[FEATURED_DATA.length - 1].yes
  const month30Change = lastVal - FEATURED_DATA[FEATURED_DATA.length - 2].yes

  return (
    <div
      style={{
        background: "var(--card)", border: "1.5px solid rgba(220,20,60,0.2)",
        borderRadius: 12, padding: "2rem", marginBottom: "2rem",
      }}
    >
      <div className="grid md:grid-cols-[55fr_45fr] gap-8">
        {/* LEFT: chart */}
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
            Confidence Over Time — YES %
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={FEATURED_DATA} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tickCount={6}
                tick={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fill: "rgba(250,250,250,0.4)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fill: "rgba(250,250,250,0.4)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<FeaturedTooltip />} cursor={{ stroke: "rgba(220,20,60,0.4)", strokeWidth: 1 }} />
              <ReferenceLine
                y={50}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="4 4"
                label={{ value: "Tipping Point", position: "right", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fill: "rgba(255,255,255,0.35)" }}
              />
              <Area
                type="monotone"
                dataKey="yes"
                fill="rgba(220,20,60,0.1)"
                stroke="rgba(220,20,60,0.6)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="ma"
                stroke="#DC143C"
                strokeWidth={1}
                dot={false}
                isAnimationActive={true}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.8rem", color: month30Change >= 0 ? "#10B981" : "#DC143C", marginTop: "0.5rem" }}>
            Confidence has moved {month30Change >= 0 ? "+" : ""}{month30Change}% in the last 30 days
          </p>
        </div>

        {/* RIGHT: info + vote */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", background: "var(--foreground)", color: "var(--background)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Technology
            </span>
            <span style={{ padding: "2px 8px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#F59E0B", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 2 }}>
              Resolves: Dec 2031
            </span>
          </div>

          {/* Context line */}
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.78rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
            The region has spoken on the debate. Now they're putting their prediction on it.
          </p>

          {/* Question */}
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", textTransform: "uppercase", lineHeight: 1.2, color: "var(--foreground)", letterSpacing: "0.02em" }}>
            Will the majority of jobs that exist today still exist in this region by 2031?
          </p>

          {/* Participation */}
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            18,392 predictions locked in
          </p>

          {/* Confidence bars */}
          <ConfidenceBars yes={71} no={29} up={true} momentum={2.1} compact={false} />

          {/* Vote buttons */}
          <VoteButtons height={52} />

          {/* Lock notice */}
          <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
            Your prediction is locked until the resolution date. No changing your mind.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── PREDICTION GRID CARD ────────────────────────────────────────────────────

function PredictionGridCard({ card }: { card: typeof GRID_CARDS[0] }) {
  return (
    <div
      style={{
        background: "var(--card)", border: "1.5px solid rgba(220,20,60,0.15)",
        borderRadius: 10, padding: "1.4rem", display: "flex", flexDirection: "column", gap: "0.85rem",
      }}
    >
      {/* Sparkline */}
      <div style={{ marginLeft: "-0.5rem", marginRight: "-0.5rem" }}>
        <Sparkline data={card.data} up={card.up} />
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ padding: "2px 7px", background: "var(--foreground)", color: "var(--background)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>
          {card.category}
        </span>
        <span style={{ padding: "2px 7px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#F59E0B", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 2 }}>
          Resolves: {card.resolves}
        </span>
      </div>

      {/* Question */}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.95rem", textTransform: "uppercase", lineHeight: 1.2, color: "var(--foreground)", letterSpacing: "0.02em" }}>
        {card.question}
      </p>

      {/* Participation */}
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
        {card.count} predictions locked in
      </p>

      {/* Confidence bars */}
      <ConfidenceBars yes={card.yes} no={card.no} up={card.up} momentum={card.momentum} compact={true} />

      {/* Vote buttons */}
      <VoteButtons height={44} />

      {/* Lock notice */}
      <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
        Your prediction is locked until the resolution date.
      </p>
    </div>
  )
}

// ─── CLOSED PREDICTION ───────────────────────────────────────────────────────

function ClosedPredictionCard() {
  return (
    <div
      style={{
        opacity: 0.65,
        background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, padding: "1.4rem", display: "flex", flexDirection: "column", gap: "0.85rem",
      }}
    >
      <div className="grid md:grid-cols-[55fr_45fr] gap-8">
        {/* Sparkline */}
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
            Final Trend — YES %
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={CLOSED_DATA} margin={{ top: 6, right: 10, bottom: 6, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fill: "rgba(250,250,250,0.35)" }} axisLine={false} tickLine={false} width={25} />
              <Line
                type="monotone"
                dataKey="yes"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
            The region called it. 67% predicted YES. They were right.
          </p>
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", background: "var(--foreground)", color: "var(--background)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Policy
            </span>
            <span style={{ padding: "3px 8px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 2 }}>
              RESOLVED — YES ▲
            </span>
          </div>

          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.95rem", textTransform: "uppercase", lineHeight: 1.2, color: "var(--foreground)", letterSpacing: "0.02em" }}>
            Will the UAE Introduce a 4-Day Work Week for Government Employees by 2025?
          </p>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
            Resolved: December 2024
          </p>

          {/* Final bars — static */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: "var(--foreground)" }}>Final YES</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: "var(--foreground)" }}>67%</span>
              </div>
              <div className="w-full h-2 rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-2 rounded-sm" style={{ width: "67%", background: "#10B981" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: "var(--foreground)" }}>Final NO</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: "var(--foreground)" }}>33%</span>
              </div>
              <div className="w-full h-2 rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-2 rounded-sm" style={{ width: "33%", background: "rgba(255,255,255,0.15)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function Predictions() {
  return (
    <Layout>
      {/* Section header */}
      <div className="bg-foreground text-background py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            Predictions
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            What Do You Think<br />Actually Happens?
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            Not what should happen. What will.
          </p>
        </div>
      </div>

      {/* Momentum ticker */}
      <MomentumTicker />

      {/* Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured prediction */}
          <div className="mb-4">
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              Featured Prediction
            </p>
          </div>
          <FeaturedPrediction />

          {/* Grid */}
          <div className="mb-4 mt-12">
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              Active Predictions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {GRID_CARDS.map(card => (
              <PredictionGridCard key={card.id} card={card} />
            ))}
          </div>

          {/* Closed predictions */}
          <div className="border-t border-border pt-12">
            <div className="mb-6">
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
                Closed Predictions
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                The region made its call. Here's what happened.
              </p>
            </div>
            <ClosedPredictionCard />
          </div>

        </div>
      </div>
    </Layout>
  )
}
