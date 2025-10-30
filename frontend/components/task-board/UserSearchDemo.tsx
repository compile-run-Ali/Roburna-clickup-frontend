'use client';

import React, { useState } from 'react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { UserSearchInput } from './UserSearchInput';
import { UserSearchResults } from './UserSearchResults';
import { SearchedUser } from '@/lib/types';

interface UserSearchDemoProps {
  taskId?: string;
  userRole?: string;
  onUsersSelected?: (users: SearchedUser[]) => void;
}

export const UserSearchDemo: React.FC<UserSearchDemoProps> = ({
  taskId,
  userRole = 'Developer',
  onUsersSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
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
  } = useUserSearch(userRole as any, taskId);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query, taskId);
    } else {
      clearSearch();
    }
  };

  const handleUserSelect = (user: SearchedUser) => {
    selectUser(user);
    if (onUsersSelected) {
      onUsersSelected([...selectedUsers, user]);
    }
  };

  const selectedUserIds = selectedUsers.map(u => u.user_id);

  // Show permission denied message if user cannot search
  if (!canSearch) {
    return (
      <div className="user-search-demo space-y-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <div className="text-red-400 font-medium mb-2">Access Denied</div>
          <div className="text-red-300 text-sm">
            You do not have permission to search for users to assign to tasks.
          </div>
          <div className="text-red-400 text-xs mt-2">
            Role: {userRole} • Contact your manager for access.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-search-demo space-y-4">
      {/* Permission Info */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
        <div className="text-blue-300 text-sm">
          <strong>Search Permissions:</strong> {userRole}
        </div>
        <div className="text-blue-400 text-xs mt-1">
          {searchScope.canSearchAllDepartments 
            ? 'You can search across all departments' 
            : 'Search limited to your department'
          }
          {searchScope.allowedRoles.length > 0 && (
            <span> • Can assign: {searchScope.allowedRoles.join(', ')}</span>
          )}
        </div>
        {excludedTaskId && (
          <div className="text-yellow-400 text-xs mt-2 flex items-center space-x-1">
            <span>🚫</span>
            <span>Excluding users already assigned to task: {excludedTaskId.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <UserSearchInput
        onSearch={handleSearch}
        loading={loading}
        error={error}
        userRole={userRole}
        className="w-full"
      />

      {/* Search Results */}
      {(searchQuery.trim() || loading || error) && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <UserSearchResults
            users={users}
            loading={loading}
            error={error}
            onUserSelect={handleUserSelect}
            selectedUserIds={selectedUserIds}
            searchQuery={searchQuery}
            excludedTaskId={excludedTaskId}
            excludedCount={excludedCount}
          />
        </div>
      )}

      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">
              Selected Users ({selectedUsers.length})
            </h3>
            <button
              onClick={clearSelectedUsers}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {selectedUsers.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-200">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.email} • {user.role_str}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeUser(user.user_id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};