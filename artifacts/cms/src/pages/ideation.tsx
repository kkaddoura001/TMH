import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Sparkles, Send, X, Plus, Settings2, Loader2, Copy, ChevronDown, ChevronUp, Database, MessageSquare } from "lucide-react";

type ContentType = "debate" | "prediction" | "pulse";

interface GeneratedIdea {
  [key: string]: unknown;
}

const CATEGORY_PRESETS: Record<ContentType, string[]> = {
  debate: ["Business", "Culture & Society", "Technology & AI", "Economy & Finance", "Geopolitics", "Women & Equality", "Startups", "Media & Influence"],
  prediction: ["Economy & Finance", "Technology & AI", "Energy & Climate", "Culture & Society", "Business & Startups", "Geopolitics & Governance", "Education & Workforce", "Infrastructure & Cities", "Sports & Entertainment", "Health & Demographics"],
  pulse: ["POWER", "MONEY", "SOCIETY", "TECHNOLOGY", "SURVIVAL", "MIGRATION", "CULTURE", "HEALTH"],
};

const QUICK_PROMPTS: Record<ContentType, string[]> = {
  debate: [
    "Generate polarizing debates about UAE tech policy",
    "Create debates about Saudi Vision 2030 progress",
    "Generate culture war debates for the MENA region",
    "Create debates about women's rights in the Gulf",
    "Generate debates about MENA startup ecosystem",
  ],
  prediction: [
    "Generate predictions about MENA IPOs in 2027",
    "Create predictions about AI adoption in the Gulf",
    "Generate predictions about MENA energy transition",
    "Create predictions about population growth trends",
    "Generate predictions about MENA tech unicorns",
  ],
  pulse: [
    "Generate pulse topics about Gulf economic data",
    "Create trend cards about MENA migration patterns",
    "Generate pulse topics about regional tech metrics",
    "Create trend cards about MENA health statistics",
    "Generate pulse topics about cultural shifts",
  ],
};

