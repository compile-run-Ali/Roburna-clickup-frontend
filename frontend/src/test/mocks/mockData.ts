import { Project, Task, User, UserRole } from '../../lib/types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Manager' as UserRole,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Developer' as UserRole,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Assistant Manager' as UserRole,
  },
]

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project Alpha',
    description: 'First test project',
  },
  {
    id: '2',
    name: 'Project Beta',
    description: 'Second test project',
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'First task description',
    status: 'todo',
    assignees: [mockUsers[0]],
    projectId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Second task description',
    status: 'in_progress',
    assignees: [mockUsers[1]],
    projectId: '1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Third task description',
    status: 'done',
    assignees: [mockUsers[0], mockUsers[1]],
    projectId: '2',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
]