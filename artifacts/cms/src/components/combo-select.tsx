import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ComboSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
}

export default function ComboSelect({ value, onChange, options, placeholder = "Select or type...", allowCustom = true }: ComboSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o =>
    o.toLowerCase().includes((search || value).toLowerCase())
  );

  const displayValue = search !== "" ? search : value;

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={e => {
            setSearch(e.target.value);
            if (allowCustom) onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-8"
        />
        <button
          type="button"
          onClick={() => { setOpen(!open); inputRef.current?.focus(); }}
          className="absolute right-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-card border border-border rounded-md shadow-lg">
          {filtered.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => { onChange(option); setSearch(""); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-secondary/50 transition-colors ${value === option ? "text-primary font-medium" : "text-foreground"}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
