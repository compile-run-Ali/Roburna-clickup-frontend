"use client";

import { useSession } from "next-auth/react";
import { ExtendedUser } from "@/app/api/auth/[...nextauth]/options";
import { 
  canInviteRole, 
  canAccessPerformance, 
  canManageAllDepartments, 
  canManageOwnDepartment,
  hasPermission,
  getInvitableRoles,
  PERMISSIONS
} from "@/lib/auth-utils";

export function usePermissions() {
  const { data: session, status } = useSession();
  const user = session?.user as ExtendedUser | null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!user,
    
    // Role-based checks
    canInviteRole: (targetRole: string) => 
      user ? canInviteRole(user.role, targetRole) : false,
    
    canAccessPerformance: () => 
      user ? canAccessPerformance(user.role) : false,
    
    canManageAllDepartments: () => 
      user ? canManageAllDepartments(user.role) : false,
    
    canManageOwnDepartment: () => 
      user ? canManageOwnDepartment(user.role) : false,
    
    // Permission-based checks
    hasPermission: (permission: string) => 
      hasPermission(user, permission),
    
    // Utility functions
    getInvitableRoles: () => 
      user ? getInvitableRoles(user.role) : [],
    
    // Quick role checks
    isCEO: () => user?.role?.toLowerCase() === "ceo",
    isManager: () => user?.role?.toLowerCase() === "manager",
    isAssistantManager: () => user?.role?.toLowerCase() === "assistant_manager",
    isDeveloper: () => user?.role?.toLowerCase() === "developer",
    isIntern: () => user?.role?.toLowerCase() === "intern",
    
    // Permission constants
    PERMISSIONS,
  };
}