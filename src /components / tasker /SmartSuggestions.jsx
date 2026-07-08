import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SmartSuggestions({ suggestions, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div className="bg-blue-50/60 rounded-xl p-3 mb-3 border border-blue-100/60">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-[11px] font-medium text-blue-600">Similar tasks found</span>
      </div>
      <div className="space-y-1.5">
        {suggestions.slice(0, 3).map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-white/80 hover:bg-white border border-blue-100/40 transition-colors"
          >
            <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
            {s.description && <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{s.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
