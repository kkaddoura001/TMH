import { useState, useMemo } from "react"
import { useListProfiles } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

function VoicesTicker({ profiles }: { profiles: Array<{ name: string; company?: string | null; quote: string }> }) {
  const quotesWithNames = profiles
    .filter(p => p.quote && p.quote.length > 10 && p.quote.length < 120)
    .map(p => ({
      name: p.name.split(" ")[0].toUpperCase(),
      company: p.company || "",
      quote: p.quote.replace(/^["']|["']$/g, ""),
    }))

  if (quotesWithNames.length === 0) return null

  const tickerText = quotesWithNames
    .map(q => `"${q.quote}" — ${q.name}${q.company ? `, ${q.company}` : ""}`)
    .join("    ·    ")

  return (
    <div style={{
      background: "rgba(220,20,60,0.06)",
      borderTop: "1px solid rgba(220,20,60,0.12)",
      borderBottom: "1px solid rgba(220,20,60,0.12)",
      height: 38,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{
        flexShrink: 0,
        background: "#DC143C",
        padding: "3px 10px",
        marginLeft: 8,
        marginRight: 12,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#fff",
        zIndex: 2,
      }}>
        WISDOM
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <span
          className="tmh-ticker-scroll"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.03em",
            color: "rgba(255,255,255,0.65)",
            paddingLeft: 8,
          }}
        >
          <span>{tickerText}</span>
          <span style={{ marginLeft: 40 }}>{tickerText}</span>
        </span>
      </div>
    </div>
  )
}

export default function Profiles() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<'all' | 'featured' | 'newest' | 'most_viewed'>('all')
  const [country, setCountry] = useState("all")

  const { data, isLoading } = useListProfiles({ search, filter, limit: 200 })

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
            The Voices
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            Meet the People<br />Moving This Region.
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            Founders. Operators. Changemakers. Finally counted.
          </p>
        </div>

        {data?.profiles && <VoicesTicker profiles={data.profiles} />}

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
