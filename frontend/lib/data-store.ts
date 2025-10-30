// In-memory data store for API routes with file persistence
// In a real application, this would be replaced with a database

import { Project, Task, User, TaskStatus } from './types';
import fs from 'fs';
import path from 'path';

// Mock users data
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Manager',
    avatar: '/avatars/john.jpg'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Developer',
    avatar: '/avatars/jane.jpg'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Developer',
    avatar: '/avatars/mike.jpg'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'Assistant Manager',
    avatar: '/avatars/sarah.jpg'
  },
  {
    id: '5',
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'Intern',
    avatar: '/avatars/alex.jpg'
  }
];

// Mock projects data
export const projects: Project[] = [
  {
    id: '1',
    name: 'Web Application',
    description: 'Main web application project for client',
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Mobile application development project',
  },
  {
    id: '3',
    name: 'API Development',
    description: 'Backend API development and integration',
  }
];

// Mock tasks data
export let tasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Set up JWT authentication for the application',
    status: 'in_progress',
    assignees: [users[0]],
    projectId: '1',
    createdAt: new Date('2024-10-01T10:00:00Z'),
    updatedAt: new Date('2024-10-30T10:00:00Z'),
    startDate: new Date('2024-10-01T10:00:00Z'),
    dueDate: new Date('2024-11-15T23:59:59Z'),
    priority: 'high',
    labels: 'feature,authentication'
  },
  {
    id: '2',
    title: 'Design landing page',
    description: 'Create a responsive landing page design',
    status: 'todo',
    assignees: [users[1]],
    projectId: '1',
    createdAt: new Date('2024-10-05T10:00:00Z'),
    updatedAt: new Date('2024-10-25T10:00:00Z'),
    startDate: new Date('2024-10-05T10:00:00Z'),
    dueDate: new Date('2024-11-20T23:59:59Z'),
    priority: 'medium',
    labels: 'design,ui'
  },
  {
    id: '3',
    title: 'Fix login bug',
    description: 'Resolve issue with login form validation',
    status: 'done',
    assignees: [users[2]],
    projectId: '1',
    createdAt: new Date('2024-10-08T10:00:00Z'),
    updatedAt: new Date('2024-10-28T10:00:00Z'),
    startDate: new Date('2024-10-08T10:00:00Z'),
    dueDate: new Date('2024-11-10T23:59:59Z'),
    priority: 'high',
    labels: 'bug,critical'
  },
  {
    id: '4',
    title: 'Update documentation',
    description: 'Update API documentation with new endpoints',
    status: 'todo',
    assignees: [users[3]],
    projectId: '2',
    createdAt: new Date('2024-10-10T10:00:00Z'),
    updatedAt: new Date('2024-10-20T10:00:00Z'),
    startDate: new Date('2024-10-10T10:00:00Z'),
    dueDate: new Date('2024-11-25T23:59:59Z'),
    priority: 'low',
    labels: 'documentation'
  },
  {
    id: '5',
    title: 'Mobile app wireframes',
    description: 'Create wireframes for mobile application',
    status: 'in_progress',
    assignees: [users[1], users[4]],
    projectId: '2',
    createdAt: new Date('2024-10-12T10:00:00Z'),
    updatedAt: new Date('2024-10-29T10:00:00Z'),
    startDate: new Date('2024-10-12T10:00:00Z'),
    dueDate: new Date('2024-12-01T23:59:59Z'),
    priority: 'medium',
    labels: 'design,mobile'
  }
];

// Project collaborators mapping
export const projectCollaborators: Record<string, string[]> = {
  '1': ['1', '2', '3'], // Web Application: John, Jane, Mike
  '2': ['1', '3', '4', '5'], // Mobile App: John, Mike, Sarah, Alex
  '3': ['2', '4'], // API Development: Jane, Sarah
};

// Helper functions
export const getNextTaskId = (): string => {
  const maxId = Math.max(...tasks.map(t => parseInt(t.id)), 0);
  return (maxId + 1).toString();
};

export const findTaskById = (id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  return tasks[taskIndex];
};

export const addTask = (task: Task): Task => {
  tasks.push(task);
  return task;
};

export const getProjectCollaboratorUsers = (projectId: string): User[] => {
  const collaboratorIds = projectCollaborators[projectId] || [];
  return users.filter(user => collaboratorIds.includes(user.id));
};

export const addAssigneesToTask = (taskId: string, userIds: string[]): boolean => {
  const task = findTaskById(taskId);
  if (!task) return false;
  
  const newAssignees = users.filter(user => userIds.includes(user.id));
  const existingAssigneeIds = task.assignees.map(a => a.id);
  
  // Add only new assignees (avoid duplicates)
  const uniqueNewAssignees = newAssignees.filter(user => !existingAssigneeIds.includes(user.id));
  
  task.assignees = [...task.assignees, ...uniqueNewAssignees];
  task.updatedAt = new Date();
  
  return true;
};