function PillInput({ items, onChange, placeholder, presets }: { items: string[]; onChange: (items: string[]) => void; placeholder: string; presets?: string[] }) {
  const [input, setInput] = useState("");

  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput("");
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-sm text-xs">
            {item}
            <button onClick={() => remove(i)} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          placeholder={placeholder}
          className="flex-1 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={() => add(input)} className="px-2 py-1.5 bg-secondary rounded-sm text-xs hover:bg-secondary/80">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {presets.filter(p => !items.includes(p)).slice(0, 6).map(p => (
            <button key={p} onClick={() => add(p)} className="px-1.5 py-0.5 text-[0.6rem] border border-border/50 rounded-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors">
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, contentType, index, onCopy }: { idea: GeneratedIdea; contentType: ContentType; index: number; onCopy: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const title = (idea.question || idea.title || `Idea ${index + 1}`) as string;
  const category = (idea.category || idea.tag || "") as string;
  const context = (idea.context || idea.blurb || "") as string;
  const tags = (idea.tags || []) as string[];

  return (
    <div className="border border-border/50 rounded-sm bg-card">
      <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className="text-[0.6rem] font-bold text-muted-foreground mt-0.5">#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{title}</p>
          {category && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase bg-primary/10 text-primary rounded-sm">{category}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); onCopy(); }} className="p-1 text-muted-foreground hover:text-foreground" title="Copy JSON">
            <Copy className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
          {context && <p className="text-xs text-muted-foreground">{context}</p>}
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.map((tag, i) => (
                <span key={i} className="px-1.5 py-0.5 text-[0.6rem] bg-secondary text-secondary-foreground rounded-sm">{tag}</span>
              ))}
            </div>
          )}
          {idea.resolvesAt && <p className="text-xs text-muted-foreground">Resolves: {idea.resolvesAt as string}</p>}
          {idea.stat && <p className="text-xs font-mono text-muted-foreground">Stat: {idea.stat as string}</p>}
          {idea.source && <p className="text-xs text-muted-foreground">Source: {idea.source as string}</p>}
          <details className="mt-2">
            <summary className="text-[0.6rem] text-muted-foreground cursor-pointer uppercase">Raw JSON</summary>
            <pre className="mt-1 text-[0.6rem] text-muted-foreground bg-background p-2 rounded-sm overflow-auto max-h-40">{JSON.stringify(idea, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default function IdeationPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "editor">("chat");
  const [contentType, setContentType] = useState<ContentType>("debate");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [guardrails, setGuardrails] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; content: string; ideas?: GeneratedIdea[] }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamText]);

  const generate = async (userPrompt?: string) => {
    const finalPrompt = userPrompt || prompt;
    if (!finalPrompt.trim() && categories.length === 0) return;

    setChatHistory(prev => [...prev, { role: "user", content: finalPrompt || `Generate ${count} ${contentType} ideas` }]);
    setPrompt("");
    setGenerating(true);
    setStreamText("");

    try {
      const result = await api.generateIdeas(
        { contentType, prompt: finalPrompt, count, guardrails, categories },
        (chunk) => setStreamText(prev => prev + chunk)
      );
      setIdeas(result);
      setChatHistory(prev => [...prev, { role: "ai", content: `Generated ${result.length} ${contentType} ideas`, ideas: result }]);
      setStreamText("");
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "ai", content: `Error: ${e instanceof Error ? e.message : "Generation failed"}` }]);
      setStreamText("");
    } finally {
      setGenerating(false);
    }
  };

  const copyIdea = (idea: GeneratedIdea) => {
    navigator.clipboard.writeText(JSON.stringify(idea, null, 2)).catch(() => {});
  };

  return (
    <div className="space-y-4 max-w-5xl h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Ideation Engine<span className="text-primary">.</span>
        </h1>
        <div className="flex items-center gap-2">
          <select value={contentType} onChange={e => { setContentType(e.target.value as ContentType); setCategories([]); }} className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="debate">Debates</option>
            <option value="prediction">Predictions</option>
            <option value="pulse">Pulse Topics</option>
          </select>
          <button onClick={() => setShowConfig(!showConfig)} className={`p-1.5 rounded-sm transition-colors ${showConfig ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-0 border-b border-border">
        <button onClick={() => setActiveTab("chat")} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "chat" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button onClick={() => setActiveTab("editor")} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "editor" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Database className="w-4 h-4" /> Content Editor
        </button>
      </div>

      {showConfig && (
        <div className="border border-border rounded-sm p-4 space-y-3 bg-card">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide">AI Config</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6rem] text-muted-foreground uppercase mb-1">Ideas to Generate</label>
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))} className="flex-1" />
                <span className="text-sm font-mono w-6 text-center">{count}</span>
              </div>
            </div>
            <div>
              <label className="block text-[0.6rem] text-muted-foreground uppercase mb-1">Content Type</label>
              <select value={contentType} onChange={e => { setContentType(e.target.value as ContentType); setCategories([]); }} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="debate">Debates</option>
                <option value="prediction">Predictions</option>
                <option value="pulse">Pulse Topics</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[0.6rem] text-muted-foreground uppercase mb-1">Focus Categories</label>
            <PillInput items={categories} onChange={setCategories} placeholder="Add category..." presets={CATEGORY_PRESETS[contentType]} />
          </div>
          <div>
            <label className="block text-[0.6rem] text-muted-foreground uppercase mb-1">Guardrails (topics to avoid/handle sensitively)</label>
            <PillInput items={guardrails} onChange={setGuardrails} placeholder="Add guardrail..." presets={["Religion", "Sectarianism", "Israel-Palestine", "Royal families", "Military conflicts", "Graphic violence"]} />
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="flex flex-col" style={{ height: showConfig ? "calc(100vh - 26rem)" : "calc(100vh - 14rem)" }}>
          <div className="flex-1 overflow-auto space-y-3 pr-2 mb-3">
            {chatHistory.length === 0 && !generating && (
              <div className="text-center py-8 space-y-4">
                <Sparkles className="w-10 h-10 text-primary/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Start a conversation or pick a prompt to generate {contentType} ideas</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
                  {QUICK_PROMPTS[contentType].map((qp, i) => (
                    <button key={i} onClick={() => { setPrompt(qp); generate(qp); }} className="px-3 py-1.5 text-xs border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-left">
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-sm p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                  <p className="text-sm">{msg.content}</p>
                  {msg.ideas && msg.ideas.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.ideas.map((idea, j) => (
                        <IdeaCard key={j} idea={idea} contentType={contentType} index={j} onCopy={() => copyIdea(idea)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {generating && streamText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-sm p-3 bg-card border border-border" ref={streamRef}>
                  <div className="flex items-center gap-2 mb-1">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-[0.6rem] text-primary uppercase font-bold">Generating...</span>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-60 overflow-auto font-mono">{streamText}</pre>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2 items-end">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }}
              placeholder={`Describe the ${contentType} ideas you want...`}
              rows={2}
              disabled={generating}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
            />
            <button onClick={() => generate()} disabled={generating || (!prompt.trim() && categories.length === 0)} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:bg-primary/90 disabled:opacity-50 h-[52px] flex items-center gap-1.5">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {generating ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "editor" && (
        <div className="space-y-4" style={{ height: showConfig ? "calc(100vh - 26rem)" : "calc(100vh - 14rem)", overflowY: "auto" }}>
          {ideas.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Database className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">No generated ideas yet. Use the Chat tab to generate content first.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold uppercase tracking-wide">{ideas.length} Generated {contentType}s</h2>
                <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(ideas, null, 2)).catch(() => {}); }} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
                  <Copy className="w-3 h-3" /> Copy All JSON
                </button>
              </div>
              <div className="space-y-2">
                {ideas.map((idea, i) => (
                  <IdeaCard key={i} idea={idea} contentType={contentType} index={i} onCopy={() => copyIdea(idea)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
