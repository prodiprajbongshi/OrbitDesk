'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import { Search, Filter, Plus, CheckSquare, Clock, AlertCircle, CheckCircle2, SortAsc } from 'lucide-react';
import { PriorityBadge, StatusBadge, EmptyState, ProgressBar } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { formatDate, isOverdue, getTasksStats } from '@/lib/utils';
import { Task, TaskStatus, Priority } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function MyTasksPage() {
  const { state } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  const myTasks = state.tasks.filter(t => t.assigneeId === state.currentUser.id);
  const stats = getTasksStats(myTasks);

  const filtered = myTasks
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const groups: { label: string; tasks: Task[]; color: string }[] = [
    { label: 'Overdue', tasks: filtered.filter(t => isOverdue(t.dueDate) && t.status !== 'done'), color: '#DC2626' },
    { label: 'To Do', tasks: filtered.filter(t => t.status === 'todo' && !isOverdue(t.dueDate)), color: '#6B7280' },
    { label: 'In Progress', tasks: filtered.filter(t => t.status === 'inprogress'), color: '#2563EB' },
    { label: 'In Review', tasks: filtered.filter(t => t.status === 'review'), color: '#D97706' },
    { label: 'Done', tasks: filtered.filter(t => t.status === 'done'), color: '#16A34A' },
  ].filter(g => g.tasks.length > 0);

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'My Tasks' }]}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: stats.total, icon: <CheckSquare size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'In Progress', value: stats.inProgress, icon: <Clock size={18} />, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Overdue', value: stats.overdue, icon: <AlertCircle size={18} />, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Completed', value: stats.done, icon: <CheckCircle2 size={18} />, color: '#16A34A', bg: '#DCFCE7' },
        ].map(s => (
          <div key={s.label} className="card p-6 rounded-2xl flex items-center gap-4.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{s.value}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-10 w-60"
            id="tasks-search"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-base w-auto" id="tasks-status-filter">
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="review">In Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="input-base w-auto" id="tasks-priority-filter">
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="input-base w-auto" id="tasks-sort">
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="createdAt">Sort by Created</option>
        </select>
        <button
          className="ml-auto btn-primary"
          onClick={() => router.push('/board')}
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Task Groups */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="No tasks found"
          description="You have no tasks matching the current filters."
        />
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: group.color }} />
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">{group.label}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {group.tasks.length}
                </span>
              </div>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th className="w-12 pl-6 pr-3"></th>
                      <th>Task</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th className="w-36">Progress</th>
                      <th>Due Date</th>
                      <th className="text-right pr-6">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.tasks.map(task => {
                      const project = state.projects.find(p => p.id === task.projectId);
                      const overdue = isOverdue(task.dueDate);
                      const checkProgress = task.checklist.length > 0
                        ? Math.round((task.checklist.filter(c => c.completed).length / task.checklist.length) * 100)
                        : null;

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          onClick={() => router.push('/board')}
                        >
                          <td className="pl-6 pr-3 py-4.5 w-12 align-middle">
                            <input
                              type="checkbox"
                              checked={task.status === 'done'}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-blue-500"
                              onChange={() => {}}
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4.5 align-middle">
                            <div className="font-semibold text-slate-900 dark:text-white">{task.title}</div>
                            {project && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full" style={{ background: project.color }} />
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{project.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                            <StatusBadge status={task.status} />
                          </td>
                          {checkProgress !== null ? (
                            <td className="px-6 py-4.5 w-36 align-middle">
                              <ProgressBar value={checkProgress} height={6} showLabel />
                            </td>
                          ) : (
                            <td className="px-6 py-4.5 w-36 align-middle text-xs text-slate-400">—</td>
                          )}
                          <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                            <span className={`text-xs font-medium ${overdue && task.status !== 'done' ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              {overdue && task.status !== 'done' ? '⚠ ' : ''}{formatDate(task.dueDate)}
                            </span>
                          </td>
                          <td className="pr-6 pl-4 py-4.5 align-middle text-right">
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {task.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
