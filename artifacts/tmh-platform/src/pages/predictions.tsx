import { useState, useEffect, useRef, useMemo } from "react"
import { Layout } from "@/components/layout/Layout"
import { Search, X, Share2, CheckCircle2 } from "lucide-react"
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

import { PREDICTIONS as FALLBACK_PREDICTIONS, PREDICTION_CATEGORIES as FALLBACK_CATEGORIES, PREDICTIONS_TICKER as FALLBACK_TICKER, type PredictionCard } from "@/data/predictions-data"
import { usePredictions, type ApiPrediction } from "@/hooks/use-cms-data"

function apiToPredictionCard(p: ApiPrediction): PredictionCard {
  return {
    id: p.id,
    category: p.category,
    resolves: p.resolvesAt ?? "TBD",
    question: p.question,
    count: p.totalCount.toLocaleString(),
    yes: p.yesPercentage,
    no: p.noPercentage,
    momentum: p.momentum,
    up: p.momentumDirection === "up",
    data: p.trendData?.length ? p.trendData : Array.from({ length: 12 }, () => p.yesPercentage),
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const FALLBACK_TICKER_DATA = FALLBACK_TICKER


const CLOSED_RAW = [55, 58, 60, 62, 63, 65, 67, 67, 67, 80]
const CLOSED_DATA = CLOSED_RAW.map((yes, i) => ({ week: i + 1, yes }))

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

function FeaturedTooltip({ active, payload, label, chartData }: any) {
  if (!active || !payload?.length) return null
  const curr = payload[0]?.value
  const data = chartData || []
  const prevIdx = data.findIndex((d: any) => d.month === label)
  const prevVal = prevIdx > 0 ? data[prevIdx - 1].yes : curr
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
  const color = up ? "#10B981" : "#DC143C"
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
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "#10B981" }}>YES</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "#10B981" }}>{yes}%</span>
        </div>
        <div className={`w-full ${h} rounded-sm overflow-hidden`} style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className={`${h} rounded-sm transition-all duration-1000`}
            style={{ width: animated ? `${yes}%` : "0%", background: "#10B981" }}
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
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "#DC143C" }}>NO</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: compact ? 12 : 13, textTransform: "uppercase", color: "#DC143C" }}>{no}%</span>
        </div>
        <div className={`w-full ${h} rounded-sm overflow-hidden`} style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className={`${h} rounded-sm transition-all duration-1000`}
            style={{ width: animated ? `${no}%` : "0%", background: "rgba(220,20,60,0.5)" }}
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

async function predCopyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true } catch {}
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.cssText = "position:fixed;top:-9999px;opacity:0"
    document.body.appendChild(ta); ta.focus(); ta.select()
    const ok = document.execCommand("copy"); document.body.removeChild(ta)
    return ok
  } catch { return false }
}

function PredShareBtn({ question }: { question: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? `${window.location.origin}/predictions` : "/predictions"

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (navigator.share) {
      try { await navigator.share({ url, title: question }); return } catch (err) { if ((err as Error).name === "AbortError") return }
    }
    const ok = await predCopyText(url)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <button onClick={handleShare} title="Share" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: copied ? "#10B981" : "rgba(250,250,250,0.4)", transition: "color 0.15s" }}>
      {copied ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
    </button>
  )
}

function VoteButtons({ height = 52, locked = false, predId }: { height?: number; locked?: boolean; predId?: number }) {
  const storageKey = predId != null ? `tmh_pred_${predId}` : null
  const [voted, setVoted] = useState<"yes" | "no" | null>(() => {
    if (typeof window === "undefined" || !storageKey) return null
    return localStorage.getItem(storageKey) as "yes" | "no" | null
  })
  if (locked) return null
  const handleVote = (choice: "yes" | "no") => {
    if (voted) return
    setVoted(choice)
    if (storageKey) localStorage.setItem(storageKey, choice)
    if (predId != null) {
      let token = localStorage.getItem("tmh_voter_token")
      if (!token) { token = crypto.randomUUID(); localStorage.setItem("tmh_voter_token", token) }
      fetch(`/api/predictions/${predId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, voterToken: token }),
      }).catch(() => {})
    }
  }
  return (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      <button
        onClick={() => handleVote("yes")}
        style={{
          flex: 1, height, border: `1.5px solid #10B981`,
          background: voted === "yes" ? "#10B981" : "transparent",
          color: voted === "yes" ? "#fff" : "#10B981",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: voted ? "default" : "pointer", transition: "all 0.15s", borderRadius: 4,
        }}
      >
        {voted === "yes" ? "✓ YES — LOCKED" : "YES"}
      </button>
      <button
        onClick={() => handleVote("no")}
        style={{
          flex: 1, height, border: `1.5px solid #DC143C`,
          background: voted === "no" ? "#DC143C" : "transparent",
          color: voted === "no" ? "#fff" : "#DC143C",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: voted ? "default" : "pointer", transition: "all 0.15s", borderRadius: 4,
        }}
      >
        {voted === "no" ? "✓ NO — LOCKED" : "NO"}
      </button>
    </div>
  )
}

