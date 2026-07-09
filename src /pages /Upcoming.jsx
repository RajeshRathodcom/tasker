import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { CalendarClock, ChevronRight } from 'lucide-react';
import AddDialog from '@/components/tasker/AddDialog';
import RolloverDialog from '@/components/tasker/RolloverDialog';

export default function Upcoming() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [rolloverTask, setRolloverTask] = useState(null);

  const today = startOfDay(new Date());

  const loadData = async () => {
    const [t, p] = await Promise.all([
      base44.entities.Task.filter({ is_template: false }, '-scheduled_date', 200),
      base44.entities.Project.list()
    ]);
    setTasks(t);
    setProjects(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);

  const futureTasks = useMemo(() =>
    tasks.filter(t =>
      t.scheduled_date && isAfter(parseISO(t.scheduled_date), today) && t.status !== 'completed'
    ), [tasks, today]
  );

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    futureTasks.forEach(t => {
      const key = t.scheduled_date;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [futureTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold tracking-tight">Upcoming</h1>
      <p className="text-sm text-muted-foreground/50 mt-1">{futureTasks.length} tasks scheduled</p>

      {grouped.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CalendarClock className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-muted-foreground/50 font-medium">No upcoming tasks</p>
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
                  <div key={task.id} className="bg-white rounded-xl p-3.5 border border-gray-100/80 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {task.project_id && projectMap[task.project_id] && (
                        <span className="text-[11px] text-muted-foreground/50">{projectMap[task.project_id].name}</span>
                      )}
                    </div>
                    <button onClick={() => setEditTask(task)} className="text-muted-foreground/30 hover:text-muted-foreground">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editTask && (
        <AddDialog open={!!editTask} onClose={() => setEditTask(null)} onRefresh={loadData} editTask={editTask} />
      )}
      {rolloverTask && (
        <RolloverDialog task={rolloverTask} open={!!rolloverTask} onClose={() => setRolloverTask(null)} onRefresh={loadData} />
      )}
    </div>
  );
}
