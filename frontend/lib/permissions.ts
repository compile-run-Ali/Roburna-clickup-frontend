// Permission utilities for role-based access control in Task Board
import { UserRole, PermissionCheck } from './types';

export const TASK_BOARD_PERMISSIONS = {
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  ASSIGN_USERS: 'assign_users',
  VIEW_ALL_PROJECTS: 'view_all_projects',
  VIEW_ALL_TASKS: 'view_all_tasks',
  UPDATE_TASK_STATUS: 'update_task_status',
  SEARCH_ALL_USERS: 'search_all_users',
  SEARCH_DEPARTMENT_USERS: 'search_department_users',
} as const;

/**
 * Check if a user role has permission to create tasks
 */
export const canCreateTask = (userRole: UserRole, isAssignedProject?: boolean): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return true;
    case 'assistant manager':
    case 'assistant_manager':
      return isAssignedProject ?? false;
    case 'developer':
    case 'intern':
      return false;
    default:
      return false;
  }
};

/**
 * Check if a user role has permission to edit task details
 */
export const canEditTask = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
    case 'assistant manager':
    case 'assistant_manager':
      return true;
    case 'developer':
    case 'intern':
      return false;
    default:
      return false;
  }
};

/**
 * Check if a user role has permission to assign users to tasks
 */
export const canAssignUsers = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
    case 'assistant manager':
    case 'assistant_manager':
      return true;
    case 'developer':
    case 'intern':
      return false;
    default:
      return false;
  }
};

/**
 * Check if a user role can view all projects
 */
export const canViewAllProjects = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return true;
    case 'assistant manager':
    case 'assistant_manager':
    case 'developer':
    case 'intern':
      return false;
    default:
      return false;
  }
};

/**
 * Check if a user role can view all tasks
 */
export const canViewAllTasks = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return true;
    case 'assistant manager':
    case 'assistant_manager':
      return true; // Can view tasks in assigned projects
    case 'developer':
    case 'intern':
      return false; // Only assigned tasks
    default:
      return false;
  }
};

/**
 * Check if a user role can update task status
 */
export const canUpdateTaskStatus = (userRole: UserRole): boolean => {
  // All roles can update task status (at least for their own tasks)
  return true;
};

/**
 * Check if a user role can search across all departments
 */
export const canSearchAllUsers = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return true;
    case 'assistant manager':
    case 'assistant_manager':
    case 'developer':
    case 'intern':
      return false;
    default:
      return false;
  }
};

/**
 * Check if a user role can search within their department
 */
export const canSearchDepartmentUsers = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return true; // They can search all departments
    case 'assistant manager':
    case 'assistant_manager':
      return true; // They can search their own department
    case 'developer':
    case 'intern':
      return false; // They cannot search for users to assign
    default:
      return false;
  }
};

/**
 * Check if a user role can access user search functionality
 */
export const canAccessUserSearch = (userRole: UserRole): boolean => {
  return canSearchAllUsers(userRole) || canSearchDepartmentUsers(userRole);
};

/**
 * Get user search scope based on role
 */
export const getUserSearchScope = (userRole: UserRole): {
  canSearchAllDepartments: boolean;
  departmentRestriction: boolean;
  allowedRoles: string[];
} => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return {
        canSearchAllDepartments: true,
        departmentRestriction: false,
        allowedRoles: ['Developer', 'Intern', 'Assistant Manager'],
      };
    case 'assistant manager':
    case 'assistant_manager':
      return {
        canSearchAllDepartments: false,
        departmentRestriction: true,
        allowedRoles: ['Developer', 'Intern'],
      };
    case 'developer':
    case 'intern':
    default:
      return {
        canSearchAllDepartments: false,
        departmentRestriction: true,
        allowedRoles: [],
      };
  }
};

/**
 * Check if user should see project selector
 */
export const shouldShowProjectSelector = (userRole: UserRole): boolean => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
    case 'assistant manager':
    case 'assistant_manager':
      return true;
    case 'developer':
    case 'intern':
      return false; // They only see assigned tasks
    default:
      return false;
  }
};

/**
 * Get all permissions for a user role
 */
export const getUserPermissions = (userRole: UserRole, isAssignedProject?: boolean): PermissionCheck => {
  return {
    canCreateTask: canCreateTask(userRole, isAssignedProject),
    canEditTask: canEditTask(userRole),
    canAssignUsers: canAssignUsers(userRole),
    canViewAllProjects: canViewAllProjects(userRole),
    canViewAllTasks: canViewAllTasks(userRole),
    canSearchAllUsers: canSearchAllUsers(userRole),
    canSearchDepartmentUsers: canSearchDepartmentUsers(userRole),
    canAccessUserSearch: canAccessUserSearch(userRole),
  };
};

/**
 * Check if user has specific permission
 */
export const hasTaskBoardPermission = (
  userRole: UserRole, 
  permission: string, 
  isAssignedProject?: boolean
): boolean => {
  switch (permission) {
    case TASK_BOARD_PERMISSIONS.CREATE_TASK:
      return canCreateTask(userRole, isAssignedProject);
    case TASK_BOARD_PERMISSIONS.EDIT_TASK:
      return canEditTask(userRole);
    case TASK_BOARD_PERMISSIONS.ASSIGN_USERS:
      return canAssignUsers(userRole);
    case TASK_BOARD_PERMISSIONS.VIEW_ALL_PROJECTS:
      return canViewAllProjects(userRole);
    case TASK_BOARD_PERMISSIONS.VIEW_ALL_TASKS:
      return canViewAllTasks(userRole);
    case TASK_BOARD_PERMISSIONS.UPDATE_TASK_STATUS:
      return canUpdateTaskStatus(userRole);
    case TASK_BOARD_PERMISSIONS.SEARCH_ALL_USERS:
      return canSearchAllUsers(userRole);
    case TASK_BOARD_PERMISSIONS.SEARCH_DEPARTMENT_USERS:
      return canSearchDepartmentUsers(userRole);
    default:
      return false;
  }
};

/**
 * Get the appropriate task fetching strategy based on user role
 */
export const getTaskFetchingStrategy = (userRole: UserRole): 'all' | 'assigned' | 'project' => {
  switch (userRole.toLowerCase()) {
    case 'ceo':
    case 'manager':
      return 'project'; // Fetch by selected project
    case 'assistant manager':
    case 'assistant_manager':
      return 'project'; // Fetch by assigned projects only
    case 'developer':
    case 'intern':
      return 'assigned'; // Fetch only assigned tasks
    default:
      return 'assigned';
  }
};

/**
 * Normalize user role string to handle variations
 */
export const normalizeUserRole = (role: string): UserRole => {
  const normalized = role.toLowerCase().replace(/[_\s]+/g, ' ').trim();
  
  switch (normalized) {
    case 'ceo':
      return 'CEO';
    case 'manager':
      return 'Manager';
    case 'assistant manager':
    case 'assistant_manager':
      return 'Assistant Manager';
    case 'developer':
      return 'Developer';
    case 'intern':
      return 'Intern';
    default:
      return role as UserRole;
  }
};