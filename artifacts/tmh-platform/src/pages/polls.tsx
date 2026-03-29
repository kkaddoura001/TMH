import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { useListPolls, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { PollCard } from "@/components/poll/PollCard";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { usePageConfig } from "@/hooks/use-cms-data";
import { motion, useInView, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const FALLBACK_DEBATE_TICKER = [
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
];

interface PollsConfig {
  hero?: { title?: string; subtitle?: string };
  tickerItems?: Array<{ topic: string; votes: string }>;
  tickerSource?: string;
}

export default function Polls() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || undefined;

  const [filter, setFilter] = useState<"latest" | "trending" | "most_voted">(
    "latest",
  );
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pollsData, isLoading } = useListPolls({
    filter,
    category,
    limit: 50,
  });
  const { data: categoriesData } = useListCategories();
  const { data: config } = usePageConfig<PollsConfig>("polls");

  const filteredPolls = useMemo(() => {
    if (!pollsData?.polls) return [];
    if (!searchQuery.trim()) return pollsData.polls;
    const q = searchQuery.toLowerCase();
    return pollsData.polls.filter(
      (p) =>
        p.question?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (p.tags as string[])?.some((t: string) => t.toLowerCase().includes(q)),
    );
  }, [pollsData?.polls, searchQuery]);

  const tabs = [
    { id: "latest", label: "Latest" },
    { id: "trending", label: "Trending" },
    { id: "most_voted", label: "Most Voted" },
  ] as const;

  const hero = config?.hero;

  const DEBATE_TICKER = useMemo(() => {
    if (pollsData?.polls?.length) {
      return pollsData.polls.slice(0, 10).map((p) => ({
        topic:
          p.question && p.question.length > 25
            ? p.question.substring(0, 23) + "…"
            : (p.question ?? "Debate"),
        votes: (p.totalVotes ?? 0).toLocaleString(),
      }));
    }
    return FALLBACK_DEBATE_TICKER;
  }, [pollsData]);

  const doubled = [...DEBATE_TICKER, ...DEBATE_TICKER];

  return (
    <Layout>
      <div className="bg-foreground text-background border-b border-border">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.68rem",
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              color: "#DC143C",
              marginBottom: "0.5rem",
            }}
          >
            Debates
          </p>
          <motion.h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              textTransform: "uppercase",
              color: "var(--background)",
              letterSpacing: "-0.01em",
              lineHeight: 1.05,
              marginBottom: "0.5rem",
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.1 }}
          >
            {(hero?.title || "What Does the Region\nActually Think?")
              .split("\n")
              .map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
          </motion.h1>
          <p
            className="text-text2/60 pl-2"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
            }}
          >
            {hero?.subtitle ||
              "Not what they say at dinner. What they vote for here."}
          </p>
        </motion.div>

        <div
          style={{
            background: "#0D0D0D",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div className="tmh-ticker-scroll">
            {doubled.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.7rem 2rem",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(250,250,250,0.5)",
                  }}
                >
                  {item.topic}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#fff",
                  }}
                >
                  {item.votes}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: "#DC143C",
                  }}
                >
                  VOTES
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-12">
        <motion.div
          className="lg:w-64 flex-shrink-0 space-y-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.15 }}
        >
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4 border-b border-border pb-2">
              Search
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Topic, keyword, country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary border border-border pl-9 pr-8 py-2.5 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4 border-b border-border pb-2">
              Sort By
            </h3>
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "text-left px-3 py-2 text-xs uppercase tracking-widest font-bold transition-colors",
                    filter === tab.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
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
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All Topics
              </button>
              {categoriesData?.categories?.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "text-left px-3 py-2 text-xs uppercase tracking-widest font-bold transition-colors flex justify-between items-center",
                    category === cat.slug
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-secondary animate-pulse border border-border"
                />
              ))}
            </div>
          ) : filteredPolls.length === 0 ? (
            <motion.div
              className="text-center py-20 border border-border border-dashed bg-secondary/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <h3 className="font-serif font-bold text-2xl uppercase tracking-wider text-foreground mb-2">
                No polls found
              </h3>
              <p className="text-sm text-muted-foreground mb-6 font-sans">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search.`
                  : "Try adjusting your filters to find more discussions."}
              </p>
              <button
                onClick={() => {
                  setFilter("latest");
                  setCategory(undefined);
                  setSearchQuery("");
                }}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-foreground transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <>
              {searchQuery && (
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-serif">
                  {filteredPolls.length} result
                  {filteredPolls.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>
              )}
              <motion.div
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {filteredPolls.map((poll) => (
                  <motion.div key={poll.id} variants={staggerItem}>
                    <PollCard poll={poll} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