// ─── MOMENTUM TICKER ─────────────────────────────────────────────────────────

function MomentumTicker({ tickerData }: { tickerData: typeof FALLBACK_TICKER_DATA }) {
  const doubled = [...tickerData, ...tickerData]
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

function FeaturedPrediction({ card }: { card: PredictionCard }) {
  const featuredData = useMemo(() => {
    return card.data.map((yes, i) => {
      const slice = card.data.slice(Math.max(0, i - 2), i + 1)
      const ma = slice.reduce((s, v) => s + v, 0) / slice.length
      return { month: MONTHS[i % 12], yes, ma: Math.round(ma * 10) / 10 }
    })
  }, [card.data])

  const lastVal = featuredData[featuredData.length - 1]?.yes ?? 0
  const prevVal = featuredData.length >= 2 ? featuredData[featuredData.length - 2].yes : lastVal
  const month30Change = lastVal - prevVal

  return (
    <div
      style={{
        background: "var(--card)", border: "1.5px solid rgba(16,185,129,0.2)",
        borderRadius: 12, padding: "2rem", marginBottom: "2rem",
      }}
    >
      <div className="grid md:grid-cols-[55fr_45fr] gap-8">
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
            Confidence Over Time — YES %
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={featuredData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tickCount={6} tick={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fill: "rgba(250,250,250,0.4)" }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fill: "rgba(250,250,250,0.4)" }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} width={30} />
              <Tooltip content={<FeaturedTooltip chartData={featuredData} />} cursor={{ stroke: "rgba(16,185,129,0.4)", strokeWidth: 1 }} />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: "Tipping Point", position: "right", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fill: "rgba(255,255,255,0.35)" }} />
              <Area type="monotone" dataKey="yes" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.6)" strokeWidth={1.5} dot={false} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
              <Line type="monotone" dataKey="ma" stroke="#10B981" strokeWidth={1} dot={false} isAnimationActive={true} animationDuration={1400} animationEasing="ease-out" />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.8rem", color: month30Change >= 0 ? "#10B981" : "#DC143C", marginTop: "0.5rem" }}>
            Confidence has moved {month30Change >= 0 ? "+" : ""}{month30Change}% in the last 30 days
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", background: "var(--foreground)", color: "var(--background)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              {card.category}
            </span>
            <span style={{ padding: "2px 8px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#F59E0B", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 2 }}>
              Resolves: {card.resolves}
            </span>
          </div>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.78rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
            The region has spoken on the debate. Now they're putting their prediction on it.
          </p>

          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", textTransform: "uppercase", lineHeight: 1.2, color: "var(--foreground)", letterSpacing: "0.02em" }}>
            {card.question}
          </p>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            {card.count} predictions locked in
          </p>

          <ConfidenceBars yes={card.yes} no={card.no} up={card.up} momentum={card.momentum} compact={false} />

          <VoteButtons height={52} predId={card.id} />

          <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
            Your prediction is locked until the resolution date. No changing your mind.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── PREDICTION GRID CARD ────────────────────────────────────────────────────

