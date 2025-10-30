// Mock API for development purposes
// This file provides mock data when the backend is not available

export const mockTasks = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Set up JWT authentication for the application',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe',
    dueDate: '2024-11-15',
    labels: 'Feature',
    completed: false,
    taskId: 'ROB-01',
    project_id: '1'
  },
  {
    id: '2',
    title: 'Design landing page',
    description: 'Create a responsive landing page design',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Jane Smith',
    dueDate: '2024-11-20',
    labels: 'Design',
    completed: false,
    taskId: 'ROB-02',
    project_id: '1'
  },
  {
    id: '3',
    title: 'Fix login bug',
    description: 'Resolve issue with login form validation',
    status: 'Completed',
    priority: 'High',
    assignee: 'Mike Johnson',
    dueDate: '2024-11-10',
    labels: 'Bug',
    completed: true,
    taskId: 'ROB-03',
    project_id: '2'
  },
  {
    id: '4',
    title: 'Update documentation',
    description: 'Update API documentation with new endpoints',
    status: 'To Do',
    priority: 'Low',
    assignee: 'Sarah Wilson',
    dueDate: '2024-11-25',
    labels: 'Documentation',
    completed: false,
    taskId: 'ROB-04',
    project_id: '1'
  }
];

export const mockProjects = [
  {
    project_id: '1',
    title: 'Web Application',
    description: 'Main web application project',
    client_company: 'Tech Corp',
    client_id: '1',
    created_at: '2024-10-01T10:00:00Z',
    due_date: '2024-12-31T23:59:59Z',
    start_date: '2024-10-01T10:00:00Z',
    status: 'in_progress',
    updated_at: '2024-10-30T10:00:00Z',
    urgency: 'high',
    budget: 50000,
    total_revenue: 75000
  },
  {
    project_id: '2',
    title: 'Mobile App',
    description: 'Mobile application development',
    client_company: 'Mobile Solutions Inc',
    client_id: '2',
    created_at: '2024-09-15T10:00:00Z',
    due_date: '2024-11-30T23:59:59Z',
    start_date: '2024-09-15T10:00:00Z',
    status: 'planning',
    updated_at: '2024-10-25T10:00:00Z',
    urgency: 'medium',
    budget: 30000,
    total_revenue: 45000
  },
  {
    project_id: '3',
    title: 'API Development',
    description: 'Backend API development',
    client_company: 'Data Systems Ltd',
    client_id: '3',
    created_at: '2024-08-01T10:00:00Z',
    due_date: '2024-10-31T23:59:59Z',
    start_date: '2024-08-01T10:00:00Z',
    status: 'completed',
    updated_at: '2024-10-20T10:00:00Z',
    urgency: 'low',
    budget: 25000,
    total_revenue: 35000
  }
];

// Mock API functions
export const fetchBoard = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockTasks;
};

export const fetchProjects = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProjects;
};

export const createTask = async (taskData: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newTask = {
    id: (mockTasks.length + 1).toString(),
    taskId: `ROB-${(mockTasks.length + 1).toString().padStart(2, '0')}`,
    ...taskData,
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Unassigned',
    labels: 'Feature',
    completed: false
  };
  
  mockTasks.push(newTask);
  
  return {
    message: 'Task created successfully',
    task_id: newTask.id
  };
};