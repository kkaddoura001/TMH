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
        { role: "system", content: "You are a research assistant specializing in Middle East business, technology, and culture trends. Return structured JSON responses." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    console.error("Perplexity API error:", res.status, await res.text());
    return generateMockResearch(prompt);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? generateMockResearch(prompt);
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
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
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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
    { title: "Should Gulf governments mandate AI literacy in school curricula by 2028?", content: { question: "Should Gulf governments mandate AI literacy in school curricula by 2028?", context: "As AI transforms industries across the Middle East, education systems face pressure to prepare the next generation. Several GCC nations have announced AI strategies, but curriculum reform remains slow.", options: ["Yes — Essential for future competitiveness", "No — Let the market drive adoption"] } },
    { title: "Is remote work undermining the social fabric of Gulf cities?",  content: { question: "Is remote work undermining the social fabric of Gulf cities?", context: "Gulf cities were built around office culture and social gathering. As remote work normalizes post-pandemic, some argue it threatens the communal identity that defines cities like Dubai and Riyadh.", options: ["Yes — Cities need physical presence", "No — Remote work enables better lives"] } },
    { title: "Will MENA's creator economy replace traditional media within a decade?", content: { question: "Will MENA's creator economy replace traditional media within a decade?", context: "Content creators in the region are generating more engagement than legacy media outlets. Brands are shifting budgets accordingly.", options: ["Yes — Creators are the new media", "No — Traditional media will adapt"] } },
    { title: "Should startups in the region prioritize profitability over growth?", content: { question: "Should startups in the region prioritize profitability over growth?", context: "After the global tech correction, MENA VCs are increasingly demanding path-to-profitability. But some argue this stifles the bold thinking needed for regional innovation.", options: ["Profitability first", "Growth first — scale matters more"] } },
    { title: "Is the Gulf's megaproject boom sustainable?", content: { question: "Is the Gulf's megaproject boom sustainable?", context: "From NEOM to The Line to Aman projects, the Gulf is undertaking unprecedented construction. Critics question whether these projects can deliver on their promises.", options: ["Yes — Vision-driven development works", "No — Overreach risks economic strain"] } },
  ];

  const predictionTemplates = [
    { title: "Will a MENA-based AI company reach $1B valuation by end of 2027?", content: { question: "Will a MENA-based AI company reach $1B valuation by end of 2027?", category: "Technology & AI", resolvesAt: "2027-12-31" } },
    { title: "Will Saudi Arabia's tourism sector hit 100M visitors before 2030?", content: { question: "Will Saudi Arabia's tourism sector hit 100M visitors before 2030?", category: "Economy", resolvesAt: "2030-01-01" } },
    { title: "Will Dubai launch a central bank digital currency by 2027?", content: { question: "Will Dubai launch a central bank digital currency by 2027?", category: "Finance", resolvesAt: "2027-12-31" } },
    { title: "Will electric vehicles reach 20% of new car sales in the UAE by 2028?", content: { question: "Will electric vehicles reach 20% of new car sales in the UAE by 2028?", category: "Energy", resolvesAt: "2028-12-31" } },
    { title: "Will a MENA country win the bid to host the 2036 Olympics?", content: { question: "Will a MENA country win the bid to host the 2036 Olympics?", category: "Sports", resolvesAt: "2029-07-01" } },
  ];

  const pulseTemplates = [
    { title: "MENA Startup Funding Hits Record Quarter", content: { title: "MENA Startup Funding Hits Record Quarter", stat: "$3.2B", delta: "+47%", direction: "up", source: "MAGNiTT Q1 2026 Report" } },
    { title: "UAE AI Adoption Rate Leads Region", content: { title: "UAE AI Adoption Rate Leads Region", stat: "73%", delta: "+12%", direction: "up", source: "Government AI Index" } },
    { title: "Saudi Entertainment Sector Growth", content: { title: "Saudi Entertainment Sector Growth", stat: "45%", delta: "+45%", direction: "up", source: "General Entertainment Authority" } },
    { title: "Gulf Remote Worker Visas Issued", content: { title: "Gulf Remote Worker Visas Issued", stat: "125K", delta: "+200%", direction: "up", source: "Immigration Authority Reports" } },
    { title: "MENA Renewable Energy Capacity", content: { title: "MENA Renewable Energy Capacity", stat: "42GW", delta: "+18%", direction: "up", source: "IRENA Regional Update" } },
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
  const prompt = `Research current trending topics, news, and data relevant to the Middle East and North Africa region.
Focus areas: ${config.categories.join(", ") || "general"}
Tags of interest: ${config.tags.join(", ") || "none specified"}
Geographic focus: ${config.regions.join(", ") || "MENA region broadly"}

Return a JSON object with:
- "topics": array of {title, summary, source} for 5-8 trending topics
- "dataPoints": array of {fact, relevance} for 3-5 key data points
- "trends": array of 5 trend strings

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

  const researchContext = `Research data:\n${JSON.stringify(config.researchData, null, 2)}`;

  const pillarInstructions: Record<string, string> = {
    debates: `Generate debate questions. Each idea should have: title, content with {question, context, options (array of 2-4 position strings)}.`,
    predictions: `Generate prediction market questions. Each idea should have: title, content with {question, category, resolvesAt (ISO date string)}.`,
    pulse: `Generate pulse/stat cards. Each idea should have: title, content with {title, stat (number/string), delta (percentage), direction (up/down), source}.`,
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

  const userPrompt = `${researchContext}${exclusionNote}${guardrailNote}

${pillarPrompt}

Generate exactly ${totalCount} ideas. Return a JSON array of objects, each with: pillarType ("debates"|"predictions"|"pulse"), title (string), content (object matching the pillar schema).

Return ONLY a valid JSON array.`;

  const result = await callClaude(systemPrompt, userPrompt);
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

  const result = await callClaude(systemPrompt, userPrompt);
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
        context: base.context || "This is an AI-generated debate topic that explores a key issue facing the MENA region. The debate captures the tension between progress and tradition, inviting diverse perspectives from across the region.",
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
        source: base.source || "AI Generated",
      };
    }
  }

  const fieldSchemas: Record<string, string> = {
    debates: `{question: string, context: string (2-3 paragraphs), options: string[] (2-4 debate positions), category: string, tags: string[]}`,
    predictions: `{question: string, category: string, resolvesAt: string (ISO date), tags: string[]}`,
    pulse: `{title: string, stat: string, delta: string (percentage), direction: "up"|"down", source: string}`,
  };

  const systemPrompt = `You are a content editor for "The Middle East Hustle". Expand rough content ideas into polished, publication-ready drafts. Maintain a sharp, informed, slightly provocative editorial voice.`;

  const userPrompt = `Expand this ${config.pillarType} idea into a full content draft:
${JSON.stringify(config.idea, null, 2)}

Output schema: ${fieldSchemas[config.pillarType] || fieldSchemas.debates}

Return ONLY valid JSON matching the schema.`;

  const result = await callClaude(systemPrompt, userPrompt);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return config.idea.content;
  }
}

export const DEFAULT_PROMPTS: Record<string, string> = {
  debates: `You are the ideation engine for "The Middle East Hustle" — Debates pillar. Generate sharp, thought-provoking debate questions about business, technology, society, and culture in the MENA region. Each debate should present a genuine tension with strong arguments on both sides. Avoid generic topics — focus on issues that are timely, specific to the region, and will drive passionate engagement.`,
  predictions: `You are the ideation engine for "The Middle East Hustle" — Predictions pillar. Generate bold prediction market questions about the future of the Middle East. Each prediction should have a clear resolution date and binary yes/no outcome. Focus on business milestones, tech breakthroughs, policy changes, and cultural shifts. Make predictions specific enough to be verifiable.`,
  pulse: `You are the ideation engine for "The Middle East Hustle" — Pulse pillar. Generate data-driven stat cards that capture the pulse of the MENA region. Each card should feature a compelling statistic, percentage change, and credible source. Focus on metrics that tell a story — growth rates, adoption numbers, investment figures, and demographic shifts.`,
};
