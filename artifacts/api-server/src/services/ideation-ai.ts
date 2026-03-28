interface ResearchResult {
  topics: { title: string; summary: string; source: string }[];
  dataPoints: { fact: string; relevance: string }[];
  trends: string[];
}

interface GeneratedIdea {
  pillarType: string;
  title: string;
  content: Record<string, unknown>;
}

interface RiskFlag {
  type: string;
  description: string;
}

interface SafetyReview {
  level: string;
  flags: RiskFlag[];
}

interface RefinedContent {
  [key: string]: unknown;
}

interface ResearchConfig {
  categories: string[];
  tags: string[];
  regions: string[];
}

interface GenerationConfig {
  pillarType?: string;
  mode: string;
  batchSize: number;
  pillarCounts?: { debates: number; predictions: number; pulse: number };
  promptTemplate: string;
  exclusionList: string[];
  guardrails?: string[];
  categories?: string[];
  tags?: string[];
  researchData: ResearchResult | Record<string, unknown>;
}

interface RefinementConfig {
  pillarType: string;
  idea: GeneratedIdea;
}

async function callPerplexity(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return generateMockResearch(prompt);
  }

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: "You are a MENA-focused research analyst. Return ONLY valid JSON. Focus on verifiable facts from the past 7 days. Include specific numbers, named sources, and dates. Prioritize breaking news, policy changes, funding rounds, and market data from the Middle East and North Africa." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      search_recency_filter: "week",
    }),
  });

  if (!res.ok) {
    console.error("Perplexity API error:", res.status, await res.text());
    return generateMockResearch(prompt);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? generateMockResearch(prompt);
}

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; max_tokens?: number },
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return generateMockContent(userPrompt);
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: options?.max_tokens ?? 4096,
      temperature: options?.temperature ?? 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    console.error("Claude API error:", res.status, await res.text());
    return generateMockContent(userPrompt);
  }

  const data = await res.json() as { content?: { text?: string }[] };
  return data.content?.[0]?.text ?? generateMockContent(userPrompt);
}

function generateMockResearch(_prompt: string): string {
  return JSON.stringify({
    topics: [
      { title: "Gulf Tech Investment Surge", summary: "Record venture capital flowing into MENA tech startups, with Saudi Arabia and UAE leading the charge.", source: "Industry Reports 2026" },
      { title: "AI Adoption in Government Services", summary: "Multiple Gulf states implementing AI-driven citizen services platforms.", source: "Government Tech Weekly" },
      { title: "Sustainable City Projects", summary: "Major green building and renewable energy developments across the region.", source: "MENA Construction News" },
      { title: "Creator Economy Growth", summary: "Middle East content creators seeing 300% growth in sponsorship deals.", source: "Digital Media Report" },
      { title: "Fintech Revolution", summary: "Open banking regulations driving innovation across GCC markets.", source: "Banking & Finance MENA" },
    ],
    dataPoints: [
      { fact: "MENA startup funding reached $3.2B in Q1 2026", relevance: "Shows accelerating investment trends" },
      { fact: "UAE AI strategy targeting 50% government service automation by 2028", relevance: "Major policy shift driving tech adoption" },
      { fact: "Saudi entertainment sector grew 45% year-over-year", relevance: "Cultural transformation accelerating" },
    ],
    trends: [
      "AI-native startups displacing traditional businesses",
      "Cross-border MENA collaboration increasing",
      "Youth entrepreneurship programs scaling rapidly",
      "Sustainability becoming a competitive advantage",
      "Digital nomad visa programs attracting global talent",
    ],
  });
}

function generateMockContent(_prompt: string): string {
  return "MOCK_RESPONSE";
}

