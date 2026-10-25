'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { PriorityBadge } from '@/components/ui/Badge';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { isOverdue, WORKSPACE_BASELINE_DATE } from '@/lib/utils';
import { Task } from '@/lib/types';

export default function CalendarPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // Oct 2024
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const tasksWithDates = state.tasks.filter(t => t.dueDate);

  function getTasksForDate(date: Date): Task[] {
    return tasksWithDates.filter(t => isSameDay(new Date(t.dueDate!), date));
  }

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const upcomingTasks = state.tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 8);

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'Calendar' }]}>
      <div className="flex gap-6">
        {/* Main Calendar */}
        <div className="flex-1 card rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white min-w-[160px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(2024, 9, 1))}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              >
                Today
              </button>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === 'month' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === 'week' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200/80 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
            {days.map((d, i) => {
              const dayTasks = getTasksForDate(d);
              const isCurrentMonth = isSameMonth(d, currentDate);
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              const isToday_ = isSameDay(d, WORKSPACE_BASELINE_DATE);

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(isSameDay(d, selectedDate || new Date(0)) ? null : d)}
                  className={`bg-white dark:bg-slate-900 min-h-[105px] p-2.5 cursor-pointer hover:bg-blue-50/70 dark:hover:bg-blue-950/20 transition-all ${
                    !isCurrentMonth ? 'opacity-35 bg-slate-50/50 dark:bg-slate-900/50' : ''
                  } ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/40 dark:bg-blue-950/20' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 transition-all ${
                      isToday_
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/40'
                        : isSelected
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {format(d, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`text-[11px] px-2 py-0.5 rounded-md truncate font-medium border ${
                          isOverdue(task.dueDate) && task.status !== 'done'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40'
                            : task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40'
                            : 'bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] font-semibold text-slate-400 px-1">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Tasks */}
          {selectedDate && selectedTasks.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 animate-fade-in">
              <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                Tasks on {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {selectedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <div className={`w-2 h-8 rounded-full shrink-0 ${task.status === 'done' ? 'bg-green-400' : isOverdue(task.dueDate) ? 'bg-red-400' : 'bg-blue-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    {task.status === 'done' && (
                      <span className="text-xs text-green-600 font-medium">✓ Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming */}
        <div className="w-72 shrink-0">
          <div className="card rounded-2xl p-6 mb-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3.5 flex items-center gap-2 tracking-tight">
              <AlertCircle size={15} className="text-amber-500" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-2.5">
              {upcomingTasks.map(task => {
                const overdue = isOverdue(task.dueDate);
                return (
                  <div key={task.id} className={`p-3.5 rounded-xl border text-xs transition-all ${overdue
                    ? 'border-rose-200 bg-rose-50/70 dark:border-rose-900/40 dark:bg-rose-950/20'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50'
                    }`}>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 leading-snug">{task.title}</div>
                    <div className="flex items-center justify-between">
                      <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400 font-medium'}>
                        {overdue ? '⚠ ' : ''}
                        {format(new Date(task.dueDate!), 'MMM d')}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3.5 tracking-tight">Legend</h3>
            <div className="space-y-2.5 text-xs font-medium">
              {[
                { color: 'bg-blue-500', label: 'In Progress / Upcoming' },
                { color: 'bg-green-500', label: 'Completed' },
                { color: 'bg-red-500', label: 'Overdue' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${l.color}`} />
                  <span className="text-gray-600 dark:text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
