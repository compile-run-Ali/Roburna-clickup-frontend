'use client'
import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, FolderOpen } from 'lucide-react';
import { taskAPI, projectAPI, CreateTaskData, Project } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: any) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const { user } = usePermissions();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    project_id: '',
    start_date: '',
    due_date: '',
  });

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      // Use session token if available, otherwise fall back to localStorage token
      const sessionToken = (session as any)?.accessToken;
      const projectsData = await projectAPI.getProjects(sessionToken);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      const errorMessage = 'Failed to load projects. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Task title is required');
      }
      if (!formData.project_id) {
        throw new Error('Please select a project');
      }

      // Prepare data for API
      const taskData: CreateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project_id: formData.project_id,
        status: 'todo', // Set default status to 'todo'
      };

      // Add dates if provided
      if (formData.start_date) {
        taskData.start_date = new Date(formData.start_date).toISOString();
      }
      if (formData.due_date) {
        taskData.due_date = new Date(formData.due_date).toISOString();
      }

      const sessionToken = (session as any)?.accessToken;
      console.log('Creating task with data:', taskData);
      const response = await taskAPI.createTask(taskData, sessionToken);
      console.log('Task creation response:', response);
      
      // Show success message
      toast.success(`Task "${formData.title}" created successfully!`);
      
      // Call success callback
      if (onTaskCreated) {
        onTaskCreated(response);
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        project_id: '',
        start_date: '',
        due_date: '',
      });
      onClose();

    } catch (error) {
      console.error('Failed to create task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        description: '',
        project_id: '',
        start_date: '',
        due_date: '',
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Create New Task
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Project Selection */}
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-300 mb-2">
                Project *
              </label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 roburna-select appearance-none"
                  required
                  disabled={loading || loadingProjects}
                >
                  <option value="">
                    {loadingProjects ? 'Loading projects...' : 'Select a project'}
                  </option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.title} - {project.client_company}
                    </option>
                  ))}
                </select>
              </div>
              {projects.length === 0 && !loadingProjects && (
                <div className="mt-2 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-300 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    No projects available. Please create a project first in Project Management.
                  </p>
                </div>
              )}
            </div>

            {/* Task Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                disabled={loading}
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.project_id}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'Creating Task...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all hover:scale-105 disabled:hover:scale-100"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* User Info */}
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Creating as: <span className="text-gray-300">{user.name || user.email}</span> ({user.role})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;