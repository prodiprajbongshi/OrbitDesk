import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Priority, TaskStatus, ProjectStatus, Role } from './types';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'No date';
  try {
    const d = new Date(date);
    return format(d, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

export const WORKSPACE_BASELINE_DATE = new Date('2024-10-29T12:00:00Z');

export function formatRelativeTime(date: string): string {
  try {
    const d = new Date(date);
    const diff = Math.floor((WORKSPACE_BASELINE_DATE.getTime() - d.getTime()) / 1000);
    if (diff < 0) return 'just now';
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    if (days < 30) return `${days}d ago`;
    return format(d, 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function isOverdue(dueDate: string | null, referenceDate?: Date): boolean {
  if (!dueDate) return false;
  try {
    const due = new Date(dueDate);
    const now = new Date(referenceDate ? referenceDate.getTime() : WORKSPACE_BASELINE_DATE.getTime());
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < now;
  } catch {
    return false;
  }
}

export function getPriorityConfig(priority: Priority) {
  const configs = {
    low: { label: 'Low', className: 'priority-low', dotColor: '#16A34A' },
    medium: { label: 'Medium', className: 'priority-medium', dotColor: '#D97706' },
    high: { label: 'High', className: 'priority-high', dotColor: '#DC2626' },
    urgent: { label: 'Urgent', className: 'priority-urgent', dotColor: '#7C3AED' },
  };
  return configs[priority];
}

export function getStatusConfig(status: TaskStatus) {
  const configs = {
    todo: { label: 'To Do', className: 'status-todo', column: 'To Do' },
    inprogress: { label: 'In Progress', className: 'status-inprogress', column: 'In Progress' },
    review: { label: 'In Review', className: 'status-review', column: 'In Review' },
    done: { label: 'Done', className: 'status-done', column: 'Done' },
  };
  return configs[status];
}

export function getProjectStatusConfig(status: ProjectStatus) {
  const configs = {
    active: { label: 'Active', color: '#16A34A', bg: '#DCFCE7' },
    'on-hold': { label: 'On Hold', color: '#D97706', bg: '#FEF9C3' },
    completed: { label: 'Completed', color: '#2563EB', bg: '#DBEAFE' },
    archived: { label: 'Archived', color: '#6B7280', bg: '#F1F5F9' },
  };
  return configs[status];
}

export function getRoleConfig(role: Role) {
  const configs = {
    admin: { label: 'Admin', color: '#DC2626', bg: '#FEE2E2' },
    manager: { label: 'Manager', color: '#D97706', bg: '#FEF9C3' },
    developer: { label: 'Developer', color: '#2563EB', bg: '#DBEAFE' },
    designer: { label: 'Designer', color: '#7C3AED', bg: '#F3E8FF' },
    viewer: { label: 'Viewer', color: '#6B7280', bg: '#F1F5F9' },
  };
  return configs[role];
}

export function getAvatarColor(name: string): string {
  const colors = [
    '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
    '#D97706', '#16A34A', '#0891B2', '#0D9488',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getTasksStats(tasks: import('./types').Task[]) {
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'inprogress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length,
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
      : 0,
  };
}
