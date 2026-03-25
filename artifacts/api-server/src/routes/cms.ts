import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db, pollsTable, pollOptionsTable, votesTable, newsletterSubscribersTable, hustlerApplicationsTable, profilesTable } from "@workspace/db";
import { eq, desc, sql, count, like, or, inArray, and, asc } from "drizzle-orm";

const router = Router();

const CMS_USERNAME = process.env.CMS_USERNAME ?? "admin";
const CMS_PIN = process.env.CMS_PIN ?? "1234";

const sessions = new Map<string, { username: string; createdAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const VALID_STATUSES = new Set(["draft", "in_review", "approved", "rejected", "revision", "flagged", "archived"]);

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["in_review", "approved", "rejected"],
  in_review: ["approved", "rejected", "draft"],
  approved: ["flagged", "archived", "draft"],
  rejected: ["revision", "draft"],
  revision: ["in_review", "approved", "draft"],
  flagged: ["approved", "archived"],
  archived: ["approved", "draft"],
};

function isValidStatusTransition(from: string | null, to: string): boolean {
  if (!from) return VALID_STATUSES.has(to);
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

function requireCmsAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-cms-token"] as string;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const session = sessions.get(token)!;
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  next();
}

interface HomepageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  textColor: string;
  enabled: boolean;
  position: string;
}

interface HomepageConfig {
  masthead: {
    title: string;
    subtitle: string;
    showPopulationCounter: boolean;
    issueLabel: string;
  };
  ticker: {
    enabled: boolean;
    speed: string;
    items: { topic: string; votes: string }[];
  };
  sections: HomepageSection[];
  banners: HomepageBanner[];
  newsletter: {
    heading: string;
    subheading: string;
    buttonText: string;
    enabled: boolean;
  };
}

