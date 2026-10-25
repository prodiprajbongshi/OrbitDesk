export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done';
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type Role = 'admin' | 'manager' | 'developer' | 'designer' | 'viewer';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  department: string;
  tasksAssigned: number;
  tasksCompleted: number;
  joinedAt: string;
  online: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  estimatedHours: number | null;
  loggedHours: number;
  order: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  emoji: string;
  startDate: string;
  deadline: string | null;
  progress: number;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
  category: string;
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'deadline_approaching' | 'task_completed' | 'comment_added' | 'project_update';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
  actorId?: string;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'commented' | 'assigned';
  description: string;
  actorId: string;
  entityType: 'task' | 'project' | 'comment';
  entityId: string;
  createdAt: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  members: Member[];
  notifications: Notification[];
  activities: Activity[];
  currentUser: Member;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}
