'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/types';
import { normalizeUserRole } from '@/lib/permissions';

export interface UseUserRoleReturn {
  userRole: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  user: any;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (session?.user) {
      // Extract role from session user
      const role = (session.user as any)?.role;
      if (role) {
        setUserRole(normalizeUserRole(role));
      }
    } else {
      setUserRole(null);
    }
  }, [session]);

  return {
    userRole,
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
    user: session?.user,
  };
};