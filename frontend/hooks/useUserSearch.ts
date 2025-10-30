import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TaskBoardAPI } from '@/lib/api';
import { SearchedUser, UserSearchParams, UserRole } from '@/lib/types';
import { canAccessUserSearch, getUserSearchScope } from '@/lib/permissions';

interface UseUserSearchReturn {
  users: SearchedUser[];
  loading: boolean;
  error: string | null;
  searchUsers: (query: string, taskId?: string) => void;
  clearSearch: () => void;
  selectUser: (user: SearchedUser) => void;
  selectedUsers: SearchedUser[];
  removeUser: (userId: string) => void;
  clearSelectedUsers: () => void;
  canSearch: boolean;
  searchScope: {
    canSearchAllDepartments: boolean;
    departmentRestriction: boolean;
    allowedRoles: string[];
  };
  excludedTaskId: string | null;
  excludedCount: number;
}

interface ProcessedSearchQuery {
  type: 'username' | 'email' | 'department' | 'general';
  value: string;
  apiParams: UserSearchParams;
}

export const useUserSearch = (userRole?: UserRole, initialTaskId?: string): UseUserSearchReturn => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excludedTaskId, setExcludedTaskId] = useState<string | null>(initialTaskId || null);
  const [excludedCount, setExcludedCount] = useState(0);
  
  // Check permissions
  const canSearch = userRole ? canAccessUserSearch(userRole) : false;
  const searchScope = userRole ? getUserSearchScope(userRole) : {
    canSearchAllDepartments: false,
    departmentRestriction: true,
    allowedRoles: [],
  };
  
  // Cache for search results (5 minute expiration)
  const searchCache = useRef(new Map<string, { users: SearchedUser[], timestamp: number }>());
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRequestRef = useRef<AbortController | null>(null);

  // Process search query to determine type and create API parameters
  const processSearchQuery = useCallback((query: string, taskId?: string): ProcessedSearchQuery => {
    const trimmedQuery = query.trim();
    
    // Email pattern detection
    if (trimmedQuery.includes('@')) {
      return {
        type: 'email',
        value: trimmedQuery,
        apiParams: {
          email: trimmedQuery,
          ...(taskId && { task_id: taskId })
        }
      };
    }
    
    // Department ID pattern (numeric)
    if (/^\d+$/.test(trimmedQuery)) {
      return {
        type: 'department',
        value: trimmedQuery,
        apiParams: {
          department_id: trimmedQuery,
          ...(taskId && { task_id: taskId })
        }
      };
    }
    
    // Default to username search
    return {
      type: 'username',
      value: trimmedQuery,
      apiParams: {
        username: trimmedQuery,
        ...(taskId && { task_id: taskId })
      }
    };
  }, []);

  // Get session token for API calls
  const getSessionToken = useCallback((): string | undefined => {
    if (session?.accessToken) {
      return session.accessToken as string;
    }
    if (session?.user?.email) {
      // Fallback token extraction from session
      return (session as any)?.token?.accessToken || (session as any)?.accessToken;
    }
    return undefined;
  }, [session]);

  // Check cache for existing results
  const getCachedResults = useCallback((cacheKey: string): SearchedUser[] | null => {
    const cached = searchCache.current.get(cacheKey);
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > 5 * 60 * 1000; // 5 minutes
      if (!isExpired) {
        console.log('Using cached search results for:', cacheKey);
        return cached.users;
      } else {
        searchCache.current.delete(cacheKey);
      }
    }
    return null;
  }, []);

  // Cache search results
  const cacheResults = useCallback((cacheKey: string, users: SearchedUser[]) => {
    searchCache.current.set(cacheKey, {
      users,
      timestamp: Date.now()
    });
    
    // Limit cache size to 10 most recent searches
    if (searchCache.current.size > 10) {
      const firstKey = searchCache.current.keys().next().value;
      if (firstKey) {
        searchCache.current.delete(firstKey);
      }
    }
  }, []);

  // Main search function with debouncing
  const searchUsers = useCallback(async (query: string, taskId?: string) => {
    // Check permissions first
    if (!canSearch) {
      setError('You do not have permission to search for users');
      setUsers([]);
      setLoading(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Cancel previous request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Clear error state
    setError(null);

    // If query is empty, clear results
    if (!query.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // Update excluded task ID
    setExcludedTaskId(taskId || null);

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        
        const processedQuery = processSearchQuery(query, taskId);
        const cacheKey = JSON.stringify(processedQuery.apiParams);
        
        console.log('=== USER SEARCH HOOK ===');
        console.log('Query:', query);
        console.log('Task ID for exclusion:', taskId);
        console.log('Processed query:', processedQuery);
        console.log('Cache key:', cacheKey);

        // Check cache first
        const cachedResults = getCachedResults(cacheKey);
        if (cachedResults) {
          setUsers(cachedResults);
          setLoading(false);
          return;
        }

        // Create new abort controller for this request
        currentRequestRef.current = new AbortController();
        
        const sessionToken = getSessionToken();
        console.log('Session token available:', !!sessionToken);

        const searchResults = await TaskBoardAPI.searchUsersToAssign(
          processedQuery.apiParams,
          sessionToken
        );

        // Check if request was aborted
        if (currentRequestRef.current?.signal.aborted) {
          return;
        }

        console.log('Search results:', searchResults);
        console.log('Results count before filtering:', searchResults.length);
        
        // Filter results based on role permissions
        const filteredResults = filterResultsByRole(searchResults, userRole);
        console.log('Filtered results by role:', filteredResults);
        console.log('Results count after role filtering:', filteredResults.length);
        
        // If we have a task ID, the backend already excluded assigned users
        // We can estimate excluded count by comparing with a search without task_id
        if (taskId) {
          console.log('Assignee exclusion active for task:', taskId);
          // Note: The backend handles exclusion, so we don't need to filter here
          // But we can track that exclusion is happening
        }
        
        // Cache the results
        cacheResults(cacheKey, filteredResults);
        
        setUsers(filteredResults);
        
        // Update excluded count (this is an approximation)
        // In a real implementation, you might want to make a separate API call
        // to get the total count without exclusions for comparison
        setExcludedCount(taskId ? 0 : 0); // Backend handles this, so we don't have exact count
      } catch (err) {
        // Don't set error if request was aborted
        if (currentRequestRef.current?.signal.aborted) {
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
        console.error('User search error:', err);
        setError(errorMessage);
        setUsers([]);
      } finally {
        setLoading(false);
        currentRequestRef.current = null;
      }
    }, 300);
  }, [processSearchQuery, getCachedResults, cacheResults, getSessionToken, canSearch, userRole]);

  // Filter search results based on user role permissions
  const filterResultsByRole = useCallback((results: SearchedUser[], currentUserRole?: UserRole): SearchedUser[] => {
    if (!currentUserRole) return results;

    const scope = getUserSearchScope(currentUserRole);
    
    // Filter by allowed roles
    return results.filter(user => {
      // CEO and Manager can see all users
      if (scope.canSearchAllDepartments) {
        return scope.allowedRoles.includes(user.role_str) || 
               ['Developer', 'Intern', 'Assistant Manager'].includes(user.role_str);
      }
      
      // Assistant Manager can only see developers and interns
      if (scope.departmentRestriction) {
        return scope.allowedRoles.includes(user.role_str);
      }
      
      return false;
    });
  }, []);

  // Clear search results
  const clearSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    setUsers([]);
    setError(null);
    setLoading(false);
  }, []);

  // Select a user
  const selectUser = useCallback((user: SearchedUser) => {
    setSelectedUsers(prev => {
      // Check if user is already selected
      if (prev.some(u => u.user_id === user.user_id)) {
        return prev;
      }
      return [...prev, user];
    });
  }, []);

  // Remove a selected user
  const removeUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.user_id !== userId));
  }, []);

  // Clear all selected users
  const clearSelectedUsers = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  return {
    users,
    loading,
    error,
    searchUsers,
    clearSearch,
    selectUser,
    selectedUsers,
    removeUser,
    clearSelectedUsers,
    canSearch,
    searchScope,
    excludedTaskId,
    excludedCount,
  };
};