'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp, useTheme } from '@/lib/context';
import { User, Bell, Layout, Shield, Moon, Sun, Monitor, Save, Palette } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

type Tab = 'profile' | 'notifications' | 'appearance' | 'workspace';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
  { id: 'workspace', label: 'Workspace', icon: <Layout size={16} /> },
];

export default function SettingsPage() {
  const { state } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'FlowBoard' }, { label: 'Settings' }]}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-52 shrink-0">
            <nav className="flex md:flex-col gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  id={`settings-tab-${tab.id}`}
                >
                  <span className={activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Card */}
          <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 shadow-xs">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Profile Settings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage your personal identification and bio</p>
                </div>
                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Avatar name={state.currentUser.name} initials={state.currentUser.avatar} size="xl" online />
                  <div>
                    <button className="btn-secondary text-sm">Change Photo</button>
                    <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">First Name</label>
                    <input className="input-base" defaultValue={state.currentUser.name.split(' ')[0]} id="first-name" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Last Name</label>
                    <input className="input-base" defaultValue={state.currentUser.name.split(' ')[1] || ''} id="last-name" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
                    <input className="input-base" defaultValue={state.currentUser.email} id="email" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Role</label>
                    <input className="input-base opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800" defaultValue={state.currentUser.role} disabled id="role" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Department</label>
                    <input className="input-base" defaultValue={state.currentUser.department} id="department" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Bio</label>
                    <textarea className="input-base resize-none" rows={3} placeholder="Tell your team about yourself..." id="bio" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Notification Preferences</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Control how and when you receive activity alerts</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {[
                    { label: 'Task Assigned', desc: 'When a task is assigned to you', defaultOn: true },
                    { label: 'Deadline Approaching', desc: 'When a task due date is coming up', defaultOn: true },
                    { label: 'Task Completed', desc: 'When someone completes a task', defaultOn: false },
                    { label: 'Comment Added', desc: 'When someone comments on your task', defaultOn: true },
                    { label: 'Project Updates', desc: 'When a project is updated', defaultOn: false },
                    { label: 'Weekly Digest', desc: 'Weekly summary of your tasks and progress', defaultOn: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3.5">
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Appearance</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Customize your interface theme and visual preferences</p>
                </div>

                {/* Theme */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 block">Theme Mode</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light Mode', icon: <Sun size={20} /> },
                      { id: 'dark', label: 'Dark Mode', icon: <Moon size={20} /> },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { if (t.id !== theme) toggleTheme(); }}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                          theme === t.id
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                        }`}
                        id={`theme-${t.id}`}
                      >
                        <div className={theme === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>{t.icon}</div>
                        <span className="text-sm font-semibold">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Density */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 block">Layout Density</label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    {['Comfortable', 'Compact'].map(d => (
                      <button
                        key={d}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                          d === 'Comfortable'
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workspace' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Workspace Settings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Configure environment naming and workspace defaults</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Workspace Name</label>
                  <input className="input-base" defaultValue="FlowBoard Workspace" id="workspace-name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Workspace URL</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">flowboard.io/</span>
                    <input className="input-base flex-1" defaultValue="my-workspace" id="workspace-url" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Default View</label>
                  <select className="input-base" id="default-view">
                    <option>Dashboard</option>
                    <option>Board</option>
                    <option>My Tasks</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Week Starts On</label>
                  <select className="input-base" id="week-start">
                    <option>Monday</option>
                    <option>Sunday</option>
                    <option>Saturday</option>
                  </select>
                </div>

                <div className="pt-5 border-t border-rose-100 dark:border-rose-950/40">
                  <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-0.5">Danger Zone</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Irreversibly resets demo workspace state.</p>
                    </div>
                    <button className="px-3.5 py-2 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100/50 dark:hover:bg-rose-900/40 transition-colors" id="clear-data-btn">
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                onClick={handleSave}
                className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
                id="save-settings-btn"
              >
                <Save size={16} />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
