# Task Creation Feature

This document describes the task creation functionality implemented in the frontend application.

## Overview

The task creation feature allows authorized users (CEO, Manager, Assistant Manager) to create new tasks through a modal interface accessible from the navbar.

## Components

### 1. CreateTaskModal (`/components/CreateTaskModal.tsx`)
- Modal component for creating new tasks
- Form validation and error handling
- Integration with real backend API
- Toast notifications for success/error feedback
- Project selection dropdown
- Date pickers for start and due dates

### 2. Updated Navbar (`/components/Navbar.tsx`)
- "Add Task" button visible only to authorized roles
- Role-based permission checking
- Modal state management

### 3. API Integration (`/lib/api.ts`)
- Real API integration with backend endpoints
- Fallback to mock API for development
- Error handling and retry logic
- TypeScript interfaces for type safety

## API Endpoints Used

Based on your backend code, the following endpoints are integrated:

- `POST /tasks/create_task/` - Create new task
- `GET /projects/get_projects` - Get available projects for dropdown (fetches real projects from project management)
- `GET /tasks/project/{project_id}` - Get tasks by project
- `PUT /tasks/{task_id}/status` - Update task status
- `PUT /tasks/{task_id}/update_details` - Update task details

## Permissions

Task creation is restricted to the following roles:
- CEO
- Manager  
- Assistant Manager

The permission check is implemented in the `canCreateTasks()` function in the Navbar component.

## Features

### Form Fields
- **Title** (required): Task title with 500 character limit
- **Project** (required): Dropdown selection from available projects
- **Description** (optional): Task description with 1000 character limit
- **Start Date** (optional): Task start date
- **Due Date** (optional): Task due date

### Validation
- Client-side validation for required fields
- Server-side validation through backend API
- Error messages displayed in modal and toast notifications

### User Experience
- Loading states during API calls
- Success/error toast notifications
- Form reset after successful creation
- Modal can be closed with Cancel button or X icon
- Disabled form during submission

## Backend Integration

The component integrates with your existing backend API and fetches real projects from your project management system:

```typescript
// Example API call for creating task
const taskData = {
  title: "Task Title",
  description: "Task Description", 
  project_id: "project-uuid",
  start_date: "2024-11-01T10:00:00Z", // ISO string
  due_date: "2024-11-15T18:00:00Z"    // ISO string
};

const response = await taskAPI.createTask(taskData, sessionToken);
// Returns: { message: string, task_id: string }

// Example API call for fetching projects
const projects = await projectAPI.getProjects(sessionToken);
// Returns: Array of Project objects with title, client_company, etc.
```

### Authentication
The API now supports both session-based authentication (NextAuth) and localStorage token fallback:
- Uses `session.accessToken` when available (preferred)
- Falls back to `localStorage.getItem('token')` if no session
- Automatically handles authentication headers

## Error Handling

- Network errors are caught and displayed to user
- Backend validation errors are shown in the modal
- Fallback to mock API if backend is unavailable (development mode)
- Toast notifications for all error states

## Development Notes

- Mock API available in `/app/api/mock.ts` for development
- TypeScript interfaces ensure type safety
- React Hook Form could be added for more advanced form handling
- Component is fully responsive and follows existing design system

## Usage

1. User clicks "Add Task" button in navbar (if authorized)
2. Modal opens with task creation form
3. User fills required fields (title, project) and optional fields
4. Form validates on submit
5. API call creates task in backend
6. Success toast shown and modal closes
7. Task board can be refreshed to see new task

## Recent Updates

### ✅ Real Project Integration
- Now fetches actual projects from your project management system
- Uses `/projects/get_projects` endpoint
- Displays project title and client company in dropdown
- Shows helpful message when no projects are available

### ✅ Enhanced Authentication
- Supports session-based authentication (NextAuth)
- Falls back to localStorage token if needed
- Proper error handling for authentication failures

### ✅ Improved User Experience
- Better project selection with client information
- Loading states for project fetching
- Error messages for missing projects
- Toast notifications for all operations

## Future Enhancements

- Real-time task updates using WebSockets
- Task assignment during creation
- File attachments
- Task templates
- Bulk task creation
- Integration with calendar for due dates
- Project filtering and search in dropdown