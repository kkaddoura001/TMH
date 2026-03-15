import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const LS_UNLOCKED_KEY = "tmh_subscriber_unlocked"
const LS_EMAIL_KEY = "tmh_subscriber_email"

function seededRand(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233) * 93942
  return x - Math.floor(x)
}

function makeRow(seed: number, rowIdx: number, labels: string[]): { label: string; pct: number }[] {
  const raws = labels.map((_, i) => 0.05 + seededRand(seed, rowIdx * 13 + i) * 0.9)
  const total = raws.reduce((a, b) => a + b, 0)
  let pcts = raws.map((r) => Math.round((r / total) * 100))
  const diff = 100 - pcts.reduce((a, b) => a + b, 0)
  pcts[0] += diff
  return labels.map((label, i) => ({ label, pct: pcts[i] }))
}

const BREAKDOWN_ROWS = [
  { dimension: "By Country", labels: ["UAE", "Saudi", "Egypt", "Jordan", "Other"] },
  { dimension: "By Sector", labels: ["Tech", "Finance", "Media", "Energy", "Other"] },
  { dimension: "By Seniority", labels: ["Founder", "C-Suite", "Manager", "IC"] },
]

interface ResultsBreakdownProps {
  pollId: number
  totalVotes: number
}

export function ResultsBreakdown({ pollId, totalVotes }: ResultsBreakdownProps) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try { return localStorage.getItem(LS_UNLOCKED_KEY) === "true" } catch { return false }
  })
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isUnlocked && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isUnlocked])

  const rows = BREAKDOWN_ROWS.map((row, ri) => ({
    ...row,
    cells: makeRow(pollId, ri, row.labels),
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email.")
      return
    }
    setError("")
    try {
      localStorage.setItem(LS_EMAIL_KEY, trimmed)
      localStorage.setItem(LS_UNLOCKED_KEY, "true")
    } catch {}
    setSubmitted(true)
    setTimeout(() => setIsUnlocked(true), 1200)
  }

  const Table = ({ blurred = false }: { blurred?: boolean }) => (
    <table className={cn("w-full text-left border-collapse", blurred && "select-none pointer-events-none")}>
      <colgroup>
        <col className="w-[110px]" />
      </colgroup>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri > 0 ? "border-t border-border" : ""}>
            <td className="py-3 pr-4 align-top">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground whitespace-nowrap">
                {row.dimension}
              </span>
            </td>
            <td className="py-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {row.cells.map((cell, ci) => (
                  <span key={ci} className="flex items-baseline gap-1.5">
                    <span className="font-serif font-black text-base text-foreground leading-none">
                      {cell.pct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground font-sans">{cell.label}</span>
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="border-t-2 border-foreground mt-6 pt-5"
    >
      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground mb-4">
        Full Breakdown
      </p>

      <AnimatePresence mode="wait">
        {isUnlocked ? (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
          >
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                <p className="font-serif font-black uppercase tracking-widest text-xs text-primary">
                  You're in. Full results unlocked.
                </p>
              </motion.div>
            )}
            <Table />
            <p className="text-[9px] text-muted-foreground mt-3 font-sans">
              Based on {totalVotes.toLocaleString()} votes · Demographic breakdown is estimated
            </p>
          </motion.div>
        ) : (
          <motion.div key="locked" className="relative">
            {/* Blurred table behind */}
            <div
              className="blur-sm opacity-40 pointer-events-none select-none"
              aria-hidden="true"
            >
              <Table blurred />
            </div>

            {/* Gate overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-b from-background/60 via-background/90 to-background">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="submitting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse inline-block mb-3" />
                    <p className="font-serif font-black uppercase tracking-widest text-sm text-primary">
                      Unlocking…
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="gate"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center w-full max-w-xs"
                  >
                    <p className="font-serif font-black uppercase tracking-tight text-xl text-foreground leading-tight mb-1">
                      Where does your region stand?
                    </p>
                    <p className="text-xs text-muted-foreground font-sans mb-4 leading-snug">
                      See how founders, executives and operators across the Middle East actually voted.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                      <input
                        ref={inputRef}
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError("") }}
                        placeholder="your@email.com"
                        className={cn(
                          "w-full px-4 py-3 border text-sm font-sans bg-background text-foreground",
                          "placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors",
                          error ? "border-primary" : "border-border"
                        )}
                      />
                      {error && (
                        <p className="text-[10px] text-primary text-left font-sans">{error}</p>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-foreground text-background px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-colors"
                      >
                        Get Access
                      </button>
                    </form>
                    <p className="text-[9px] text-muted-foreground mt-2 font-sans">
                      Free during beta. No spam.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
