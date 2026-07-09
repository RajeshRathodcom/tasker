import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, differenceInDays } from 'date-fns';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/tasker/StatCard';
import TaskCard from '@/components/tasker/TaskCard';
import FocusMode from '@/components/tasker/FocusMode';
import RolloverDialog from '@/components/tasker/RolloverDialog';
import AddDialog from '@/components/tasker/AddDialog';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusTask, setFocusTask] = useState(null);
  const [rolloverTask, setRolloverTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [user, setUser] = useState(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadData = async () => {
    const [t, all, s, te, svc, proj, me] = await Promise.all([
      base44.entities.Task.filter({ scheduled_date: today, is_template: false }),
      base44.entities.Task.filter({ is_template: false }),
      base44.entities.Subtask.list('-created_date', 500),
      base44.entities.TimeEntry.filter({ date: today }),
      base44.entities.Service.list(),
      base44.entities.Project.list(),
      base44.auth.me()
    ]);
    t.sort((a, b) => (a.priority_order || 0) - (b.priority_order || 0));
    setTasks(t);
    setAllTasks(all);
    setSubtasks(s);
    setTimeEntries(te);
    setServices(svc);
    setProjects(proj);
    setUser(me);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Stats
  const todayTime = useMemo(() => timeEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0), [timeEntries]);
  const completedToday = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const nearestDeadline = useMemo(() => {
    const deadlines = services.filter(s => s.deadline && s.status === 'active').map(s => differenceInDays(new Date(s.deadline), new Date()));
    return deadlines.length ? Math.min(...deadlines) : null;
  }, [services]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTasks(items);
    await Promise.all(items.map((t, i) => base44.entities.Task.update(t.id, { priority_order: i })));
  };

  const handleStart = async (task) => {
    await base44.entities.Task.update(task.id, { status: 'in_progress' });
    setFocusTask({ ...task, status: 'in_progress' });
  };

  const handleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await base44.entities.Task.update(task.id, {
      status: newStatus,
      completed_date: newStatus === 'completed' ? today : undefined
    });
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

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <>
      <div className="px-5 pt-12 pb-4">
        {/* Greeting */}
        <p className="text-sm text-muted-foreground/60 font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{firstName}</h1>

        {/* Stat cards */}
        <div className="flex gap-3 mt-5">
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Time today"
            value={formatTime(todayTime)}
            color="bg-blue-50 text-blue-500"
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Completed"
            value={`${completedToday}/${tasks.length}`}
            color="bg-green-50 text-green-500"
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Deadline"
            value={nearestDeadline !== null ? `${nearestDeadline}d` : '—'}
            sublabel={nearestDeadline !== null ? 'nearest' : 'No deadlines'}
            color="bg-amber-50 text-amber-500"
          />
        </div>

        {/* Today's tasks */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Today's Tasks</h2>

          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-muted-foreground/50 font-medium">No tasks for today</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Tap + to add one</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <TaskCard
                            task={task}
                            subtasks={subtasks.filter(s => s.task_id === task.id)}
                            projectName={task.project_id ? projectMap[task.project_id]?.name : null}
                            onStart={handleStart}
                            onComplete={handleComplete}
                            onEdit={(t) => setEditTask(t)}
                            onDelete={handleDelete}
                            onRollover={(t) => setRolloverTask(t)}
                            onRefresh={loadData}
                            provided={provided}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Focus mode overlay */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onStop={() => { setFocusTask(null); loadData(); }}
          onRefresh={loadData}
        />
      )}

      {/* Rollover dialog */}
      {rolloverTask && (
        <RolloverDialog
          task={rolloverTask}
          open={!!rolloverTask}
          onClose={() => setRolloverTask(null)}
          onRefresh={loadData}
        />
      )}

      {/* Edit dialog */}
      {editTask && (
        <AddDialog
          open={!!editTask}
          onClose={() => setEditTask(null)}
          onRefresh={loadData}
          editTask={editTask}
        />
      )}
    </>
  );
}
