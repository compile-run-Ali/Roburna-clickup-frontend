import { http, HttpResponse } from 'msw'

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'A test project',
  },
  {
    id: '2',
    name: 'Test Project 2',
    description: 'Another test project',
  },
]

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'A test task',
    status: 'todo',
    assignees: [],
    projectId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Another test task',
    status: 'in_progress',
    assignees: [],
    projectId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockUsers = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'Manager',
  },
  {
    id: '2',
    name: 'Another User',
    email: 'another@example.com',
    role: 'Developer',
  },
]

export const handlers = [
  // Projects
  http.get('/api/projects/get_projects', () => {
    return HttpResponse.json(mockProjects)
  }),

  http.get('/api/projects/:projectId/collaborators', () => {
    return HttpResponse.json(mockUsers)
  }),

  // Tasks
  http.get('/api/tasks/get_tasks_by_project/:projectId', () => {
    return HttpResponse.json(mockTasks)
  }),

  http.get('/api/tasks/get_assigned_tasks', () => {
    return HttpResponse.json(mockTasks)
  }),

  http.post('/api/tasks/create_task', async ({ request }) => {
    const taskData = await request.json()
    const newTask = {
      id: '3',
      ...taskData,
      assignees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(newTask)
  }),

  http.patch('/api/tasks/update_task_details/:taskId', async ({ request }) => {
    const updates = await request.json()
    const updatedTask = {
      ...mockTasks[0],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(updatedTask)
  }),

  http.patch('/api/tasks/update_task_status/:taskId', () => {
    return HttpResponse.json({ success: true })
  }),

  // Users
  http.get('/api/tasks/search_users_to_assign_tasks', () => {
    return HttpResponse.json(mockUsers)
  }),

  http.post('/api/tasks/add_assignees_to_task/:taskId', () => {
    return HttpResponse.json({ success: true })
  }),
]