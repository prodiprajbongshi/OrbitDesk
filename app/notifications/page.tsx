'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import { Bell, CheckCircle2, AlertCircle, MessageSquare, Zap, FolderOpen, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Notification } from '@/lib/types';

const NOTIF_ICONS: Record<Notification['type'], React.ReactNode> = {
  task_assigned: <Zap size={16} className="text-blue-600" />,
  deadline_approaching: <AlertCircle size={16} className="text-orange-500" />,
  task_completed: <CheckCircle2 size={16} className="text-green-500" />,
  comment_added: <MessageSquare size={16} className="text-purple-500" />,
  project_update: <FolderOpen size={16} className="text-indigo-500" />,
};

const NOTIF_BG: Record<Notification['type'], string> = {
  task_assigned: 'bg-blue-50 dark:bg-blue-900/10',
  deadline_approaching: 'bg-orange-50 dark:bg-orange-900/10',
  task_completed: 'bg-green-50 dark:bg-green-900/10',
  comment_added: 'bg-purple-50 dark:bg-purple-900/10',
  project_update: 'bg-indigo-50 dark:bg-indigo-900/10',
};

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const unread = state.notifications.filter(n => !n.read);
  const read = state.notifications.filter(n => n.read);

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'Notifications' }]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unread.length > 0 ? `${unread.length} unread` : 'All caught up!'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            className="btn-secondary text-sm flex items-center gap-2"
            onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
            id="mark-all-read-btn"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Unread */}
        {unread.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              New ({unread.length})
            </h2>
            <div className="space-y-2">
              {unread.map(n => (
                <NotificationItem key={n.id} notification={n} onRead={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })} />
              ))}
            </div>
          </div>
        )}

        {/* Read */}
        {read.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Earlier
            </h2>
            <div className="space-y-2">
              {read.map(n => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          </div>
        )}

        {state.notifications.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-16">
            <Bell size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">No notifications yet</h3>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function NotificationItem({ notification: n, onRead }: { notification: Notification; onRead?: () => void }) {
  return (
    <div
      className={`card rounded-2xl p-6 flex items-start gap-4.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border ${
        !n.read
          ? 'border-blue-200 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-950/20'
          : 'border-slate-200/80 dark:border-slate-800/80 opacity-80'
      }`}
      onClick={onRead}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${NOTIF_BG[n.type]}`}>
        {NOTIF_ICONS[n.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm text-slate-900 dark:text-white">{n.title}</div>
          {!n.read && (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs shadow-blue-500/50 shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2 block">{formatRelativeTime(n.createdAt)}</span>
      </div>
    </div>
  );
}
