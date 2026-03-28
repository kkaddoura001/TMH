import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { db, pollsTable, pollOptionsTable, votesTable, profilesTable, newsletterSubscribersTable, pollSnapshotsTable } from "@workspace/db";
import { eq, desc, sql, and, inArray, asc } from "drizzle-orm";

const router: IRouter = Router();

const voteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // max 60 votes per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many votes from this IP, please try again later" },
});

async function getCountryFromIp(_ip: string): Promise<{ code: string; name: string } | null> {
  return null;
}

function getClientIp(req: any): string {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const ips = (typeof xff === "string" ? xff : xff[0]).split(",");
    return ips[0].trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "";
}

async function enrichWithProfiles(profileIds: number[]) {
  if (!profileIds || profileIds.length === 0) return [];
  const rows = await db
    .select({ id: profilesTable.id, name: profilesTable.name, role: profilesTable.role, company: profilesTable.company, isVerified: profilesTable.isVerified })
    .from(profilesTable)
    .where(inArray(profilesTable.id, profileIds))
    .limit(3);
  return rows.map((p) => ({ id: p.id, name: p.name, role: p.role, company: p.company ?? null, isVerified: p.isVerified }));
}

async function toPollResponse(poll: any, options: any[]) {
  const totalVotes = options.reduce((s: number, o: any) => s + o.voteCount, 0);
  const relatedProfileIds: number[] = poll.relatedProfileIds ?? [];
  const relatedProfiles = await enrichWithProfiles(relatedProfileIds.slice(0, 3));
  return {
    id: poll.id,
    question: poll.question,
    context: poll.context ?? null,
    category: poll.category,
    categorySlug: poll.categorySlug,
    tags: poll.tags ?? [],
    pollType: poll.pollType,
    options: options.map((o) => ({
      id: o.id,
      text: o.text,
      voteCount: o.voteCount,
      percentage: totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 1000) / 10 : 0,
    })),
    totalVotes,
    isFeatured: poll.isFeatured,
    isEditorsPick: poll.isEditorsPick,
    createdAt: poll.createdAt?.toISOString() ?? new Date().toISOString(),
    endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
    relatedProfileIds,
    relatedProfiles,
  };
}

router.get("/polls", async (req, res) => {
  try {
    const { filter, category, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit) || 20, 50);
    const off = parseInt(offset) || 0;

    // Resolve slug → canonical category name to handle duplicate slug variants in DB
    let categoryName: string | null = null;
    if (category) {
      const catRow = await db.select({ category: pollsTable.category })
        .from(pollsTable)
        .where(eq(pollsTable.categorySlug, category))
        .limit(1);
      categoryName = catRow[0]?.category ?? null;
    }

    const approvedFilter = eq(pollsTable.editorialStatus, "approved");

    let baseWhere: any = approvedFilter;
    if (categoryName) {
      baseWhere = and(approvedFilter, eq(pollsTable.category, categoryName));
    }

    let polls;
    if (filter === "trending" || filter === "most_voted") {
      polls = await db.select().from(pollsTable).where(baseWhere).orderBy(desc(sql`(SELECT SUM(vote_count) FROM poll_options WHERE poll_id = polls.id)`)).limit(lim).offset(off);
    } else if (filter === "editors_picks") {
      const whereClause = categoryName
        ? and(eq(pollsTable.isEditorsPick, true), eq(pollsTable.category, categoryName), approvedFilter)
        : and(eq(pollsTable.isEditorsPick, true), approvedFilter);
      polls = await db.select().from(pollsTable).where(whereClause).orderBy(desc(pollsTable.createdAt)).limit(lim).offset(off);
    } else if (filter === "ending_soon") {
      polls = await db.select().from(pollsTable).where(baseWhere).orderBy(pollsTable.endsAt).limit(lim).offset(off);
    } else {
      polls = await db.select().from(pollsTable).where(baseWhere).orderBy(desc(pollsTable.createdAt)).limit(lim).offset(off);
    }

    const result = await Promise.all(
      polls.map(async (poll: any) => {
        const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));
        return await toPollResponse(poll, options);
      })
    );

    const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(pollsTable).where(eq(pollsTable.editorialStatus, "approved"));
    return res.json({ polls: result, total: Number(countRow.count) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch polls" });
  }
});

