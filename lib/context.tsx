'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Task, Project, Notification, Member } from './types';
import {
  PROJECTS, TASKS, MEMBERS, NOTIFICATIONS, ACTIVITIES, CURRENT_USER
} from './data';

type Action =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; status: Task['status'] } }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  projects: PROJECTS,
  tasks: TASKS,
  members: MEMBERS,
  notifications: NOTIFICATIONS,
  activities: ACTIVITIES,
  currentUser: CURRENT_USER,
  theme: 'light',
  sidebarCollapsed: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id
            ? { ...t, status: action.payload.status, updatedAt: new Date().toISOString() }
            : t
        ),
      };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        tasks: state.tasks.filter(t => t.projectId !== action.payload),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowboard-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {}
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      const toSave = {
        projects: state.projects,
        tasks: state.tasks,
        notifications: state.notifications,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      };
      localStorage.setItem('flowboard-state', JSON.stringify(toSave));
    } catch {}
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useTheme() {
  const { state, dispatch } = useApp();
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  }, [state.theme, dispatch]);
  return { theme: state.theme, toggleTheme };
}
