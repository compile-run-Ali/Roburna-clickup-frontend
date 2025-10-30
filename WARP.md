# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Structure

This is a **Roburna ClickUp Frontend** - a Next.js 15 task management application with role-based access control. The main codebase is in the `frontend/` directory.

### Key Directories

- `frontend/app/` - Next.js App Router pages and API routes
- `frontend/components/` - Reusable React components (Sidebar, Navbar, CreateTaskModal)
- `frontend/hooks/` - Custom React hooks (usePermissions, useTasks, useProjects, useUserSearch, useUserRole)
- `frontend/lib/` - Core utilities (api.ts, auth-utils.ts, permissions.ts, types.ts, data-store.ts)
- `frontend/app/api/` - Next.js API routes (auth, projects, tasks)

### Important Files

- `frontend/middleware.ts` - NextAuth middleware for route protection based on roles
- `frontend/lib/api.ts` - Backend API integration layer with real and mock endpoints
- `frontend/lib/permissions.ts` - Role-based permission checks for task operations
- `frontend/lib/types.ts` - TypeScript interfaces for Task, Project, User, and related types
- `frontend/app/api/auth/[...nextauth]/options.ts` - NextAuth configuration with role/permission mapping

## Development Commands

All commands must be run from the `frontend/` directory:

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000

# Building
npm run build            # Production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Testing
npm run test             # Run tests with Vitest (single run)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
```

## Environment Variables

Required in `frontend/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

## Architecture Overview

### Authentication & Authorization

This app uses **NextAuth v4** for authentication with a Python backend API.

- **Session Structure**: Sessions include user role, department, organizationId, and computed permissions array
- **Middleware Protection**: Routes are protected at middleware level based on role (see `middleware.ts`)
- **Role Hierarchy**: CEO > Manager > Assistant Manager > Developer > Intern
- **Permission System**: Permissions are computed in `app/api/auth/[...nextauth]/options.ts` based on role and stored in session

**Key Auth Files:**
- `app/api/auth/[...nextauth]/options.ts` - NextAuth config, JWT callbacks, permission computation
- `lib/auth-utils.ts` - Server-side auth helpers (requireAuth, requireRole, requirePerformanceAccess, etc.)
- `hooks/usePermissions.ts` - Client-side permission checking
- `middleware.ts` - Route protection based on role

### Role-Based Access Control (RBAC)

**Role Capabilities:**

| Role | Can Create Tasks | Can Edit Tasks | Can Assign Users | Access Performance | Can Invite |
|------|-----------------|----------------|------------------|-------------------|------------|
| CEO | All projects | ✅ | ✅ | ✅ | All roles |
| Manager | All projects | ✅ | ✅ | ✅ (view-only clients) | Assistant Manager, Developer, Intern |
| Assistant Manager | Assigned projects only | ✅ | ✅ | ❌ | Developer, Intern |
| Developer | ❌ | ❌ | ❌ | ❌ | None |
| Intern | ❌ | ❌ | ❌ | ❌ | None |

**Protected Routes:**
- `/performance` - CEO and Manager only
- `/add-member` - Management roles (CEO, Manager, Assistant Manager)
- `/user-management` - Management roles only
- `/client-management` - CEO and Manager only
- `/admin` - CEO only

**Permission Checking:**
- **Server-side**: Use `lib/auth-utils.ts` functions in page components
- **Client-side**: Use `hooks/usePermissions.ts` for conditional rendering
- **Middleware**: Automatic redirect to `/unauthorized` for unauthorized access

### Backend Integration

The app integrates with a Python FastAPI backend at `NEXT_PUBLIC_BACKEND_URL`.

**Key API Endpoints:**
- `POST /tasks/create_task/` - Create new task
- `GET /tasks/project/{project_id}` - Get tasks by project
- `PUT /tasks/{task_id}/status` - Update task status
- `PUT /tasks/{task_id}/update_details` - Update task details
- `POST /tasks/{task_id}/assign_users` - Assign users to task
- `GET /projects/get_projects` - Get available projects
- `POST /auth/login` - User authentication
- `POST /users/search` - Search users with role/department filters

**Authentication Pattern:**
- Uses `session.accessToken` from NextAuth (preferred)
- Falls back to `localStorage.getItem('token')` if no session
- All API calls in `lib/api.ts` handle both authentication methods

**Error Handling:**
- Backend errors are caught and displayed via toast notifications
- Fallback to mock API for development (see `app/api/mock.ts`)

### Task Board System

**Data Flow:**
1. User selects project from `ProjectSelector`
2. `useTasks` hook fetches tasks for selected project
3. Tasks displayed in Kanban board with drag-and-drop (@dnd-kit)
4. Task status updates via drag-and-drop or modal edit
5. Real-time updates via API calls

**Key Components:**
- `components/task-board/KanbanBoard.tsx` - Main board with drag-and-drop
- `components/task-board/TaskColumn.tsx` - Individual column (Todo/In Progress/Done)
- `components/task-board/TaskCard.tsx` - Individual task card
- `components/CreateTaskModal.tsx` - Task creation modal (shown in Navbar)
- `components/task-board/EditTaskModal.tsx` - Task editing modal
- `components/task-board/AssignUserModal.tsx` - User assignment with search

**Custom Hooks:**
- `useTasks(projectId, token)` - Fetch and manage tasks for a project
- `useProjects(token)` - Fetch available projects based on role
- `useUserSearch(token)` - Search users with role/department restrictions
- `useUserRole()` - Get current user role from session

### State Management

- **Server State**: NextAuth session for user/auth data
- **Component State**: React useState for UI state
- **Data Fetching**: Custom hooks with fetch API (no external state library)
- **Toast Notifications**: react-toastify for user feedback

## TypeScript

- **Strict Mode**: Enabled in `tsconfig.json`
- **Path Alias**: `@/*` maps to root directory
- **Key Types**: See `lib/types.ts` for User, Task, Project, TaskStatus, UserRole, etc.

## Testing

- **Test Framework**: Vitest (Jest alternative)
- **Test Environment**: jsdom for React component testing
- **Testing Library**: @testing-library/react for component tests
- **Setup File**: `src/test/setup.ts` (if exists) or create for test utilities

## Styling

- **CSS Framework**: Tailwind CSS v4
- **Custom Classes**: `roburna-*` prefix for brand colors (e.g., `roburna-bg-primary`, `roburna-text-primary`)
- **Global Styles**: `app/globals.css`
- **Dark Theme**: Default theme with dark backgrounds

## Code Patterns

### Server Components with Auth

```typescript
import { requirePerformanceAccess } from "@/lib/auth-utils";

export default async function PerformancePage() {
  const user = await requirePerformanceAccess();
  return <PerformanceClient user={user} />;
}
```

### Client-side Permission Checks

```typescript
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { canAccessPerformance, canInviteRole } = usePermissions();
  
  return (
    <div>
      {canAccessPerformance() && <PerformanceLink />}
      {canInviteRole("developer") && <InviteButton />}
    </div>
  );
}
```

### API Calls with Authentication

```typescript
import { taskAPI } from "@/lib/api";
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();
  
  const createTask = async (taskData) => {
    const token = session?.accessToken || localStorage.getItem('token');
    const response = await taskAPI.createTask(taskData, token);
    // Handle response
  };
}
```

### Permission-based Rendering

```typescript
import { canCreateTask } from "@/lib/permissions";

function TaskBoard({ userRole }) {
  const canCreate = canCreateTask(userRole);
  
  return (
    <div>
      {canCreate && <CreateTaskButton />}
      <TaskList />
    </div>
  );
}
```

## Important Notes

- **Working Directory**: Always run commands from `frontend/` directory, not the repo root
- **Mock Data**: In-memory mock data available in `lib/data-store.ts` for development without backend
- **Route Protection**: All routes except `/`, `/login`, `/sign-up`, `/login-via-email` require authentication
- **Role Normalization**: Roles are normalized to lowercase with underscores (e.g., "Assistant Manager" → "assistant_manager")
- **Date Handling**: Backend expects ISO 8601 strings for dates (e.g., "2024-11-01T10:00:00Z")
- **Toast Notifications**: Use react-toastify for all user feedback (success, error, info)

## Related Documentation

For more context on specific features:
- `ROLE_BASED_ACCESS.md` - Detailed RBAC implementation
- `TASK_CREATION_GUIDE.md` - Task creation feature documentation
- `README.md` - Basic Next.js setup instructions