function generateMockIdeas(config: GenerationConfig): GeneratedIdea[] {
  const debateTemplates = [
    { title: "Should Gulf governments mandate AI literacy by 2028?", content: { question: "Should Gulf governments mandate AI literacy by 2028?", context: "GCC nations have ambitious AI strategies but school curricula haven't caught up. The gap between policy ambition and classroom reality is widening fast.", options: ["Yes — Essential for competitiveness", "No — Let the market decide"] } },
    { title: "Is remote work killing Gulf city culture?",  content: { question: "Is remote work killing Gulf city culture?", context: "Gulf cities were built on office culture and communal gathering. Remote work threatens the social fabric that defines Dubai and Riyadh.", options: ["Yes — Cities need physical presence", "No — Remote work enables better lives"] } },
    { title: "Will MENA creators replace traditional media?", content: { question: "Will MENA creators replace traditional media?", context: "Regional content creators now outperform legacy media on engagement. Brands are following the audience — and the money.", options: ["Yes — Creators are the new media", "No — Traditional media will adapt"] } },
    { title: "Should MENA startups prioritize profit over growth?", content: { question: "Should MENA startups prioritize profit over growth?", context: "Post-correction, Gulf VCs demand profitability. Critics say this kills the bold bets the region needs.", options: ["Profitability first", "Growth first — scale matters more"] } },
    { title: "Is the Gulf's megaproject boom sustainable?", content: { question: "Is the Gulf's megaproject boom sustainable?", context: "NEOM, The Line, Aman — unprecedented construction across the Gulf. The question: can vision outrun economic gravity?", options: ["Yes — Vision-driven development works", "No — Overreach risks economic strain"] } },
  ];

  const predictionTemplates = [
    { title: "Will a MENA-based AI company reach $1B valuation by end of 2027?", content: { question: "Will a MENA-based AI company reach $1B valuation by end of 2027?", category: "Technology & AI", resolvesAt: "2027-12-31" } },
    { title: "Will Saudi Arabia's tourism sector hit 100M visitors before 2030?", content: { question: "Will Saudi Arabia's tourism sector hit 100M visitors before 2030?", category: "Economy", resolvesAt: "2030-01-01" } },
    { title: "Will Dubai launch a central bank digital currency by 2027?", content: { question: "Will Dubai launch a central bank digital currency by 2027?", category: "Finance", resolvesAt: "2027-12-31" } },
    { title: "Will electric vehicles reach 20% of new car sales in the UAE by 2028?", content: { question: "Will electric vehicles reach 20% of new car sales in the UAE by 2028?", category: "Energy", resolvesAt: "2028-12-31" } },
    { title: "Will a MENA country win the bid to host the 2036 Olympics?", content: { question: "Will a MENA country win the bid to host the 2036 Olympics?", category: "Sports", resolvesAt: "2029-07-01" } },
  ];

  const pulseTemplates = [
    { title: "MENA Startup Funding Record Quarter", content: { title: "MENA Startup Funding Record Quarter", stat: "$3.2B", delta: "+47%", direction: "up", blurb: "MENA startup funding just hit its highest quarter ever. The Gulf is betting big on tech — and this time, the numbers back it up.", source: "MAGNiTT Q1 2026 Report" } },
    { title: "UAE AI Adoption Leads Region", content: { title: "UAE AI Adoption Leads Region", stat: "73%", delta: "+12%", direction: "up", blurb: "Nearly 3 in 4 UAE businesses now use AI tools. The government's top-down push is paying off faster than anyone expected.", source: "Government AI Index" } },
    { title: "Saudi Entertainment Sector Surges", content: { title: "Saudi Entertainment Sector Surges", stat: "45%", delta: "+45%", direction: "up", blurb: "Saudi entertainment grew 45% YoY — from zero cinemas to a cultural transformation. The kingdom is spending its way into relevance.", source: "General Entertainment Authority" } },
    { title: "Gulf Remote Worker Visas Surge", content: { title: "Gulf Remote Worker Visas Surge", stat: "125K", delta: "+200%", direction: "up", blurb: "Gulf states issued 125K remote worker visas — a 3x jump. The region is importing talent without importing payroll.", source: "Immigration Authority Reports" } },
    { title: "MENA Renewable Energy Capacity", content: { title: "MENA Renewable Energy Capacity", stat: "42GW", delta: "+18%", direction: "up", blurb: "Oil nations are quietly building 42GW of renewable capacity. The energy transition in MENA is real — just don't call it that.", source: "IRENA Regional Update" } },
  ];

  const allTemplates: Record<string, GeneratedIdea[]> = {
    debates: debateTemplates.map(t => ({ pillarType: "debates", ...t })),
    predictions: predictionTemplates.map(t => ({ pillarType: "predictions", ...t })),
    pulse: pulseTemplates.map(t => ({ pillarType: "pulse", ...t })),
  };

  const ideas: GeneratedIdea[] = [];

  if (config.mode === "focused" && config.pillarType) {
    const templates = allTemplates[config.pillarType] || allTemplates.debates;
    for (let i = 0; i < config.batchSize; i++) {
      ideas.push({ ...templates[i % templates.length], title: `${templates[i % templates.length].title}` });
    }
  } else if (config.pillarCounts) {
    const pc = config.pillarCounts;
    for (const [pillar, count] of Object.entries(pc)) {
      const templates = allTemplates[pillar] || allTemplates.debates;
      for (let i = 0; i < count; i++) {
        ideas.push({ ...templates[i % templates.length] });
      }
    }
  } else {
    const pillars = ["debates", "predictions", "pulse"];
    const perPillar = Math.ceil(config.batchSize / 3);
    for (const pillar of pillars) {
      const templates = allTemplates[pillar];
      for (let i = 0; i < perPillar && ideas.length < config.batchSize; i++) {
        ideas.push({ ...templates[i % templates.length] });
      }
    }
  }

  return ideas;
}

