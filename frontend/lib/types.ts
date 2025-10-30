// Core TypeScript interfaces for the Task Board System

export type UserRole = 'CEO' | 'Manager' | 'Assistant Manager' | 'Developer' | 'Intern';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  collaborators?: User[];
  // Mapping from existing API structure
  project_id?: string;
  title?: string;
  client_company?: string;
  client_id?: string;
  created_at?: string;
  due_date?: string;
  start_date?: string;
  status?: string;
  updated_at?: string;
  urgency?: string;
  budget?: number;
  total_revenue?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignees: User[];
  startDate?: Date;
  dueDate?: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for compatibility with existing system
  priority?: string;
  labels?: string;
  completed?: boolean;
  taskId?: string;
  project_id?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  assigneeIds?: string[];
  projectId: string;
  priority?: string;
  labels?: string;
  // Backend compatibility fields
  project_id?: string;
  start_date?: string;
  due_date?: string;
  status?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  // Backend compatibility fields
  start_date?: string;
  due_date?: string;
}

// Component Props Interfaces

export interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  userRole: UserRole;
  loading: boolean;
}

export interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  userRole: UserRole;
  projectId?: string;
}

export interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onTaskClick: (task: Task) => void;
  canCreateTask: boolean;
  onCreateTask: () => void;
}

export interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskData) => void;
  projectId: string;
  userRole: UserRole;
}

export interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmit: (taskId: string, updates: TaskUpdateData) => void;
  onAssignUsers: (taskId: string) => void;
  userRole: UserRole;
}

export interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  currentAssignees: User[];
  onAssign: (taskId: string, userIds: string[]) => void;
  userRole?: UserRole;
}

// State Management Interfaces

export interface TaskBoardContext {
  // User state
  userRole: UserRole;
  
  // Project state
  projects: Project[];
  selectedProject: Project | null;
  
  // Task state
  tasks: Task[];
  
  // UI state
  loading: {
    projects: boolean;
    tasks: boolean;
    taskUpdate: boolean;
  };
  
  // Actions
  setSelectedProject: (project: Project) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  refreshTasks: () => void;
}

// API Response Types

export interface TaskResponse {
  message: string;
  task_id: string;
}

export interface ApiError {
  detail: string;
  status: number;
}

// Drag and Drop Types

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: string;
}

// Permission Types

export interface PermissionCheck {
  canCreateTask: boolean;
  canEditTask: boolean;
  canAssignUsers: boolean;
  canViewAllProjects: boolean;
  canViewAllTasks: boolean;
  canSearchAllUsers: boolean;
  canSearchDepartmentUsers: boolean;
  canAccessUserSearch: boolean;
}

export interface UserSearchScope {
  canSearchAllDepartments: boolean;
  departmentRestriction: boolean;
  allowedRoles: string[];
}

// User Search Types

export interface UserSearchParams {
  task_id?: string;
  username?: string;
  email?: string;
  department_id?: string;
}

export interface SearchedUser {
  user_id: string;
  organization_id: string;
  username: string;
  email: string;
  role_str: string;
  department_name: string;
}

export interface UserSearchResponse {
  users: SearchedUser[];
  total_count?: number;
}

// Loading and Error State Types

export interface LoadingState {
  projects: boolean;
  tasks: boolean;
  taskUpdate: boolean;
  taskCreate: boolean;
  userAssignment: boolean;
  userSearch: boolean;
}

export interface ErrorState {
  projects: string | null;
  tasks: string | null;
  taskUpdate: string | null;
  taskCreate: string | null;
  userAssignment: string | null;
  userSearch: string | null;
}