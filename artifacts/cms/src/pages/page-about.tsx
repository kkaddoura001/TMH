import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Save, Plus, Trash2 } from "lucide-react";

interface Pillar {
  num: string;
  title: string;
  body: string;
  link: string;
  cta: string;
}

interface Belief {
  num: string;
  title: string;
  body: string;
}

interface AboutConfig {
  hero: { tagline: string; title: string; subtitle: string };
  pillars: Pillar[];
  beliefs: Belief[];
}

export default function PageAbout() {
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPage("about").then(setConfig).catch(console.error).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.updatePage("about", config as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!config) return <div className="text-center py-12 text-red-500">Failed to load About page config</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide">About Page<span className="text-primary">.</span></h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:bg-primary/90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <section className="border border-border rounded-sm p-4 space-y-3">
        <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Hero Section</h2>
        <div>
          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Tagline</label>
          <input value={config.hero.tagline} onChange={e => setConfig({ ...config, hero: { ...config.hero, tagline: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Title</label>
          <input value={config.hero.title} onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Subtitle</label>
          <textarea value={config.hero.subtitle} onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
      </section>

      <section className="border border-border rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">The Four Pillars</h2>
          <button onClick={() => setConfig({ ...config, pillars: [...config.pillars, { num: String(config.pillars.length + 1).padStart(2, "0"), title: "", body: "", link: "/", cta: "" }] })} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
            <Plus className="w-3 h-3" /> Add Pillar
          </button>
        </div>
        {config.pillars.map((p, i) => (
          <div key={i} className="border border-border/50 rounded-sm p-3 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-bold">{p.num}</span>
              <button onClick={() => setConfig({ ...config, pillars: config.pillars.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input value={p.title} onChange={e => { const pillars = [...config.pillars]; pillars[i] = { ...p, title: e.target.value }; setConfig({ ...config, pillars }); }} placeholder="Title" className="w-full px-3 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <textarea value={p.body} onChange={e => { const pillars = [...config.pillars]; pillars[i] = { ...p, body: e.target.value }; setConfig({ ...config, pillars }); }} rows={3} placeholder="Description" className="w-full px-3 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            <div className="grid grid-cols-2 gap-2">
              <input value={p.link} onChange={e => { const pillars = [...config.pillars]; pillars[i] = { ...p, link: e.target.value }; setConfig({ ...config, pillars }); }} placeholder="Link path" className="px-3 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={p.cta} onChange={e => { const pillars = [...config.pillars]; pillars[i] = { ...p, cta: e.target.value }; setConfig({ ...config, pillars }); }} placeholder="CTA text" className="px-3 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        ))}
      </section>

      <section className="border border-border rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Core Beliefs</h2>
          <button onClick={() => setConfig({ ...config, beliefs: [...config.beliefs, { num: String(config.beliefs.length + 1).padStart(2, "0"), title: "", body: "" }] })} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
            <Plus className="w-3 h-3" /> Add Belief
          </button>
        </div>
        {config.beliefs.map((b, i) => (
          <div key={i} className="border border-border/50 rounded-sm p-3 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-bold">{b.num}</span>
              <button onClick={() => setConfig({ ...config, beliefs: config.beliefs.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input value={b.title} onChange={e => { const beliefs = [...config.beliefs]; beliefs[i] = { ...b, title: e.target.value }; setConfig({ ...config, beliefs }); }} placeholder="Title" className="w-full px-3 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <textarea value={b.body} onChange={e => { const beliefs = [...config.beliefs]; beliefs[i] = { ...b, body: e.target.value }; setConfig({ ...config, beliefs }); }} rows={2} placeholder="Description" className="w-full px-3 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
        ))}
      </section>
    </div>
  );
}
