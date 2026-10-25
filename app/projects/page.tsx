'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import { Plus, LayoutGrid, List, Search, Filter, MoreHorizontal, Users, Calendar, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { ProgressBar, EmptyState } from '@/components/ui/Badge';
import { AvatarGroup } from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { formatDate, getProjectStatusConfig, getTasksStats, generateId } from '@/lib/utils';
import { Project, ProjectStatus } from '@/lib/types';

const PROJECT_COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#16A34A', '#0891B2', '#0D9488',
];

const PROJECT_EMOJIS = ['🚀', '🎨', '⚙️', '📱', '📣', '📊', '🏢', '🌟', '🔧', '💡', '🎯', '📋'];

interface CreateProjectForm {
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  emoji: string;
  deadline: string;
  category: string;
}

export default function ProjectsPage() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProjectForm>({
    name: '',
    description: '',
    status: 'active',
    color: '#2563EB',
    emoji: '🚀',
    deadline: '',
    category: 'Engineering',
  });

  const filtered = state.projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleCreate() {
    if (!form.name.trim()) return;
    const project: Project = {
      id: generateId(),
      ...form,
      startDate: new Date().toISOString().split('T')[0],
      deadline: form.deadline || null,
      progress: 0,
      memberIds: [state.currentUser.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROJECT', payload: project });
    setShowCreate(false);
    setForm({ name: '', description: '', status: 'active', color: '#2563EB', emoji: '🚀', deadline: '', category: 'Engineering' });
  }

  function handleDelete(id: string) {
    if (confirm('Delete this project and all its tasks?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    }
    setMenuOpenId(null);
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'Projects' }]}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{state.projects.length} projects total</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 w-48"
              id="projects-search"
            />
          </div>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-base w-auto"
            id="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <List size={15} />
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)} id="create-project-btn">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid size={28} />}
          title="No projects found"
          description="Create your first project or adjust your search filters."
          action={{ label: 'New Project', onClick: () => setShowCreate(true) }}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              members={state.members.filter(m => project.memberIds.includes(m.id))}
              taskCount={state.tasks.filter(t => t.projectId === project.id).length}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Team</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => {
                const statusConfig = getProjectStatusConfig(project.status);
                const members = state.members.filter(m => project.memberIds.includes(m.id));
                return (
                  <tr key={project.id}>
                    <td>
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs" style={{ background: project.color + '20' }}>
                          {project.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">{project.name}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{project.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="tag" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="w-48">
                      <ProgressBar value={project.progress} color={project.color} showLabel />
                    </td>
                    <td>
                      <AvatarGroup members={members.map(m => ({ name: m.name, initials: m.avatar }))} max={3} size="xs" />
                    </td>
                    <td className="text-slate-500 dark:text-slate-400 font-medium">
                      {formatDate(project.deadline)}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Project"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate} id="save-project-btn">Create Project</button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Emoji + Color */}
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Icon</label>
              <div className="grid grid-cols-6 gap-1.5">
                {PROJECT_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${form.emoji === e ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Color</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Project Name *</label>
            <input
              className="input-base"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              id="project-name-input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Description</label>
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="What is this project about?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
              <select className="input-base" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
              <input className="input-base" placeholder="Engineering" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Deadline</label>
            <input type="date" className="input-base" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function ProjectCard({
  project, members, taskCount, menuOpenId, setMenuOpenId, onDelete
}: {
  project: Project;
  members: any[];
  taskCount: number;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const statusConfig = getProjectStatusConfig(project.status);

  return (
    <div className="card rounded-2xl p-7 animate-fade-in hover:-translate-y-1 hover:shadow-md transition-all duration-200 relative group border border-slate-200/80 dark:border-slate-800/80">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ring-1 ring-black/5 dark:ring-white/10"
          style={{ background: project.color + '18' }}
        >
          {project.emoji}
        </div>
        <div className="flex items-center gap-2">
          <span className="tag" style={{ background: statusConfig.bg, color: statusConfig.color }}>
            {statusConfig.label}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpenId === project.id && (
              <div className="absolute right-0 top-8 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 animate-scale-in">
                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-xl">
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-b-xl"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 truncate tracking-tight">{project.name}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 line-clamp-2 leading-relaxed min-h-[32px]">{project.description}</p>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} color={project.color} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <AvatarGroup members={members.map(m => ({ name: m.name, initials: m.avatar }))} max={3} size="xs" />
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium"><CheckSquare size={13} /> {taskCount} tasks</span>
          {project.deadline && (
            <span className="flex items-center gap-1 font-medium"><Calendar size={13} /> {formatDate(project.deadline)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckSquare({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