interface MockPrediction {
  id: number;
  question: string;
  category: string;
  categorySlug: string;
  resolvesAt: string | null;
  yesPercentage: number;
  noPercentage: number;
  totalCount: number;
  momentum: number;
  momentumDirection: string;
  trendData: number[];
  cardLayout: string;
  editorialStatus: string;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

let nextPredictionId = 100;

const mockPredictions: MockPrediction[] = [
  { id: 1, question: "Will Saudi Arabia's NEOM project meet its 2030 deadline?", category: "Megaprojects", categorySlug: "megaprojects", resolvesAt: "2030-12-31T00:00:00Z", yesPercentage: 22, noPercentage: 78, totalCount: 8420, momentum: 3.2, momentumDirection: "down", trendData: [35, 32, 28, 25, 22], cardLayout: "featured", editorialStatus: "approved", isFeatured: true, tags: ["saudi", "neom", "vision-2030"], createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, question: "Will Dubai overtake Singapore as the world's top fintech hub by 2027?", category: "Finance", categorySlug: "finance", resolvesAt: "2027-06-30T00:00:00Z", yesPercentage: 61, noPercentage: 39, totalCount: 5230, momentum: 5.1, momentumDirection: "up", trendData: [45, 52, 55, 58, 61], cardLayout: "grid", editorialStatus: "approved", isFeatured: true, tags: ["dubai", "fintech"], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, question: "Will a MENA-based unicorn IPO on NASDAQ in 2026?", category: "Startups", categorySlug: "startups", resolvesAt: "2026-12-31T00:00:00Z", yesPercentage: 45, noPercentage: 55, totalCount: 3100, momentum: 1.8, momentumDirection: "up", trendData: [38, 40, 42, 44, 45], cardLayout: "grid", editorialStatus: "draft", isFeatured: false, tags: ["ipo", "unicorn"], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, question: "Will remote work become the default in Gulf tech companies?", category: "Technology & AI", categorySlug: "technology-ai", resolvesAt: "2027-01-01T00:00:00Z", yesPercentage: 33, noPercentage: 67, totalCount: 2750, momentum: -2.1, momentumDirection: "down", trendData: [42, 38, 35, 34, 33], cardLayout: "compact", editorialStatus: "in_review", isFeatured: false, tags: ["remote-work", "gulf"], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
];

router.post("/cms/auth/login", (req, res) => {
  const { username, pin } = req.body;
  if (username === CMS_USERNAME && pin === CMS_PIN) {
    const token = generateToken();
    sessions.set(token, { username, createdAt: Date.now() });
    return res.json({ token, username });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

router.post("/cms/auth/verify", requireCmsAuth, (_req, res) => {
  return res.json({ valid: true });
});

router.get("/cms/stats", requireCmsAuth, async (_req, res) => {
  try {
    const debateStatusCounts = await db
      .select({ status: pollsTable.editorialStatus, count: count() })
      .from(pollsTable)
      .groupBy(pollsTable.editorialStatus);

    const debateStats = {
      total: debateStatusCounts.reduce((s, r) => s + r.count, 0),
      drafts: debateStatusCounts.find(r => r.status === "draft")?.count ?? 0,
      live: debateStatusCounts.find(r => r.status === "approved")?.count ?? 0,
      flagged: debateStatusCounts.find(r => r.status === "flagged")?.count ?? 0,
      inReview: debateStatusCounts.find(r => r.status === "in_review")?.count ?? 0,
      archived: debateStatusCounts.find(r => r.status === "archived")?.count ?? 0,
    };

    const [profileCountResult] = await db.select({ count: count() }).from(profilesTable);
    const voiceStats = {
      total: profileCountResult.count,
      drafts: 0,
      live: profileCountResult.count,
      flagged: 0,
      inReview: 0,
      archived: 0,
    };

    const predCountByStatus = (status: string) => mockPredictions.filter(p => p.editorialStatus === status).length;
    const predStats = {
      total: mockPredictions.length,
      drafts: predCountByStatus("draft"),
      live: predCountByStatus("approved"),
      flagged: predCountByStatus("flagged"),
      inReview: predCountByStatus("in_review"),
      archived: predCountByStatus("archived"),
    };

    const recentDebates = await db
      .select({ id: pollsTable.id, question: pollsTable.question, editorialStatus: pollsTable.editorialStatus, createdAt: pollsTable.createdAt })
      .from(pollsTable)
      .orderBy(desc(pollsTable.createdAt))
      .limit(10);

    const recentActivity = [
      ...recentDebates.map(d => ({ type: "debate" as const, id: d.id, title: d.question, status: d.editorialStatus, updatedAt: d.createdAt?.toISOString() ?? new Date().toISOString() })),
      ...mockPredictions.map(p => ({ type: "prediction" as const, id: p.id, title: p.question, status: p.editorialStatus, updatedAt: p.updatedAt })),
    ].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()).slice(0, 10);

    return res.json({
      debates: debateStats,
      predictions: predStats,
      voices: voiceStats,
      recentActivity,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ error: "Stats failed" });
  }
});

router.get("/cms/taxonomy", requireCmsAuth, async (_req, res) => {
  try {
    const dbCategories = await db
      .select({ category: pollsTable.category })
      .from(pollsTable)
      .groupBy(pollsTable.category);

    const dbSectors = await db
      .select({ sector: profilesTable.sector })
      .from(profilesTable)
      .groupBy(profilesTable.sector);

    const dbCountries = await db
      .select({ country: profilesTable.country })
      .from(profilesTable)
      .groupBy(profilesTable.country);

    const dbCities = await db
      .select({ city: profilesTable.city })
      .from(profilesTable)
      .groupBy(profilesTable.city);

    const dbTags = await db
      .select({ tags: pollsTable.tags })
      .from(pollsTable);

    const allDbTags = new Set<string>();
    for (const row of dbTags) {
      if (Array.isArray(row.tags)) {
        for (const t of row.tags) {
          if (typeof t === "string" && t.trim()) allDbTags.add(t.trim().toLowerCase());
        }
      }
    }

    const debateCategories = [...new Set([
      ...dbCategories.map(r => r.category),
      "Technology & AI", "Politics", "Economy", "Finance", "Startups", "Society", "Lifestyle", "Culture", "Energy", "Climate", "Diplomacy", "Healthcare", "Education", "Real Estate",
    ])].sort();

    const predictionCategories = [...new Set([
      ...mockPredictions.map(p => p.category),
      "Megaprojects", "Energy", "Business", "Technology", "Politics", "Markets", "Geopolitics", "Sports", "Climate",
    ])].sort();

    return res.json({
      debateCategories,
      predictionCategories,
      tags: [...allDbTags].sort(),
      sectors: [...new Set([...dbSectors.map(r => r.sector), "Technology", "Finance", "Healthcare", "Education", "Energy", "Real Estate", "Logistics", "Media", "Climate Tech", "E-commerce", "Agriculture", "Manufacturing", "Consulting", "Legal"])].sort(),
      countries: [...new Set([...dbCountries.map(r => r.country), "Saudi Arabia", "UAE", "Egypt", "Jordan", "Bahrain", "Kuwait", "Oman", "Qatar", "Lebanon", "Morocco", "Tunisia", "Iraq", "Turkey", "Iran"])].sort(),
      cities: [...new Set([...dbCities.map(r => r.city), "Dubai", "Riyadh", "Jeddah", "Abu Dhabi", "Cairo", "Amman", "Manama", "Doha", "Kuwait City", "Muscat", "Beirut", "Casablanca", "Istanbul", "Tehran"])].sort(),
    });
  } catch (err) {
    console.error("Taxonomy error:", err);
    return res.status(500).json({ error: "Taxonomy failed" });
  }
});

router.get("/cms/debates", requireCmsAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const whereClause = (status && status !== "all") ? eq(pollsTable.editorialStatus, status) : undefined;

    const polls = await db
      .select()
      .from(pollsTable)
      .where(whereClause)
      .orderBy(desc(pollsTable.createdAt));

    const pollIds = polls.map(p => p.id);
    let optionsMap: Record<number, { id: number; pollId: number; text: string; voteCount: number }[]> = {};

    if (pollIds.length > 0) {
      const allOptions = await db
        .select()
        .from(pollOptionsTable)
        .where(inArray(pollOptionsTable.pollId, pollIds));

      for (const opt of allOptions) {
        if (!optionsMap[opt.pollId]) optionsMap[opt.pollId] = [];
        optionsMap[opt.pollId].push(opt);
      }
    }

    const items = polls.map(p => ({
      id: p.id,
      question: p.question,
      context: p.context,
      category: p.category,
      categorySlug: p.categorySlug,
      tags: p.tags ?? [],
      pollType: p.pollType,
      cardLayout: "standard",
      isFeatured: p.isFeatured,
      isEditorsPick: p.isEditorsPick,
      editorialStatus: p.editorialStatus,
      endsAt: p.endsAt?.toISOString() ?? null,
      createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
      relatedProfileIds: p.relatedProfileIds ?? [],
      options: optionsMap[p.id] ?? [],
      totalVotes: (optionsMap[p.id] ?? []).reduce((s, o) => s + o.voteCount, 0),
    }));

    return res.json({ items });
  } catch (err) {
    console.error("Debates list error:", err);
    return res.status(500).json({ error: "Failed to fetch debates" });
  }
});

router.get("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  try {
    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, Number(req.params.id)));
    if (!poll) return res.status(404).json({ error: "Not found" });

    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));

    return res.json({
      id: poll.id,
      question: poll.question,
      context: poll.context,
      category: poll.category,
      categorySlug: poll.categorySlug,
      tags: poll.tags ?? [],
      pollType: poll.pollType,
      cardLayout: "standard",
      isFeatured: poll.isFeatured,
      isEditorsPick: poll.isEditorsPick,
      editorialStatus: poll.editorialStatus,
      endsAt: poll.endsAt?.toISOString() ?? null,
      createdAt: poll.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: poll.createdAt?.toISOString() ?? new Date().toISOString(),
      relatedProfileIds: poll.relatedProfileIds ?? [],
      options,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch debate" });
  }
});

