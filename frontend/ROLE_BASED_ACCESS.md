# Role-Based Access Control (RBAC) Implementation

This document outlines the role-based access control system implemented using NextAuth.

## Roles and Permissions

### CEO
- **Permissions:**
  - `all_departments` - Can manage all departments
  - `can_invite_manager` - Can invite managers
  - `can_invite_assistant_manager` - Can invite assistant managers
  - `can_invite_developer` - Can invite developers
  - `can_invite_intern` - Can invite interns
- **Access:**
  - Performance page ✅
  - Add member page ✅
  - Client management page ✅
  - All departments ✅

### Manager
- **Permissions:**
  - `own_department` - Can manage own department only
  - `can_invite_assistant_manager` - Can invite assistant managers
  - `can_invite_developer` - Can invite developers
  - `can_invite_intern` - Can invite interns
- **Access:**
  - Performance page ✅
  - Add member page ✅
  - Client management page ❌
  - Own department only ✅

### Assistant Manager
- **Permissions:**
  - `own_department` - Can manage own department only
  - `can_invite_developer` - Can invite developers
  - `can_invite_intern` - Can invite interns
- **Access:**
  - Performance page ❌
  - Add member page ✅
  - Client management page ❌
  - Own department only ✅

### Developer & Intern
- **Permissions:** None
- **Access:**
  - Performance page ❌
  - Add member page ❌
  - Client management page ❌
  - Task board only ✅

## Implementation Files

### Core Authentication
- `app/api/auth/[...nextauth]/options.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth route handler
- `middleware.ts` - Route protection middleware

### Utilities
- `lib/auth-utils.ts` - Server-side auth utilities
- `hooks/usePermissions.ts` - Client-side permission hook

### Protected Pages
- `app/performance/page.tsx` - CEO and Manager only
- `app/add-member/page.tsx` - Management roles only
- `app/client-management/page.tsx` - CEO only
- `app/unauthorized/page.tsx` - Access denied page

### Components
- `components/Sidebar.tsx` - Role-based navigation
- `app/dashboard/page.tsx` - Role-aware dashboard

## Usage Examples

### Server-side Protection
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

### Middleware Protection
Routes are automatically protected based on role in `middleware.ts`:
- `/performance/*` - CEO and Manager only
- `/add-member/*` - Management roles only
- `/client-management/*` - CEO only
- `/admin/*` - CEO only

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

## Session Structure

The user session includes:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string;
    organizationId: string;
    organizationName: string;
    permissions: string[];
    canAccessPerformance: boolean;
  }
}
```