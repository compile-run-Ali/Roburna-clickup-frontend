"use client";
import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader, Plus, X, Edit } from "lucide-react";

interface Project {
  project_id: string;
  client_company: string;
  client_id: string;
  created_at: string;
  description: string;
  due_date: string;
  start_date?: string;
  status: string;
  title: string;
  updated_at: string;
  urgency: string;
  budget?: number;
  total_revenue?: number;
}

const ProjectManagement = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { 
    user, 
    isLoading: permissionsLoading,
    isCEO,
    isManager,
    isAssistantManager
  } = usePermissions();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create project states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    due_date: '',
    start_date: null as string | null,
    status: 'planning',
    urgency: 'medium',
    budget: null as number | null,
    total_revenue: null as number | null,
    department_ids: null as string[] | null,
    collaborator_ids: null as string[] | null
  });

  // Client management states
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Department management states
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  
  // Collaborator management states
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectCollaborators, setProjectCollaborators] = useState<any[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  
  // Backend status
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Update project states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Client name expansion state
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    due_date: '',
    start_date: null as string | null,
    status: 'planning',
    urgency: 'medium',
    budget: null as number | null,
    total_revenue: null as number | null,
    department_ids: null as string[] | null,
    collaborator_ids: null as string[] | null
  });

  // Fetch projects from the real API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.accessToken) {
        setError('No access token available');
        return;
      }

      // Debug logging
      console.log('Fetching projects...');
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
      
      // Check if backend URL is configured
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error('Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.');
      }
      
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/get_projects`;
      console.log('Fetch URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch projects response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to fetch projects: ${response.status} ${response.statusText}`;
        
        if (response.status === 403) {
          errorMessage = 'Access denied: You do not have permission to view projects. Please check your role permissions.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed: Please log out and log in again.';
        }
        
        // Try to get more details from the response
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage += ` Details: ${errorData.detail}`;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const projectsData = await response.json();
      console.log('Projects fetched successfully:', projectsData);
      console.log('Number of projects:', projectsData.length);
      console.log('Projects array:', projectsData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Fetch projects error:', err);
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to backend server at http://127.0.0.1:8000. Please ensure the backend server is running.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch projects');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create project function
  const createProject = async () => {
    try {
      setIsCreating(true);
      setCreateError(null);

      if (!session?.accessToken) {
        setCreateError('No access token available');
        return;
      }

      // Validate required fields
      if (!formData.title || !formData.description || !formData.client_id || !formData.due_date) {
        setCreateError('Please fill in all required fields');
        return;
      }

      // Debug logging
      console.log('Creating project with data:', formData);
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
      console.log('Access Token:', session.accessToken ? 'Present' : 'Missing');

          // Check if backend URL is configured
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error('Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.');
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/create_project`;
      console.log('Full URL:', url);

      // Test backend connectivity first
      try {
        const testResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docs`);
        console.log('Backend connectivity test:', testResponse.status);
      } catch (connectError) {
        console.error('Backend connectivity test failed:', connectError);
        throw new Error('Cannot connect to backend server. Please ensure the FastAPI server is running on http://127.0.0.1:8000');
      }

      // Prepare the data for the backend
      const projectData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      };

      console.log('Sending project data:', projectData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (response.status === 403) {
          errorMessage = 'Access denied: You do not have permission to create projects. Please check your role permissions.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed: Please log out and log in again.';
        }
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage += ` Details: ${errorData.detail}`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Project created successfully:', result);
      
      setCreateSuccess('Project created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        client_id: '',
        due_date: '',
        start_date: null,
        status: 'planning',
        urgency: 'medium',
        budget: null,
        total_revenue: null,
        department_ids: null,
        collaborator_ids: null
      });
      
      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      console.error('Create project error:', err);
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setCreateError('Network error: Unable to connect to backend server at http://127.0.0.1:8000. Please ensure the backend server is running.');
      } else if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError('An unexpected error occurred while creating the project');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Update project function
  const updateProject = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      if (!session?.accessToken || !editingProject) {
        setUpdateError('No access token or project selected');
        return;
      }

      // Validate required fields
      if (!updateFormData.title || !updateFormData.description || !updateFormData.client_id || !updateFormData.due_date) {
        setUpdateError('Please fill in all required fields');
        return;
      }

      // Prepare the data for the backend
      const updateData = {
        ...updateFormData,
        due_date: updateFormData.due_date ? new Date(updateFormData.due_date).toISOString() : null,
        start_date: updateFormData.start_date ? new Date(updateFormData.start_date).toISOString() : null,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/update_project/${editingProject.project_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update project');
      }

      const result = await response.json();
      setUpdateSuccess('Project updated successfully!');
      setShowUpdateModal(false);
      setEditingProject(null);
      setUpdateFormData({
        title: '',
        description: '',
        client_id: '',
        due_date: '',
        start_date: null,
        urgency: 'medium',
        status: 'planning',
        budget: null,
        total_revenue: null,
        department_ids: null,
        collaborator_ids: null
      });
      
      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docs`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      setBackendStatus('online');
      return true;
    } catch (error) {
      console.error('Backend status check failed:', error);
      setBackendStatus('offline');
      return false;
    }
  };

  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      setLoadingClients(true);

      if (!session?.accessToken) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/client/view_clients`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);

      if (!session?.accessToken) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organization/get_organization_departments`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const departmentsData = await response.json();
        setDepartments(departmentsData);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch available users for collaborator selection
  const fetchAvailableUsers = async (projectId?: string) => {
    try {
      setLoadingUsers(true);

      if (!session?.accessToken) {
        return;
      }

      const params = new URLSearchParams();
      if (projectId) {
        params.append('project_id', projectId);
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/search_assistant_managers_to_add${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        setAvailableUsers(usersData);
      }
    } catch (err) {
      console.error('Failed to fetch available users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch project collaborators
  const fetchProjectCollaborators = async (projectId: string) => {
    try {
      setLoadingCollaborators(true);

      if (!session?.accessToken) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/get_project_collaborators/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const collaboratorsData = await response.json();
        setProjectCollaborators(collaboratorsData);
      }
    } catch (err) {
      console.error('Failed to fetch project collaborators:', err);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  // Add collaborators to project
  const addCollaboratorsToProject = async (projectId: string, collaboratorIds: string[], collaboratorName?: string) => {
    try {
      if (!session?.accessToken) {
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/add_collaborator_to_project/${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collaborator_ids: collaboratorIds }),
      });

      if (response.ok) {
        // Show success message
        const result = await response.json();
        console.log('Collaborator added successfully:', result.message);
        if (collaboratorName) {
          console.log(`${collaboratorName} has been added to the project team.`);
        }
        
        // Refresh collaborators list
        await fetchProjectCollaborators(projectId);
        // Refresh available users list
        await fetchAvailableUsers(projectId);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to add collaborator:', errorData.detail);
        alert(`Failed to add collaborator: ${errorData.detail}`);
        return false;
      }
    } catch (err) {
      console.error('Failed to add collaborators:', err);
      alert('Network error: Failed to add collaborator. Please try again.');
      return false;
    }
  };

  // Remove collaborator from project
  const removeCollaboratorFromProject = async (projectId: string, collaboratorId: string, collaboratorName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to remove ${collaboratorName} from this project?`);
    if (!confirmed) return false;

    try {
      if (!session?.accessToken) {
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/remove_collaborator_from_project/${projectId}?collaborator_id=${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Show success message
        const result = await response.json();
        console.log('Collaborator removed successfully:', result.message);
        
        // Refresh collaborators list
        await fetchProjectCollaborators(projectId);
        // Refresh available users list
        await fetchAvailableUsers(projectId);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to remove collaborator:', errorData.detail);
        alert(`Failed to remove collaborator: ${errorData.detail}`);
        return false;
      }
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
      alert('Network error: Failed to remove collaborator. Please try again.');
      return false;
    }
  };

  // Open collaborator management modal
  const openCollaboratorModal = (project: Project) => {
    setSelectedProject(project);
    setShowCollaboratorModal(true);
    fetchProjectCollaborators(project.project_id);
    fetchAvailableUsers(project.project_id);
  };

  // Open update modal with project data
  const openUpdateModal = (project: Project) => {
    setEditingProject(project);
    setUpdateFormData({
      title: project.title,
      description: project.description,
      client_id: project.client_id,
      due_date: project.due_date.split('T')[0], // Format date for input
      start_date: project.start_date ? project.start_date.split('T')[0] : null,
      status: project.status,
      urgency: project.urgency,
      budget: project.budget || null,
      total_revenue: project.total_revenue || null,
      department_ids: null, // Will be populated if needed
      collaborator_ids: null // Will be populated if needed
    });
    setShowUpdateModal(true);
    setUpdateError(null);
    
    // Fetch clients and departments for the dropdown
    if (session?.accessToken) {
      fetchClients();
      // Only fetch departments for CEOs
      if (isCEO()) {
        fetchDepartments();
      }
    }
  };

  useEffect(() => {
    // Check backend status first
    checkBackendStatus();
    
    if (session?.accessToken && user) {
      fetchProjects();
    }
  }, [session?.accessToken, user]);

  // Fetch clients, departments, and users when create modal opens
  useEffect(() => {
    if (showCreateModal && session?.accessToken) {
      fetchClients();
      // Only fetch departments for CEOs
      if (isCEO()) {
        fetchDepartments();
      }
      // Fetch available users for CEO and Managers
      if (isCEO() || isManager()) {
        fetchAvailableUsers();
      }
    }
  }, [showCreateModal, session?.accessToken]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (createSuccess) {
      const timer = setTimeout(() => setCreateSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => setUpdateSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  // Check permissions
  if (permissionsLoading) {
    return (
      <div className="min-h-screen roburna-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="animate-spin" size={32} />
          <span className="roburna-text-primary text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Check if user has permission to access projects
  const canAccessProjects = user && (isCEO() || isManager() || isAssistantManager());
  
  // Debug logging (remove in production)
  console.log('Project Management Debug:', {
    user: user,
    userRole: user?.role,
    userDepartment: user?.department,
    userOrganization: user?.organizationId,
    isCEO: isCEO(),
    isManager: isManager(),
    isAssistantManager: isAssistantManager(),
    canAccessProjects,
    session: session,
    accessToken: session?.accessToken ? 'Present' : 'Missing',
    sessionUser: session?.user,
    projectsCount: projects.length
  });
  
  if (!canAccessProjects) {
    return (
      <div className="min-h-screen roburna-bg-primary flex items-center justify-center">
        <div className="roburna-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold roburna-text-primary mb-4">Access Denied</h1>
          <p className="roburna-text-secondary">You don't have permission to access project management.</p>
          <p className="roburna-text-muted text-sm mt-2">Only CEOs, Managers, and Assistant Managers can access this feature.</p>
        </div>
      </div>
    );
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning':
        return 'bg-blue-500 text-white';
      case 'in_progress':
        return 'roburna-status-success';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'on_hold':
        return 'bg-yellow-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'bg-red-900 text-red-200 border border-red-500';
      case 'high':
        return 'bg-red-900 text-red-300';
      case 'medium':
        return 'bg-yellow-900 text-yellow-300';
      case 'low':
        return 'bg-green-900 text-green-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const truncateClientName = (clientCompany: string, maxLength: number = 20) => {
    if (clientCompany.length <= maxLength) return clientCompany;
    return clientCompany.substring(0, maxLength) + '...';
  };

  const toggleClientExpansion = (projectId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen roburna-bg-primary p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold roburna-gradient-text mb-2">Project Management</h1>
            <p className="roburna-text-secondary">
              {isCEO() || isManager() 
                ? 'View and manage all projects in your organization' 
                : 'View your assigned projects'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Refresh Button */}
            <button
              onClick={fetchProjects}
              className="roburna-btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            {/* Create Project Button - Only for CEO and Managers */}
            {(isCEO() || isManager()) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="roburna-btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            )}
          </div>
        </div>

        {/* Backend Status Indicator */}
        {backendStatus === 'offline' && (
          <div className="roburna-error-message rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <strong>Backend Server Offline</strong>
                <p className="text-sm mt-1">
                  Cannot connect to the backend server at http://127.0.0.1:8000. 
                  Please start the FastAPI server by running: <code>cd Roburna-clickup-backend/app && fastapi dev main.py</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {createSuccess && (
          <div className="roburna-success-message rounded-lg p-4 mb-4">
            {createSuccess}
          </div>
        )}
        {updateSuccess && (
          <div className="roburna-success-message rounded-lg p-4 mb-4">
            {updateSuccess}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader className="animate-spin" size={32} />
            <span className="roburna-text-primary text-lg">Loading projects...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="roburna-error-message rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Failed to Load Projects</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchProjects}
            className="roburna-btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <>
          {projects.length === 0 ? (
            <div className="roburna-card rounded-lg p-12 text-center">
              <svg className="mx-auto h-12 w-12 roburna-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium roburna-text-primary mb-2">No Projects Found</h3>
              <p className="roburna-text-secondary">
                {isAssistantManager()
                  ? 'You have no assigned projects at the moment.' 
                  : 'No projects have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div key={project.project_id} className="roburna-card roburna-fade-in p-6 relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold roburna-text-primary line-clamp-2 pr-8">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      {/* Edit Button - Only for CEO and Managers */}
                      {(isCEO() || isManager()) && (
                        <button
                          onClick={() => openUpdateModal(project)}
                          className="p-1 roburna-text-secondary hover:roburna-text-primary transition-colors rounded"
                          title="Edit Project"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="roburna-text-secondary text-sm mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor(project.urgency)}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {project.urgency}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm roburna-text-secondary">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {formatDate(project.due_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <button
                        onClick={() => toggleClientExpansion(project.project_id)}
                        className="text-left hover:text-blue-400 transition-colors cursor-pointer flex-1"
                        title="Click to expand/collapse client name"
                      >
                        Client: {expandedClients.has(project.project_id) 
                          ? project.client_company
                          : truncateClientName(project.client_company)
                        }
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Created: {formatDate(project.created_at)}
                    </div>
                  </div>
                  
                  {/* Manage Collaborators Button - Only for CEO and Managers */}
                  {(isCEO() || isManager()) && (
                    <div className="mt-4 pt-4 border-t roburna-border">
                      <button
                        onClick={() => openCollaboratorModal(project)}
                        className="w-full roburna-btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        Manage Team
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-4xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b roburna-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold roburna-text-primary">Create New Project</h2>
                  <p className="text-sm roburna-text-secondary">Set up a new project with team and timeline</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                  setFormData({
                    title: '',
                    description: '',
                    client_id: '',
                    due_date: '',
                    start_date: null,
                    status: 'planning',
                    urgency: 'medium',
                    budget: null,
                    total_revenue: null,
                    department_ids: null,
                    collaborator_ids: null
                  });
                }}
                className="roburna-text-secondary hover:roburna-text-primary transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              {createError && (
                <div className="m-6 mb-0 roburna-error-message rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-medium">{createError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); createProject(); }} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold roburna-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Project Details
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Project Title */}
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Project Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="roburna-input w-full"
                            placeholder="Enter a descriptive project title"
                            required
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Description *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="roburna-input w-full h-28 resize-none"
                            placeholder="Describe the project goals, scope, and key deliverables..."
                            required
                          />
                        </div>

                        {/* Client Selection */}
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Client *
                          </label>
                          {loadingClients ? (
                            <div className="roburna-input w-full flex items-center justify-center py-3">
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              <span className="text-sm">Loading clients...</span>
                            </div>
                          ) : (
                            <select
                              value={formData.client_id}
                              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                              className="roburna-select w-full"
                              required
                            >
                              <option value="">Choose a client for this project</option>
                              {clients.map((client) => (
                                <option key={client.client_id} value={client.client_id}>
                                  {client.name} - {client.company}
                                </option>
                              ))}
                            </select>
                          )}
                          {clients.length === 0 && !loadingClients && (
                            <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                              <p className="text-sm text-yellow-300 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                No clients available. Create a client first in Client Management.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status and Urgency Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Status
                            </label>
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="roburna-select w-full"
                            >
                              <option value="planning">📋 Planning</option>
                              <option value="in_progress">🚀 In Progress</option>
                              <option value="on_hold">⏸️ On Hold</option>
                              <option value="completed">✅ Completed</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Priority
                            </label>
                            <select
                              value={formData.urgency}
                              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                              className="roburna-select w-full"
                            >
                              <option value="low">🟢 Low</option>
                              <option value="medium">🟡 Medium</option>
                              <option value="high">🟠 High</option>
                              <option value="critical">🔴 Critical</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Timeline & Resources */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold roburna-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Timeline & Budget
                      </h3>
                      
                      <div className="space-y-4">

                        {/* Project Dates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={formData.start_date || ''}
                              onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                              className="roburna-input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Due Date *
                            </label>
                            <input
                              type="date"
                              value={formData.due_date}
                              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                              className="roburna-input w-full"
                              required
                            />
                          </div>
                        </div>

                        {/* Budget Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Budget
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.budget || ''}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                                className="roburna-input w-full pl-8"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Expected Revenue
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.total_revenue || ''}
                                onChange={(e) => setFormData({ ...formData, total_revenue: e.target.value ? parseFloat(e.target.value) : null })}
                                className="roburna-input w-full pl-8"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Assignment Section */}
                    <div>
                      <h3 className="text-lg font-semibold roburna-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Department Assignment
                      </h3>

                      {/* Department Selection - CEO Only */}
                      {isCEO() && (
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Departments (Optional)
                          </label>
                          <p className="text-xs roburna-text-muted mb-3">
                            Select departments to assign this project to. If none selected, project will be assigned to all departments.
                          </p>
                          {loadingDepartments ? (
                            <div className="roburna-input w-full flex items-center justify-center py-4">
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              <span className="text-sm">Loading departments...</span>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto roburna-card-dark p-3 rounded-lg">
                              {departments.map((department) => (
                                <label key={department.department_id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={formData.department_ids?.includes(department.department_id) || false}
                                    onChange={(e) => {
                                      const currentDepts = formData.department_ids || [];
                                      if (e.target.checked) {
                                        setFormData({ 
                                          ...formData, 
                                          department_ids: [...currentDepts, department.department_id] 
                                        });
                                      } else {
                                        setFormData({ 
                                          ...formData, 
                                          department_ids: currentDepts.filter(id => id !== department.department_id) 
                                        });
                                      }
                                    }}
                                    className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                                  />
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-medium text-xs">
                                      {department.department_name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-sm roburna-text-primary font-medium">{department.department_name}</span>
                                </label>
                              ))}
                              {departments.length === 0 && (
                                <p className="text-sm roburna-text-muted text-center py-4">
                                  No departments available.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Department Assignment Info for Managers */}
                      {isManager() && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-300">Automatic Department Assignment</span>
                          </div>
                          <p className="text-xs text-blue-200 ml-11">
                            As a Manager, projects will be automatically assigned to your department or all departments based on your permissions.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Members Section - Full Width */}
              



                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t roburna-border">
                  <div className="flex items-center gap-2 text-sm roburna-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You can modify these settings later</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setCreateError(null);
                        setFormData({
                          title: '',
                          description: '',
                          client_id: '',
                          due_date: '',
                          start_date: null,
                          status: 'planning',
                          urgency: 'medium',
                          budget: null,
                          total_revenue: null,
                          department_ids: null,
                          collaborator_ids: null
                        });
                      }}
                      className="px-6 py-2.5 roburna-btn-secondary"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2.5 roburna-btn-primary flex items-center gap-2"
                      disabled={isCreating || !formData.title || !formData.description || !formData.client_id || !formData.due_date}
                    >
                      {isCreating ? (
                        <>
                          <Loader className="animate-spin w-4 h-4" />
                          <span>Creating Project...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Create Project</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Project Modal */}
      {showUpdateModal && editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-4xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b roburna-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold roburna-text-primary">Update Project</h2>
                  <p className="text-sm roburna-text-secondary">Modify project details and settings</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateError(null);
                  setEditingProject(null);
                }}
                className="roburna-text-secondary hover:roburna-text-primary transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              {updateError && (
                <div className="m-6 mb-0 roburna-error-message rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-medium">{updateError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); updateProject(); }} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold roburna-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Project Details
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Project Title */}
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Project Title *
                          </label>
                          <input
                            type="text"
                            value={updateFormData.title}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, title: e.target.value })}
                            className="roburna-input w-full"
                            placeholder="Enter a descriptive project title"
                            required
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Description *
                          </label>
                          <textarea
                            value={updateFormData.description}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                            className="roburna-input w-full h-28 resize-none"
                            placeholder="Describe the project goals, scope, and key deliverables..."
                            required
                          />
                        </div>

                        {/* Client Selection */}
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Client *
                          </label>
                          <select
                            value={updateFormData.client_id}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, client_id: e.target.value })}
                            className="roburna-select w-full"
                            required
                          >
                            <option value="">Choose a client for this project</option>
                            {clients.map((client) => (
                              <option key={client.client_id} value={client.client_id}>
                                {client.name} - {client.company}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status and Urgency Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Status
                            </label>
                            <select
                              value={updateFormData.status}
                              onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                              className="roburna-select w-full"
                            >
                              <option value="planning">📋 Planning</option>
                              <option value="in_progress">🚀 In Progress</option>
                              <option value="on_hold">⏸️ On Hold</option>
                              <option value="completed">✅ Completed</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Priority
                            </label>
                            <select
                              value={updateFormData.urgency}
                              onChange={(e) => setUpdateFormData({ ...updateFormData, urgency: e.target.value })}
                              className="roburna-select w-full"
                            >
                              <option value="low">🟢 Low</option>
                              <option value="medium">🟡 Medium</option>
                              <option value="high">🟠 High</option>
                              <option value="critical">🔴 Critical</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Timeline & Resources */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold roburna-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Timeline & Budget
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Project Dates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={updateFormData.start_date || ''}
                              onChange={(e) => setUpdateFormData({ ...updateFormData, start_date: e.target.value || null })}
                              className="roburna-input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Due Date *
                            </label>
                            <input
                              type="date"
                              value={updateFormData.due_date}
                              onChange={(e) => setUpdateFormData({ ...updateFormData, due_date: e.target.value })}
                              className="roburna-input w-full"
                              required
                            />
                          </div>
                        </div>

                        {/* Budget Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Budget
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={updateFormData.budget || ''}
                                onChange={(e) => setUpdateFormData({ ...updateFormData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                                className="roburna-input w-full pl-8"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium roburna-text-primary mb-2">
                              Expected Revenue
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={updateFormData.total_revenue || ''}
                                onChange={(e) => setUpdateFormData({ ...updateFormData, total_revenue: e.target.value ? parseFloat(e.target.value) : null })}
                                className="roburna-input w-full pl-8"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Assignment Section */}
                    <div>
                      <h3 className="text-lg font-semibold roburna-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Department Assignment
                      </h3>

                      {/* Department Selection - CEO Only */}
                      {isCEO() && (
                        <div>
                          <label className="block text-sm font-medium roburna-text-primary mb-2">
                            Departments (Optional)
                          </label>
                          <p className="text-xs roburna-text-muted mb-3">
                            Select departments to assign this project to. If none selected, project will be assigned to all departments.
                          </p>
                          {loadingDepartments ? (
                            <div className="roburna-input w-full flex items-center justify-center py-4">
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              <span className="text-sm">Loading departments...</span>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto roburna-card-dark p-3 rounded-lg">
                              {departments.map((department) => (
                                <label key={department.department_id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={updateFormData.department_ids?.includes(department.department_id) || false}
                                    onChange={(e) => {
                                      const currentDepts = updateFormData.department_ids || [];
                                      if (e.target.checked) {
                                        setUpdateFormData({ 
                                          ...updateFormData, 
                                          department_ids: [...currentDepts, department.department_id] 
                                        });
                                      } else {
                                        setUpdateFormData({ 
                                          ...updateFormData, 
                                          department_ids: currentDepts.filter(id => id !== department.department_id) 
                                        });
                                      }
                                    }}
                                    className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                                  />
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-medium text-xs">
                                      {department.department_name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-sm roburna-text-primary font-medium">{department.department_name}</span>
                                </label>
                              ))}
                              {departments.length === 0 && (
                                <p className="text-sm roburna-text-muted text-center py-4">
                                  No departments available.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Department Assignment Info for Managers */}
                      {isManager() && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-300">Automatic Department Assignment</span>
                          </div>
                          <p className="text-xs text-blue-200 ml-11">
                            As a Manager, projects will be automatically assigned to your department or all departments based on your permissions.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t roburna-border">
                  <div className="flex items-center gap-2 text-sm roburna-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Changes will be saved immediately</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        setUpdateError(null);
                        setEditingProject(null);
                      }}
                      className="px-6 py-2.5 roburna-btn-secondary"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2.5 roburna-btn-primary flex items-center gap-2"
                      disabled={isUpdating || !updateFormData.title || !updateFormData.description || !updateFormData.client_id || !updateFormData.due_date}
                    >
                      {isUpdating ? (
                        <>
                          <Loader className="animate-spin w-4 h-4" />
                          <span>Updating Project...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Update Project</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Collaborator Management Modal */}
      {showCollaboratorModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-4xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b roburna-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold roburna-text-primary">Manage Team</h2>
                  <p className="text-sm roburna-text-secondary">{selectedProject.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCollaboratorModal(false);
                  setSelectedProject(null);
                  setProjectCollaborators([]);
                  setAvailableUsers([]);
                }}
                className="roburna-text-secondary hover:roburna-text-primary transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Team Members */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold roburna-text-primary">Current Team Members</h3>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                      {projectCollaborators.length}
                    </span>
                  </div>
                  
                  {loadingCollaborators ? (
                    <div className="roburna-card-dark rounded-lg p-8 flex items-center justify-center">
                      <Loader className="animate-spin w-6 h-6 mr-3" />
                      <span className="text-sm">Loading team members...</span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {projectCollaborators.length === 0 ? (
                        <div className="roburna-card-dark rounded-lg p-8 text-center">
                          <svg className="w-12 h-12 roburna-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                          <p className="text-sm roburna-text-muted">No team members assigned yet.</p>
                          <p className="text-xs roburna-text-muted mt-1">Add team members from the available list.</p>
                        </div>
                      ) : (
                        projectCollaborators.map((collaborator) => (
                          <div key={collaborator.user_id} className="flex items-center justify-between p-4 roburna-card-dark rounded-lg hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {collaborator.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium roburna-text-primary">{collaborator.username}</div>
                                <div className="text-xs roburna-text-secondary">{collaborator.email}</div>
                                <div className="text-xs roburna-text-muted flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {collaborator.department_name}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeCollaboratorFromProject(selectedProject.project_id, collaborator.user_id, collaborator.username)}
                              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                              title="Remove from project"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Available Users to Add */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <h3 className="text-lg font-semibold roburna-text-primary">Available Assistant Managers</h3>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                      {availableUsers.length}
                    </span>
                  </div>
                  
                  {loadingUsers ? (
                    <div className="roburna-card-dark rounded-lg p-8 flex items-center justify-center">
                      <Loader className="animate-spin w-6 h-6 mr-3" />
                      <span className="text-sm">Loading available users...</span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {availableUsers.length === 0 ? (
                        <div className="roburna-card-dark rounded-lg p-8 text-center">
                          <svg className="w-12 h-12 roburna-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm roburna-text-muted">All available users are already on the team.</p>
                          <p className="text-xs roburna-text-muted mt-1">Great job building your team!</p>
                        </div>
                      ) : (
                        availableUsers.map((user) => (
                          <div key={user.user_id} className="flex items-center justify-between p-4 roburna-card-dark rounded-lg hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium roburna-text-primary">{user.username}</div>
                                <div className="text-xs roburna-text-secondary">{user.email}</div>
                                <div className="text-xs roburna-text-muted flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {user.department_name}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => addCollaboratorsToProject(selectedProject.project_id, [user.user_id], user.username)}
                              className="text-green-400 hover:text-green-300 transition-colors p-2 hover:bg-green-500/10 rounded-lg"
                              title="Add to project"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t roburna-border">
                <div className="flex items-center gap-2 text-sm roburna-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Changes are saved automatically</span>
                </div>
                <button
                  onClick={() => {
                    setShowCollaboratorModal(false);
                    setSelectedProject(null);
                    setProjectCollaborators([]);
                    setAvailableUsers([]);
                  }}
                  className="px-6 py-2.5 roburna-btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectManagement