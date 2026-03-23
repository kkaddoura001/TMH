import { useState } from "react"
import { useLocation } from "wouter"
import { useListPolls, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { cn } from "@/lib/utils"

const DEBATE_TICKER = [
  { topic: "Brain Drain", votes: "18,421" },
  { topic: "AI & Jobs", votes: "12,847" },
  { topic: "Gender Leadership", votes: "9,203" },
  { topic: "Income Tax UAE", votes: "15,609" },
  { topic: "Vision 2030", votes: "11,002" },
  { topic: "Arab Identity", votes: "8,441" },
  { topic: "Expat Rights", votes: "7,810" },
  { topic: "Cannabis Reform", votes: "6,290" },
  { topic: "Arranged Marriage", votes: "5,433" },
  { topic: "Gulf Wealth Gap", votes: "10,117" },
]

export default function Polls() {
  const [location] = useLocation()
  const searchParams = new URLSearchParams(window.location.search)
  const initialCategory = searchParams.get('category') || undefined
  
  const [filter, setFilter] = useState<'latest' | 'trending' | 'most_voted'>('latest')
  const [category, setCategory] = useState<string | undefined>(initialCategory)

  const { data: pollsData, isLoading } = useListPolls({ filter, category, limit: 20 })
  const { data: categoriesData } = useListCategories()

  const tabs = [
    { id: 'latest', label: 'Latest' },
    { id: 'trending', label: 'Trending' },
    { id: 'most_voted', label: 'Most Voted' }
  ] as const

  const doubled = [...DEBATE_TICKER, ...DEBATE_TICKER]

  return (
    <Layout>
      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            Debates
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            What Does the Region<br />Actually Think?
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            Not what they say at dinner. What they vote for here.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
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
                  {item.topic}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#fff" }}>
                  {item.votes}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", color: "#DC143C" }}>
                  VOTES
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-64 flex-shrink-0 space-y-12">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4 border-b border-border pb-2">
              Sort By
            </h3>
            <div className="flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "text-left px-3 py-2 text-xs uppercase tracking-widest font-bold transition-colors",
                    filter === tab.id 
                      ? "bg-foreground text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4 border-b border-border pb-2">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCategory(undefined)}
                className={cn(
                  "text-left px-3 py-2 text-xs uppercase tracking-widest font-bold transition-colors flex justify-between",
                  !category 
                    ? "bg-foreground text-background" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Topics
              </button>
              {categoriesData?.categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "text-left px-3 py-2 text-xs uppercase tracking-widest font-bold transition-colors flex justify-between items-center",
                    category === cat.slug 
                      ? "bg-foreground text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[1,2,3,4].map(i => <div key={i} className="h-80 bg-secondary animate-pulse border border-border" />)}
            </div>
          ) : pollsData?.polls.length === 0 ? (
            <div className="text-center py-20 border border-border border-dashed bg-secondary/30">
              <h3 className="font-serif font-bold text-2xl uppercase tracking-wider text-foreground mb-2">No polls found</h3>
              <p className="text-sm text-muted-foreground mb-6 font-sans">Try adjusting your filters to find more discussions.</p>
              <button 
                onClick={() => { setFilter('latest'); setCategory(undefined); }}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-foreground transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {pollsData?.polls.map(poll => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
