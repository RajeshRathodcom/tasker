import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Play, ChevronDown, ChevronUp, MoreHorizontal, Calendar, Trash2, Pencil, ArrowRightCircle, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SubtaskItem from '@/components/tasker/SubtaskItem';
import { format } from 'date-fns';

export default function TaskCard({ task, subtasks = [], projectName, onStart, onComplete, onEdit, onDelete, onRollover, onRefresh, provided }) {
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [adding, setAdding] = useState(false);

  const completedSubs = subtasks.filter(s => s.status === 'completed').length;
  const totalSubs = subtasks.length;

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    await base44.entities.Subtask.create({ title: newSubtask.trim(), task_id: task.id, order: totalSubs });
    setNewSubtask('');
    setAdding(false);
    onRefresh?.();
  };

  const toggleSubtask = async (sub) => {
    await base44.entities.Subtask.update(sub.id, { status: sub.status === 'completed' ? 'todo' : 'completed' });
    onRefresh?.();
  };

  const deleteSubtask = async (id) => {
    await base44.entities.Subtask.delete(id);
    onRefresh?.();
  };

  const isActive = task.status === 'in_progress';

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`bg-white rounded-2xl border transition-all duration-200 ${isActive ? 'border-blue-200 shadow-md shadow-blue-100/50 ring-1 ring-blue-100' : 'border-gray-100/80 shadow-sm'}`}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Complete button */}
          <button
            onClick={() => onComplete(task)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Task info */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-[15px] font-medium leading-snug ${task.status === 'completed' ? 'line-through text-muted-foreground/50' : ''}`}>
              {task.title}
            </h3>
            {projectName && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-medium">
                {projectName}
              </span>
            )}
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {task.status !== 'completed' && (
              <button
                onClick={() => onStart(task)}
                className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-muted-foreground/50 hover:bg-gray-100'}`}
              >
                <Play className="w-4 h-4" fill={isActive ? 'currentColor' : 'none'} />
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg text-muted-foreground/40 hover:bg-gray-100 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRollover(task)}>
                  <ArrowRightCircle className="w-3.5 h-3.5 mr-2" /> Rollover
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2.5 ml-8">
          {task.deadline && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.deadline), 'MMM d')}
            </span>
          )}
          {totalSubs > 0 && (
            <span className="text-[11px] text-muted-foreground/60">
              {completedSubs}/{totalSubs} subtasks
            </span>
          )}
          {task.total_time_spent > 0 && (
            <span className="text-[11px] text-muted-foreground/60">
              {Math.floor(task.total_time_spent / 3600)}h {Math.floor((task.total_time_spent % 3600) / 60)}m
            </span>
          )}
        </div>

        {/* Expand toggle */}
        {(totalSubs > 0 || task.status !== 'completed') && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 ml-8 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Less' : totalSubs > 0 ? 'Subtasks' : 'Add subtask'}
          </button>
        )}
      </div>

      {/* Subtasks section */}
      {expanded && (
        <div className="px-4 pb-3 ml-8 border-t border-gray-50 pt-2">
          {subtasks.map(sub => (
            <SubtaskItem key={sub.id} subtask={sub} onToggle={toggleSubtask} onDelete={deleteSubtask} />
          ))}
          {adding ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                autoFocus
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Subtask name..."
                className="flex-1 text-sm bg-transparent border-b border-gray-200 focus:border-blue-400 outline-none py-1 placeholder:text-muted-foreground/30"
              />
              <button onClick={handleAddSubtask} className="text-blue-500 text-xs font-medium">Add</button>
              <button onClick={() => { setAdding(false); setNewSubtask(''); }} className="text-muted-foreground/40 text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 mt-1 text-xs text-blue-500 hover:text-blue-600 transition-colors">
              <Plus className="w-3 h-3" /> Add subtask
            </button>
          )}
        </div>
      )}
    </div>
  );
}
