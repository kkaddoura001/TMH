import { useState, useMemo } from "react"
import { useListProfiles } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Search, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "wouter"
import { usePageConfig } from "@/hooks/use-cms-data"

const FALLBACK_IMPACT_STATEMENTS: Record<string, string> = {
  "Kitopi": "Scaled cloud kitchens across 5 countries — redefining how the region eats",
  "Replit": "Made coding accessible to millions worldwide — democratizing software creation",
  "Sarwa": "AED 10B+ in trading volume — making investing accessible to every Arab",
  "CoinMENA": "Opened crypto access for Arabs — building financial freedom across MENA",
  "Washmen": "Disrupted laundry in the Gulf — and cancelled a sponsorship over Gaza",
  "Deliveroo": "Built Deliveroo MENA from zero to millions of orders",
  "Binance FZE (Dubai)": "Leading Binance Dubai — reshaping how money moves in the Middle East",
  "MUNCH:ON (acquired by Careem)": "Built MUNCH:ON and sold it to Careem — solving corporate lunch with tech",
  "Plug and Play": "Championing Arab and African startup ecosystems from the ground up",
  "Brookings Institution / AGFE": "A Palestinian refugee who built pathways to education where none existed",
  "Fiker Institute": "Building the Arab world's first serious geopolitical think tank",
  "Sharjah Entrepreneurship Center (Sheraa)": "Turned Sharjah into a startup powerhouse — empowering the next generation",
  "MSA Capital / MSA Novo": "One of MENA's most active emerging market VC funds — transforming obstacles into opportunity",
  "Arzan Venture Capital": "Dentist turned VC — 9 exits and counting, now building again in stealth",
  "Saudi Exchange": "Helping build one of the world's fastest-growing capital markets",
  "The Tribunal": "Building the region's opinion layer — where MENA's voice gets counted",
  "Tuhoon / Wamda Capital": "Tackling the mental health crisis no one talks about in MENA",
  "Revolut UAE": "Founded Souqalmal, now leading Revolut UAE — making finance transparent for Arabs",
}

function VoicesTicker({ profiles, impactStatements }: { profiles: Array<{ name: string; company?: string | null; quote: string; impactStatement?: string | null }>; impactStatements: Record<string, string> }) {
  const items = profiles
    .filter(p => p.company && p.name)
    .map(p => {
      const impact = p.impactStatement || impactStatements[p.company || ""]
      const statement = impact || (p.quote && p.quote.length > 10 && p.quote.length < 80 ? `"${p.quote.replace(/^["']|["']$/g, "")}"` : null)
      if (!statement) return null
      return { name: p.name.split(" ")[0].toUpperCase(), company: p.company!, statement }
    })
    .filter((x): x is { name: string; company: string; statement: string } => x !== null)

  if (items.length === 0) return null

  const doubled = [...items, ...items]

  return (
    <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div className="tmh-ticker-scroll-slow">
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
              {item.name}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff", whiteSpace: "nowrap" }}>
              {item.company}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#DC143C", whiteSpace: "nowrap" }}>
              {item.statement}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Profiles() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<'all' | 'featured' | 'newest' | 'most_viewed'>('all')
  const [country, setCountry] = useState("all")

  const { data, isLoading } = useListProfiles({ search, filter, limit: 200 })
  const { data: pageConfig } = usePageConfig<{ impactStatements?: Record<string, string> }>("profiles")

  const IMPACT_STATEMENTS = useMemo(() => {
    if (pageConfig?.impactStatements && Object.keys(pageConfig.impactStatements).length > 0) {
      return pageConfig.impactStatements
    }
    return FALLBACK_IMPACT_STATEMENTS
  }, [pageConfig])

  const countries = useMemo(() => {
    if (!data?.profiles) return []
    const set = new Set(data.profiles.map(p => p.country).filter(Boolean))
    return Array.from(set).sort()
  }, [data?.profiles])

  const filtered = useMemo(() => {
    if (!data?.profiles) return []
    if (country === "all") return data.profiles
    return data.profiles.filter(p => p.country === country)
  }, [data?.profiles, country])

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Most Relevant' },
    { id: 'most_viewed', label: 'Most Viewed' },
    { id: 'newest', label: 'Newly Added' },
  ] as const

  return (
    <Layout>
      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            Voices
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            Meet the People<br />Moving This Region.
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.65)" }}>
            Founders. Operators. Changemakers. Finally counted.
          </p>
          <Link
            href="/majlis"
            className="inline-flex items-center gap-2 mt-4 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-2.5 hover:bg-primary/90 transition-colors font-serif"
          >
            <Lock className="w-3.5 h-3.5" />
            Enter The Majlis
          </Link>
        </div>

        {data?.profiles && <VoicesTicker profiles={data.profiles} impactStatements={IMPACT_STATEMENTS} />}

        <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0.65rem 0", display: "flex", alignItems: "center", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{data?.profiles?.length ?? "—"}</span> Voices
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{countries.length || "—"}</span> Countries
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>1</span> Region
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search by name, company, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background border border-border focus:outline-none focus:border-foreground text-foreground transition-all text-base font-medium font-sans"
            />
          </div>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="px-4 py-4 bg-background border border-border text-foreground font-sans text-sm focus:outline-none focus:border-foreground"
          >
            <option value="all">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-2 mb-10 flex-wrap">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors border",
                filter === f.id
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-border hover:text-foreground hover:border-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-secondary animate-pulse border border-border" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-border border-dashed bg-secondary/30">
            <h3 className="font-serif font-bold text-xl uppercase tracking-wider text-foreground mb-2">No profiles found</h3>
            <p className="text-sm text-muted-foreground font-sans">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
