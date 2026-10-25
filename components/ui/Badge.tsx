'use client';

import React from 'react';
import { getPriorityConfig, getStatusConfig } from '@/lib/utils';
import { Priority, TaskStatus } from '@/lib/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = getPriorityConfig(priority);
  return (
    <span className={`tag ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: config.dotColor }} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = getStatusConfig(status);
  return (
    <span className={`tag ${config.className}`}>
      {config.label}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
  className?: string;
}

export function ProgressBar({ value, color, showLabel = false, height = 7, className = '' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex-1 progress-bar" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${clampedValue}%`,
            background: color || 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[34px] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, icon, iconColor, iconBg, trend, onClick }: StatCardProps) {
  return (
    <div
      className={`card relative overflow-hidden p-6 sm:p-6.5 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/50' : ''
      } transition-all duration-200 group`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              trend.value >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
            }`}
          >
            <span>{trend.value >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-4">{description}</p>
      {action && (
        <button className="btn-primary text-sm" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-blue-600"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
