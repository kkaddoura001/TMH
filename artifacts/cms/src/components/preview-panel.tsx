import type React from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";

interface PollOption {
  text: string;
  voteCount: number;
}

interface DebateItem {
  question: string;
  context?: string;
  category: string;
  tags?: string[];
  options?: PollOption[];
}

interface PredictionItem {
  question: string;
  category: string;
  yesPercentage: number;
  noPercentage: number;
  momentum: number;
  momentumDirection: string;
  resolvesAt?: string;
  tags?: string[];
}

interface VoiceItem {
  name: string;
  headline: string;
  role: string;
  company?: string;
  sector: string;
  country: string;
  city: string;
  imageUrl?: string;
  summary: string;
  story?: string;
  lessonsLearned?: string[];
  quote?: string;
}

interface PreviewPanelProps {
  type: "debates" | "predictions" | "voices";
  item: Record<string, unknown>;
  onClose: () => void;
  onUpdate?: (field: string, value: unknown) => void;
}

function EditableText({ value, onChange, className, multiline, style }: { value: string; onChange?: (v: string) => void; className?: string; multiline?: boolean; style?: React.CSSProperties }) {
  if (!onChange) return multiline ? <p className={className} style={style}>{value}</p> : <span className={className} style={style}>{value}</span>;
  const baseClass = "bg-transparent border-b border-transparent hover:border-[rgba(255,255,255,0.2)] focus:border-[#DC143C] focus:outline-none transition-colors w-full";
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={Math.max(2, value.split("\n").length)}
        className={`${baseClass} resize-none ${className ?? ""}`}
        style={style}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${baseClass} ${className ?? ""}`}
      style={style}
    />
  );
}

export default function PreviewPanel({ type, item, onClose, onUpdate }: PreviewPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-end z-50">
      <div className="w-full max-w-lg bg-[#0A0A0A] h-full overflow-auto border-l border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.08)]">
          <span className="text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-serif">
            {onUpdate ? "Live Edit Preview" : "Preview"}
          </span>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.4)] hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {type === "debates" && <DebatePreview item={item as unknown as DebateItem} onUpdate={onUpdate} />}
          {type === "predictions" && <PredictionPreview item={item as unknown as PredictionItem} onUpdate={onUpdate} />}
          {type === "voices" && <VoicePreview item={item as unknown as VoiceItem} onUpdate={onUpdate} />}
        </div>
        {onUpdate && (
          <div className="px-6 pb-4">
            <p className="text-[10px] text-[rgba(255,255,255,0.25)] text-center">Click any text to edit inline</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DebatePreview({ item, onUpdate }: { item: DebateItem; onUpdate?: (field: string, value: unknown) => void }) {
  const totalVotes = item.options?.reduce((s: number, o: PollOption) => s + (o.voteCount || 0), 0) || 0;
  return (
    <div className="space-y-5">
      <div>
        <EditableText
          value={item.category || "Category"}
          onChange={onUpdate ? v => onUpdate("category", v) : undefined}
          className="text-xs font-semibold uppercase tracking-wider block"
          style={{ color: "#DC143C", fontFamily: "'Barlow Condensed', sans-serif" }}
        />
        <EditableText
          value={item.question || "Your question here..."}
          onChange={onUpdate ? v => onUpdate("question", v) : undefined}
          className="text-xl font-bold mt-2 text-white leading-snug block"
          multiline
        />
      </div>
      <EditableText
        value={item.context || ""}
        onChange={onUpdate ? v => onUpdate("context", v) : undefined}
        className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed"
        multiline
      />
      <div className="space-y-2">
        {item.options?.map((opt: PollOption, i: number) => {
          const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
          return (
            <div key={i} className="relative bg-[rgba(255,255,255,0.04)] rounded-lg overflow-hidden p-3">
              <div className="absolute inset-0 rounded-lg" style={{ width: `${pct}%`, background: i === 0 ? "rgba(220,20,60,0.15)" : "rgba(255,255,255,0.04)" }} />
              <div className="relative flex justify-between items-center">
                {onUpdate ? (
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => {
                      const next = [...(item.options || [])];
                      next[i] = { ...next[i], text: e.target.value };
                      onUpdate("options", next);
                    }}
                    className="text-sm text-white bg-transparent border-b border-transparent hover:border-[rgba(255,255,255,0.2)] focus:border-[#DC143C] focus:outline-none flex-1"
                  />
                ) : (
                  <span className="text-sm text-white">{opt.text}</span>
                )}
                <span className="text-sm font-semibold text-white ml-2">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)]">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionPreview({ item, onUpdate }: { item: PredictionItem; onUpdate?: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <EditableText
          value={item.category || "Category"}
          onChange={onUpdate ? v => onUpdate("category", v) : undefined}
          className="text-xs font-semibold uppercase tracking-wider block"
        />
        <EditableText
          value={item.question || "Your prediction here..."}
          onChange={onUpdate ? v => onUpdate("question", v) : undefined}
          className="text-xl font-bold mt-2 text-white leading-snug block"
          multiline
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[rgba(220,20,60,0.1)] border border-[rgba(220,20,60,0.2)] rounded-lg p-4 text-center">
          {onUpdate ? (
            <input
              type="number"
              value={item.yesPercentage}
              onChange={e => { const v = Number(e.target.value); onUpdate("yesPercentage", v); onUpdate("noPercentage", 100 - v); }}
              className="text-3xl font-bold text-white bg-transparent text-center w-full focus:outline-none border-b border-transparent hover:border-[rgba(255,255,255,0.2)] focus:border-[#DC143C]"
            />
          ) : (
            <p className="text-3xl font-bold text-white">{item.yesPercentage}%</p>
          )}
          <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">YES</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{item.noPercentage}%</p>
          <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">NO</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-[rgba(255,255,255,0.5)]">
        <div className="flex items-center gap-1">
          {item.momentumDirection === "up" ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          <span>{item.momentum}%</span>
        </div>
        {item.resolvesAt && <span>Resolves {new Date(item.resolvesAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>}
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)]">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function VoicePreview({ item, onUpdate }: { item: VoiceItem; onUpdate?: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-full object-cover border-2 border-[rgba(220,20,60,0.3)]" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[rgba(220,20,60,0.15)] flex items-center justify-center text-xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {item.name?.charAt(0) || "?"}
          </div>
        )}
        <div className="flex-1">
          <EditableText
            value={item.name || "Name"}
            onChange={onUpdate ? v => onUpdate("name", v) : undefined}
            className="text-xl font-bold text-white block"
          />
          <div className="flex gap-1 items-center text-sm text-[rgba(255,255,255,0.5)]">
            <EditableText
              value={item.role || "Role"}
              onChange={onUpdate ? v => onUpdate("role", v) : undefined}
              className="text-sm text-[rgba(255,255,255,0.5)]"
            />
            {item.company && (
              <>
                <span className="text-[rgba(255,255,255,0.3)]">,</span>
                <EditableText
                  value={item.company}
                  onChange={onUpdate ? v => onUpdate("company", v) : undefined}
                  className="text-sm text-[rgba(255,255,255,0.5)]"
                />
              </>
            )}
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{item.city || "City"}, {item.country || "Country"} · {item.sector || "Sector"}</p>
        </div>
      </div>
      {(item.headline || onUpdate) && (
        <EditableText
          value={item.headline || ""}
          onChange={onUpdate ? v => onUpdate("headline", v) : undefined}
          className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed italic"
          multiline
        />
      )}
      {(item.summary || onUpdate) && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Summary</h3>
          <EditableText
            value={item.summary || ""}
            onChange={onUpdate ? v => onUpdate("summary", v) : undefined}
            className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed"
            multiline
          />
        </div>
      )}
      {item.story && item.story !== item.summary && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Story</h3>
          <EditableText
            value={item.story}
            onChange={onUpdate ? v => onUpdate("story", v) : undefined}
            className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed whitespace-pre-wrap"
            multiline
          />
        </div>
      )}
      {item.lessonsLearned && item.lessonsLearned.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Lessons Learned</h3>
          <ul className="space-y-1.5">
            {item.lessonsLearned.map((lesson: string, i: number) => (
              <li key={i} className="text-sm text-[rgba(255,255,255,0.7)] flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">▸</span>
                {onUpdate ? (
                  <input
                    type="text"
                    value={lesson}
                    onChange={e => {
                      const next = [...(item.lessonsLearned || [])];
                      next[i] = e.target.value;
                      onUpdate("lessonsLearned", next);
                    }}
                    className="flex-1 text-sm text-[rgba(255,255,255,0.7)] bg-transparent border-b border-transparent hover:border-[rgba(255,255,255,0.2)] focus:border-[#DC143C] focus:outline-none"
                  />
                ) : (
                  lesson
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.quote && (
        <blockquote className="border-l-2 border-[#DC143C] pl-4 py-1">
          <EditableText
            value={item.quote}
            onChange={onUpdate ? v => onUpdate("quote", v) : undefined}
            className="text-sm text-[rgba(255,255,255,0.8)] italic"
          />
        </blockquote>
      )}
    </div>
  );
}
