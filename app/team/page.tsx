'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import { Search, Users, CheckSquare, TrendingUp } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/Badge';
import { getRoleConfig, getTasksStats } from '@/lib/utils';
import { Member } from '@/lib/types';

export default function TeamPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = state.members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'Team' }]}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{state.members.length} members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 w-52"
              id="team-search"
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-base w-auto" id="role-filter">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {filtered.map(member => {
          const roleConfig = getRoleConfig(member.role);
          const memberTasks = state.tasks.filter(t => t.assigneeId === member.id);
          const completionRate = memberTasks.length > 0
            ? Math.round((memberTasks.filter(t => t.status === 'done').length / memberTasks.length) * 100)
            : 0;
          const assignedProjects = state.projects.filter(p => p.memberIds.includes(member.id));

          return (
            <div key={member.id} className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              {/* Top */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={member.name} initials={member.avatar} size="lg" online={member.online} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate text-base tracking-tight">{member.name}</div>
                  <div className="text-xs text-slate-400 mb-2.5 truncate">{member.email}</div>
                  <div className="flex items-center gap-2">
                    <span className="tag text-xs font-semibold" style={{ background: roleConfig.bg, color: roleConfig.color }}>
                      {roleConfig.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{member.department}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 my-4 py-3 px-2 bg-slate-50/75 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/70">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{member.tasksAssigned}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Assigned</div>
                </div>
                <div className="text-center border-x border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{member.tasksCompleted}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{assignedProjects.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Projects</div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion Rate</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{completionRate}%</span>
                </div>
                <ProgressBar
                  value={completionRate}
                  color={completionRate >= 80 ? '#16A34A' : completionRate >= 60 ? '#D97706' : '#DC2626'}
                  height={7}
                />
              </div>

              {/* Projects */}
              {assignedProjects.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2">Assigned Projects</div>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedProjects.slice(0, 3).map(p => (
                      <span
                        key={p.id}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: p.color + '18', color: p.color }}
                      >
                        {p.emoji} {p.name}
                      </span>
                    ))}
                    {assignedProjects.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                        +{assignedProjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Online status */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${member.online ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span className="text-xs text-slate-400 font-medium">{member.online ? 'Available now' : 'Offline'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workload Overview Table with Generous Padding */}
      <div className="table-container">
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/75 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
              Team Workload Overview
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Real-time task distribution</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left bg-slate-50/40 dark:bg-slate-900/20">
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">Active Tasks</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority Load</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {state.members.map(member => {
                const memberTasks = state.tasks.filter(t => t.assigneeId === member.id && t.status !== 'done');
                const total = memberTasks.length;
                const highPriority = memberTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
                const roleConfig = getRoleConfig(member.role);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4.5 align-middle">
                      <div className="flex items-center gap-3.5">
                        <Avatar name={member.name} initials={member.avatar} size="sm" online={member.online} />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                          <div className="text-xs text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 align-middle">
                      <span className="tag text-xs" style={{ background: roleConfig.bg, color: roleConfig.color }}>
                        {member.department}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 align-middle">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{total} active</span>
                          <span className="text-slate-400">{Math.min(100, total * 10)}%</span>
                        </div>
                        <ProgressBar
                          value={Math.min(100, total * 10)}
                          color={total > 8 ? '#DC2626' : total > 5 ? '#D97706' : '#2563EB'}
                          height={6}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4.5 align-middle">
                      {highPriority > 0 ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                          {highPriority} urgent / high
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 align-middle text-right">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        member.online
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {member.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
