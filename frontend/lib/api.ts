// API utility functions for task management
import { 
  Project, 
  Task, 
  User, 
  CreateTaskData, 
  TaskUpdateData, 
  TaskStatus,
  ApiError,
  UserSearchParams,
  SearchedUser,
  UserRole
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

// API client configured to use external backend

// Get auth token from localStorage or session
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        // Try multiple possible token storage locations
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('accessToken');
        console.log('Retrieved token from localStorage:', token ? 'Token found' : 'No token found');
        return token;
    }
    return null;
};

// Create headers with authentication
const createHeaders = (sessionToken?: string) => {
    const token = sessionToken || getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    console.log('=== AUTH DEBUG ===');
    console.log('Session token provided:', !!sessionToken);
    console.log('Token from localStorage:', !!getAuthToken());
    console.log('Final token used:', !!token);
    console.log('Request headers:', headers);
    return headers;
};

// Error handling utility
const handleApiError = async (response: Response): Promise<never> => {
    const errorData = await response.json().catch(() => ({}));
    const error: ApiError = {
        detail: errorData.detail || `HTTP error! status: ${response.status}`,
        status: response.status
    };
    throw error;
};

// Task Board API - Complete implementation based on backend Swagger docs
export class TaskBoardAPI {
    // Health check to verify backend connectivity
    static async checkBackendHealth(): Promise<boolean> {
        try {
            console.log('Checking backend health at:', API_BASE_URL);
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const isHealthy = response.ok;
            console.log('Backend health check result:', isHealthy, 'Status:', response.status);
            return isHealthy;
        } catch (error) {
            console.log('Backend health check failed, likely using local API fallback:', error instanceof Error ? error.message : 'Unknown error');
            return false;
        }
    }
    // Helper method to normalize task status from backend
    private static normalizeTaskStatus(status: string): TaskStatus {
        if (!status) return 'todo';
        
        const normalizedStatus = status.toLowerCase().replace(/[_\s-]+/g, '_');
        
        switch (normalizedStatus) {
            case 'todo':
            case 'to_do':
            case 'pending':
            case 'open':
            case 'new':
                return 'todo';
            case 'in_progress':
            case 'inprogress':
            case 'in-progress':
            case 'working':
            case 'active':
                return 'in_progress';
            case 'done':
            case 'completed':
            case 'finished':
            case 'closed':
                return 'done';
            default:
                return 'todo';
        }
    }
    // Project operations
    static async getProjects(sessionToken?: string): Promise<Project[]> {
        try {
            console.log('Fetching projects from:', `${API_BASE_URL}/projects/get_projects`);
            
            const response = await fetch(`${API_BASE_URL}/projects/get_projects`, {
                method: 'GET',
                headers: createHeaders(sessionToken),
            });

            console.log('Projects response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Projects API Error:', errorText);
                await handleApiError(response);
            }

            const rawProjects = await response.json();
            console.log('Raw projects from API:', rawProjects);
            
            // Transform backend data to match our Project interface
            const transformedProjects = rawProjects.map((project: any) => ({
                id: project.project_id || project.id,
                name: project.title || project.name,
                description: project.description,
                // Keep original fields for backward compatibility
                project_id: project.project_id,
                title: project.title,
                client_company: project.client_company,
                client_id: project.client_id,
                created_at: project.created_at,
                due_date: project.due_date,
                start_date: project.start_date,
                status: project.status,
                updated_at: project.updated_at,
                urgency: project.urgency,
                budget: project.budget,
                total_revenue: project.total_revenue,
            }));
            
            console.log('Transformed projects:', transformedProjects);
            return transformedProjects;
        } catch (error) {
            console.error('Failed to fetch projects from backend:', error);
            throw error;
        }
    }

    static async getProjectCollaborators(projectId: string, sessionToken?: string): Promise<User[]> {
        try {
            console.log('Fetching project collaborators for project:', projectId);
            console.log('API URL:', `${API_BASE_URL}/projects/get_project_collaborators/${projectId}`);
            
            const response = await fetch(`${API_BASE_URL}/projects/get_project_collaborators/${projectId}`, {
                method: 'GET',
                headers: createHeaders(sessionToken),
            });

            console.log('Project collaborators response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Project collaborators API Error:', errorText);
                await handleApiError(response);
            }

            const rawUsers = await response.json();
            console.log('Raw project collaborators from API:', rawUsers);
            
            // Transform backend data to match our User interface
            return rawUsers.map((user: any) => ({
                id: user.user_id || user.id,
                name: user.name || user.username || user.full_name || 'Unknown User',
                email: user.email || '',
                avatar: user.avatar || user.profile_picture,
                role: user.role || 'Developer',
            }));
        } catch (error) {
            console.warn('Failed to fetch project collaborators:', error);
            return [];
        }
    }

    // Task operations
    static async getTasksByProject(projectId: string, sessionToken?: string): Promise<Task[]> {
        try {
            console.log('Fetching tasks for project:', projectId);
            console.log('API URL:', `${API_BASE_URL}/tasks/get_tasks_by_project/${projectId}`);
            
            const response = await fetch(`${API_BASE_URL}/tasks/get_tasks_by_project/${projectId}`, {
                method: 'GET',
                headers: createHeaders(sessionToken),
            });

            console.log('Tasks response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Tasks API Error:', errorText);
                await handleApiError(response);
            }

            const rawTasks = await response.json();
            console.log('=== TASK RETRIEVAL DEBUG ===');
            console.log('Raw tasks from API:', rawTasks);
            console.log('Number of tasks:', rawTasks.length);
            console.log('Available fields in first task:', rawTasks.length > 0 ? Object.keys(rawTasks[0]) : 'No tasks');
            
            // Transform backend data to match our Task interface
            const transformedTasks = rawTasks.map((taskWrapper: any, index: number) => {
                console.log(`=== TASK ${index + 1} TRANSFORMATION ===`);
                console.log('Raw task wrapper:', JSON.stringify(taskWrapper, null, 2));
                
                // Handle nested task structure from backend
                const task = taskWrapper.task || taskWrapper;
                const assignees = taskWrapper.assignees || task.assignees || [];
                
                console.log('Extracted task object:', JSON.stringify(task, null, 2));
                console.log('Task title field:', task.title);
                console.log('Task description field:', task.description);
                console.log('Task priority field:', task.priority);
                console.log('Task labels field:', task.labels);
                console.log('Task status field:', task.status);
                console.log('Extracted assignees:', assignees);
                
                const transformedTask = {
                    id: task.task_id || task.id,
                    title: task.title || task.name || 'Untitled Task',
                    description: task.description || '',
                    status: this.normalizeTaskStatus(task.status),
                    assignees: Array.isArray(assignees) ? assignees : [],
                    projectId: task.project_id || projectId,
                    createdAt: task.created_at ? new Date(task.created_at) : new Date(),
                    updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
                    startDate: task.start_date ? new Date(task.start_date) : undefined,
                    dueDate: task.due_date ? new Date(task.due_date) : undefined,
                    priority: task.priority || task.task_priority || 'medium',
                    labels: task.labels || task.task_labels || task.tags || '',
                    completed: task.completed || task.status === 'done',
                };
                
                console.log('Transformed task final result:', JSON.stringify(transformedTask, null, 2));
                console.log('Priority mapping check:', {
                    raw: task.priority,
                    taskPriority: task.task_priority,
                    final: transformedTask.priority
                });
                console.log('Labels mapping check:', {
                    raw: task.labels,
                    taskLabels: task.task_labels,
                    tags: task.tags,
                    final: transformedTask.labels
                });
                
                return transformedTask;
            });
            
            console.log('Transformed tasks:', transformedTasks);
            return transformedTasks;
        } catch (error) {
            console.warn('Failed to fetch tasks for project from backend:', projectId, error);
            
            // Fallback to local API if backend is not available
            try {
                console.log('Attempting fallback to local API for project tasks...');
                const localResponse = await fetch(`/api/tasks/get_tasks_by_project/${projectId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                
                if (localResponse.ok) {
                    const localTasks = await localResponse.json();
                    console.log('Local API tasks response:', localTasks);
                    
                    // Transform local API response
                    console.log('=== LOCAL API FALLBACK TRANSFORMATION ===');
                    console.log('Local tasks raw data:', JSON.stringify(localTasks, null, 2));
                    
                    return localTasks.map((task: any) => {
                        console.log('Transforming local task:', JSON.stringify(task, null, 2));
                        const transformed = {
                            id: task.id,
                            title: task.title || 'Untitled Task',
                            description: task.description || '',
                            status: this.normalizeTaskStatus(task.status),
                            assignees: task.assignees || [],
                            projectId: task.projectId || projectId,
                            createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                            updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
                            startDate: task.startDate ? new Date(task.startDate) : undefined,
                            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                            priority: task.priority || 'medium',
                            labels: task.labels || '',
                            completed: task.completed || task.status === 'done',
                        };
                        console.log('Local task transformed result:', JSON.stringify(transformed, null, 2));
                        return transformed;
                    });
                }
            } catch (localError) {
                console.error('Local API also failed:', localError);
            }
            
            // Return empty array instead of throwing to prevent UI crashes
            return [];
        }
    }

    static async getAssignedTasks(sessionToken?: string): Promise<Task[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/get_assigned_tasks`, {
                method: 'GET',
                headers: createHeaders(sessionToken),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const rawTasks = await response.json();
            
            // Transform backend data to match our Task interface
            return rawTasks.map((task: any) => ({
                id: task.task_id || task.id,
                title: task.title || task.name || 'Untitled Task',
                description: task.description || '',
                status: this.normalizeTaskStatus(task.status),
                assignees: task.assignees || task.assigned_users || [],
                projectId: task.project_id || '',
                createdAt: task.created_at ? new Date(task.created_at) : new Date(),
                updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
                startDate: task.start_date ? new Date(task.start_date) : undefined,
                dueDate: task.due_date ? new Date(task.due_date) : undefined,
                priority: task.priority,
                labels: task.labels,
                completed: task.completed || task.status === 'done',
            }));
        } catch (error) {
            console.warn('Failed to fetch assigned tasks:', error);
            // Return empty array instead of throwing to prevent UI crashes
            return [];
        }
    }

    static async createTask(taskData: CreateTaskData, sessionToken?: string): Promise<Task> {
        try {
            // Transform data to match backend expectations
            const backendData = {
                title: taskData.title,
                description: taskData.description || '',
                project_id: taskData.projectId || taskData.project_id,
                start_date: taskData.startDate?.toISOString() || taskData.start_date,
                due_date: taskData.dueDate?.toISOString() || taskData.due_date,
                status: taskData.status || 'todo',
                priority: taskData.priority || 'medium',
                labels: taskData.labels || '',
                assignee_ids: taskData.assigneeIds || []
            };

            console.log('=== TASK CREATION DEBUG ===');
            console.log('Original taskData:', JSON.stringify(taskData, null, 2));
            console.log('Transformed backendData:', JSON.stringify(backendData, null, 2));
            console.log('API URL:', `${API_BASE_URL}/tasks/create_task`);
            console.log('Session token present:', !!sessionToken);
            console.log('Priority field check:', {
                original: taskData.priority,
                transformed: backendData.priority,
                fallback: 'medium'
            });
            console.log('Labels field check:', {
                original: taskData.labels,
                transformed: backendData.labels,
                fallback: ''
            });

            const response = await fetch(`${API_BASE_URL}/tasks/create_task`, {
                method: 'POST',
                headers: createHeaders(sessionToken),
                body: JSON.stringify(backendData),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Full API Response:', JSON.stringify(result, null, 2));
            
            // Transform the response to match our Task interface
            if (result.task_id || result.id) {
                // If we get a response with task_id, create a task object
                const newTask = {
                    id: result.task_id || result.id,
                    title: result.title || taskData.title,
                    description: result.description || taskData.description || '',
                    status: this.normalizeTaskStatus(result.status || taskData.status || 'todo'),
                    assignees: result.assignees || [],
                    projectId: result.project_id || taskData.projectId || taskData.project_id || '',
                    createdAt: result.created_at ? new Date(result.created_at) : new Date(),
                    updatedAt: result.updated_at ? new Date(result.updated_at) : new Date(),
                    startDate: result.start_date ? new Date(result.start_date) : taskData.startDate,
                    dueDate: result.due_date ? new Date(result.due_date) : taskData.dueDate,
                    priority: result.priority || taskData.priority,
                    labels: result.labels || taskData.labels,
                    completed: result.completed || result.status === 'done',
                };
                console.log('=== CREATED TASK OBJECT ===');
                console.log('Created task object:', JSON.stringify(newTask, null, 2));
                console.log('Task title from result:', result.title);
                console.log('Task title from taskData:', taskData.title);
                console.log('Final task title:', newTask.title);
                return newTask;
            }
            
            // If the result is already a full task object, transform it
            if (result.task) {
                const task = result.task;
                const assignees = result.assignees || task.assignees || [];
                
                console.log('=== TRANSFORMING RESULT.TASK ===');
                console.log('Task object from result:', JSON.stringify(task, null, 2));
                console.log('Assignees from result:', assignees);
                
                const transformedTask = {
                    id: task.task_id || task.id,
                    title: task.title || task.name || taskData.title || 'Untitled Task',
                    description: task.description || taskData.description || '',
                    status: this.normalizeTaskStatus(task.status || taskData.status),
                    assignees: Array.isArray(assignees) ? assignees : [],
                    projectId: task.project_id || taskData.projectId || '',
                    createdAt: task.created_at ? new Date(task.created_at) : new Date(),
                    updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
                    startDate: task.start_date ? new Date(task.start_date) : taskData.startDate,
                    dueDate: task.due_date ? new Date(task.due_date) : taskData.dueDate,
                    priority: task.priority || taskData.priority || 'medium',
                    labels: task.labels || taskData.labels || '',
                    completed: task.completed || task.status === 'done',
                };
                console.log('Transformed task from result.task:', JSON.stringify(transformedTask, null, 2));
                console.log('Priority check - task.priority:', task.priority, 'taskData.priority:', taskData.priority, 'final:', transformedTask.priority);
                console.log('Labels check - task.labels:', task.labels, 'taskData.labels:', taskData.labels, 'final:', transformedTask.labels);
                return transformedTask;
            }
            
            return result;
        } catch (error) {
            console.error('Failed to create task on backend:', error);
            console.log('Error details:', error);
            
            // Check if this is a network error (backend not available)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.warn('Backend appears to be unavailable, falling back to local API');
                // Fallback to local API route
                try {
                    const localResponse = await fetch('/api/tasks/create_task', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: taskData.title,
                            description: taskData.description || '',
                            project_id: taskData.projectId || taskData.project_id,
                            start_date: taskData.startDate?.toISOString() || taskData.start_date,
                            due_date: taskData.dueDate?.toISOString() || taskData.due_date,
                            status: taskData.status || 'todo',
                            priority: taskData.priority || 'medium',
                            labels: taskData.labels || '',
                            assignee_ids: taskData.assigneeIds || []
                        }),
                    });
                    
                    if (localResponse.ok) {
                        const localResult = await localResponse.json();
                        console.log('Local API response:', localResult);
                        
                        // Transform local response
                        console.log('=== LOCAL API CREATE TASK FALLBACK ===');
                        console.log('Local result:', JSON.stringify(localResult, null, 2));
                        
                        if (localResult.task) {
                            const task = localResult.task;
                            console.log('Local task object:', JSON.stringify(task, null, 2));
                            console.log('Original taskData for comparison:', JSON.stringify(taskData, null, 2));
                            
                            const transformedLocalTask = {
                                id: task.task_id || task.id,
                                title: task.title || taskData.title,
                                description: task.description || taskData.description || '',
                                status: this.normalizeTaskStatus(task.status),
                                assignees: task.assignees || [],
                                projectId: task.project_id || taskData.projectId || '',
                                createdAt: task.created_at ? new Date(task.created_at) : new Date(),
                                updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
                                startDate: task.start_date ? new Date(task.start_date) : taskData.startDate,
                                dueDate: task.due_date ? new Date(task.due_date) : taskData.dueDate,
                                priority: task.priority || taskData.priority,
                                labels: task.labels || taskData.labels,
                                completed: task.completed || task.status === 'done',
                            };
                            
                            console.log('Final transformed local task:', JSON.stringify(transformedLocalTask, null, 2));
                            console.log('Priority check - task.priority:', task.priority, 'taskData.priority:', taskData.priority, 'final:', transformedLocalTask.priority);
                            console.log('Labels check - task.labels:', task.labels, 'taskData.labels:', taskData.labels, 'final:', transformedLocalTask.labels);
                            
                            return transformedLocalTask;
                        }
                    }
                } catch (localError) {
                    console.error('Local API also failed:', localError);
                }
            }
            
            throw error;
        }
    }

    static async updateTaskDetails(taskId: string, updates: TaskUpdateData, sessionToken?: string): Promise<Task> {
        try {
            // Transform data to match backend expectations
            const backendUpdates = {
                title: updates.title,
                description: updates.description,
                start_date: updates.startDate?.toISOString() || updates.start_date,
                due_date: updates.dueDate?.toISOString() || updates.due_date,
                updated_at: new Date().toISOString(),
            };

            console.log('=== UPDATING TASK DETAILS ===');
            console.log('Task ID:', taskId);
            console.log('Updates:', backendUpdates);

            const response = await fetch(`${API_BASE_URL}/tasks/update_task_details/${taskId}`, {
                method: 'PATCH',
                headers: createHeaders(sessionToken),
                body: JSON.stringify(backendUpdates),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Task details update error:', errorText);
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Task details update result:', result);

            // Transform response to match our Task interface
            if (result.task) {
                const task = result.task;
                return {
                    id: task.task_id || task.id,
                    title: task.title,
                    description: task.description || '',
                    status: this.normalizeTaskStatus(task.status),
                    assignees: task.assignees || [],
                    projectId: task.project_id,
                    createdAt: task.created_at ? new Date(task.created_at) : new Date(),
                    updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
                    startDate: task.start_date ? new Date(task.start_date) : undefined,
                    dueDate: task.due_date ? new Date(task.due_date) : undefined,
                    priority: task.priority || 'medium',
                    labels: task.labels || '',
                    completed: task.completed || task.status === 'done',
                };
            }

            return result;
        } catch (error) {
            console.error('Failed to update task details on backend:', error);
            
            // Fallback to local API if backend is not available or authentication fails
            if (error instanceof TypeError && error.message.includes('fetch') || 
                (error as any)?.status === 401 || 
                (error as any)?.status === 403) {
                console.warn('Backend appears to be unavailable or authentication failed, falling back to local API');
                try {
                    const localResponse = await fetch(`/api/tasks/update_task_details/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: updates.title,
                            description: updates.description,
                            start_date: updates.startDate?.toISOString() || updates.start_date,
                            due_date: updates.dueDate?.toISOString() || updates.due_date,
                            updated_at: new Date().toISOString(),
                        }),
                    });
                    
                    if (localResponse.ok) {
                        const localResult = await localResponse.json();
                        console.log('Local API details update result:', localResult);
                        
                        if (localResult.task) {
                            const task = localResult.task;
                            return {
                                id: task.task_id || task.id,
                                title: task.title,
                                description: task.description || '',
                                status: this.normalizeTaskStatus(task.status),
                                assignees: task.assignees || [],
                                projectId: task.project_id,
                                createdAt: task.created_at ? new Date(task.created_at) : new Date(),
                                updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
                                startDate: task.start_date ? new Date(task.start_date) : undefined,
                                dueDate: task.due_date ? new Date(task.due_date) : undefined,
                                priority: task.priority || 'medium',
                                labels: task.labels || '',
                                completed: task.completed || task.status === 'done',
                            };
                        }
                    }
                } catch (localError) {
                    console.error('Local API also failed:', localError);
                }
            }
            
            throw error;
        }
    }

    static async updateTaskStatus(taskId: string, status: TaskStatus, sessionToken?: string): Promise<void> {
        try {
            console.log('=== UPDATING TASK STATUS ===');
            console.log('Task ID:', taskId);
            console.log('New Status:', status);
            console.log('API URL:', `${API_BASE_URL}/tasks/update_task_status/${taskId}`);

            const response = await fetch(`${API_BASE_URL}/tasks/update_task_status/${taskId}`, {
                method: 'PATCH',
                headers: createHeaders(sessionToken),
                body: JSON.stringify({ 
                    status: status
                }),
            });

            console.log('Update response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Task status update error:', errorText);
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Task status update result:', result);
        } catch (error) {
            console.error('Failed to update task status on backend:', error);
            
            // Fallback to local API if backend is not available or authentication fails
            if (error instanceof TypeError && error.message.includes('fetch') || 
                (error as any)?.status === 401 || 
                (error as any)?.status === 403) {
                console.warn('Backend appears to be unavailable or authentication failed, falling back to local API');
                try {
                    const localResponse = await fetch(`/api/tasks/update_task_status/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            status: status
                        }),
                    });
                    
                    if (localResponse.ok) {
                        const localResult = await localResponse.json();
                        console.log('Local API status update result:', localResult);
                        return;
                    }
                } catch (localError) {
                    console.error('Local API also failed:', localError);
                }
            }
            
            throw error;
        }
    }

    // User operations
    static async searchUsersToAssign(params: UserSearchParams = {}, sessionToken?: string): Promise<SearchedUser[]> {
        try {
            console.log('=== USER SEARCH API CALL ===');
            console.log('Search parameters:', params);
            console.log('Session token present:', !!sessionToken);

            // Build query string from parameters
            const queryParams = new URLSearchParams();
            if (params.task_id) queryParams.append('task_id', params.task_id);
            if (params.username) queryParams.append('username', params.username);
            if (params.email) queryParams.append('email', params.email);
            if (params.department_id) queryParams.append('department_id', params.department_id);

            const queryString = queryParams.toString();
            const url = `${API_BASE_URL}/tasks/search_users_to_assign_tasks${queryString ? `?${queryString}` : ''}`;
            
            console.log('API URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: createHeaders(sessionToken),
            });

            console.log('User search response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('User search API Error:', errorText);
                await handleApiError(response);
            }

            const rawUsers = await response.json();
            console.log('Raw user search results:', rawUsers);
            
            // Transform backend data to match our SearchedUser interface
            const transformedUsers = Array.isArray(rawUsers) ? rawUsers.map((user: any) => ({
                user_id: user.user_id || user.id,
                organization_id: user.organization_id || '',
                username: user.username || user.name || 'Unknown User',
                email: user.email || '',
                role_str: user.role_str || user.role || 'Developer',
                department_name: user.department_name || user.department || 'Unknown Department',
            })) : [];

            console.log('Transformed user search results:', transformedUsers);
            return transformedUsers;
        } catch (error) {
            console.error('Failed to search users for assignment:', error);
            throw error;
        }
    }

    // Legacy method for backward compatibility
    static async searchUsersToAssignLegacy(sessionToken?: string): Promise<User[]> {
        try {
            const searchedUsers = await this.searchUsersToAssign({}, sessionToken);
            
            // Transform SearchedUser to User interface for backward compatibility
            return searchedUsers.map((user: SearchedUser) => ({
                id: user.user_id,
                name: user.username,
                email: user.email,
                avatar: undefined,
                role: user.role_str as UserRole,
            }));
        } catch (error) {
            console.warn('Failed to fetch users for assignment (legacy):', error);
            return [];
        }
    }

    static async addAssigneesToTask(taskId: string, userIds: string[], sessionToken?: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/tasks/add_assignees_to_task/${taskId}`, {
            method: 'POST',
            headers: createHeaders(sessionToken),
            body: JSON.stringify({ user_ids: userIds }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    }
}

// Legacy task API for backward compatibility
export const taskAPI = {
    // Create a new task
    createTask: async (taskData: CreateTaskData, sessionToken?: string) => {
        return TaskBoardAPI.createTask(taskData, sessionToken);
    },

    // Get tasks by project
    getTasksByProject: async (projectId: string, sessionToken?: string) => {
        return TaskBoardAPI.getTasksByProject(projectId, sessionToken);
    },

    // Update task status
    updateTaskStatus: async (taskId: string, status: string, sessionToken?: string) => {
        return TaskBoardAPI.updateTaskStatus(taskId, status as TaskStatus, sessionToken);
    },

    // Update task details
    updateTaskDetails: async (taskId: string, updates: TaskUpdateData, sessionToken?: string) => {
        return TaskBoardAPI.updateTaskDetails(taskId, updates, sessionToken);
    },

    // Get assigned tasks (for developers/interns)
    getAssignedTasks: async (sessionToken?: string) => {
        return TaskBoardAPI.getAssignedTasks(sessionToken);
    },

    // Get all tasks (for task board)
    getAllTasks: async (sessionToken?: string) => {
        return TaskBoardAPI.getAssignedTasks(sessionToken);
    },
};

// Legacy project API for backward compatibility
export const projectAPI = {
    // Get all projects (for task creation dropdown)
    getProjects: async (sessionToken?: string) => {
        return TaskBoardAPI.getProjects(sessionToken);
    },
};

// Legacy type definitions for backward compatibility
export interface UpdateTaskData {
    title?: string;
    description?: string;
    start_date?: string;
    due_date?: string;
}

export interface TaskResponse {
    message: string;
    task_id: string;
}

// Re-export types from the main types file
export type { 
    CreateTaskData, 
    Project, 
    Task, 
    User, 
    TaskStatus, 
    UserRole,
    TaskUpdateData,
    ApiError
} from './types';