'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Plus, Command, X } from 'lucide-react';
import { useApp, useTheme } from '@/lib/context';
import Avatar from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/lib/utils';

interface NavbarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Navbar({ title, breadcrumbs }: NavbarProps) {
  const { state, dispatch } = useApp();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<{ type: string; title: string; href: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = state.notifications.filter(n => !n.read).length;

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const projectResults = state.projects
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({ type: 'Project', title: p.name, href: `/projects/${p.id}` }));
    const taskResults = state.tasks
      .filter(t => t.title.toLowerCase().includes(q))
      .map(t => ({ type: 'Task', title: t.title, href: `/board` }));
    setSearchResults([...projectResults, ...taskResults].slice(0, 6));
  }, [searchQuery, state.projects, state.tasks]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery('');
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Left: Title / Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'font-bold text-slate-900 dark:text-white tracking-tight' : 'text-slate-500 dark:text-slate-400 font-medium'}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        )}
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-2xs"
            id="search-button"
          >
            <Search size={14} />
            <span className="hidden sm:block text-xs font-medium">Search...</span>
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 shadow-3xs">
              <Command size={10} /> K
            </kbd>
          </button>

          {showSearch && (
            <div className="absolute right-0 top-12 w-84 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl animate-scale-in z-50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <Search size={14} className="text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search projects, tasks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  id="global-search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { router.push(r.href); setShowSearch(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium">{r.type}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{r.title}</span>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="py-8 text-center text-sm text-gray-400">No results found</div>
              ) : (
                <div className="p-3 text-xs text-gray-400 text-center">Type to search projects & tasks</div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-2xs"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          id="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-2xs"
            id="notifications-button"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-84 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl animate-scale-in z-50 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {state.notifications.slice(0, 6).map(n => (
                  <button
                    key={n.id}
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 ${!n.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                      <div className={!n.read ? '' : 'pl-4'}>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
                        <div className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <button
                  onClick={() => { router.push('/notifications'); setShowNotifications(false); }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button
          onClick={() => router.push('/settings')}
          className="ml-1"
          id="user-avatar-button"
        >
          <Avatar
            name={state.currentUser.name}
            initials={state.currentUser.avatar}
            size="sm"
            online={true}
          />
        </button>
      </div>
    </header>
  );
}