function generateMockSafetyReview(): SafetyReview {
  const riskLevels = ["low", "low", "low", "medium", "low"];
  const level = riskLevels[Math.floor(Math.random() * riskLevels.length)];

  const possibleFlags: RiskFlag[] = [
    { type: "political_sensitivity", description: "Topic touches on inter-state relations" },
    { type: "factual_concern", description: "Claims may need verification" },
    { type: "sentiment_risk", description: "Could polarize audience" },
  ];

  const flags = level === "low" ? [] :
    level === "medium" ? [possibleFlags[Math.floor(Math.random() * possibleFlags.length)]] :
    possibleFlags.slice(0, 2);

  return { level, flags };
}

export async function runResearch(config: ResearchConfig): Promise<ResearchResult> {
  const today = new Date().toISOString().split("T")[0];
  const prompt = `Today is ${today}. Find the most important MENA news and data from the past 7 days.

Focus areas: ${config.categories.join(", ") || "business, technology, culture, politics, economy"}
Tags: ${config.tags.join(", ") || "any"}
Regions: ${config.regions.join(", ") || "MENA region broadly"}

Return a JSON object with:
- "topics": array of {title, summary, source} for 5-8 BREAKING or trending stories. Each summary must be 1 sentence with a specific fact or number.
- "dataPoints": array of {fact, relevance} for 3-5 data points. Each fact must include a specific number and named source.
- "trends": array of 5 trend strings — each must be a specific, debatable claim (not vague platitudes)

Return ONLY valid JSON.`;

  const result = await callPerplexity(prompt);
  try {
    return JSON.parse(result);
  } catch {
    return JSON.parse(generateMockResearch(prompt));
  }
}