router.put("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  try {
    const pollId = Number(req.params.id);
    const [existing] = await db.select().from(pollsTable).where(eq(pollsTable.id, pollId));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { options, cardLayout, updatedAt, totalVotes, ...data } = req.body;

    if (data.editorialStatus && VALID_STATUSES.has(data.editorialStatus)) {
      if (!isValidStatusTransition(existing.editorialStatus, data.editorialStatus)) {
        return res.status(400).json({ error: `Cannot transition from '${existing.editorialStatus}' to '${data.editorialStatus}'` });
      }
    }

    const updateFields: Record<string, unknown> = {};
    if (data.question !== undefined) updateFields.question = data.question;
    if (data.context !== undefined) updateFields.context = data.context;
    if (data.category !== undefined) updateFields.category = data.category;
    if (data.categorySlug !== undefined) updateFields.categorySlug = data.categorySlug;
    if (data.tags !== undefined) updateFields.tags = data.tags;
    if (data.pollType !== undefined) updateFields.pollType = data.pollType;
    if (data.isFeatured !== undefined) updateFields.isFeatured = data.isFeatured;
    if (data.isEditorsPick !== undefined) updateFields.isEditorsPick = data.isEditorsPick;
    if (data.editorialStatus !== undefined) updateFields.editorialStatus = data.editorialStatus;
    if (data.endsAt !== undefined) updateFields.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (data.relatedProfileIds !== undefined) updateFields.relatedProfileIds = data.relatedProfileIds;

    if (Object.keys(updateFields).length > 0) {
      await db.update(pollsTable).set(updateFields).where(eq(pollsTable.id, pollId));
    }

    if (options && Array.isArray(options)) {
      await db.delete(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
      for (const opt of options) {
        await db.insert(pollOptionsTable).values({
          pollId,
          text: typeof opt === "string" ? opt : opt.text,
          voteCount: opt.voteCount ?? 0,
        });
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Update debate error:", err);
    return res.status(500).json({ error: "Failed to update debate" });
  }
});

router.delete("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  try {
    const pollId = Number(req.params.id);
    await db.delete(votesTable).where(eq(votesTable.pollId, pollId));
    await db.delete(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
    await db.delete(pollsTable).where(eq(pollsTable.id, pollId));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete debate" });
  }
});

router.get("/cms/predictions", requireCmsAuth, async (req, res) => {
  const status = req.query.status as string | undefined;
  const items = (status && status !== "all")
    ? mockPredictions.filter(p => p.editorialStatus === status)
    : mockPredictions;
  return res.json({ items: items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) });
});

router.get("/cms/predictions/:id", requireCmsAuth, async (req, res) => {
  const item = mockPredictions.find(p => p.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

router.put("/cms/predictions/:id", requireCmsAuth, async (req, res) => {
  const idx = mockPredictions.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  if (req.body.editorialStatus && VALID_STATUSES.has(req.body.editorialStatus)) {
    if (!isValidStatusTransition(mockPredictions[idx].editorialStatus, req.body.editorialStatus)) {
      return res.status(400).json({ error: `Cannot transition from '${mockPredictions[idx].editorialStatus}' to '${req.body.editorialStatus}'` });
    }
  }
  Object.assign(mockPredictions[idx], req.body, { updatedAt: new Date().toISOString() });
  return res.json({ success: true });
});

router.delete("/cms/predictions/:id", requireCmsAuth, async (req, res) => {
  const idx = mockPredictions.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  mockPredictions.splice(idx, 1);
  return res.json({ success: true });
});

router.get("/cms/voices", requireCmsAuth, async (req, res) => {
  try {
    const profiles = await db
      .select()
      .from(profilesTable)
      .orderBy(desc(profilesTable.createdAt));

    const items = profiles.map(p => ({
      id: p.id,
      name: p.name,
      headline: p.headline,
      role: p.role,
      company: p.company,
      companyUrl: p.companyUrl,
      sector: p.sector,
      country: p.country,
      city: p.city,
      imageUrl: p.imageUrl,
      summary: p.summary,
      story: p.story,
      lessonsLearned: p.lessonsLearned ?? [],
      quote: p.quote,
      isFeatured: p.isFeatured,
      isVerified: p.isVerified,
      viewCount: p.viewCount,
      associatedPollCount: p.associatedPollCount,
      editorialStatus: "approved",
      createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
    }));

    return res.json({ items });
  } catch (err) {
    console.error("Voices list error:", err);
    return res.status(500).json({ error: "Failed to fetch voices" });
  }
});

router.get("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, Number(req.params.id)));
    if (!profile) return res.status(404).json({ error: "Not found" });

    return res.json({
      id: profile.id,
      name: profile.name,
      headline: profile.headline,
      role: profile.role,
      company: profile.company,
      companyUrl: profile.companyUrl,
      sector: profile.sector,
      country: profile.country,
      city: profile.city,
      imageUrl: profile.imageUrl,
      summary: profile.summary,
      story: profile.story,
      lessonsLearned: profile.lessonsLearned ?? [],
      quote: profile.quote,
      isFeatured: profile.isFeatured,
      isVerified: profile.isVerified,
      viewCount: profile.viewCount,
      associatedPollCount: profile.associatedPollCount,
      editorialStatus: "approved",
      createdAt: profile.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: profile.createdAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch voice" });
  }
});

router.put("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  try {
    const profileId = Number(req.params.id);
    const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { editorialStatus, updatedAt, viewCount, associatedPollCount, ...data } = req.body;

    const updateFields: Record<string, unknown> = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.headline !== undefined) updateFields.headline = data.headline;
    if (data.role !== undefined) updateFields.role = data.role;
    if (data.company !== undefined) updateFields.company = data.company;
    if (data.companyUrl !== undefined) updateFields.companyUrl = data.companyUrl;
    if (data.sector !== undefined) updateFields.sector = data.sector;
    if (data.country !== undefined) updateFields.country = data.country;
    if (data.city !== undefined) updateFields.city = data.city;
    if (data.imageUrl !== undefined) updateFields.imageUrl = data.imageUrl;
    if (data.summary !== undefined) updateFields.summary = data.summary;
    if (data.story !== undefined) updateFields.story = data.story;
    if (data.lessonsLearned !== undefined) updateFields.lessonsLearned = data.lessonsLearned;
    if (data.quote !== undefined) updateFields.quote = data.quote;
    if (data.isFeatured !== undefined) updateFields.isFeatured = data.isFeatured;
    if (data.isVerified !== undefined) updateFields.isVerified = data.isVerified;

    if (Object.keys(updateFields).length > 0) {
      await db.update(profilesTable).set(updateFields).where(eq(profilesTable.id, profileId));
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Update voice error:", err);
    return res.status(500).json({ error: "Failed to update voice" });
  }
});

router.delete("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete voice" });
  }
});

