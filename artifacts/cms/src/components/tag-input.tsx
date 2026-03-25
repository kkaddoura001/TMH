import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export default function TagInput({ tags, onChange, suggestions = [], placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = suggestions.filter(s =>
    !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 bg-background border border-border rounded-md min-h-[38px]">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
            #{tag}
            <button type="button" onClick={() => removeTag(i)} className="text-muted-foreground hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none"
        />
      </div>
      {showSuggestions && (input || tags.length === 0) && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-40 overflow-auto bg-card border border-border rounded-md shadow-lg">
          {filtered.slice(0, 15).map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary/50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">#</span>{suggestion}
            </button>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground mt-1">Press Enter or comma to add. Type to search suggestions or create custom tags.</p>
    </div>
  );
}
