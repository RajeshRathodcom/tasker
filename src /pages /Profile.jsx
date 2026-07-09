import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Settings, FileText, FolderOpen, Briefcase, LogOut, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddDialog from '@/components/tasker/AddDialog';

export default function Profile() {
  const [topTab, setTopTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [templateTab, setTemplateTab] = useState('tasks');
  const [editItem, setEditItem] = useState({ task: null, project: null, service: null });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [me, t, p, s] = await Promise.all([
      base44.auth.me(),
      base44.entities.Task.filter({ is_template: true }),
      base44.entities.Project.list(),
      base44.entities.Service.list()
    ]);
    setUser(me);
    setTasks(t);
    setProjects(p);
    setServices(s);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleteTemplate = async (id) => {
    await base44.entities.Task.delete(id);
    loadData();
  };

  const handleDeleteProject = async (id) => {
    await base44.entities.Project.delete(id);
    loadData();
  };

  const handleDeleteService = async (id) => {
    await base44.entities.Service.delete(id);
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
      {/* Top tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTopTab('profile')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${topTab === 'profile' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground/50'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setTopTab('settings')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${topTab === 'settings' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground/50'}`}
        >
          Settings
        </button>
      </div>

      {topTab === 'profile' && (
        <>
          {/* Profile card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user?.full_name || 'User'}</h2>
                <p className="text-sm text-muted-foreground/50">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile sub-tabs: Profile info / Templates */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => setTemplateTab('tasks')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${templateTab === 'tasks' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground/50'}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" />Tasks
            </button>
            <button
              onClick={() => setTemplateTab('projects')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${templateTab === 'projects' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground/50'}`}
            >
              <FolderOpen className="w-3.5 h-3.5 inline mr-1" />Projects
            </button>
            <button
              onClick={() => setTemplateTab('services')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${templateTab === 'services' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground/50'}`}
            >
              <Briefcase className="w-3.5 h-3.5 inline mr-1" />Services
            </button>
          </div>

          {/* Templates list */}
          {templateTab === 'tasks' && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Task Templates</h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground/40 py-8 text-center">No task templates saved yet</p>
              ) : tasks.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-3.5 border border-gray-100/80 shadow-sm flex items-center gap-3 group">
                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    {t.description && <p className="text-[11px] text-muted-foreground/40 truncate">{t.description}</p>}
                  </div>
                  <button onClick={() => setEditItem({ task: t, project: null, service: null })} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground/30">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/30 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {templateTab === 'projects' && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Projects</h3>
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground/40 py-8 text-center">No projects yet</p>
              ) : projects.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-3.5 border border-gray-100/80 shadow-sm flex items-center gap-3 group">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || '#3B82F6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {p.description && <p className="text-[11px] text-muted-foreground/40 truncate">{p.description}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${p.status === 'active' ? 'bg-green-50 text-green-600' : p.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                    {p.status}
                  </span>
                  <button onClick={() => setEditItem({ task: null, project: p, service: null })} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground/30">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/30 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {templateTab === 'services' && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Services</h3>
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground/40 py-8 text-center">No services yet</p>
              ) : services.map(s => (
                <div key={s.id} className="bg-white rounded-xl p-3.5 border border-gray-100/80 shadow-sm flex items-center gap-3 group">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || '#8B5CF6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    {s.description && <p className="text-[11px] text-muted-foreground/40 truncate">{s.description}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${s.status === 'active' ? 'bg-green-50 text-green-600' : s.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                    {s.status}
                  </span>
                  <button onClick={() => setEditItem({ task: null, project: null, service: s })} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground/30">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteService(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/30 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {topTab === 'settings' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <button
              onClick={() => base44.auth.logout('/')}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-destructive hover:bg-red-50/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground/30 mt-8">Tasker v1.0</p>
        </div>
      )}

      {/* Edit dialogs */}
      {(editItem.task || editItem.project || editItem.service) && (
        <AddDialog
          open={!!(editItem.task || editItem.project || editItem.service)}
          onClose={() => setEditItem({ task: null, project: null, service: null })}
          onRefresh={loadData}
          editTask={editItem.task}
          editProject={editItem.project}
          editService={editItem.service}
        />
      )}
    </div>
  );
}
