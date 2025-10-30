'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './task-board.css';
import { Task, Project, CreateTaskData } from '@/lib/types';
import { useUserRole } from '@/hooks/useUserRole';
import { useProjects } from '@/hooks/useProjects';
import { useTaskBoard } from '@/hooks/useTasks';
import { shouldShowProjectSelector } from '@/lib/permissions';
import { useToast } from '@/components/task-board/ToastProvider';

// Components
import { ProjectSelector } from '@/components/task-board/ProjectSelector';
import { KanbanBoard } from '@/components/task-board/KanbanBoard';
import { LinearTaskBoard } from '@/components/task-board/LinearTaskBoard';
import { CreateTaskModal } from '@/components/task-board/CreateTaskModal';
import { EditTaskModal } from '@/components/task-board/EditTaskModal';
import { AssignUserModal } from '@/components/task-board/AssignUserModal';
import { TaskBoardErrorBoundary } from '@/components/task-board/ErrorBoundary';
import { ToastProvider } from '@/components/task-board/ToastProvider';
import {
    FullPageLoading,
    KanbanBoardSkeleton,
    EmptyState
} from '@/components/task-board/LoadingSkeletons';

// Icons
import { Loader2, AlertCircle } from 'lucide-react';

function TaskBoardPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { userRole, loading: roleLoading } = useUserRole();
    const { showSuccess, showError } = useToast();

    // State for modals and view
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [assignTaskId, setAssignTaskId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'kanban' | 'linear'>('linear');
    const [showProjectSwitchDialog, setShowProjectSwitchDialog] = useState(false);
    const [pendingProjectSwitch, setPendingProjectSwitch] = useState<{project: any, taskTitle: string} | null>(null);

    // Hooks for data management
    const {
        projects,
        selectedProject,
        loading: projectsLoading,
        error: projectsError,
        setSelectedProject,
    } = useProjects(userRole || 'Developer');

    const {
        tasks,
        loading: tasksLoading,
        error: tasksError,
        createTask,
        updateTaskStatus,
        updateTaskDetails,
        refreshTasks,
        assignUsersToTask,
    } = useTaskBoard(userRole || 'Developer', selectedProject?.id || selectedProject?.project_id);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Auto-refresh tasks when project changes
    useEffect(() => {
        if (selectedProject && userRole) {
            const projectId = selectedProject.id || selectedProject.project_id;
            if (projectId) {
                refreshTasks(projectId);
            }
        }
    }, [selectedProject, userRole, refreshTasks]);

  // Update selectedTask when tasks list changes (to keep modal data fresh)
  useEffect(() => {
    if (selectedTask && tasks.length > 0) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedTask) {
        // Use shallow comparison of key fields instead of JSON.stringify
        const hasChanged = 
          updatedTask.title !== selectedTask.title ||
          updatedTask.status !== selectedTask.status ||
          updatedTask.description !== selectedTask.description ||
          updatedTask.priority !== selectedTask.priority ||
          updatedTask.labels !== selectedTask.labels;
        
        if (hasChanged) {
          console.log('=== UPDATING SELECTED TASK ===');
          console.log('Changed fields detected');
          setSelectedTask(updatedTask);
        }
      }
    }
  }, [tasks, selectedTask]);

    // Handle task click (edit or create)
    const handleTaskClick = (task: Task) => {
        if (task.id === 'create-new') {
            setShowCreateModal(true);
        } else {
            // Always get the latest task data from the tasks list
            const latestTask = tasks.find(t => t.id === task.id) || task;
            console.log('=== TASK CLICK ===');
            console.log('Clicked task:', task);
            console.log('Latest task from list:', latestTask);
            setSelectedTask(latestTask);
            setShowEditModal(true);
        }
    };

    // Handle task status update via drag and drop
    const handleTaskStatusUpdate = async (taskId: string, newStatus: any) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            showSuccess('Task updated', 'Task status updated successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
            showError('Update failed', errorMessage, {
                label: 'Retry',
                onClick: () => handleTaskStatusUpdate(taskId, newStatus)
            });
        }
    };

    // Handle task creation
    const handleCreateTask = useCallback(async (taskData: CreateTaskData) => {
        try {
            console.log('=== CREATING TASK IN PAGE COMPONENT ===');
            console.log('Task data:', taskData);
            console.log('Current selected project:', selectedProject?.id || selectedProject?.project_id);
            console.log('Task being created in project:', taskData.projectId);

            const createdTask = await createTask(taskData);
            console.log('Task created successfully:', createdTask);

            setShowCreateModal(false);
            
            // Get the project ID where the task was created
            const createdTaskProjectId = createdTask.projectId || taskData.projectId || taskData.project_id;
            const currentProjectId = selectedProject?.id || selectedProject?.project_id;
            
            console.log('Created task project ID:', createdTaskProjectId);
            console.log('Current project ID:', currentProjectId);

            // Check if task was created in a different project
            if (createdTaskProjectId && createdTaskProjectId !== currentProjectId) {
                // Find the project where the task was created
                const taskProject = projects.find(
                    p => (p.id || p.project_id) === createdTaskProjectId
                );
                
                if (taskProject) {
                    // Show dialog asking user if they want to switch projects
                    setPendingProjectSwitch({ project: taskProject, taskTitle: taskData.title });
                    setShowProjectSwitchDialog(true);
                } else {
                    showSuccess('Task created', `"${taskData.title}" has been created successfully`);
                }
            } else {
                showSuccess('Task created', `"${taskData.title}" has been created successfully`);
                
                // Refresh current project's tasks
                setTimeout(() => {
                    if (currentProjectId) {
                        console.log('Refreshing tasks after creation...');
                        refreshTasks(currentProjectId);
                    }
                }, 500);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
            console.error('Task creation failed:', error);
            showError('Creation failed', errorMessage);
            throw error;
        }
    }, [createTask, selectedProject, projects, refreshTasks, showSuccess, showError, setSelectedProject]);

  // Handle task editing with proper cleanup
  const handleEditTask = useCallback(async (taskId: string, updates: any) => {
    try {
      console.log('=== HANDLING TASK EDIT ===');
      console.log('Task ID:', taskId);
      console.log('Updates:', updates);
      
      await updateTaskDetails(taskId, updates);
      setShowEditModal(false);
      setSelectedTask(null);
      showSuccess('Task updated', 'Task details have been updated successfully');
      
      // Refresh tasks to ensure we have the latest data from backend
      const timeoutId = setTimeout(() => {
        if (selectedProject) {
          const projectId = selectedProject.id || selectedProject.project_id;
          if (projectId) {
            console.log('Refreshing tasks after update...');
            refreshTasks(projectId);
          }
        }
      }, 500);
      
      // Store timeout ID for cleanup if needed
      return () => clearTimeout(timeoutId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      showError('Update failed', errorMessage);
      throw error;
    }
  }, [updateTaskDetails, selectedProject, refreshTasks, showSuccess, showError]);

    // Handle project switch decision
    const handleSwitchToProject = useCallback(() => {
        if (pendingProjectSwitch) {
            console.log('Switching to project:', pendingProjectSwitch.project.name || pendingProjectSwitch.project.title);
            setSelectedProject(pendingProjectSwitch.project);
            showSuccess(
                'Task created',
                `"${pendingProjectSwitch.taskTitle}" created in ${pendingProjectSwitch.project.name || pendingProjectSwitch.project.title}`
            );
        }
        setShowProjectSwitchDialog(false);
        setPendingProjectSwitch(null);
    }, [pendingProjectSwitch, setSelectedProject, showSuccess]);

    const handleStayOnCurrentProject = useCallback(() => {
        if (pendingProjectSwitch) {
            showSuccess(
                'Task created',
                `"${pendingProjectSwitch.taskTitle}" created in ${pendingProjectSwitch.project.name || pendingProjectSwitch.project.title}. Switch projects to view it.`
            );
        }
        setShowProjectSwitchDialog(false);
        setPendingProjectSwitch(null);
    }, [pendingProjectSwitch, showSuccess]);

    // Handle user assignment
    const handleAssignUsers = (taskId: string) => {
        setAssignTaskId(taskId);
        setShowAssignModal(true);
        setShowEditModal(false);
    };

    const handleUserAssignment = async (taskId: string, userIds: string[]) => {
        try {
            await assignUsersToTask(taskId, userIds);
            setShowAssignModal(false);
            setAssignTaskId('');
            showSuccess('Users assigned', 'Task assignees have been updated successfully');

            // Refresh tasks to get updated assignee information
            if (selectedProject) {
                const projectId = selectedProject.id || selectedProject.project_id;
                if (projectId) {
                    refreshTasks(projectId);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to assign users';
            showError('Assignment failed', errorMessage);
            throw error;
        }
    };

    // Loading state
    if (status === 'loading' || roleLoading) {
        return <FullPageLoading message="Loading task board..." />;
    }

    // Not authenticated
    if (status === 'unauthenticated') {
        return null;
    }

    // No user role
    if (!userRole) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                    <p className="text-gray-300">Unable to determine your role. Please contact an administrator.</p>
                </div>
            </div>
        );
    }

    const showProjectSelector = shouldShowProjectSelector(userRole);
    const currentProjectId = selectedProject?.id || selectedProject?.project_id || '';

    return (
        <div className="min-h-screen bg-gray-900 task-board-mobile">
            {/* Header - Show for both views but with different content */}
            {(viewMode === 'kanban' || viewMode === 'linear') && (
                <div className="bg-gray-800 border-b border-gray-700">
                    <div className="px-4 md:px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                <h1 className="text-xl md:text-2xl font-bold text-white">Task Board</h1>

                                {/* Project Selector - Always show when applicable */}
                                {showProjectSelector && (
                                    <ProjectSelector
                                        projects={projects}
                                        selectedProject={selectedProject}
                                        onProjectSelect={setSelectedProject}
                                        userRole={userRole}
                                        loading={projectsLoading}
                                    />
                                )}

                                {/* View Mode Toggle - Only show when project is selected */}
                                {selectedProject && (
                                    <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('linear')}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                viewMode === 'linear'
                                                    ? 'bg-gray-600 text-white'
                                                    : 'text-gray-300 hover:text-white'
                                            }`}
                                        >
                                            List
                                        </button>
                                        <button
                                            onClick={() => setViewMode('kanban')}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                viewMode === 'kanban'
                                                    ? 'bg-gray-600 text-white'
                                                    : 'text-gray-300 hover:text-white'
                                            }`}
                                        >
                                            Board
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center space-x-2">
                                <span className="text-xs md:text-sm text-gray-300">
                                    {session?.user?.name} ({userRole})
                                </span>
                            </div>
                        </div>

                        {/* Error Messages */}
                        {projectsError && (
                            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                <p className="text-sm text-red-300">{projectsError}</p>
                            </div>
                        )}

                        {tasksError && (
                            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                <p className="text-sm text-red-300">{tasksError}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={viewMode === 'linear' ? 'h-screen' : 'flex-1 h-[calc(100vh-80px)]'}>
                {showProjectSelector && !selectedProject ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                                <Loader2 size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                {projectsLoading ? 'Loading projects...' : 'Select a Project'}
                            </h3>
                            <p className="text-gray-300">
                                {projectsLoading
                                    ? 'Please wait while we load your projects'
                                    : 'Choose a project from the dropdown to view its tasks'
                                }
                            </p>
                        </div>
                    </div>
                ) : tasksLoading.tasks ? (
                    <KanbanBoardSkeleton />
                ) : viewMode === 'linear' ? (
                    <LinearTaskBoard
                        tasks={tasks}
                        onTaskStatusUpdate={handleTaskStatusUpdate}
                        onTaskClick={handleTaskClick}
                        userRole={userRole}
                        projectId={currentProjectId}
                    />
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onTaskStatusUpdate={handleTaskStatusUpdate}
                        onTaskClick={handleTaskClick}
                        userRole={userRole}
                        projectId={currentProjectId}
                    />
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateTaskModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateTask}
                    projectId={currentProjectId}
                    userRole={userRole}
                />
            )}

            {showEditModal && selectedTask && (
                <EditTaskModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedTask(null);
                    }}
                    task={selectedTask}
                    onSubmit={handleEditTask}
                    onAssignUsers={handleAssignUsers}
                    userRole={userRole}
                />
            )}

            {showAssignModal && (
                <AssignUserModal
                    isOpen={showAssignModal}
                    onClose={() => {
                        setShowAssignModal(false);
                        setAssignTaskId('');
                    }}
                    taskId={assignTaskId}
                    currentAssignees={
                        tasks.find(t => t.id === assignTaskId)?.assignees || []
                    }
                    onAssign={handleUserAssignment}
                />
            )}

            {/* Project Switch Dialog */}
            {showProjectSwitchDialog && pendingProjectSwitch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
                    <div className="modal-content bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Task Created in Different Project</h2>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-300 mb-4">
                                Your task <span className="font-semibold text-white">"{pendingProjectSwitch.taskTitle}"</span> was created in:
                            </p>
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <span className="font-medium text-white">
                                        {pendingProjectSwitch.project.name || pendingProjectSwitch.project.title}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                Would you like to switch to this project to view the task, or stay on your current project?
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
                            <button
                                onClick={handleStayOnCurrentProject}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors btn-hover-secondary"
                            >
                                Stay Here
                            </button>
                            <button
                                onClick={handleSwitchToProject}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors btn-hover-primary"
                            >
                                Switch to Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TaskBoardPage() {
    return (
        <TaskBoardErrorBoundary>
            <ToastProvider>
                <TaskBoardPageContent />
            </ToastProvider>
        </TaskBoardErrorBoundary>
    );
}