router.get("/polls/featured", async (_req, res) => {
  try {
    const [poll] = await db.select().from(pollsTable).where(and(eq(pollsTable.isFeatured, true), eq(pollsTable.editorialStatus, "approved"))).orderBy(desc(pollsTable.createdAt)).limit(1);
    if (!poll) {
      const [fallback] = await db.select().from(pollsTable).where(eq(pollsTable.editorialStatus, "approved")).orderBy(desc(pollsTable.createdAt)).limit(1);
      if (!fallback) return res.status(404).json({ error: "No polls found" });
      const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, fallback.id));
      return res.json(await toPollResponse(fallback, options));
    }
    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));
    return res.json(await toPollResponse(poll, options));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch featured poll" });
  }
});

router.get("/polls/:id/breakdown", async (req, res) => {
  try {
    const pollId = parseInt(req.params.id as string);
    const rows = await db
      .select({
        countryCode: votesTable.countryCode,
        countryName: votesTable.countryName,
        count: sql<number>`count(*)::int`,
      })
      .from(votesTable)
      .where(and(eq(votesTable.pollId, pollId), sql`country_code IS NOT NULL`))
      .groupBy(votesTable.countryCode, votesTable.countryName)
      .orderBy(desc(sql`count(*)`))
      .limit(8);

    if (rows.length === 0) {
      return res.json({ countries: [], total: 0 });
    }

    const countryTopOptions: Record<string, string> = {};
    for (const row of rows) {
      if (!row.countryCode) continue;
      const topOption = await db
        .select({ text: pollOptionsTable.text })
        .from(votesTable)
        .innerJoin(pollOptionsTable, eq(votesTable.optionId, pollOptionsTable.id))
        .where(and(eq(votesTable.pollId, pollId), eq(votesTable.countryCode, row.countryCode)))
        .groupBy(pollOptionsTable.id, pollOptionsTable.text)
        .orderBy(desc(sql`count(*)`))
        .limit(1);
      if (topOption.length > 0) countryTopOptions[row.countryCode] = topOption[0].text;
    }

    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const countries = rows.map((r) => ({
      code: r.countryCode!,
      name: r.countryName ?? r.countryCode!,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
      topOptionText: r.countryCode ? (countryTopOptions[r.countryCode] ?? null) : null,
    }));

    return res.json({ countries, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ countries: [], total: 0 });
  }
});

router.get("/polls/:id/trends", async (req, res) => {
  try {
    const pollId = parseInt(req.params.id as string);

    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, pollId));
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
    const optionMap = new Map(options.map(o => [o.id, o.text]));

    const snapshots = await db
      .select()
      .from(pollSnapshotsTable)
      .where(eq(pollSnapshotsTable.pollId, pollId))
      .orderBy(asc(pollSnapshotsTable.snapshotDate));

    const grouped = new Map<string, { date: string; series: { optionId: number; optionText: string; percentage: number }[] }>();
    for (const snap of snapshots) {
      const dateKey = snap.snapshotDate.toISOString().slice(0, 10);
      if (!grouped.has(dateKey)) grouped.set(dateKey, { date: dateKey, series: [] });
      grouped.get(dateKey)!.series.push({
        optionId: snap.optionId,
        optionText: optionMap.get(snap.optionId) ?? "",
        percentage: snap.percentage,
      });
    }

    const dataPoints = Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
    return res.json({ pollId, question: poll.question, dataPoints });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch trends" });
  }
});

router.get("/polls/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [poll] = await db.select().from(pollsTable).where(and(eq(pollsTable.id, id), eq(pollsTable.editorialStatus, "approved")));
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, id));
    return res.json(await toPollResponse(poll, options));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch poll" });
  }
});

