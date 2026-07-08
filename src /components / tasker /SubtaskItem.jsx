import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

export default function SubtaskItem({ subtask, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 group">
      <Checkbox
        checked={subtask.status === 'completed'}
        onCheckedChange={() => onToggle(subtask)}
        className="h-4 w-4 rounded-full border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
      />
      <span className={`flex-1 text-sm ${subtask.status === 'completed' ? 'line-through text-muted-foreground/50' : 'text-foreground/80'}`}>
        {subtask.title}
      </span>
      <button
        onClick={() => onDelete(subtask.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground/40 hover:text-destructive"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
