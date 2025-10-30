import { getServerSession } from "next-auth";
import { authOptions, ExtendedUser } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

// Backend permission structure for invites
const INVITE_PERMISSIONS: Record<string, string[]> = {
  ceo: ["manager", "assistant_manager", "developer", "intern"],
  manager: ["assistant_manager", "developer", "intern"],
  assistant_manager: ["developer", "intern"],
  developer: [], // Developers cannot invite anyone
  intern: [] // Interns cannot invite anyone
};

// Check if user has permission to invite a specific role
export function canInviteRole(userRole: string, targetRole: string): boolean {
  const normalizedUserRole = userRole.toLowerCase().replace(/\s+/g, "_");
  const normalizedTargetRole = targetRole.toLowerCase().replace(/\s+/g, "_");
  
  const allowedRoles = INVITE_PERMISSIONS[normalizedUserRole];
  
  if (!allowedRoles) {
    return false;
  }
  
  return allowedRoles.includes(normalizedTargetRole);
}

// Check if user can access performance page
export function canAccessPerformance(userRole: string): boolean {
  const allowedRoles = ["ceo", "manager"];
  return allowedRoles.includes(userRole.toLowerCase());
}

// Check if user can manage all departments (CEO only)
export function canManageAllDepartments(userRole: string): boolean {
  return userRole.toLowerCase() === "ceo";
}

// Check if user can manage their own department
export function canManageOwnDepartment(userRole: string): boolean {
  const normalizedRole = userRole.toLowerCase();
  const allowedRoles = ["ceo", "manager", "assistant_manager"];
  return allowedRoles.includes(normalizedRole);
}

// Server-side authentication check
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session.user as ExtendedUser;
}

// Server-side role check
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role.toLowerCase())) {
    redirect("/unauthorized");
  }
  
  return user;
}

// Server-side performance page access check
export async function requirePerformanceAccess() {
  const user = await requireAuth();
  
  if (!canAccessPerformance(user.role)) {
    redirect("/unauthorized");
  }
  
  return user;
}

// Server-side CEO-only access check
export async function requireCEOAccess() {
  const user = await requireAuth();
  
  if (user.role.toLowerCase() !== "ceo") {
    redirect("/unauthorized");
  }
  
  return user;
}

// Client-side permission checker hook
export function hasPermission(user: ExtendedUser | null, permission: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }
  
  return user.permissions.includes(permission);
}

// Get available roles user can invite
export function getInvitableRoles(userRole: string): string[] {
  const normalizedUserRole = userRole.toLowerCase().replace(/\s+/g, "_");
  const allowedRoles = INVITE_PERMISSIONS[normalizedUserRole];
  
  if (!allowedRoles) {
    return [];
  }
  
  return [...allowedRoles];
}

// Permission constants for easy reference
export const PERMISSIONS = {
  ALL_DEPARTMENTS: "all_departments",
  OWN_DEPARTMENT: "own_department",
  CAN_INVITE_MANAGER: "can_invite_manager",
  CAN_INVITE_ASSISTANT_MANAGER: "can_invite_assistant_manager",
  CAN_INVITE_DEVELOPER: "can_invite_developer",
  CAN_INVITE_INTERN: "can_invite_intern",
} as const;

/**
 * Extracts the session token from NextAuth session object
 * Tries multiple possible token locations for backward compatibility
 * 
 * @param session - NextAuth session object
 * @returns Session token string or undefined if not found
 */
export const getSessionToken = (session: Session | null | undefined): string | undefined => {
  if (!session) return undefined;

  // Try different token properties from NextAuth session
  const sessionAny = session as any;
  
  return sessionAny?.accessToken || 
         sessionAny?.access_token || 
         sessionAny?.token ||
         session?.user?.email; // fallback to email as identifier
};

/**
 * Debug helper to log session token availability
 * Only logs in development mode
 * 
 * @param session - NextAuth session object
 * @param context - Context string for debugging (e.g., "useProjects")
 */
export const debugSessionToken = (
  session: Session | null | undefined, 
  context: string = 'Auth'
): void => {
  if (process.env.NODE_ENV === 'development') {
    const token = getSessionToken(session);
    console.log(`[${context}] Session token available:`, !!token);
  }
};
