import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

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

interface MockDebate {
  id: number;
  question: string;
  context: string | null;
  category: string;
  categorySlug: string;
  tags: string[];
  pollType: string;
  cardLayout: string;
  isFeatured: boolean;
  isEditorsPick: boolean;
  editorialStatus: string;
  endsAt: string | null;
  updatedAt: string;
  createdAt: string;
  relatedProfileIds: number[];
  options: { id: number; pollId: number; text: string; voteCount: number }[];
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

interface MockVoice {
  id: number;
  name: string;
  headline: string;
  role: string;
  company: string | null;
  companyUrl: string | null;
  sector: string;
  country: string;
  city: string;
  imageUrl: string | null;
  summary: string;
  story: string;
  lessonsLearned: string[];
  quote: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  associatedPollCount: number;
  editorialStatus: string;
  updatedAt: string;
  createdAt: string;
}

let nextDebateId = 100;
let nextPredictionId = 100;
let nextVoiceId = 100;
let nextOptionId = 1000;

const mockDebates: MockDebate[] = [
  { id: 1, question: "Will your job still exist in 5 years? Be honest.", context: "AI is reshaping the workforce across the Middle East", category: "Technology & AI", categorySlug: "technology-ai", tags: ["ai", "future-of-work"], pollType: "binary", cardLayout: "featured", isFeatured: true, isEditorsPick: true, editorialStatus: "approved", endsAt: null, updatedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), relatedProfileIds: [], options: [{ id: 1, pollId: 1, text: "Yes, AI will replace most jobs", voteCount: 4521 }, { id: 2, pollId: 1, text: "No, AI will create new opportunities", voteCount: 3892 }] },
  { id: 2, question: "Which Middle Eastern city is the best place to actually build a life?", context: "Beyond careers — cost of living, community, lifestyle", category: "Lifestyle", categorySlug: "lifestyle", tags: ["cities", "mena"], pollType: "multiple", cardLayout: "standard", isFeatured: true, isEditorsPick: false, editorialStatus: "approved", endsAt: null, updatedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), relatedProfileIds: [], options: [{ id: 3, pollId: 2, text: "Dubai", voteCount: 3200 }, { id: 4, pollId: 2, text: "Riyadh", voteCount: 2100 }, { id: 5, pollId: 2, text: "Amman", voteCount: 1800 }, { id: 6, pollId: 2, text: "Cairo", voteCount: 1500 }] },
  { id: 3, question: "Is remote work killing startup culture in the region?", context: null, category: "Startups", categorySlug: "startups", tags: ["remote-work", "startups"], pollType: "binary", cardLayout: "compact", isFeatured: false, isEditorsPick: false, editorialStatus: "draft", endsAt: null, updatedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), relatedProfileIds: [], options: [{ id: 7, pollId: 3, text: "Yes", voteCount: 0 }, { id: 8, pollId: 3, text: "No", voteCount: 0 }] },
  { id: 4, question: "Should MENA governments regulate crypto more strictly?", context: "Crypto adoption in the region continues to grow", category: "Finance", categorySlug: "finance", tags: ["crypto", "regulation"], pollType: "binary", cardLayout: "standard", isFeatured: false, isEditorsPick: false, editorialStatus: "in_review", endsAt: null, updatedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), relatedProfileIds: [], options: [{ id: 9, pollId: 4, text: "Yes, more regulation needed", voteCount: 0 }, { id: 10, pollId: 4, text: "No, let the market decide", voteCount: 0 }] },
  { id: 5, question: "What's the biggest barrier to women in tech in the Middle East?", context: null, category: "Society", categorySlug: "society", tags: ["women-in-tech", "diversity"], pollType: "multiple", cardLayout: "sidebar", isFeatured: false, isEditorsPick: true, editorialStatus: "approved", endsAt: null, updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), relatedProfileIds: [], options: [{ id: 11, pollId: 5, text: "Cultural expectations", voteCount: 2800 }, { id: 12, pollId: 5, text: "Lack of role models", voteCount: 1900 }, { id: 13, pollId: 5, text: "Funding gaps", voteCount: 1600 }] },
];

