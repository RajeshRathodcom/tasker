import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SmartSuggestions from '@/components/tasker/SmartSuggestions';
import { format } from 'date-fns';
import { X, Plus } from 'lucide-react';
import { debounce } from 'lodash';

const TABS = ['Task', 'Project', 'Service'];

export default function AddDialog({ open, onClose, onRefresh, editTask, editProject, editService }) {
  const initialTab = editProject ? 1 : editService ? 2 : 0;
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Task fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deadline, setDeadline] = useState('');
  const [expDays, setExpDays] = useState(0);
  const [expHours, setExpHours] = useState(0);
  const [expMins, setExpMins] = useState(0);
  const [isTemplate, setIsTemplate] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Project fields
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projServiceId, setProjServiceId] = useState('');
  const [projColor, setProjColor] = useState('#3B82F6');
  const [projStart, setProjStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [projDeadline, setProjDeadline] = useState('');

  // Service fields
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcColor, setSvcColor] = useState('#8B5CF6');
  const [svcDeadline, setSvcDeadline] = useState('');

  // Lookup data
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (open) {
      base44.entities.Project.list().then(setProjects);
      base44.entities.Service.list().then(setServices);
    }
  }, [open]);

  // Populate edit data
  useEffect(() => {
    if (editTask) {
      setTab(0);
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setProjectId(editTask.project_id || '');
      setServiceId(editTask.service_id || '');
      setStartDate(editTask.start_date || editTask.scheduled_date || format(new Date(), 'yyyy-MM-dd'));
      setDeadline(editTask.deadline || '');
      setExpDays(editTask.expected_days || 0);
      setExpHours(editTask.expected_hours || 0);
      setExpMins(editTask.expected_minutes || 0);
      setIsTemplate(editTask.is_template || false);
    } else if (editProject) {
      setTab(1);
      setProjName(editProject.name || '');
      setProjDesc(editProject.description || '');
      setProjServiceId(editProject.service_id || '');
      setProjColor(editProject.color || '#3B82F6');
      setProjStart(editProject.start_date || format(new Date(), 'yyyy-MM-dd'));
      setProjDeadline(editProject.deadline || '');
    } else if (editService) {
      setTab(2);
      setSvcName(editService.name || '');
      setSvcDesc(editService.description || '');
      setSvcColor(editService.color || '#8B5CF6');
      setSvcDeadline(editService.deadline || '');
    }
  }, [editTask, editProject, editService]);

  // Smart suggestions
  const searchSimilar = useCallback(
    debounce(async (query) => {
      if (query.length < 2) { setSuggestions([]); return; }
      const [tasks, templates] = await Promise.all([
        base44.entities.Task.list('-created_date', 50),
        base44.entities.Task.filter({ is_template: true })
      ]);
      const all = [...templates, ...tasks];
      const unique = Array.from(new Map(all.map(t => [t.id, t])).values());
      const matches = unique.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) && t.id !== editTask?.id
      );
      setSuggestions(matches);
    }, 300),
    [editTask]
  );

  const handleTitleChange = (val) => {
    setTitle(val);
    searchSimilar(val);
  };

  const applySuggestion = (s) => {
    setTitle(s.title);
    setDescription(s.description || '');
    setProjectId(s.project_id || '');
    setSuggestions([]);
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setSubtaskInputs([]); setProjectId(''); setServiceId('');
    setStartDate(format(new Date(), 'yyyy-MM-dd')); setDeadline(''); setExpDays(0); setExpHours(0); setExpMins(0);
    setIsTemplate(false); setSuggestions([]);
    setProjName(''); setProjDesc(''); setProjServiceId(''); setProjColor('#3B82F6');
    setProjStart(format(new Date(), 'yyyy-MM-dd')); setProjDeadline('');
    setSvcName(''); setSvcDesc(''); setSvcColor('#8B5CF6'); setSvcDeadline('');
  };

  const handleSave = async () => {
    setLoading(true);
    if (tab === 0) {
      const data = {
        title, description, project_id: projectId || undefined, service_id: serviceId || undefined,
        scheduled_date: startDate, start_date: startDate, deadline: deadline || undefined,
        expected_days: expDays, expected_hours: expHours, expected_minutes: expMins,
        is_template: isTemplate
      };
      if (editTask) {
        await base44.entities.Task.update(editTask.id, data);
      } else {
        const task = await base44.entities.Task.create(data);
        if (subtaskInputs.length > 0) {
          await base44.entities.Subtask.bulkCreate(
            subtaskInputs.filter(s => s.trim()).map((s, i) => ({ title: s.trim(), task_id: task.id, order: i }))
          );
        }
      }
    } else if (tab === 1) {
      const data = { name: projName, description: projDesc, service_id: projServiceId || undefined, color: projColor, start_date: projStart, deadline: projDeadline || undefined };
      if (editProject) {
        await base44.entities.Project.update(editProject.id, data);
      } else {
        await base44.entities.Project.create(data);
      }
    } else {
      const data = { name: svcName, description: svcDesc, color: svcColor, deadline: svcDeadline || undefined };
      if (editService) {
        await base44.entities.Service.update(editService.id, data);
      } else {
        await base44.entities.Service.create(data);
      }
    }
    setLoading(false);
    resetForm();
    onRefresh?.();
    onClose();
  };

  const canSave = tab === 0 ? title.trim() : tab === 1 ? projName.trim() : svcName.trim();

  return (
    <Dialog open={open} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="max-w-md mx-auto rounded-2xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header tabs */}
        <div className="flex items-center border-b border-gray-100 px-4 pt-4 pb-0">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => !editTask && !editProject && !editService && setTab(i)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${
                tab === i ? 'text-blue-500 border-blue-500' : 'text-muted-foreground/50 border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Task form */}
          {tab === 0 && (
            <>
              <div>
                <input
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Task name"
                  className="w-full text-lg font-medium bg-transparent outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              <SmartSuggestions suggestions={suggestions} onSelect={applySuggestion} />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={2}
                className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2.5 outline-none resize-none placeholder:text-muted-foreground/30 border border-gray-100"
              />

              {/* Subtasks */}
              {!editTask && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1.5 block">Subtasks</label>
                  {subtaskInputs.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1.5">
                      <input
                        value={s}
                        onChange={e => { const copy = [...subtaskInputs]; copy[i] = e.target.value; setSubtaskInputs(copy); }}
                        placeholder={`Subtask ${i + 1}`}
                        className="flex-1 text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none border border-gray-100"
                      />
                      <button onClick={() => setSubtaskInputs(subtaskInputs.filter((_, j) => j !== i))} className="text-muted-foreground/30 hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setSubtaskInputs([...subtaskInputs, ''])} className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                    <Plus className="w-3 h-3" /> Add subtask
                  </button>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Deadline</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                </div>
              </div>

              {/* Expected time */}
              <div>
                <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Expected time</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <input type="number" min="0" value={expDays} onChange={e => setExpDays(+e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                    <span className="text-xs text-muted-foreground/50">d</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input type="number" min="0" max="23" value={expHours} onChange={e => setExpHours(+e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                    <span className="text-xs text-muted-foreground/50">h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input type="number" min="0" max="59" value={expMins} onChange={e => setExpMins(+e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                    <span className="text-xs text-muted-foreground/50">m</span>
                  </div>
                </div>
              </div>

              {/* Project & Service */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Project</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="rounded-xl bg-gray-50 border-gray-100 text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Service</label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger className="rounded-xl bg-gray-50 border-gray-100 text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Template toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Save as template</p>
                  <p className="text-[11px] text-muted-foreground/50">Reuse this task structure later</p>
                </div>
                <Switch checked={isTemplate} onCheckedChange={setIsTemplate} />
              </div>
            </>
          )}

          {/* Project form */}
          {tab === 1 && (
            <>
              <input value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project name" className="w-full text-lg font-medium bg-transparent outline-none placeholder:text-muted-foreground/30" />
              <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Description..." rows={2} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2.5 outline-none resize-none placeholder:text-muted-foreground/30 border border-gray-100" />
              <div>
                <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Service</label>
                <Select value={projServiceId} onValueChange={setProjServiceId}>
                  <SelectTrigger className="rounded-xl bg-gray-50 border-gray-100 text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Start date</label>
                  <input type="date" value={projStart} onChange={e => setProjStart(e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Deadline</label>
                  <input type="date" value={projDeadline} onChange={e => setProjDeadline(e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Color</label>
                <input type="color" value={projColor} onChange={e => setProjColor(e.target.value)} className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
              </div>
            </>
          )}

          {/* Service form */}
          {tab === 2 && (
            <>
              <input value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="Service name" className="w-full text-lg font-medium bg-transparent outline-none placeholder:text-muted-foreground/30" />
              <textarea value={svcDesc} onChange={e => setSvcDesc(e.target.value)} placeholder="Description..." rows={2} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2.5 outline-none resize-none placeholder:text-muted-foreground/30 border border-gray-100" />
              <div>
                <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Deadline</label>
                <input type="date" value={svcDeadline} onChange={e => setSvcDeadline(e.target.value)} className="w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/70 mb-1 block">Color</label>
                <input type="color" value={svcColor} onChange={e => setSvcColor(e.target.value)} className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Button onClick={handleSave} disabled={!canSave || loading} className="w-full rounded-xl h-11">
            {loading ? 'Saving...' : editTask || editProject || editService ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
