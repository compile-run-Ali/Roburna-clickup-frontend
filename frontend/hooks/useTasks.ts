'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { TaskBoardAPI } from '@/lib/api';
import { Task, CreateTaskData, TaskUpdateData, TaskStatus, UserRole } from '@/lib/types';
import { getTaskFetchingStrategy } from '@/lib/permissions';
import { toast } from 'react-toastify';
import { getSessionToken } from '@/lib/auth-utils';

// Note: Toast notifications are handled at the component level

// Legacy interface for backward compatibility
export interface LegacyTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  labels: string;
  completed: boolean;
  taskId: string;
  project_id: string;
}

export interface UseTasksReturn {
  tasks: Task[];
  loading: {
    tasks: boolean;
    taskUpdate: boolean;
    taskCreate: boolean;
  };
  error: string | null;
  createTask: (taskData: CreateTaskData) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskDetails: (taskId: string, updates: TaskUpdateData) => Promise<Task>;
  refreshTasks: (projectId?: string) => Promise<void>;
  assignUsersToTask: (taskId: string, userIds: string[]) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setError: (error: string | null) => void;
}

export const useTaskBoard = (userRole: UserRole, projectId?: string): UseTasksReturn => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState({
    tasks: false,
    taskUpdate: false,
    taskCreate: false,
  });
  const [error, setError] = useState<string | null>(null);

  const setLoadingState = (key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task> => {
    setLoadingState('taskCreate', true);
    setError(null);

    try {
      const sessionToken = getSessionToken(session);
      
      console.log('=== CREATING TASK IN HOOK ===');
      console.log('Task data being sent:', taskData);
      console.log('Session token available:', !!sessionToken);
      
      const response = await TaskBoardAPI.createTask(taskData, sessionToken);
      console.log('Task creation response in hook:', response);
      
      // Success notification handled at component level

      // Add the new task to local state
      setTasks(prevTasks => {
        console.log('Adding task to local state. Previous tasks:', prevTasks.length);
        console.log('New task being added:', response);
        const newTasks = [...prevTasks, response];
        console.log('Updated tasks array:', newTasks.length);
        return newTasks;
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      console.error('Task creation error in hook:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingState('taskCreate', false);
    }
  }, [session]);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus): Promise<void> => {
    setLoadingState('taskUpdate', true);
    setError(null);

    // Optimistic update
    const originalTasks = tasks;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status, completed: status === 'done' }
          : task
      )
    );

    try {
      const sessionToken = getSessionToken(session);
      
      console.log('=== UPDATING TASK STATUS IN HOOK ===');
      console.log('Task ID:', taskId);
      console.log('New Status:', status);
      console.log('Session token available:', !!sessionToken);
      
      await TaskBoardAPI.updateTaskStatus(taskId, status, sessionToken);
      // Success notification handled at component level
    } catch (error) {
      // Revert optimistic update on error
      setTasks(originalTasks);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingState('taskUpdate', false);
    }
  }, [tasks, session]);

  const updateTaskDetails = useCallback(async (taskId: string, updates: TaskUpdateData): Promise<Task> => {
    setLoadingState('taskUpdate', true);
    setError(null);

    try {
      const sessionToken = getSessionToken(session);
      
      console.log('=== UPDATING TASK DETAILS IN HOOK ===');
      console.log('Task ID:', taskId);
      console.log('Updates:', updates);
      console.log('Session token available:', !!sessionToken);
      
      const response = await TaskBoardAPI.updateTaskDetails(taskId, updates, sessionToken);
      
      console.log('=== TASK UPDATE RESPONSE ===');
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));

      // Update local state
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task, ...response };
            console.log('=== TASK STATE UPDATE ===');
            console.log('Original task:', task);
            console.log('API response:', response);
            console.log('Updated task:', updatedTask);
            return updatedTask;
          }
          return task;
        });
        console.log('Updated tasks array length:', updatedTasks.length);
        return updatedTasks;
      });

      toast.success('Task updated successfully!');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingState('taskUpdate', false);
    }
  }, [session]);

  const assignUsersToTask = useCallback(async (taskId: string, userIds: string[]): Promise<void> => {
    setLoadingState('taskUpdate', true);
    setError(null);

    try {
      const sessionToken = getSessionToken(session);
      
      console.log('=== ASSIGNING USERS TO TASK IN HOOK ===');
      console.log('Task ID:', taskId);
      console.log('User IDs:', userIds);
      console.log('Session token available:', !!sessionToken);
      
      await TaskBoardAPI.addAssigneesToTask(taskId, userIds, sessionToken);
      toast.success('Users assigned successfully!');

      // Refresh tasks to get updated assignee information
      if (projectId) {
        await refreshTasks(projectId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign users';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingState('taskUpdate', false);
    }
  }, [projectId, session]);

  const refreshTasks = useCallback(async (currentProjectId?: string): Promise<void> => {
    // Don't make API calls if session is not loaded yet
    if (!session) {
      console.log('Session not loaded yet, skipping tasks fetch');
      return;
    }

    setLoadingState('tasks', true);
    setError(null);

    try {
      const strategy = getTaskFetchingStrategy(userRole);
      let fetchedTasks: Task[] = [];

      console.log('=== REFRESHING TASKS ===');
      console.log('Fetching tasks with strategy:', strategy, 'for project:', currentProjectId || projectId);
      
      const sessionToken = getSessionToken(session);
      
      console.log('Session token available:', !!sessionToken);
      
      // Check backend health first
      const backendHealthy = await TaskBoardAPI.checkBackendHealth();
      console.log('Backend health status:', backendHealthy);
      
      switch (strategy) {
        case 'assigned':
          console.log('Fetching assigned tasks...');
          fetchedTasks = await TaskBoardAPI.getAssignedTasks(sessionToken);
          break;
        case 'project':
          if (currentProjectId || projectId) {
            console.log('Fetching tasks for project:', currentProjectId || projectId);
            fetchedTasks = await TaskBoardAPI.getTasksByProject(currentProjectId || projectId!, sessionToken);
          }
          break;
        default:
          console.log('Fetching assigned tasks (default)...');
          fetchedTasks = await TaskBoardAPI.getAssignedTasks(sessionToken);
      }

      console.log('=== REFRESH RESULTS ===');
      console.log('Number of fetched tasks:', fetchedTasks.length);
      console.log('Fetched tasks details:', fetchedTasks.map(t => ({ id: t.id, title: t.title })));
      setTasks(fetchedTasks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
      setError(errorMessage);
      console.error('Failed to load tasks:', error);
    } finally {
      setLoadingState('tasks', false);
    }
  }, [userRole, projectId, session]);

  // Auto-refresh tasks when projectId changes
  useEffect(() => {
    if (projectId) {
      refreshTasks(projectId);
    }
  }, [projectId, refreshTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    updateTaskDetails,
    refreshTasks,
    assignUsersToTask,
    setTasks,
    setError,
  };
};

// Legacy hook for backward compatibility
export const useTasks = () => {
  const [tasks, setTasks] = useState<LegacyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = useCallback(async (taskData: CreateTaskData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await TaskBoardAPI.createTask(taskData);
      toast.success(`Task "${taskData.title}" created successfully!`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: string) => {
    setLoading(true);
    setError(null);

    try {
      await TaskBoardAPI.updateTaskStatus(taskId, status as TaskStatus);

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status, completed: status === 'done' }
            : task
        )
      );

      toast.success('Task status updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskDetails = useCallback(async (taskId: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await TaskBoardAPI.updateTaskDetails(taskId, updates);

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates }
            : task
        )
      );

      toast.success('Task updated successfully!');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasksByProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await TaskBoardAPI.getTasksByProject(projectId);
      setTasks(response as any);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssignedTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TaskBoardAPI.getAssignedTasks();
      setTasks(response as any);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assigned tasks';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    updateTaskDetails,
    getTasksByProject,
    getAssignedTasks,
    setTasks,
    setError,
  };
};