const mockPredictions: MockPrediction[] = [
  { id: 1, question: "Will Saudi Arabia's NEOM project meet its 2030 deadline?", category: "Megaprojects", categorySlug: "megaprojects", resolvesAt: "2030-12-31T00:00:00Z", yesPercentage: 22, noPercentage: 78, totalCount: 8420, momentum: 3.2, momentumDirection: "down", trendData: [35, 32, 28, 25, 22], cardLayout: "featured", editorialStatus: "approved", isFeatured: true, tags: ["saudi", "neom", "vision-2030"], createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, question: "Will Dubai overtake Singapore as the world's top fintech hub by 2027?", category: "Finance", categorySlug: "finance", resolvesAt: "2027-06-30T00:00:00Z", yesPercentage: 61, noPercentage: 39, totalCount: 5230, momentum: 5.1, momentumDirection: "up", trendData: [45, 52, 55, 58, 61], cardLayout: "grid", editorialStatus: "approved", isFeatured: true, tags: ["dubai", "fintech"], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, question: "Will a MENA-based unicorn IPO on NASDAQ in 2026?", category: "Startups", categorySlug: "startups", resolvesAt: "2026-12-31T00:00:00Z", yesPercentage: 45, noPercentage: 55, totalCount: 3100, momentum: 1.8, momentumDirection: "up", trendData: [38, 40, 42, 44, 45], cardLayout: "grid", editorialStatus: "draft", isFeatured: false, tags: ["ipo", "unicorn"], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, question: "Will remote work become the default in Gulf tech companies?", category: "Technology & AI", categorySlug: "technology-ai", resolvesAt: "2027-01-01T00:00:00Z", yesPercentage: 33, noPercentage: 67, totalCount: 2750, momentum: -2.1, momentumDirection: "down", trendData: [42, 38, 35, 34, 33], cardLayout: "compact", editorialStatus: "in_review", isFeatured: false, tags: ["remote-work", "gulf"], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
];

const mockVoices: MockVoice[] = [
  { id: 1, name: "Layla Al-Rashid", headline: "Building the future of EdTech in Saudi Arabia", role: "Founder & CEO", company: "MindBridge", companyUrl: "https://mindbridge.sa", sector: "Education", country: "Saudi Arabia", city: "Riyadh", imageUrl: null, summary: "Layla dropped out of a PhD program to build the region's most ambitious online learning platform.", story: "Growing up in Jeddah, I watched my mother struggle to access quality education...", lessonsLearned: ["Start before you're ready", "Your network is your net worth", "Fail fast, learn faster"], quote: "Education is the great equalizer — but only if everyone can access it.", isFeatured: true, isVerified: true, viewCount: 12500, associatedPollCount: 3, editorialStatus: "approved", updatedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 2, name: "Omar Khalil", headline: "From refugee to fintech founder", role: "Co-founder", company: "PayFlow", companyUrl: "https://payflow.io", sector: "Finance", country: "UAE", city: "Dubai", imageUrl: null, summary: "Omar's journey from a refugee camp in Jordan to founding one of Dubai's fastest-growing fintech startups.", story: "I arrived in Dubai with $200 and a dream...", lessonsLearned: ["Resilience is a muscle", "Build for the underserved", "Culture eats strategy for breakfast"], quote: "The Middle East doesn't need saving — it needs backing.", isFeatured: true, isVerified: true, viewCount: 9800, associatedPollCount: 2, editorialStatus: "approved", updatedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 25).toISOString() },
  { id: 3, name: "Nadia Hassan", headline: "Leading climate tech innovation in Egypt", role: "CTO", company: "GreenSahara", companyUrl: null, sector: "Climate Tech", country: "Egypt", city: "Cairo", imageUrl: null, summary: "Nadia is pioneering desert agriculture technology that could feed millions.", story: "The Sahara isn't just sand — it's possibility...", lessonsLearned: ["Think in decades, act in days", "The hardest problems are the most worth solving"], quote: "If we can grow food in the desert, we can do anything.", isFeatured: false, isVerified: false, viewCount: 3200, associatedPollCount: 1, editorialStatus: "draft", updatedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 4, name: "Tariq Mansour", headline: "Disrupting logistics across the GCC", role: "CEO", company: "SwiftRoute", companyUrl: "https://swiftroute.com", sector: "Logistics", country: "Bahrain", city: "Manama", imageUrl: null, summary: "Tariq built a logistics platform that reduced delivery times by 40% across the Gulf.", story: "I spent 10 years in Amazon's logistics division before returning home...", lessonsLearned: ["Execution beats ideas every time", "Hire slow, fire fast", "Customer obsession isn't a buzzword"], quote: "The best time to build in the Middle East was 10 years ago. The second best time is now.", isFeatured: false, isVerified: true, viewCount: 5600, associatedPollCount: 0, editorialStatus: "in_review", updatedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
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
    const countByStatus = (items: { editorialStatus: string }[], status: string) =>
      items.filter(i => i.editorialStatus === status).length;

    return res.json({
      debates: { total: mockDebates.length, drafts: countByStatus(mockDebates, "draft"), live: countByStatus(mockDebates, "approved"), flagged: countByStatus(mockDebates, "flagged"), inReview: countByStatus(mockDebates, "in_review"), archived: countByStatus(mockDebates, "archived") },
      predictions: { total: mockPredictions.length, drafts: countByStatus(mockPredictions, "draft"), live: countByStatus(mockPredictions, "approved"), flagged: countByStatus(mockPredictions, "flagged"), inReview: countByStatus(mockPredictions, "in_review"), archived: countByStatus(mockPredictions, "archived") },
      voices: { total: mockVoices.length, drafts: countByStatus(mockVoices, "draft"), live: countByStatus(mockVoices, "approved"), flagged: countByStatus(mockVoices, "flagged"), inReview: countByStatus(mockVoices, "in_review"), archived: countByStatus(mockVoices, "archived") },
      recentActivity: [
        ...mockDebates.map(d => ({ type: "debate" as const, id: d.id, title: d.question, status: d.editorialStatus, updatedAt: d.updatedAt })),
        ...mockPredictions.map(p => ({ type: "prediction" as const, id: p.id, title: p.question, status: p.editorialStatus, updatedAt: p.updatedAt })),
        ...mockVoices.map(p => ({ type: "voice" as const, id: p.id, title: p.name, status: p.editorialStatus, updatedAt: p.updatedAt })),
      ].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()).slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Stats failed" });
  }
});