router.post("/cms/:type/:id/status", requireCmsAuth, async (req, res) => {
  const { type, id } = req.params;
  const { action } = req.body;

  const validTransitions: Record<string, Record<string, string>> = {
    approve: { draft: "approved", in_review: "approved", revision: "approved" },
    reject: { in_review: "rejected", draft: "rejected" },
    review: { draft: "in_review", revision: "in_review" },
    revision: { rejected: "revision" },
    flag: { approved: "flagged" },
    archive: { approved: "archived", flagged: "archived" },
    unflag: { flagged: "approved" },
    unarchive: { archived: "approved" },
    unpublish: { approved: "draft" },
  };

  if (!action || !validTransitions[action]) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const numId = Number(id);

  try {
    if (type === "debates") {
      const [poll] = await db.select({ editorialStatus: pollsTable.editorialStatus }).from(pollsTable).where(eq(pollsTable.id, numId));
      if (!poll) return res.status(404).json({ error: "Not found" });
      const newStatus = validTransitions[action][poll.editorialStatus];
      if (!newStatus) return res.status(400).json({ error: `Cannot ${action} from status '${poll.editorialStatus}'` });
      await db.update(pollsTable).set({ editorialStatus: newStatus }).where(eq(pollsTable.id, numId));
      return res.json({ success: true, newStatus });
    } else if (type === "predictions") {
      const item = mockPredictions.find(p => p.id === numId);
      if (!item) return res.status(404).json({ error: "Not found" });
      const newStatus = validTransitions[action][item.editorialStatus];
      if (!newStatus) return res.status(400).json({ error: `Cannot ${action} from status '${item.editorialStatus}'` });
      item.editorialStatus = newStatus;
      item.updatedAt = new Date().toISOString();
      return res.json({ success: true, newStatus });
    } else if (type === "voices") {
      return res.json({ success: true, newStatus: "approved" });
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Status update failed" });
  }
});

router.post("/cms/:type/bulk-action", requireCmsAuth, async (req, res) => {
  const { type } = req.params;
  const { ids, action } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  try {
    if (action === "delete") {
      if (type === "debates") {
        for (const id of ids) {
          await db.delete(votesTable).where(eq(votesTable.pollId, id));
          await db.delete(pollOptionsTable).where(eq(pollOptionsTable.pollId, id));
          await db.delete(pollsTable).where(eq(pollsTable.id, id));
        }
      } else if (type === "predictions") {
        ids.forEach(id => { const idx = mockPredictions.findIndex(p => p.id === id); if (idx !== -1) mockPredictions.splice(idx, 1); });
      } else if (type === "voices") {
        for (const id of ids) {
          await db.delete(profilesTable).where(eq(profilesTable.id, id));
        }
      } else {
        return res.status(400).json({ error: "Invalid type" });
      }
      return res.json({ success: true, deleted: ids.length });
    }

    const statusMap: Record<string, string> = {
      approve: "approved", reject: "rejected", flag: "flagged", archive: "archived",
      unflag: "approved", unarchive: "approved", unpublish: "draft", revision: "revision",
    };

    const newStatus = statusMap[action];
    if (!newStatus) return res.status(400).json({ error: "Invalid action" });

    if (type === "debates") {
      await db.update(pollsTable).set({ editorialStatus: newStatus }).where(inArray(pollsTable.id, ids));
    } else if (type === "predictions") {
      ids.forEach(id => {
        const item = mockPredictions.find(i => i.id === id);
        if (item) { item.editorialStatus = newStatus; item.updatedAt = new Date().toISOString(); }
      });
    } else if (type === "voices") {
      return res.json({ success: true, updated: ids.length });
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    return res.json({ success: true, updated: ids.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Bulk action failed" });
  }
});

router.post("/cms/upload/:type", requireCmsAuth, async (req, res) => {
  const { type } = req.params;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "items array is required" });
  }

  try {
    if (type === "debates") {
      let created = 0;
      for (const item of items) {
        const [poll] = await db.insert(pollsTable).values({
          question: item.question,
          context: item.context ?? null,
          category: item.category,
          categorySlug: item.categorySlug ?? item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tags: item.tags ?? [],
          pollType: item.pollType ?? "binary",
          isFeatured: item.isFeatured ?? false,
          isEditorsPick: item.isEditorsPick ?? false,
          editorialStatus: item.editorialStatus ?? "draft",
          endsAt: item.endsAt ? new Date(item.endsAt) : null,
          relatedProfileIds: item.relatedProfileIds ?? [],
        }).returning();

        if (item.options && Array.isArray(item.options)) {
          for (const opt of item.options) {
            await db.insert(pollOptionsTable).values({
              pollId: poll.id,
              text: typeof opt === "string" ? opt : opt.text,
              voteCount: 0,
            });
          }
        }
        created++;
      }
      return res.json({ success: true, created });
    }

    if (type === "predictions") {
      const created = items.map((item: any) => {
        const prediction: MockPrediction = {
          id: nextPredictionId++,
          question: item.question,
          category: item.category,
          categorySlug: item.categorySlug ?? item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          resolvesAt: item.resolvesAt ?? null,
          yesPercentage: item.yesPercentage ?? 50,
          noPercentage: item.noPercentage ?? 50,
          totalCount: item.totalCount ?? 0,
          momentum: item.momentum ?? 0,
          momentumDirection: item.momentumDirection ?? "up",
          trendData: item.trendData ?? [],
          cardLayout: item.cardLayout ?? "grid",
          editorialStatus: item.editorialStatus ?? "draft",
          isFeatured: item.isFeatured ?? false,
          tags: item.tags ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockPredictions.push(prediction);
        return prediction;
      });
      return res.json({ success: true, created: created.length });
    }

    if (type === "voices") {
      let created = 0;
      for (const item of items) {
        await db.insert(profilesTable).values({
          name: item.name,
          headline: item.headline,
          role: item.role,
          company: item.company ?? null,
          companyUrl: item.companyUrl ?? null,
          sector: item.sector,
          country: item.country,
          city: item.city,
          imageUrl: item.imageUrl ?? null,
          summary: item.summary,
          story: item.story,
          lessonsLearned: item.lessonsLearned ?? [],
          quote: item.quote,
          isFeatured: item.isFeatured ?? false,
          isVerified: item.isVerified ?? false,
        });
        created++;
      }
      return res.json({ success: true, created });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

const uploadsDir = path.resolve("/home/runner/workspace/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/cms/upload-image", requireCmsAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }
  const url = `/api/cms/uploads/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});

router.get("/cms/uploads/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadsDir, filename);
  if (!filePath.startsWith(uploadsDir) || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  return res.sendFile(filePath);
});

const homepageConfig: HomepageConfig = {
  masthead: {
    title: "The Tribunal.",
    subtitle: "by The Middle East Hustle",
    showPopulationCounter: true,
    issueLabel: "EST. 2026 · ISSUE NO. 001",
  },
  ticker: {
    enabled: true,
    speed: "normal",
    items: [
      { topic: "New Debate Every 24 Hours", votes: "—" },
      { topic: "The Middle East Unfiltered", votes: "—" },
    ],
  },
  sections: [
    { id: "lead-debate", type: "lead_debate", title: "Today's Lead Debate", enabled: true, order: 1, config: { showSidebar: true, showOpinionBubbles: true } },
    { id: "weekly-debates", type: "debate_grid", title: "This Week's Debates", enabled: true, order: 2, config: { maxItems: 4, layout: "grid-2col", firstSpanFull: true } },
    { id: "predictions", type: "predictions", title: "What Do You Think Actually Happens?", enabled: true, order: 3, config: { maxItems: 4, layout: "grid-2col" } },
    { id: "voices", type: "voices", title: "The Voices", enabled: true, order: 4, config: { maxItems: 8, layout: "grid-4col" } },
    { id: "topics", type: "explore_topics", title: "Explore Topics", enabled: true, order: 5, config: {} },
    { id: "live-activity", type: "live_activity", title: "Live Activity", enabled: true, order: 6, config: {} },
    { id: "newsletter", type: "newsletter_cta", title: "Newsletter CTA", enabled: true, order: 7, config: {} },
  ],
  banners: [
    { id: "launch-banner", title: "The Tribunal is Live", subtitle: "The Middle East's first opinion platform — powered by the people.", ctaText: "Start Voting", ctaLink: "/polls", bgColor: "#DC143C", textColor: "#FFFFFF", enabled: true, position: "top" },
    { id: "ramadan-banner", title: "Ramadan Special", subtitle: "How is the region celebrating this year? Share your perspective.", ctaText: "Join the Debate", ctaLink: "/polls?category=culture", bgColor: "#1A1A2E", textColor: "#F5F5DC", enabled: false, position: "middle" },
    { id: "newsletter-promo", title: "Get the Weekly Digest", subtitle: "The hottest debates, predictions, and voices — every Friday.", ctaText: "Subscribe", ctaLink: "#newsletter", bgColor: "#0D0D0D", textColor: "#FFFFFF", enabled: true, position: "bottom" },
  ],
  newsletter: {
    heading: "The Region's Opinion. Unfiltered.",
    subheading: "The questions no one else asks. The data no one else collects.",
    buttonText: "Join The Hustle",
    enabled: true,
  },
};

router.get("/cms/homepage", requireCmsAuth, (_req, res) => {
  return res.json(homepageConfig);
});

router.put("/cms/homepage", requireCmsAuth, (req, res) => {
  const { masthead, ticker, sections, banners, newsletter } = req.body;
  if (masthead) Object.assign(homepageConfig.masthead, masthead);
  if (ticker) Object.assign(homepageConfig.ticker, ticker);
  if (sections) homepageConfig.sections = sections;
  if (banners) homepageConfig.banners = banners;
  if (newsletter) Object.assign(homepageConfig.newsletter, newsletter);
  return res.json({ success: true, config: homepageConfig });
});

router.post("/cms/homepage/banners", requireCmsAuth, (req, res) => {
  const banner: HomepageBanner = {
    id: `banner-${Date.now()}`,
    title: req.body.title || "New Banner",
    subtitle: req.body.subtitle || "",
    ctaText: req.body.ctaText || "Learn More",
    ctaLink: req.body.ctaLink || "/",
    bgColor: req.body.bgColor || "#DC143C",
    textColor: req.body.textColor || "#FFFFFF",
    enabled: req.body.enabled ?? true,
    position: req.body.position || "top",
  };
  homepageConfig.banners.push(banner);
  return res.json({ success: true, banner });
});

router.delete("/cms/homepage/banners/:id", requireCmsAuth, (req, res) => {
  const idx = homepageConfig.banners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Banner not found" });
  homepageConfig.banners.splice(idx, 1);
  return res.json({ success: true });
});

router.get("/cms/subscribers", requireCmsAuth, async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    let whereClause;
    if (search) {
      whereClause = like(newsletterSubscribersTable.email, `%${search}%`);
    }

    const [items, totalResult] = await Promise.all([
      db.select().from(newsletterSubscribersTable)
        .where(whereClause)
        .orderBy(desc(newsletterSubscribersTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(newsletterSubscribersTable).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    const sourceStats = await db
      .select({ source: newsletterSubscribersTable.source, count: count() })
      .from(newsletterSubscribersTable)
      .groupBy(newsletterSubscribersTable.source);

    return res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit), sourceStats });
  } catch (err) {
    console.error("Subscribers error:", err);
    return res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

router.delete("/cms/subscribers/:id", requireCmsAuth, async (req, res) => {
  try {
    await db.delete(newsletterSubscribersTable).where(eq(newsletterSubscribersTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete subscriber" });
  }
});

router.get("/cms/subscribers/export", requireCmsAuth, async (_req, res) => {
  try {
    const items = await db.select().from(newsletterSubscribersTable).orderBy(desc(newsletterSubscribersTable.createdAt));
    const csv = ["email,source,country_code,created_at", ...items.map(i => `${i.email},${i.source},${i.countryCode || ""},${i.createdAt}`)].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=subscribers.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to export" });
  }
});

router.get("/cms/applications", requireCmsAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(hustlerApplicationsTable.editorialStatus, status));
    }
    if (search) {
      conditions.push(or(
        like(hustlerApplicationsTable.name, `%${search}%`),
        like(hustlerApplicationsTable.email, `%${search}%`),
        like(hustlerApplicationsTable.company, `%${search}%`)
      ));
    }

    const whereClause = conditions.length > 0
      ? conditions.length === 1 ? conditions[0] : and(...conditions)
      : undefined;

    const [items, totalResult] = await Promise.all([
      db.select().from(hustlerApplicationsTable)
        .where(whereClause)
        .orderBy(desc(hustlerApplicationsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(hustlerApplicationsTable).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    const statusCounts = await db
      .select({ status: hustlerApplicationsTable.editorialStatus, count: count() })
      .from(hustlerApplicationsTable)
      .groupBy(hustlerApplicationsTable.editorialStatus);

    return res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit), statusCounts });
  } catch (err) {
    console.error("Applications error:", err);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.get("/cms/applications/:id", requireCmsAuth, async (req, res) => {
  try {
    const [item] = await db.select().from(hustlerApplicationsTable).where(eq(hustlerApplicationsTable.id, Number(req.params.id)));
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch application" });
  }
});

router.patch("/cms/applications/:id", requireCmsAuth, async (req, res) => {
  try {
    const { editorialStatus, editorNotes } = req.body;
    const updates: Record<string, unknown> = {};
    if (editorialStatus) updates.editorialStatus = editorialStatus;
    if (editorNotes !== undefined) updates.editorNotes = editorNotes;
    if (editorialStatus && editorialStatus !== "pending") updates.reviewedAt = new Date();

    await db.update(hustlerApplicationsTable).set(updates).where(eq(hustlerApplicationsTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update application" });
  }
});

router.get("/cms/analytics", requireCmsAuth, async (_req, res) => {
  try {
    const [totalVotesResult] = await db.select({ count: count() }).from(votesTable);
    const [totalPollsResult] = await db.select({ count: count() }).from(pollsTable);
    const [totalProfilesResult] = await db.select({ count: count() }).from(profilesTable);
    const [totalSubscribersResult] = await db.select({ count: count() }).from(newsletterSubscribersTable);
    const [totalApplicationsResult] = await db.select({ count: count() }).from(hustlerApplicationsTable);

    const votesByCategory = await db
      .select({ category: pollsTable.category, count: count() })
      .from(votesTable)
      .innerJoin(pollsTable, eq(votesTable.pollId, pollsTable.id))
      .groupBy(pollsTable.category)
      .orderBy(desc(count()));

    const topPolls = await db
      .select({
        id: pollsTable.id,
        question: pollsTable.question,
        category: pollsTable.category,
        totalVotes: sql<number>`COALESCE(SUM(${pollOptionsTable.voteCount}), 0)`.as("total_votes"),
      })
      .from(pollsTable)
      .leftJoin(pollOptionsTable, eq(pollsTable.id, pollOptionsTable.pollId))
      .groupBy(pollsTable.id, pollsTable.question, pollsTable.category)
      .orderBy(desc(sql`total_votes`))
      .limit(10);

    const recentVotes = await db
      .select({
        date: sql<string>`DATE(${votesTable.createdAt})`.as("date"),
        count: count(),
      })
      .from(votesTable)
      .groupBy(sql`DATE(${votesTable.createdAt})`)
      .orderBy(desc(sql`DATE(${votesTable.createdAt})`))
      .limit(14);

    const votesByCountry = await db
      .select({ country: votesTable.countryName, count: count() })
      .from(votesTable)
      .where(sql`${votesTable.countryName} IS NOT NULL`)
      .groupBy(votesTable.countryName)
      .orderBy(desc(count()))
      .limit(15);

    return res.json({
      overview: {
        totalVotes: totalVotesResult.count,
        totalPolls: totalPollsResult.count,
        totalProfiles: totalProfilesResult.count,
        totalSubscribers: totalSubscribersResult.count,
        totalApplications: totalApplicationsResult.count,
      },
      votesByCategory,
      topPolls,
      recentVotes: recentVotes.reverse(),
      votesByCountry,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

const pageConfigs: Record<string, unknown> = {
  about: {
    hero: {
      tagline: "Est. 2026 · Founded by Kareem Kaddoura",
      title: "The Region's First Collective Mirror",
      subtitle: "MENA's first opinion intelligence platform — part editorial, part data engine, part social experiment. Covering 19 countries. 541 million people. One platform.",
    },
    pillars: [
      { num: "01", title: "Debates", body: "The questions no one asks out loud — about identity, money, religion, gender, power, and the future. Every debate is anonymous. Every vote is permanent. What the region thinks stays on record.", link: "/polls", cta: "Enter the Debates" },
      { num: "02", title: "Predictions", body: "Not what should happen — what will. A Bloomberg-style prediction market for MENA's biggest questions. Track confidence over time, watch consensus shift, and bet on where the region is headed.", link: "/predictions", cta: "Make a Prediction" },
      { num: "03", title: "The Pulse", body: "Exploding Topics for MENA. 36 data-driven trend cards across 8 categories — from press freedom collapse to the $4.1T sovereign wealth machine. Filterable by Power, Money, Society, Tech, Survival, Migration, Culture, and Health. Real-time population counter. Live tickers. The region's vital signs.", link: "/mena-pulse", cta: "Read The Pulse" },
      { num: "04", title: "The Voices", body: "94 founders, operators, and changemakers from 10 countries — curated, not applied-for. Each Voice has a story, a lesson, and a quote. This is the region's leadership index, built one profile at a time.", link: "/profiles", cta: "Meet The Voices" },
    ],
    beliefs: [
      { num: "01", title: "A Social Experiment", body: "Every question is a controlled provocation. The point is not agreement. The point is honesty." },
      { num: "02", title: "No Editorial Agenda", body: "We write the questions. We never write the answers. What the region thinks is the region's business." },
      { num: "03", title: "Private Opinions, Public Data", body: "Your vote is anonymous. The aggregate is not. That gap is where the truth lives." },
      { num: "04", title: "The Questions No One Asks", body: "Not because they're dangerous. Because nobody built the room yet. We built the room." },
      { num: "05", title: "Youngest Region on Earth", body: "60% of MENA is under 30. 541 million people. That's not a demographic stat — it's 541 million opinions waiting to be heard." },
      { num: "06", title: "Real People Only", body: "No bots. No astroturfing. No sponsored opinions. Just the region, speaking for itself." },
    ],
  },
  pulse: {
    categories: [
      { key: "ALL", label: "All Trends", color: "#DC143C" },
      { key: "POWER", label: "Power & Politics", color: "#EF4444" },
      { key: "MONEY", label: "Money & Markets", color: "#F59E0B" },
      { key: "SOCIETY", label: "Society & Identity", color: "#EC4899" },
      { key: "TECHNOLOGY", label: "Tech & AI", color: "#3B82F6" },
      { key: "SURVIVAL", label: "Survival & Crisis", color: "#F97316" },
      { key: "MIGRATION", label: "Migration & Talent", color: "#EF4444" },
      { key: "CULTURE", label: "Culture & Religion", color: "#A855F7" },
      { key: "HEALTH", label: "Health & Youth", color: "#10B981" },
    ],
    topicCards: [
      { id: "authoritarianism-index", tag: "POWER", title: "Press Freedom Collapse", stat: "17 of 19 countries", delta: "Not Free", deltaUp: false, blurb: "17 of 19 MENA nations are rated 'Not Free' or 'Partly Free' by Freedom House.", source: "Freedom House 2026 / RSF Press Freedom Index" },
      { id: "surveillance-tech", tag: "POWER", title: "Surveillance Tech Spending", stat: "$4.8B", delta: "+62% since 2021", deltaUp: true, blurb: "UAE deployed Pegasus spyware against its own citizens. MENA is the world's #1 buyer of spyware.", source: "Citizen Lab / Amnesty International" },
      { id: "political-prisoners", tag: "POWER", title: "Political Detainees", stat: "60,000+", delta: "Across MENA", deltaUp: false, blurb: "Egypt holds 60,000+ political prisoners — more than during Mubarak.", source: "HRW / Amnesty International / ANHRI" },
      { id: "wealth-inequality", tag: "MONEY", title: "Billionaire Wealth vs. GDP", stat: "Top 10 = $186B", delta: "+41%", deltaUp: true, blurb: "The 10 richest Arabs hold $186B — more than the GDP of Jordan, Lebanon, Tunisia, Libya, and Yemen combined.", source: "Forbes / World Bank" },
    ],
    hero: {
      title: "MENA PULSE",
      subtitle: "Real-time trend tracking across 19 countries. The region's vital signs.",
    },
  },
  faq: {
    sections: [
      {
        category: "The Platform",
        questions: [
          { q: "What is The Tribunal?", a: "The Tribunal, by The Middle East Hustle, is MENA's first opinion intelligence platform — part editorial, part data engine, part social experiment. We cover 19 countries and 541 million people across the Middle East and North Africa." },
          { q: "Is The Tribunal free to use?", a: "Yes. Voting on debates, making predictions, browsing The Pulse trends, and exploring Voice profiles are all completely free." },
          { q: "Who is behind The Tribunal?", a: "The Tribunal was founded by Kareem Kaddoura under The Middle East Hustle. The platform is editorially independent." },
          { q: "Are the polls scientific?", a: "No. Our polls are not statistically representative surveys. They represent the self-selected opinions of people who visit the platform." },
        ],
      },
      {
        category: "Debates",
        questions: [
          { q: "How do the debates work?", a: "Every debate is a single question with multiple options. You click your answer. Your vote is anonymous — we don't store your IP address or personally identify you." },
          { q: "Can I vote more than once?", a: "No. Each device can cast one vote per debate. We use browser storage (not cookies) to remember your votes." },
          { q: "What is the Share Gate?", a: "The Share Gate sits between your vote and the full results. After you vote, you can unlock results by sharing on social media or entering your email." },
        ],
      },
      {
        category: "Predictions",
        questions: [
          { q: "What is the Predictions page?", a: "Predictions is our Bloomberg-style prediction market for MENA's biggest questions. Instead of asking 'what should happen,' we ask 'what will happen.'" },
        ],
      },
      {
        category: "The Pulse",
        questions: [
          { q: "What is The Pulse?", a: "The Pulse is our data-driven trend tracking page — think 'Exploding Topics' but built specifically for the MENA region." },
        ],
      },
      {
        category: "The Voices",
        questions: [
          { q: "How do I become a Voice?", a: "Apply through the 'Join The Voices' page. We look for verifiable impact, a unique story, and relevance to the MENA ecosystem." },
        ],
      },
      {
        category: "Data & Privacy",
        questions: [
          { q: "Is my vote anonymous?", a: "Yes. We do not store your IP address. We derive your approximate country from your IP at the time of voting, then discard the IP immediately." },
        ],
      },
    ],
  },
  terms: {
    lastUpdated: "2026-01-01",
    sections: [
      { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using The Tribunal, by The Middle East Hustle, you agree to be bound by these Terms and Conditions." },
      { id: "platform", title: "2. What The Tribunal Is", content: "The Tribunal is an independent opinion and polling platform by The Middle East Hustle, focused on the Middle East and North Africa region." },
      { id: "eligibility", title: "3. Age and Eligibility", content: "You must be at least 16 years old to use The Tribunal." },
      { id: "data", title: "4. Data Collection", content: "When you vote on a poll, we collect: your anonymised vote selection, the poll ID and timestamp, your approximate country of origin. Your full IP address is never stored." },
      { id: "cookies", title: "5. Cookies and Local Storage", content: "The Tribunal uses browser localStorage (not third-party cookies) to remember your voting history and preferences." },
      { id: "ugc", title: "6. User-Generated Content", content: "Voice profiles, submitted poll questions, and application materials constitute user-generated content." },
      { id: "ip", title: "7. Intellectual Property", content: "All branding, editorial content, design assets, and platform code are the intellectual property of The Middle East Hustle." },
      { id: "sharing", title: "8. The Share Gate Mechanic", content: "The Share Gate requires users to share a poll or provide an email before accessing full results." },
      { id: "disclaimers", title: "9. Disclaimers and Limitation of Liability", content: "THE PLATFORM IS PROVIDED 'AS IS' WITHOUT WARRANTIES OF ANY KIND." },
      { id: "prohibited", title: "10. Prohibited Conduct", content: "You agree not to: vote multiple times using VPNs/proxies, submit false information, or use bots to bypass the Share Gate." },
      { id: "governing", title: "11. Governing Law", content: "These Terms are governed by the laws of the United Arab Emirates." },
    ],
  },
  contact: {
    emails: [
      { label: "General Inquiries", email: "hello@themiddleeasthustle.com", description: "For questions, partnerships, and media inquiries" },
      { label: "Legal & Data Requests", email: "legal@themiddleeasthustle.com", description: "For GDPR requests, legal notices, and data inquiries" },
      { label: "Editorial & Corrections", email: "editorial@themiddleeasthustle.com", description: "For content corrections, editorial submissions, and fact-checking" },
    ],
    socialLinks: [
      { platform: "X (Twitter)", url: "https://x.com/tmehustle" },
      { platform: "LinkedIn", url: "https://linkedin.com/company/themiddleeasthustle" },
      { platform: "Instagram", url: "https://instagram.com/themiddleeasthustle" },
    ],
    officeLocation: "Dubai, United Arab Emirates",
  },
};

router.get("/cms/pages/:page", requireCmsAuth, (req, res) => {
  const page = req.params.page;
  const config = pageConfigs[page];
  if (!config) return res.status(404).json({ error: "Page not found" });
  return res.json(config);
});

router.put("/cms/pages/:page", requireCmsAuth, (req, res) => {
  const page = req.params.page;
  if (!pageConfigs[page]) return res.status(404).json({ error: "Page not found" });
  pageConfigs[page] = req.body;
  return res.json({ success: true, config: pageConfigs[page] });
});

export default router;
