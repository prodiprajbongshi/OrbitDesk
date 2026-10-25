'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import { BarChart2, TrendingUp, CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { getTasksStats, getRoleConfig } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { WEEKLY_PRODUCTIVITY, PRIORITY_BREAKDOWN } from '@/lib/data';

const MONTHLY_DATA = [
  { month: 'Jun', completed: 28, created: 35 },
  { month: 'Jul', completed: 42, created: 38 },
  { month: 'Aug', completed: 35, created: 45 },
  { month: 'Sep', completed: 52, created: 48 },
  { month: 'Oct', completed: 38, created: 52 },
];

const STATUS_COLORS = ['#6B7280', '#2563EB', '#D97706', '#16A34A'];

export default function ReportsPage() {
  const { state } = useApp();
  const allStats = getTasksStats(state.tasks);

  const statusData = [
    { name: 'To Do', value: allStats.todo, color: '#6B7280' },
    { name: 'In Progress', value: allStats.inProgress, color: '#2563EB' },
    { name: 'In Review', value: allStats.review, color: '#D97706' },
    { name: 'Done', value: allStats.done, color: '#16A34A' },
  ];

  const projectProgressData = state.projects.slice(0, 6).map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    progress: p.progress,
    color: p.color,
  }));

  const teamProductivity = state.members.map(m => {
    const tasks = state.tasks.filter(t => t.assigneeId === m.id);
    return {
      name: m.name.split(' ')[0],
      assigned: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
    };
  });

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'Reports' }]}>
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Completion Rate', value: `${allStats.completionRate}%`, icon: <CheckCircle2 size={18} />, color: '#16A34A', bg: '#DCFCE7', desc: 'All time completed' },
          { label: 'Tasks In Progress', value: allStats.inProgress, icon: <Clock size={18} />, color: '#2563EB', bg: '#EFF6FF', desc: 'Currently active' },
          { label: 'Overdue Tasks', value: allStats.overdue, icon: <AlertCircle size={18} />, color: '#DC2626', bg: '#FEE2E2', desc: 'Need immediate action' },
          { label: 'Active Members', value: state.members.filter(m => m.online).length, icon: <Users size={18} />, color: '#7C3AED', bg: '#F3E8FF', desc: 'Online right now' },
        ].map(kpi => (
          <div key={kpi.label} className="card p-6.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xs" style={{ background: kpi.bg, color: kpi.color }}>
                {kpi.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">{kpi.value}</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{kpi.label}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Monthly Trend */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Monthly Task Trend</h2>
            <p className="text-xs text-slate-400">Tasks created vs completed (last 5 months)</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={MONTHLY_DATA} margin={{ left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="created" name="Created" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Task Status</h2>
            <p className="text-xs text-slate-400">Current workspace distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{s.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Project Progress Table with Generous Padding */}
        <div className="table-container">
          <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/75 dark:bg-slate-900/50">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Project Progress Table</h2>
              <p className="text-xs text-slate-400 mt-0.5">Completion overview across active initiatives</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {state.projects.length} Projects
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-44">Progress</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {state.projects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4.5 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs" style={{ background: p.color + '20' }}>
                          {p.emoji}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 align-middle text-xs font-medium text-slate-500 dark:text-slate-400">
                      {p.category}
                    </td>
                    <td className="px-6 py-4.5 align-middle">
                      <ProgressBar value={p.progress} color={p.color} showLabel height={7} />
                    </td>
                    <td className="px-6 py-4.5 align-middle text-right">
                      <span className="tag text-xs capitalize" style={{ background: p.color + '18', color: p.color }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Productivity */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Team Productivity</h2>
            <p className="text-xs text-slate-400">Tasks completed per member</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamProductivity} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Bar dataKey="assigned" name="Assigned" fill="#DBEAFE" radius={[0, 4, 4, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Breakdown + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Priority Distribution</h2>
            <p className="text-xs text-slate-400">Task breakdown across urgency levels</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PRIORITY_BREAKDOWN} margin={{ left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {PRIORITY_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Weekly Overview</h2>
            <p className="text-xs text-slate-400">Throughput velocity comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={WEEKLY_PRODUCTIVITY} margin={{ left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB' }} />
              <Line type="monotone" dataKey="created" name="Created" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
}