router.get("/cms/taxonomy", requireCmsAuth, async (_req, res) => {
  const debateCategories = [...new Set(mockDebates.map(d => d.category).filter(Boolean))];
  const predictionCategories = [...new Set(mockPredictions.map(p => p.category).filter(Boolean))];
  const allTags = [...new Set([
    ...mockDebates.flatMap(d => d.tags),
    ...mockPredictions.flatMap(p => p.tags),
  ])];
  const sectors = [...new Set(mockVoices.map(v => v.sector).filter(Boolean))];
  const countries = [...new Set(mockVoices.map(v => v.country).filter(Boolean))];
  const cities = [...new Set(mockVoices.map(v => v.city).filter(Boolean))];

  return res.json({
    debateCategories: [...debateCategories, "Technology & AI", "Politics", "Economy", "Finance", "Startups", "Society", "Lifestyle", "Culture", "Energy", "Climate", "Diplomacy", "Healthcare", "Education", "Real Estate"].filter((v, i, a) => a.indexOf(v) === i).sort(),
    predictionCategories: [...predictionCategories, "Megaprojects", "Energy", "Business", "Technology", "Politics", "Markets", "Geopolitics", "Sports", "Climate"].filter((v, i, a) => a.indexOf(v) === i).sort(),
    tags: [...allTags, "ai", "startups", "mena", "saudi", "uae", "egypt", "fintech", "climate", "crypto", "energy", "women-in-tech", "future-of-work", "remote-work", "regulation", "vision-2030", "infrastructure", "ipo", "sustainability"].filter((v, i, a) => a.indexOf(v) === i).sort(),
    sectors: [...sectors, "Technology", "Finance", "Healthcare", "Education", "Energy", "Real Estate", "Logistics", "Media", "Climate Tech", "E-commerce", "Agriculture", "Manufacturing", "Consulting", "Legal"].filter((v, i, a) => a.indexOf(v) === i).sort(),
    countries: [...countries, "Saudi Arabia", "UAE", "Egypt", "Jordan", "Bahrain", "Kuwait", "Oman", "Qatar", "Lebanon", "Morocco", "Tunisia", "Iraq", "Turkey", "Iran"].filter((v, i, a) => a.indexOf(v) === i).sort(),
    cities: [...cities, "Dubai", "Riyadh", "Jeddah", "Abu Dhabi", "Cairo", "Amman", "Manama", "Doha", "Kuwait City", "Muscat", "Beirut", "Casablanca", "Istanbul", "Tehran"].filter((v, i, a) => a.indexOf(v) === i).sort(),
  });
});

