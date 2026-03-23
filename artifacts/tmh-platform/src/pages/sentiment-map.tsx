import { Layout } from "@/components/layout/Layout"

const GLOBAL_TRENDS = [
  {
    trend: "AI & The Future of Work",
    impact: "HIGH",
    impactColor: "#DC143C",
    stat: "63%",
    body: "of MENA professionals believe AI will eliminate their role within 5 years — higher than the global average of 47%.",
    editorial: "While Silicon Valley debates AGI timelines, MENA's workforce is quietly recalibrating. The region's job market hasn't caught up to the anxiety.",
  },
  {
    trend: "De-Dollarization Signals",
    impact: "MONITORING",
    impactColor: "#F59E0B",
    stat: "$1.1T",
    body: "in annual Gulf oil revenues priced in dollars — making the region uniquely exposed to any shift in petrodollar dominance.",
    editorial: "The dollar peg isn't just monetary policy. It's geopolitical positioning. And every BRICS headline makes treasury desks in Riyadh pay attention.",
  },
  {
    trend: "The Global Brain Race",
    impact: "HIGH",
    impactColor: "#DC143C",
    stat: "1 in 3",
    body: "MENA professionals are actively considering emigration — talent is leaving faster than capital is arriving.",
    editorial: "Every Golden Visa issued by Lisbon, Berlin, or Toronto is a quiet referendum on regional opportunity. The diaspora isn't leaving. It already left.",
  },
  {
    trend: "Climate & Energy Transition",
    impact: "CRITICAL",
    impactColor: "#EF4444",
    stat: "2048",
    body: "the year Saudi Arabia's sovereign wealth could be under severe pressure under an aggressive clean energy transition.",
    editorial: "Diversification isn't a strategy anymore. It's a survival clock. And the clock doesn't care about press conferences.",
  },
]

const DATA_DROPS = [
  { stat: "71%", label: "of TMH voters believe Saudi Arabia will fully embrace cinema culture by end of 2026." },
  { stat: "4 min", label: "Average time a TMH user spends on a single poll before casting their vote. They actually read." },
  { stat: "18+", label: "Countries represented in TMH's first 60 days. The diaspora is the loudest room." },
  { stat: "44%", label: "Believe a MENA startup will hit $10B valuation in 2026. Skeptical, but watching." },
  { stat: "80%+", label: "Of votes on controversial polls come in within the first 6 hours. This region reacts." },
  { stat: "29%", label: "Say cannabis will be legalized somewhere in MENA within a decade. Minority, but growing." },
]

const COUNTRY_PULSE = [
  { flag: "🇦🇪", name: "UAE", signal: "Optimistic but calculating", mood: 78, note: "High confidence in economy, hedging on residency alternatives." },
  { flag: "🇸🇦", name: "Saudi Arabia", signal: "Energized, cautiously nationalist", mood: 72, note: "Vision 2030 believers outnumber skeptics 2:1 on the platform." },
  { flag: "🇱🇧", name: "Lebanon", signal: "Fatigued, globally minded", mood: 31, note: "Highest emigration intent of any country in our dataset." },
  { flag: "🇪🇬", name: "Egypt", signal: "Pragmatic, increasingly vocal", mood: 48, note: "Economic anxiety is the primary driver of engagement." },
  { flag: "🇯🇴", name: "Jordan", signal: "Steady, opportunity-seeking", mood: 54, note: "Brain drain is the single most-discussed topic." },
  { flag: "🇶🇦", name: "Qatar", signal: "Confident, post-World Cup momentum", mood: 81, note: "Highest belief in regional soft power potential." },
  { flag: "🇰🇼", name: "Kuwait", signal: "Skeptical, reform-curious", mood: 58, note: "Most likely to engage with political reform debates." },
  { flag: "🇧🇭", name: "Bahrain", signal: "Pragmatic, business-first", mood: 63, note: "Fintech and deregulation are top engagement topics." },
]

const INSIGHT_TICKER = [
  "63% OF MENA PROFESSIONALS WORRY ABOUT AI REPLACING THEIR JOB",
  "BRAIN DRAIN VELOCITY UP 18% YEAR OVER YEAR",
  "SAUDI ENTERTAINMENT SECTOR GREW 340% SINCE 2019",
  "UAE REMAINS #1 DESTINATION FOR INTRA-REGIONAL TALENT MIGRATION",
  "1 IN 4 GULF RESIDENTS PLAN TO RELOCATE WITHIN 3 YEARS",
  "MENA STARTUP FUNDING DOWN 42% FROM 2022 PEAK",
  "ARABIC-LANGUAGE AI TOOLS USAGE UP 215% IN 12 MONTHS",
]

export default function SentimentMap() {
  const doubled = [...INSIGHT_TICKER, ...INSIGHT_TICKER]

  return (
    <Layout>
      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            The Brief
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            How the Region<br />Reads the World.
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            Global trends. Regional impact. The data behind the discourse.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div className="tmh-ticker-scroll">
            {doubled.map((text, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "0.65rem 2.5rem",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(250,250,250,0.6)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
            Trending Signals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GLOBAL_TRENDS.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "1.8rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--foreground)", lineHeight: 1.2 }}>
                    {t.trend}
                  </p>
                  <span style={{ padding: "2px 8px", fontSize: "0.6rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: t.impactColor, border: `1px solid ${t.impactColor}40`, borderRadius: 3, flexShrink: 0 }}>
                    {t.impact}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "0.7rem" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "2.8rem", color: "#DC143C", lineHeight: 1 }}>
                    {t.stat}
                  </span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.5, flex: 1 }}>
                    {t.body}
                  </span>
                </div>

                <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "italic", fontSize: "0.78rem", color: "var(--muted-foreground)", lineHeight: 1.5, borderTop: "1px solid var(--border)", paddingTop: "0.8rem" }}>
                  {t.editorial}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(250,250,250,0.4)", marginBottom: "1.5rem" }}>
            Data Drops
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {DATA_DROPS.map((d, i) => (
              <div key={i} style={{ borderLeft: "3px solid #DC143C", paddingLeft: "1.2rem" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "2.2rem", color: "#DC143C", lineHeight: 1, marginBottom: "0.5rem" }}>
                  {d.stat}
                </div>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", color: "rgba(250,250,250,0.55)", lineHeight: 1.5 }}>
                  {d.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
            Country Pulse
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {COUNTRY_PULSE.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "1.4rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.8rem" }}>{c.flag}</span>
                  <div>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--foreground)" }}>
                      {c.name}
                    </p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.7rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                      {c.signal}
                    </p>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted-foreground)" }}>
                      Mood Index
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", color: c.mood >= 60 ? "#10B981" : c.mood >= 45 ? "#F59E0B" : "#DC143C" }}>
                      {c.mood}/100
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${c.mood}%`, height: "100%", borderRadius: 3, background: c.mood >= 60 ? "#10B981" : c.mood >= 45 ? "#F59E0B" : "#DC143C", transition: "width 1s ease" }} />
                  </div>
                </div>

                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                  {c.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