router.post("/polls/:id/vote", voteRateLimit, async (req, res) => {
  try {
    const pollId = parseInt(req.params.id as string);
    const { optionId, voterToken } = req.body;

    if (!optionId || !voterToken) {
      return res.status(400).json({ error: "optionId and voterToken are required" });
    }

    const existing = await db
      .select()
      .from(votesTable)
      .where(and(eq(votesTable.pollId, pollId), eq(votesTable.voterToken, voterToken)));

    if (existing.length > 0) {
      const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
      const total = options.reduce((s: number, o: any) => s + o.voteCount, 0);
      return res.json({
        success: false,
        alreadyVoted: true,
        options: options.map((o) => ({
          id: o.id,
          text: o.text,
          voteCount: o.voteCount,
          percentage: total > 0 ? Math.round((o.voteCount / total) * 1000) / 10 : 0,
        })),
        totalVotes: total,
      });
    }

    const ip = getClientIp(req);
    const geoData = await getCountryFromIp(ip);

    const inserted = await db.insert(votesTable).values({
      pollId,
      optionId,
      voterToken,
      countryCode: geoData?.code ?? null,
      countryName: geoData?.name ?? null,
    }).onConflictDoNothing().returning({ id: votesTable.id });

    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
    const total = options.reduce((s: number, o: any) => s + o.voteCount, 0);

    // Race condition: another vote slipped in between our pre-check and insert
    if (!inserted.length) {
      return res.json({
        success: false,
        alreadyVoted: true,
        options: options.map((o) => ({
          id: o.id,
          text: o.text,
          voteCount: o.voteCount,
          percentage: total > 0 ? Math.round((o.voteCount / total) * 1000) / 10 : 0,
        })),
        totalVotes: total,
      });
    }

    await db
      .update(pollOptionsTable)
      .set({ voteCount: sql`vote_count + 1` })
      .where(eq(pollOptionsTable.id, optionId));

    const updatedOptions = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
    const updatedTotal = updatedOptions.reduce((s: number, o: any) => s + o.voteCount, 0);

    return res.json({
      success: true,
      alreadyVoted: false,
      country: geoData ?? null,
      options: updatedOptions.map((o) => ({
        id: o.id,
        text: o.text,
        voteCount: o.voteCount,
        percentage: updatedTotal > 0 ? Math.round((o.voteCount / updatedTotal) * 1000) / 10 : 0,
      })),
      totalVotes: updatedTotal,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to record vote" });
  }
});

router.post("/polls/:id/email-unlock", async (req, res) => {
  try {
    const pollId = parseInt(req.params.id as string);
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    const ip = getClientIp(req);
    const geoData = await getCountryFromIp(ip);
    await db.insert(newsletterSubscribersTable).values({
      email: email.toLowerCase().trim(),
      source: "share_gate",
      pollId,
      countryCode: geoData?.code ?? null,
    }).onConflictDoNothing();
    console.log(`[NEWSLETTER] New subscriber: ${email} (poll ${pollId}, ${geoData?.name ?? "unknown"})`);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.json({ success: true });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [[pollsRow], [votesRow], [countriesRow], [activeRow]] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(pollsTable),
      db.select({ total: sql<number>`COALESCE(SUM(vote_count)::int, 0)` }).from(pollOptionsTable),
      db.select({ count: sql<number>`count(distinct country_code)::int` }).from(votesTable).where(sql`country_code IS NOT NULL`),
      db.select({ count: sql<number>`count(distinct voter_token)::int` }).from(votesTable).where(sql`created_at > now() - interval '7 days'`),
    ]);
    return res.json({
      livePolls: Number(pollsRow.count),
      totalVotes: Number(votesRow.total),
      countries: Number(countriesRow.count),
      activeThisWeek: Number(activeRow.count),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ livePolls: 0, totalVotes: 0, countries: 0, activeThisWeek: 0 });
  }
});

router.get("/activity", async (_req, res) => {
  try {
    const rows = await db
      .select({
        countryCode: votesTable.countryCode,
        countryName: votesTable.countryName,
        createdAt: votesTable.createdAt,
        question: pollsTable.question,
        pollId: votesTable.pollId,
      })
      .from(votesTable)
      .innerJoin(pollsTable, eq(votesTable.pollId, pollsTable.id))
      .where(and(sql`${votesTable.countryCode} IS NOT NULL`, eq(pollsTable.editorialStatus, "approved")))
      .orderBy(desc(votesTable.createdAt))
      .limit(10);
    return res.json({
      activity: rows.map((r) => ({
        countryCode: r.countryCode,
        countryName: r.countryName,
        pollId: r.pollId,
        questionSnippet: r.question.length > 55 ? r.question.slice(0, 52) + "…" : r.question,
        secondsAgo: Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 1000),
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ activity: [] });
  }
});

router.get("/stats/countries", async (_req, res) => {
  try {
    const rows = await db
      .select({
        countryCode: votesTable.countryCode,
        countryName: votesTable.countryName,
        count: sql<number>`count(*)::int`,
      })
      .from(votesTable)
      .where(sql`country_code IS NOT NULL`)
      .groupBy(votesTable.countryCode, votesTable.countryName)
      .orderBy(desc(sql`count(*)`))
      .limit(12);

    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const countries = rows.map((r) => ({
      code: r.countryCode!,
      name: r.countryName ?? r.countryCode!,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));

    return res.json({ countries, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ countries: [], total: 0 });
  }
});

export default router;