router.get("/cms/debates", requireCmsAuth, async (req, res) => {
  const status = req.query.status as string | undefined;
  const items = (status && status !== "all")
    ? mockDebates.filter(d => d.editorialStatus === status)
    : mockDebates;
  return res.json({ items: items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) });
});

router.get("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  const debate = mockDebates.find(d => d.id === Number(req.params.id));
  if (!debate) return res.status(404).json({ error: "Not found" });
  return res.json(debate);
});

router.put("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  const idx = mockDebates.findIndex(d => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { options, ...data } = req.body;
  if (data.editorialStatus && VALID_STATUSES.has(data.editorialStatus)) {
    if (!isValidStatusTransition(mockDebates[idx].editorialStatus, data.editorialStatus)) {
      return res.status(400).json({ error: `Cannot transition from '${mockDebates[idx].editorialStatus}' to '${data.editorialStatus}'` });
    }
  }
  Object.assign(mockDebates[idx], data, { updatedAt: new Date().toISOString() });
  if (options && Array.isArray(options)) {
    mockDebates[idx].options = options.map((opt: { text: string; voteCount?: number }, i: number) => ({
      id: nextOptionId++,
      pollId: mockDebates[idx].id,
      text: opt.text,
      voteCount: opt.voteCount ?? 0,
    }));
  }
  return res.json({ success: true });
});

router.delete("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  const idx = mockDebates.findIndex(d => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  mockDebates.splice(idx, 1);
  return res.json({ success: true });
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
  const status = req.query.status as string | undefined;
  const items = (status && status !== "all")
    ? mockVoices.filter(v => v.editorialStatus === status)
    : mockVoices;
  return res.json({ items: items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) });
});

router.get("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  const item = mockVoices.find(v => v.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

router.put("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  const idx = mockVoices.findIndex(v => v.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  if (req.body.editorialStatus && VALID_STATUSES.has(req.body.editorialStatus)) {
    if (!isValidStatusTransition(mockVoices[idx].editorialStatus, req.body.editorialStatus)) {
      return res.status(400).json({ error: `Cannot transition from '${mockVoices[idx].editorialStatus}' to '${req.body.editorialStatus}'` });
    }
  }
  Object.assign(mockVoices[idx], req.body, { updatedAt: new Date().toISOString() });
  return res.json({ success: true });
});

