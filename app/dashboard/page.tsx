'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import {
  FolderOpen, CheckSquare, TrendingUp, AlertCircle,
  Clock, Activity, ChevronRight, ArrowRight
} from 'lucide-react';
import { StatCard, ProgressBar, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import Avatar, { AvatarGroup } from '@/components/ui/Avatar';
import { formatDate, formatRelativeTime, isOverdue, getTasksStats, getAvatarColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { WEEKLY_PRODUCTIVITY, PRIORITY_BREAKDOWN } from '@/lib/data';

export default function DashboardPage() {
  const { state } = useApp();
  const router = useRouter();
  const stats = getTasksStats(state.tasks);
  const myTasks = state.tasks.filter(t => t.assigneeId === state.currentUser.id);
  const myTaskStats = getTasksStats(myTasks);
  const upcomingTasks = state.tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const activeProjects = state.projects.filter(p => p.status === 'active');

  return (
    <AppLayout breadcrumbs={[{ label: 'Orbit Desk' }, { label: 'Dashboard' }]}>
      {/* Welcome Banner */}
      <div className="mb-6 rounded-2xl p-6 md:p-7 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-md shadow-blue-500/20 border border-blue-400/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold mb-2.5 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Workspace
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
              Good morning, {state.currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100/90 text-sm font-medium max-w-xl">
              You have <strong className="text-white font-semibold">{myTaskStats.inProgress} tasks in progress</strong> and{' '}
              <strong className="text-white font-semibold">{myTaskStats.todo} tasks ready to start</strong> today.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => router.push('/board')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              Open Kanban
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold border border-white/25 transition-all"
            >
              Browse Projects
            </button>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Activity size={180} className="text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Projects"
          value={state.projects.length}
          subtitle={`${activeProjects.length} active`}
          icon={<FolderOpen size={18} />}
          iconColor="#2563EB"
          iconBg="#DBEAFE"
          trend={{ value: 12, label: 'this month' }}
          onClick={() => router.push('/projects')}
        />
        <StatCard
          title="Total Tasks"
          value={stats.total}
          subtitle={`${stats.done} completed`}
          icon={<CheckSquare size={18} />}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          trend={{ value: 8, label: 'this week' }}
          onClick={() => router.push('/tasks')}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle={`${stats.review} in review`}
          icon={<TrendingUp size={18} />}
          iconColor="#D97706"
          iconBg="#FEF9C3"
          onClick={() => router.push('/board')}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          subtitle="Need attention"
          icon={<AlertCircle size={18} />}
          iconColor="#DC2626"
          iconBg="#FEE2E2"
          trend={{ value: -5, label: 'vs last week' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Weekly Productivity */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Weekly Productivity</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tasks created vs completed this week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEKLY_PRODUCTIVITY} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#2563EB" fill="url(#completedGrad)" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#16A34A" fill="url(#createdGrad)" strokeWidth={2} dot={{ r: 3, fill: '#16A34A' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Breakdown */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Priority Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Active tasks by priority</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={PRIORITY_BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {PRIORITY_BREAKDOWN.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PRIORITY_BREAKDOWN.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Projects */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Active Projects</h2>
            <button onClick={() => router.push('/projects')} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {activeProjects.slice(0, 4).map(project => {
              const members = state.members.filter(m => project.memberIds.includes(m.id));
              return (
                <div
                  key={project.id}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl p-3.5 transition-all border border-slate-100 dark:border-slate-800/70"
                  onClick={() => router.push('/projects')}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs"
                      style={{ background: project.color + '20' }}
                    >
                      {project.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{project.name}</div>
                      <ProgressBar value={project.progress} color={project.color} showLabel className="mt-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2   dark:border-slate-800/50">
                    <AvatarGroup
                      members={members.map(m => ({ name: m.name, initials: m.avatar }))}
                      max={3}
                      size="xs"
                    />
                    <span className="text-xs text-slate-400 font-medium">{formatDate(project.deadline)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Upcoming Deadlines</h2>
            <Clock size={16} className="text-slate-400" />
          </div>
          <div className="space-y-2.5">
            {upcomingTasks.slice(0, 5).map(task => {
              const overdue = isOverdue(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 cursor-pointer transition-all"
                  onClick={() => router.push('/tasks')}
                >
                  <div className={`w-2 h-9 rounded-full shrink-0 ${overdue ? 'bg-rose-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</div>
                    <div className={`text-xs mt-0.5 ${overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'}`}>
                      {overdue ? '⚠ Overdue · ' : ''}{formatDate(task.dueDate)}
                    </div>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Recent Activity</h2>
          </div>
          <div className="space-y-3.5">
            {state.activities.slice(0, 6).map(activity => {
              const actor = state.members.find(m => m.id === activity.actorId);
              if (!actor) return null;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <Avatar name={actor.name} initials={actor.avatar} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="font-semibold text-slate-900 dark:text-white">{actor.name.split(' ')[0]}</span>{' '}
                      {activity.description}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">{formatRelativeTime(activity.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