function PredictionGridCard({ card }: { card: PredictionCard }) {
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ padding: "2px 7px", background: "var(--foreground)", color: "var(--background)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>
          {card.category}
        </span>
        <span style={{ padding: "2px 7px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#F59E0B", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 2 }}>
          Resolves: {card.resolves}
        </span>
        <PredShareBtn question={card.question} />
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
      <VoteButtons height={44} predId={card.id} />

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
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [visibleCount, setVisibleCount] = useState(20)

  const { data: apiData, isLoading } = usePredictions()

  const PREDICTIONS: PredictionCard[] = useMemo(() => {
    if (apiData?.items?.length) return apiData.items.map(apiToPredictionCard)
    return FALLBACK_PREDICTIONS
  }, [apiData])

  const PREDICTION_CATEGORIES = useMemo(() => {
    if (apiData?.items?.length) {
      const cats = [...new Set(apiData.items.map(p => p.category))]
      return cats.sort()
    }
    return FALLBACK_CATEGORIES
  }, [apiData])

  const tickerData = useMemo(() => {
    if (apiData?.items?.length) {
      return apiData.items.slice(0, 12).map(p => ({
        label: p.question.length > 40 ? p.question.substring(0, 38) + "…" : p.question,
        yes: p.yesPercentage,
        delta: p.momentum,
        up: p.momentumDirection === "up",
      }))
    }
    return FALLBACK_TICKER_DATA
  }, [apiData])

  const filteredCards = useMemo(() => {
    let result = PREDICTIONS
    if (activeCategory !== "ALL") {
      result = result.filter(c => c.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.question.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.resolves.toLowerCase().includes(q)
      )
    }
    return result
  }, [searchQuery, activeCategory, PREDICTIONS])

  const isFiltering = searchQuery || activeCategory !== "ALL"

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
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.65)" }}>
            {PREDICTIONS.length} predictions across {PREDICTION_CATEGORIES.length} categories. Not what should happen. What will.
          </p>
          <div className="mt-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(250,250,250,0.4)" }} />
            <input
              type="text"
              placeholder="Search predictions..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(20) }}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                padding: "10px 36px 10px 36px", fontSize: "0.8rem", fontFamily: "DM Sans, sans-serif",
                color: "#fff", outline: "none",
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(250,250,250,0.5)" }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#0D0D0D", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0.65rem 0", display: "flex", alignItems: "center", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
          <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{PREDICTIONS.length}</span> Predictions
        </span>
        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
          <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{PREDICTION_CATEGORIES.length}</span> Categories
        </span>
        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
          <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>19</span> Countries
        </span>
      </div>

      {/* Momentum ticker */}
      <MomentumTicker tickerData={tickerData} />

      {/* Category filter */}
      <div style={{ background: "var(--background)", borderBottom: "1px solid var(--border)", padding: "1rem 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => { setActiveCategory("ALL"); setVisibleCount(20) }}
              style={{
                padding: "5px 14px",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.1em",
                background: activeCategory === "ALL" ? "#DC143C" : "transparent",
                color: activeCategory === "ALL" ? "#fff" : "var(--muted-foreground)",
                border: activeCategory === "ALL" ? "1px solid #DC143C" : "1px solid var(--border)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              All ({PREDICTIONS.length})
            </button>
            {PREDICTION_CATEGORIES.map(cat => {
              const count = PREDICTIONS.filter(p => p.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(20) }}
                  style={{
                    padding: "5px 14px",
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    background: activeCategory === cat ? "#DC143C" : "transparent",
                    color: activeCategory === cat ? "#fff" : "var(--muted-foreground)",
                    border: activeCategory === cat ? "1px solid #DC143C" : "1px solid var(--border)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured prediction */}
          {!isFiltering && PREDICTIONS.length > 0 && (
            <>
              <div className="mb-4">
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                  Featured Prediction
                </p>
              </div>
              <FeaturedPrediction card={PREDICTIONS[0]} />
            </>
          )}

          {/* Grid */}
          <div className="mb-4 mt-12">
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              {isFiltering
                ? `${filteredCards.length} prediction${filteredCards.length !== 1 ? 's' : ''}${searchQuery ? ` for "${searchQuery}"` : ''}${activeCategory !== "ALL" ? ` in ${activeCategory}` : ''}`
                : `Active Predictions (${PREDICTIONS.length})${isLoading ? " — loading…" : ""}`}
            </p>
          </div>
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 border border-border border-dashed" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase", color: "var(--foreground)", marginBottom: 8 }}>No predictions found</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: 16 }}>
                Try a different search or category.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("ALL") }}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#DC143C", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {filteredCards.slice(0, visibleCount).map(card => (
                  <PredictionGridCard key={card.id} card={card} />
                ))}
              </div>
              {visibleCount < filteredCards.length && (
                <div className="text-center mb-16">
                  <button
                    onClick={() => setVisibleCount(v => v + 20)}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.78rem",
                      textTransform: "uppercase", letterSpacing: "0.15em", color: "#DC143C",
                      background: "none", border: "1px solid rgba(220,20,60,0.3)", padding: "12px 32px",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    Load More ({filteredCards.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {!isFiltering && (
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
          )}

        </div>
      </div>
    </Layout>
  )
}