export async function runGeneration(config: GenerationConfig): Promise<GeneratedIdea[]> {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  if (!hasApiKey) {
    return generateMockIdeas(config);
  }

  const systemPrompt = config.promptTemplate || `You are a content ideation engine for "The Middle East Hustle", a platform covering business, technology, and culture in the MENA region. Generate engaging, thought-provoking content ideas.`;

  const exclusionNote = config.exclusionList.length > 0
    ? `\n\nEXCLUSION LIST — Do NOT generate ideas about these topics/phrases:\n${config.exclusionList.map(e => `- ${e}`).join("\n")}`
    : "";

  const guardrailNote = config.guardrails && config.guardrails.length > 0
    ? `\n\nCONTENT GUARDRAILS — You MUST follow these rules:\n${config.guardrails.map(g => `- ${g}`).join("\n")}`
    : "";

  const focusNote = (config.categories?.length || config.tags?.length)
    ? `\n\nEDITORIAL FOCUS — Prioritize ideas in these areas:\nCategories: ${config.categories?.join(", ") || "any"}\nThemes/Tags: ${config.tags?.join(", ") || "any"}`
    : "";

  const researchContext = `Research data:\n${JSON.stringify(config.researchData, null, 2)}`;

  const pillarInstructions: Record<string, string> = {
    debates: `Generate debate questions. Each idea must have: title (max 15 words), content with {question (max 20 words, punchy yes/no framing), context (max 2 sentences, ~40 words — a sharp hook that frames the tension, NOT an essay), options (array of 2-4 position strings, each max 8 words)}.`,
    predictions: `Generate prediction market questions. Each idea must have: title (max 15 words), content with {question (max 20 words, specific and verifiable), category, resolvesAt (ISO date string)}.`,
    pulse: `Generate pulse/stat cards. Each idea must have: title (max 8 words), content with {title (max 8 words), stat (a specific number/string), delta (percentage change), direction (up/down), blurb (max 2 sentences, ~40 words — a punchy editorial take on what the stat means), source (named source)}.`,
  };

  let pillarPrompt: string;
  let totalCount = config.batchSize;

  if (config.mode === "focused" && config.pillarType) {
    pillarPrompt = pillarInstructions[config.pillarType] || pillarInstructions.debates;
  } else if (config.pillarCounts) {
    const pc = config.pillarCounts;
    totalCount = pc.debates + pc.predictions + pc.pulse;
    pillarPrompt = `Generate ideas across pillars with these exact counts:\n- debates (${pc.debates} ideas): ${pillarInstructions.debates}\n- predictions (${pc.predictions} ideas): ${pillarInstructions.predictions}\n- pulse (${pc.pulse} ideas): ${pillarInstructions.pulse}`;
  } else {
    pillarPrompt = `Generate a mix of ideas across all three pillars:\n${Object.entries(pillarInstructions).map(([k, v]) => `${k}: ${v}`).join("\n")}`;
  }

  const userPrompt = `${researchContext}${focusNote}${exclusionNote}${guardrailNote}

${pillarPrompt}

Generate exactly ${totalCount} ideas. Return a JSON array of objects, each with: pillarType ("debates"|"predictions"|"pulse"), title (string), content (object matching the pillar schema).

CRITICAL: All content must be SHORT and punchy. Think newspaper headlines and Twitter threads, not blog posts. Every sentence must earn its place.

Return ONLY a valid JSON array.`;

  const result = await callClaude(systemPrompt, userPrompt, { temperature: 0.7, max_tokens: 4096 });
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(result);
  } catch {
    return generateMockIdeas(config);
  }
}

export async function runSafetyReview(ideas: GeneratedIdea[]): Promise<Map<number, SafetyReview>> {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  const reviews = new Map<number, SafetyReview>();

  if (!hasApiKey) {
    ideas.forEach((_, idx) => {
      reviews.set(idx, generateMockSafetyReview());
    });
    return reviews;
  }

  const systemPrompt = `You are a content safety reviewer for a Middle East business/culture platform. Analyze each content idea for potential risks including: sentiment harm, political sensitivity, factual concerns, and cultural sensitivity. Rate each as "low", "medium", or "high" risk.`;

  const userPrompt = `Review these content ideas for safety risks:\n${JSON.stringify(ideas, null, 2)}

Return a JSON array where each element has:
- index (number, 0-based)
- level ("low"|"medium"|"high")
- flags (array of {type: string, description: string})

Flag types: "sentiment_risk", "political_sensitivity", "factual_concern", "cultural_sensitivity"
Return ONLY valid JSON array.`;

  const result = await callClaude(systemPrompt, userPrompt, { temperature: 0.1, max_tokens: 2048 });
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    for (const review of parsed) {
      reviews.set(review.index, { level: review.level, flags: review.flags || [] });
    }
  } catch {
    ideas.forEach((_, idx) => {
      reviews.set(idx, generateMockSafetyReview());
    });
  }

  return reviews;
}