router.delete("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  const idx = mockVoices.findIndex(v => v.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  mockVoices.splice(idx, 1);
  return res.json({ success: true });
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
  let item: { editorialStatus: string; updatedAt: string } | undefined;

  if (type === "debates") {
    item = mockDebates.find(d => d.id === numId);
  } else if (type === "predictions") {
    item = mockPredictions.find(p => p.id === numId);
  } else if (type === "voices") {
    item = mockVoices.find(v => v.id === numId);
  } else {
    return res.status(400).json({ error: "Invalid type" });
  }

  if (!item) return res.status(404).json({ error: "Not found" });

  const newStatus = validTransitions[action][item.editorialStatus];
  if (!newStatus) {
    return res.status(400).json({ error: `Cannot ${action} from status '${item.editorialStatus}'` });
  }

  item.editorialStatus = newStatus;
  item.updatedAt = new Date().toISOString();

  return res.json({ success: true, newStatus });
});

router.post("/cms/:type/bulk-action", requireCmsAuth, async (req, res) => {
  const { type } = req.params;
  const { ids, action } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  if (type !== "debates" && type !== "predictions" && type !== "voices") {
    return res.status(400).json({ error: "Invalid type" });
  }

  if (action === "delete") {
    if (type === "debates") {
      ids.forEach(id => { const idx = mockDebates.findIndex(d => d.id === id); if (idx !== -1) mockDebates.splice(idx, 1); });
    } else if (type === "predictions") {
      ids.forEach(id => { const idx = mockPredictions.findIndex(p => p.id === id); if (idx !== -1) mockPredictions.splice(idx, 1); });
    } else {
      ids.forEach(id => { const idx = mockVoices.findIndex(v => v.id === id); if (idx !== -1) mockVoices.splice(idx, 1); });
    }
    return res.json({ success: true, deleted: ids.length });
  }

  const statusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    flag: "flagged",
    archive: "archived",
    unflag: "approved",
    unarchive: "approved",
    unpublish: "draft",
    revision: "revision",
  };

  const newStatus = statusMap[action];
  if (!newStatus) return res.status(400).json({ error: "Invalid action" });

  const updateItem = (arr: { id: number; editorialStatus: string; updatedAt: string }[]) => {
    ids.forEach(id => {
      const item = arr.find(i => i.id === id);
      if (item) {
        item.editorialStatus = newStatus;
        item.updatedAt = new Date().toISOString();
      }
    });
  };
  if (type === "debates") updateItem(mockDebates);
  else if (type === "predictions") updateItem(mockPredictions);
  else updateItem(mockVoices);

  return res.json({ success: true, updated: ids.length });
});

router.post("/cms/upload/:type", requireCmsAuth, async (req, res) => {
  const { type } = req.params;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "items array is required" });
  }

  if (type === "debates") {
    const created = items.map((item: any) => {
      const debate: MockDebate = {
        id: nextDebateId++,
        question: item.question,
        context: item.context ?? null,
        category: item.category,
        categorySlug: item.categorySlug ?? item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tags: item.tags ?? [],
        pollType: item.pollType ?? "binary",
        cardLayout: item.cardLayout ?? "standard",
        isFeatured: item.isFeatured ?? false,
        isEditorsPick: item.isEditorsPick ?? false,
        editorialStatus: item.editorialStatus ?? "draft",
        endsAt: item.endsAt ?? null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        relatedProfileIds: item.relatedProfileIds ?? [],
        options: (item.options ?? []).map((o: string | { text: string }) => ({
          id: nextOptionId++,
          pollId: nextDebateId - 1,
          text: typeof o === "string" ? o : o.text,
          voteCount: 0,
        })),
      };
      mockDebates.push(debate);
      return debate;
    });
    return res.json({ success: true, created: created.length, items: created });
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
    return res.json({ success: true, created: created.length, items: created });
  }

  if (type === "voices") {
    const created = items.map((item: any) => {
      const voice: MockVoice = {
        id: nextVoiceId++,
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
        viewCount: 0,
        associatedPollCount: 0,
        editorialStatus: item.editorialStatus ?? "draft",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      mockVoices.push(voice);
      return voice;
    });
    return res.json({ success: true, created: created.length, items: created });
  }

  return res.status(400).json({ error: "Invalid type" });
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

export default router;
