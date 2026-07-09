import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';

export default function Completed() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [t, p] = await Promise.all([
      base44.entities.Task.filter({ status: 'completed', is_template: false }, '-completed_date', 200),
      base44.entities.Project.list()
    ]);
    setTasks(t);
    setProjects(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);

  const grouped = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const key = t.completed_date || format(new Date(t.updated_date), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [tasks]);

  const handleReopen = async (task) => {
    await base44.entities.Task.update(task.id, { status: 'todo', completed_date: undefined, scheduled_date: format(new Date(), 'yyyy-MM-dd') });
    loadData();
  };

  const handleDelete = async (task) => {
    await base44.entities.Task.delete(task.id);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold tracking-tight">Completed</h1>
      <p className="text-sm text-muted-foreground/50 mt-1">{tasks.length} tasks done</p>

      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-muted-foreground/50 font-medium">No completed tasks yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(([date, dateTasks]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">
                {format(parseISO(date), 'EEEE, MMM d')}
              </h3>
              <div className="space-y-2">
                {dateTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-xl p-3.5 border border-gray-100/80 shadow-sm flex items-center gap-3 group">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground/60 line-through truncate">{task.title}</p>
                      {task.project_id && projectMap[task.project_id] && (
                        <span className="text-[11px] text-muted-foreground/40">{projectMap[task.project_id].name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleReopen(task)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground/40" title="Reopen">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(task)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/40 hover:text-destructive" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {task.total_time_spent > 0 && (
                      <span className="text-[11px] text-muted-foreground/40 flex-shrink-0">
                        {Math.floor(task.total_time_spent / 3600)}h {Math.floor((task.total_time_spent % 3600) / 60)}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
