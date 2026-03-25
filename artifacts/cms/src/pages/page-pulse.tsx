import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface TopicCard {
  id: string;
  tag: string;
  title: string;
  stat: string;
  delta: string;
  deltaUp: boolean;
  blurb: string;
  source: string;
}

interface PulseCategory {
  key: string;
  label: string;
  color: string;
}

interface PulseConfig {
  hero: { title: string; subtitle: string };
  categories: PulseCategory[];
  topicCards: TopicCard[];
}

export default function PagePulse() {
  const [config, setConfig] = useState<PulseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("ALL");

  useEffect(() => {
    api.getPage("pulse").then(setConfig).catch(console.error).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.updatePage("pulse", config as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!config) return <div className="text-center py-12 text-red-500">Failed to load Pulse config</div>;

  const filteredCards = filterCat === "ALL" ? config.topicCards : config.topicCards.filter(c => c.tag === filterCat);

  const addCard = () => {
    const newCard: TopicCard = {
      id: `card-${Date.now()}`,
      tag: "POWER",
      title: "New Topic Card",
      stat: "0",
      delta: "0%",
      deltaUp: true,
      blurb: "",
      source: "",
    };
    setConfig({ ...config, topicCards: [...config.topicCards, newCard] });
    setExpandedCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<TopicCard>) => {
    setConfig({
      ...config,
      topicCards: config.topicCards.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };

  const deleteCard = (id: string) => {
    if (!confirm("Delete this topic card?")) return;
    setConfig({ ...config, topicCards: config.topicCards.filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide">Pulse Page<span className="text-primary">.</span></h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:bg-primary/90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <section className="border border-border rounded-sm p-4 space-y-3">
        <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Hero</h2>
        <input value={config.hero.title} onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })} placeholder="Title" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <textarea value={config.hero.subtitle} onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })} rows={2} placeholder="Subtitle" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
      </section>

      <section className="border border-border rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Categories</h2>
          <button onClick={() => setConfig({ ...config, categories: [...config.categories, { key: `CAT_${Date.now()}`, label: "New Category", color: "#DC143C" }] })} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {config.categories.map((cat, i) => (
            <div key={cat.key} className="flex items-center gap-2 p-2 border border-border/50 rounded-sm bg-card">
              <input type="color" value={cat.color} onChange={e => { const cats = [...config.categories]; cats[i] = { ...cat, color: e.target.value }; setConfig({ ...config, categories: cats }); }} className="w-6 h-6 border-0 cursor-pointer" />
              <input value={cat.label} onChange={e => { const cats = [...config.categories]; cats[i] = { ...cat, label: e.target.value }; setConfig({ ...config, categories: cats }); }} className="flex-1 px-2 py-1 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              {cat.key !== "ALL" && (
                <button onClick={() => setConfig({ ...config, categories: config.categories.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border border-border rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Topic Cards ({config.topicCards.length})</h2>
          <button onClick={addCard} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90">
            <Plus className="w-3 h-3" /> Add Card
          </button>
        </div>

        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterCat("ALL")} className={`px-2 py-1 text-xs rounded-sm ${filterCat === "ALL" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>All</button>
          {config.categories.filter(c => c.key !== "ALL").map(cat => (
            <button key={cat.key} onClick={() => setFilterCat(cat.key)} className={`px-2 py-1 text-xs rounded-sm ${filterCat === cat.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredCards.map(card => (
            <div key={card.id} className="border border-border/50 rounded-sm bg-card">
              <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}>
                <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground uppercase">{card.tag}</span>
                <span className="text-sm font-medium flex-1">{card.title}</span>
                <span className="text-xs text-muted-foreground">{card.stat}</span>
                {expandedCard === card.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              {expandedCard === card.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Title</label>
                      <input value={card.title} onChange={e => updateCard(card.id, { title: e.target.value })} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Category Tag</label>
                      <select value={card.tag} onChange={e => updateCard(card.id, { tag: e.target.value })} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        {config.categories.filter(c => c.key !== "ALL").map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Stat</label>
                      <input value={card.stat} onChange={e => updateCard(card.id, { stat: e.target.value })} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Delta</label>
                      <input value={card.delta} onChange={e => updateCard(card.id, { delta: e.target.value })} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Direction</label>
                      <select value={card.deltaUp ? "up" : "down"} onChange={e => updateCard(card.id, { deltaUp: e.target.value === "up" })} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Blurb</label>
                    <textarea value={card.blurb} onChange={e => updateCard(card.id, { blurb: e.target.value })} rows={3} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] text-muted-foreground uppercase mb-0.5">Source</label>
                    <input value={card.source} onChange={e => updateCard(card.id, { source: e.target.value })} className="w-full px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <button onClick={() => deleteCard(card.id)} className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded-sm">
                    <Trash2 className="w-3 h-3" /> Delete Card
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
