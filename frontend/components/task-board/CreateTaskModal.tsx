'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CreateTaskModalProps, CreateTaskData, User, TaskStatus, Project } from '@/lib/types';
import { TaskBoardAPI } from '@/lib/api';
import { getSessionToken } from '@/lib/auth-utils';
import { X, Calendar, User as UserIcon, Loader2, FolderOpen } from 'lucide-react';

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  userRole,
}) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    projectId,
    startDate: undefined,
    dueDate: undefined,
    assigneeIds: [],
  });
  
  const [priority, setPriority] = useState<string>('medium');
  const [labels, setLabels] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available users and projects when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
      loadAvailableProjects();
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        projectId: projectId || '',
        startDate: undefined,
        dueDate: undefined,
        assigneeIds: [],
      });
      setSelectedAssignees([]);
      setSelectedProject(null);
      setPriority('medium');
      setLabels('');
      setStatus('todo');
      setErrors({});
    }
  }, [isOpen, projectId]);

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const sessionToken = getSessionToken(session);
      
      console.log('=== LOADING USERS FOR TASK CREATION ===');
      console.log('Session token available:', !!sessionToken);
      
      const users = await TaskBoardAPI.searchUsersToAssign(sessionToken);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAvailableProjects = async () => {
    setLoadingProjects(true);
    try {
      const sessionToken = getSessionToken(session);
      
      console.log('=== LOADING PROJECTS FOR TASK CREATION ===');
      console.log('Session token available:', !!sessionToken);
      console.log('API URL will be:', `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/projects/get_projects`);
      
      const projects = await TaskBoardAPI.getProjects(sessionToken);
      console.log('Loaded projects:', projects);
      setAvailableProjects(projects);
      
      // If a projectId was provided, find and select that project
      if (projectId) {
        const currentProject = projects.find(p => p.id === projectId || p.project_id === projectId);
        if (currentProject) {
          console.log('Auto-selecting project:', currentProject);
          setSelectedProject(currentProject);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleInputChange = <K extends keyof CreateTaskData>(
    field: K,
    value: CreateTaskData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAssigneeToggle = (user: User) => {
    const isSelected = selectedAssignees.some(a => a.id === user.id);
    
    if (isSelected) {
      setSelectedAssignees(prev => prev.filter(a => a.id !== user.id));
    } else {
      setSelectedAssignees(prev => [...prev, user]);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setFormData(prev => ({ 
      ...prev, 
      projectId: project.id || project.project_id || '' 
    }));
    // Clear project selection error if it exists
    if (errors.projectId) {
      setErrors(prev => ({ ...prev, projectId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!selectedProject && !formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData: CreateTaskData = {
        ...formData,
        assigneeIds: selectedAssignees.map(user => user.id),
      };
      
      // Add priority, labels, and status to the task data for the API call
      const extendedTaskData: CreateTaskData = {
        ...taskData,
        priority,
        labels: labels.trim(),
        status,
      };
      
      console.log('=== CREATE TASK MODAL SUBMIT ===');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      console.log('Priority state:', priority);
      console.log('Labels state:', labels);
      console.log('Status state:', status);
      console.log('Selected assignees:', selectedAssignees.map(u => ({ id: u.id, name: u.name })));
      console.log('Final extended task data:', JSON.stringify(extendedTaskData, null, 2));
      
      await onSubmit(extendedTaskData);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors btn-hover-icon"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
            />
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FolderOpen size={16} className="inline mr-1" />
              Project *
            </label>
            
            {loadingProjects ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading projects...</span>
              </div>
            ) : (
              <div className={`border rounded-lg bg-gray-700 ${
                errors.projectId ? 'border-red-500' : 'border-gray-600'
              }`}>
                {availableProjects.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    {availableProjects.map((project) => (
                      <label
                        key={project.id || project.project_id}
                        className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-600 transition-colors user-item-hover"
                      >
                        <input
                          type="radio"
                          name="project"
                          checked={selectedProject?.id === project.id || selectedProject?.project_id === project.project_id}
                          onChange={() => handleProjectSelect(project)}
                          className="rounded border-gray-500 bg-gray-600 text-blue-400 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {project.name || project.title}
                          </div>
                          {project.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    <FolderOpen size={24} className="mx-auto mb-2" />
                    <p className="text-sm">No projects available</p>
                  </div>
                )}
              </div>
            )}
            
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
            )}
            
            {/* Selected Project Display */}
            {selectedProject && (
              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FolderOpen size={16} className="text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">
                    Selected: {selectedProject.name || selectedProject.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Status, Priority and Labels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full roburna-select"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full roburna-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Labels
              </label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="feature, urgent, etc."
              />
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <strong>Labels:</strong> Separate multiple labels with commas (e.g., "feature, urgent, frontend")
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon size={16} className="inline mr-1" />
              Assignees
            </label>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading users...</span>
              </div>
            ) : (
              <div className="border border-gray-600 bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                {availableUsers.length > 0 ? (
                  <div className="space-y-2">
                    {availableUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600 p-2 rounded user-item-hover"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssignees.some(a => a.id === user.id)}
                          onChange={() => handleAssigneeToggle(user)}
                          className="rounded border-gray-500 bg-gray-600 text-blue-400 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-200">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm text-white">{user.name}</span>
                          <span className="text-xs text-gray-400">({user.role})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    No users available for assignment
                  </p>
                )}
              </div>
            )}

            {/* Selected Assignees */}
            {selectedAssignees.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Selected:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAssignees.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300"
                    >
                      {user.name}
                      <button
                        type="button"
                        onClick={() => handleAssigneeToggle(user)}
                        className="ml-1 hover:text-blue-200 btn-hover-icon"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 btn-hover-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center btn-hover-primary"
            >
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};