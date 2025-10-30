'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Project, UserRole } from '@/lib/types';
import { TaskBoardAPI } from '@/lib/api';
import { canViewAllProjects } from '@/lib/permissions';
import { getSessionToken } from '@/lib/auth-utils';
// Note: Toast notifications should be handled at the component level

export interface UseProjectsReturn {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  setSelectedProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
  getProjectCollaborators: (projectId: string) => Promise<any[]>;
}

export const useProjects = (userRole: UserRole): UseProjectsReturn => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    // Don't make API calls if session is not loaded yet
    if (!session) {
      console.log('Session not loaded yet, skipping projects fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get session token for API authentication
      const sessionToken = getSessionToken(session);
      console.log('Using session token for projects API:', sessionToken ? 'Token available' : 'No token');
      
      const fetchedProjects = await TaskBoardAPI.getProjects(sessionToken);
      
      // Filter projects based on user role
      let filteredProjects = fetchedProjects;
      
      if (!canViewAllProjects(userRole)) {
        // For Assistant Managers, filter to only assigned projects
        // This would need to be implemented based on your backend logic
        // For now, we'll show all projects but this should be filtered server-side
        filteredProjects = fetchedProjects;
      }

      setProjects(filteredProjects);
      
      // If no project is selected and we have projects, select the first one
      if (!selectedProject && filteredProjects.length > 0) {
        setSelectedProject(filteredProjects[0]);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole, session, selectedProject]);

  const getProjectCollaborators = useCallback(async (projectId: string) => {
    try {
      const sessionToken = getSessionToken(session);
      return await TaskBoardAPI.getProjectCollaborators(projectId, sessionToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project collaborators';
      console.error('Failed to load project collaborators:', error);
      return [];
    }
  }, [session]);

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return {
    projects,
    selectedProject,
    loading,
    error,
    setSelectedProject,
    refreshProjects,
    getProjectCollaborators,
  };
};