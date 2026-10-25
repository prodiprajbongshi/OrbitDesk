'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Kanban,
  Calendar, Users, BarChart2, Bell, Settings, ChevronLeft,
  ChevronRight, Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/context';
import Avatar from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { href: '/board', icon: Kanban, label: 'Board View' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/team', icon: Users, label: 'Team' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const pathname = usePathname();
  const collapsed = state.sidebarCollapsed;
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <aside
      className={`${collapsed ? 'w-[72px]' : 'w-64'} shrink-0 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-slate-800/60 z-30`}
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Brand Header */}
      <div className={`flex items-center gap-3.5 px-4 py-5 border-b border-white/8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 ring-1 ring-white/20">
          <Sparkles size={18} className="text-white animate-pulse" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base tracking-tight truncate">FlowBoard</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <div className="text-slate-400 text-xs truncate">Workspace Studio</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          const isNotifications = href === '/notifications';

          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2 py-3' : ''}`}
              title={collapsed ? label : undefined}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Icon size={19} className={active ? 'text-blue-400' : 'text-slate-400'} />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold ring-2 ring-[#0B1120]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="truncate tracking-tight">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card & Collapse toggle */}
      <div className="p-3 border-t border-white/8 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <Avatar
              name={state.currentUser.name}
              initials={state.currentUser.avatar}
              size="sm"
              online={true}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{state.currentUser.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{state.currentUser.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all text-xs font-medium"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={17} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