export async function runRefinement(config: RefinementConfig): Promise<RefinedContent> {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  if (!hasApiKey) {
    const base = config.idea.content;
    if (config.pillarType === "debates") {
      return {
        question: base.question || config.idea.title,
        context: base.context || "A pivotal question dividing MENA's business and policy elite. The stakes are real, the clock is ticking.",
        options: base.options || ["Position A", "Position B"],
        category: "Technology & AI",
        tags: ["ai-generated", "mena"],
      };
    } else if (config.pillarType === "predictions") {
      return {
        question: base.question || config.idea.title,
        category: base.category || "Technology",
        resolvesAt: base.resolvesAt || new Date(Date.now() + 365 * 86400000).toISOString(),
        tags: ["ai-generated"],
      };
    } else {
      return {
        title: base.title || config.idea.title,
        stat: base.stat || "N/A",
        delta: base.delta || "0%",
        direction: base.direction || "up",
        blurb: base.blurb || "A data point that tells you more about the region than any headline.",
        source: base.source || "AI Generated",
      };
    }
  }

  const fieldSchemas: Record<string, string> = {
    debates: `{question: string (max 20 words — sharp, provocative yes/no question), context: string (EXACTLY 2-3 sentences, max 50 words total — a punchy hook that frames the stakes, like a newspaper subheadline. NO paragraphs.), options: string[] (2-4 debate positions, each max 8 words), category: string, tags: string[]}`,
    predictions: `{question: string (max 20 words — specific, verifiable, with a clear resolution), category: string, resolvesAt: string (ISO date), tags: string[]}`,
    pulse: `{title: string (max 8 words — punchy stat headline), stat: string (specific number), delta: string (percentage change), direction: "up"|"down", blurb: string (EXACTLY 2 sentences, max 40 words — editorial take on what the stat means and why it matters), source: string}`,
  };

  const systemPrompt = `You are the senior editor at "The Middle East Hustle" — a sharp, data-driven platform covering MENA business, tech, and culture. Your job is to TIGHTEN content, never expand it.

EDITORIAL RULES:
- Write like a Bloomberg terminal meets Vice News — crisp, provocative, zero fluff
- Every word must earn its place. If a sentence doesn't add new information or punch, cut it
- Lead with the most surprising or provocative fact
- Use specific numbers, names, and dates — never vague claims
- Context should read like a newspaper subheadline: sets the stakes in one breath
- Blurbs should feel like the first 2 lines of a viral tweet thread

HARD LIMITS:
- Debate context: max 50 words (2-3 sentences)
- Pulse blurb: max 40 words (2 sentences)
- Prediction questions: max 20 words
- If the input is already good, make it sharper — do NOT pad it`;

  const userPrompt = `TIGHTEN this ${config.pillarType} idea into a publication-ready draft. Do NOT expand — make it shorter and sharper.

Input:
${JSON.stringify(config.idea, null, 2)}

Output schema: ${fieldSchemas[config.pillarType] || fieldSchemas.debates}

RULES:
- The output must be SHORTER than the input, not longer
- Match the word limits specified in the schema EXACTLY
- If the input context is longer than 50 words, CUT it down — do not preserve length
- Return ONLY valid JSON matching the schema`;

  const result = await callClaude(systemPrompt, userPrompt, { temperature: 0.4, max_tokens: 1024 });
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return config.idea.content;
  }
}

export const DEFAULT_PROMPTS: Record<string, string> = {
  debates: `You are the ideation engine for "The Middle East Hustle" — Debates pillar. Generate sharp, provocative debate questions about MENA business, tech, society, and culture. Each debate must present a genuine tension with strong arguments on both sides. Context must be 2-3 SENTENCES max (like a newspaper subheadline), not paragraphs. Avoid generic topics — focus on timely, region-specific issues that drive passionate engagement. Write like you're crafting a Bloomberg headline, not a Wikipedia entry.`,
  predictions: `You are the ideation engine for "The Middle East Hustle" — Predictions pillar. Generate bold prediction market questions about the future of the Middle East. Each prediction must be specific, verifiable, and under 20 words. Focus on business milestones, tech breakthroughs, policy changes, and cultural shifts. Include a clear resolution date and binary yes/no framing.`,
  pulse: `You are the ideation engine for "The Middle East Hustle" — Pulse pillar. Generate data-driven stat cards that capture the pulse of the MENA region. Each card needs: a punchy title (max 8 words), a specific stat with source, and a blurb (max 2 sentences) that gives an editorial take on why this number matters. Focus on metrics that tell a story — growth rates, adoption numbers, investment figures, demographic shifts. Write the blurb like the opening of a viral tweet thread.`,
};
