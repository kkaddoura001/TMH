import { Router, type IRouter } from "express";
import { db, pollsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const ICON_MAP: Record<string, string> = {
  "arts-expression": "🎨",
  "startups-venture": "🚀",
  "business-startups": "🚀",
  "business": "🚀",
  "work-careers": "💼",
  "cities-lifestyle": "🏙️",
  "cities": "🏙️",
  "technology-ai": "🤖",
  "technology_ai": "🤖",
  "leadership": "🎯",
  "consumer-trends": "📈",
  "culture-identity": "🌍",
  "culture-society": "🌍",
  "culture_society": "🌍",
  "economy-finance": "💰",
  "economy": "💰",
  "women-in-region": "⭐",
  "women-equality": "⭐",
  "women_equality": "⭐",
  "media-influence": "📡",
  "sports-events": "🏆",
  "future-region": "🔮",
  "education-learning": "📚",
  "identity-belonging": "🧭",
  "identity": "🧭",
};

router.get("/categories", async (_req, res) => {
  try {
    // Derive categories dynamically from DB — grouped by category name, summing counts across any slug variants
    const rows = await db
      .select({
        category: pollsTable.category,
        categorySlug: pollsTable.categorySlug,
        count: sql<number>`count(*)`,
      })
      .from(pollsTable)
      .groupBy(pollsTable.category, pollsTable.categorySlug)
      .orderBy(pollsTable.category);

    // Merge slug variants under the same category name, keeping the slug with the most polls
    const nameMap: Record<string, { slug: string; count: number }> = {};
    for (const row of rows) {
      const existing = nameMap[row.category];
      const n = Number(row.count);
      if (!existing || n > existing.count) {
        nameMap[row.category] = { slug: row.categorySlug, count: n };
      }
    }

    const categories = Object.entries(nameMap)
      .map(([name, { slug, count }]) => ({
        name,
        slug,
        icon: ICON_MAP[slug] ?? "📌",
        pollCount: count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/weekly-pulse", async (_req, res) => {
  try {
    const topPolls = await db
      .select()
      .from(pollsTable)
      .orderBy(sql`(SELECT SUM(vote_count) FROM poll_options WHERE poll_id = polls.id) DESC`)
      .limit(4);

    const { db: dbModule, pollOptionsTable } = await import("@workspace/db");
    const topPollsWithOptions = await Promise.all(
      topPolls.map(async (poll) => {
        const options = await dbModule.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));
        const totalVotes = options.reduce((s: number, o: any) => s + o.voteCount, 0);
        return {
          id: poll.id,
          question: poll.question,
          context: poll.context ?? null,
          category: poll.category,
          categorySlug: poll.categorySlug,
          tags: poll.tags ?? [],
          pollType: poll.pollType,
          options: options.map((o: any) => ({
            id: o.id,
            text: o.text,
            voteCount: o.voteCount,
            percentage: totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 1000) / 10 : 0,
          })),
          totalVotes,
          isFeatured: poll.isFeatured,
          isEditorsPick: poll.isEditorsPick,
          createdAt: poll.createdAt.toISOString(),
          endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
          relatedProfileIds: poll.relatedProfileIds ?? [],
        };
      })
    );

    res.json({
      weekLabel: "March 10–16, 2026",
      topPolls: topPollsWithOptions,
      biggestSurprise: "72% of respondents believe AI will replace traditional consulting roles in the region within 5 years — far higher than last month's 51%.",
      stats: [
        { label: "Total Votes Cast", value: "284,391", change: "+23%", sentiment: "positive" },
        { label: "Active Polls", value: "47", change: "+8", sentiment: "positive" },
        { label: "Countries Represented", value: "22", change: "+3", sentiment: "positive" },
        { label: "Most Active Sector", value: "Technology & AI", change: null, sentiment: "neutral" },
      ],
      sectorSentiment: [
        { sector: "Technology & AI", sentiment: 82, label: "Optimistic" },
        { sector: "Startups & Venture", sentiment: 74, label: "Confident" },
        { sector: "Real Estate", sentiment: 61, label: "Cautious" },
        { sector: "Media", sentiment: 55, label: "Mixed" },
        { sector: "Education", sentiment: 68, label: "Hopeful" },
        { sector: "Finance", sentiment: 57, label: "Cautious" },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weekly pulse" });
  }
});

export default router;
