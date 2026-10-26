'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/context';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragEndEvent, DragOverEvent, useDroppable, useDraggable
} from '@dnd-kit/core';
import { Plus, Search, Filter, GripVertical, Calendar, User, Tag, X, MoreHorizontal, Trash2, Edit2, Clock } from 'lucide-react';
import { PriorityBadge, StatusBadge, EmptyState } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { Task, TaskStatus, Priority } from '@/lib/types';
import { formatDate, isOverdue, getPriorityConfig, generateId, formatRelativeTime } from '@/lib/utils';

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'todo', label: 'To Do', color: '#6B7280', bg: '#F1F5F9' },
  { id: 'inprogress', label: 'In Progress', color: '#2563EB', bg: '#DBEAFE' },
  { id: 'review', label: 'In Review', color: '#D97706', bg: '#FEF9C3' },
  { id: 'done', label: 'Done', color: '#16A34A', bg: '#DCFCE7' },
];

interface CreateTaskForm {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  assigneeId: string;
  projectId: string;
  tags: string;
}

export default function BoardPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [form, setForm] = useState<CreateTaskForm>({
    title: '', description: '', priority: 'medium', status: 'todo',
    dueDate: '', assigneeId: '', projectId: '', tags: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchProject = projectFilter === 'all' || t.projectId === projectFilter;
      return matchSearch && matchPriority && matchProject;
    });
  }, [state.tasks, search, priorityFilter, projectFilter]);

  const activeTask = activeTaskId ? state.tasks.find(t => t.id === activeTaskId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newStatus = over.id as TaskStatus;
      if (COLUMNS.some(c => c.id === newStatus)) {
        dispatch({ type: 'MOVE_TASK', payload: { id: active.id as string, status: newStatus } });
      }
    }
    setActiveTaskId(null);
  }

  function handleCreateTask() {
    if (!form.title.trim()) return;
    const task: Task = {
      id: generateId(),
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      projectId: form.projectId || state.projects[0]?.id || '',
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      checklist: [],
      comments: [],
      attachments: [],
      estimatedHours: null,
      loggedHours: 0,
      order: state.tasks.filter(t => t.status === form.status).length,
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    setShowCreate(false);
    setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assigneeId: '', projectId: '', tags: '' });
  }

  function handleDeleteTask(id: string) {
    dispatch({ type: 'DELETE_TASK', payload: id });
    setSelectedTask(null);
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'Orbit Desk' }, { label: 'Board View' }]}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-9 w-52"
            id="board-search"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="input-base w-auto"
          id="priority-filter"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className="input-base w-auto"
          id="project-filter"
        >
          <option value="all">All Projects</option>
          {state.projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="ml-auto">
          <button className="btn-primary" onClick={() => setShowCreate(true)} id="create-task-btn">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext id="flowboard-dnd-context" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={columnTasks}
                members={state.members}
                projects={state.projects}
                onTaskClick={setSelectedTask}
                onAddTask={() => {
                  setForm(f => ({ ...f, status: col.id }));
                  setShowCreate(true);
                }}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-90 rotate-1 scale-105">
              <TaskCard
                task={activeTask}
                member={state.members.find(m => m.id === activeTask.assigneeId)}
                project={state.projects.find(p => p.id === activeTask.projectId)}
                onClick={() => {}}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          members={state.members}
          projects={state.projects}
          onClose={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
          onUpdate={(task) => {
            dispatch({ type: 'UPDATE_TASK', payload: task });
            setSelectedTask(task);
          }}
        />
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Task"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreateTask} id="save-task-btn">Create Task</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Task Title *</label>
            <input className="input-base" placeholder="What needs to be done?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} id="task-title-input" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Description</label>
            <textarea className="input-base resize-none" rows={3} placeholder="Add more details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Priority</label>
              <select className="input-base" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
              <select className="input-base" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Project</label>
              <select className="input-base" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">No Project</option>
                {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Assignee</label>
              <select className="input-base" value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}>
                <option value="">Unassigned</option>
                {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Due Date</label>
              <input type="date" className="input-base" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Tags (comma-separated)</label>
              <input className="input-base" placeholder="UI, Backend..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function KanbanColumn({ column, tasks, members, projects, onTaskClick, onAddTask }: {
  column: typeof COLUMNS[0];
  tasks: Task[];
  members: any[];
  projects: any[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="shrink-0 w-72 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color }} />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">{column.label}</h3>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          title="Add task to this column"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3.5 min-h-[220px] rounded-2xl p-3 transition-all ${
          isOver
            ? 'bg-blue-50/80 dark:bg-blue-950/20 ring-2 ring-blue-400 ring-dashed shadow-inner'
            : 'bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60'
        }`}
      >
        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 text-xs font-medium text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Drop tasks here
          </div>
        )}
        {tasks.map(task => (
          <DraggableTask
            key={task.id}
            task={task}
            member={members.find(m => m.id === task.assigneeId)}
            project={projects.find(p => p.id === task.projectId)}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableTask({ task, member, project, onClick }: {
  task: Task;
  member: any;
  project: any;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.35 : 1 }}
      className="group"
    >
      <div {...attributes}>
        <TaskCard task={task} member={member} project={project} onClick={onClick} dragHandle={listeners} />
      </div>
    </div>
  );
}

function TaskCard({ task, member, project, onClick, isDragging, dragHandle }: {
  task: Task;
  member: any;
  project: any;
  onClick: () => void;
  isDragging?: boolean;
  dragHandle?: any;
}) {
  const overdue = isOverdue(task.dueDate);
  const completedChecks = task.checklist.filter(c => c.completed).length;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Top: Drag + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span
            {...dragHandle}
            className="drag-handle text-slate-300 dark:text-slate-600 hover:text-slate-500 shrink-0 cursor-grab active:cursor-grabbing p-0.5"
            onClick={e => e.stopPropagation()}
            title="Drag to move"
          >
            <GripVertical size={14} />
          </span>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Project */}
      {project && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-2 h-2 rounded-full" style={{ background: project.color }} />
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">{project.name}</span>
        </div>
      )}

      {/* Checklist progress */}
      {task.checklist.length > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(completedChecks / task.checklist.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{completedChecks}/{task.checklist.length}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        {task.dueDate ? (
          <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            <Calendar size={11} />
            {formatDate(task.dueDate)}
          </span>
        ) : <span />}
        {member ? (
          <Avatar name={member.name} initials={member.avatar} size="xs" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User size={10} className="text-gray-400" />
          </span>
        )}
      </div>
    </div>
  );
}

function TaskDetailDrawer({ task, members, projects, onClose, onDelete, onUpdate }: {
  task: Task;
  members: any[];
  projects: any[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
}) {
  const assignee = members.find(m => m.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newComment, setNewComment] = useState('');

  function toggleCheck(itemId: string) {
    const updated = {
      ...task,
      checklist: task.checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c),
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
  }

  function addCheckItem() {
    if (!newCheckItem.trim()) return;
    const updated = {
      ...task,
      checklist: [...task.checklist, { id: generateId(), text: newCheckItem, completed: false }],
    };
    onUpdate(updated);
    setNewCheckItem('');
  }

  function addComment() {
    if (!newComment.trim()) return;
    const updated = {
      ...task,
      comments: [...task.comments, {
        id: generateId(),
        authorId: 'm1',
        content: newComment,
        createdAt: new Date().toISOString(),
      }],
    };
    onUpdate(updated);
    setNewComment('');
  }

  const completedChecks = task.checklist.filter(c => c.completed).length;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full animate-slide-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug">{task.title}</h2>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-400 mb-1">Assignee</div>
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar name={assignee.name} initials={assignee.avatar} size="xs" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs">{assignee.name}</span>
                </div>
              ) : <span className="text-gray-400 text-xs">Unassigned</span>}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Due Date</div>
              <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                {formatDate(task.dueDate)}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Project</div>
              {project ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: project.color }} />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{project.name}</span>
                </div>
              ) : <span className="text-gray-400 text-xs">No project</span>}
            </div>
            {task.estimatedHours && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Time</div>
                <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                  <Clock size={12} />
                  {task.loggedHours}h / {task.estimatedHours}h
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Description</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Checklist {task.checklist.length > 0 && `(${completedChecks}/${task.checklist.length})`}
              </div>
              {task.checklist.length > 0 && (
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(completedChecks / task.checklist.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 mb-2">
              {task.checklist.map(item => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleCheck(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                  <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                className="input-base flex-1 text-xs"
              />
              <button onClick={addCheckItem} className="btn-secondary text-xs px-3">Add</button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              Comments ({task.comments.length})
            </div>
            <div className="space-y-3 mb-3">
              {task.comments.map(comment => {
                const author = members.find(m => m.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    {author && <Avatar name={author.name} initials={author.avatar} size="xs" />}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{author?.name}</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                className="input-base flex-1 text-xs"
              />
              <button onClick={addComment} className="btn-primary text-xs px-3">Send</button>
            </div>
          </div>

          {/* Attachments mock */}
          {task.attachments.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Attachments</div>
              <div className="space-y-2">
                {task.attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-xs font-bold uppercase">
                      {att.type.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{att.name}</div>
                      <div className="text-xs text-gray-400">{att.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
