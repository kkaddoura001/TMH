import { Plus, X, GripVertical } from "lucide-react";

interface DynamicListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function DynamicList({ items, onChange, placeholder = "Add item...", label }: DynamicListProps) {
  const addItem = () => onChange([...items, ""]);
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <button type="button" className="text-muted-foreground cursor-grab" onMouseDown={(e) => e.preventDefault()}>
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={item}
            onChange={e => updateItem(i, e.target.value)}
            className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={placeholder}
          />
          <div className="flex gap-1">
            {i > 0 && <button type="button" onClick={() => moveItem(i, i - 1)} className="text-xs text-muted-foreground hover:text-foreground px-1">↑</button>}
            {i < items.length - 1 && <button type="button" onClick={() => moveItem(i, i + 1)} className="text-xs text-muted-foreground hover:text-foreground px-1">↓</button>}
          </div>
          <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}
