'use client';

import React, { useState, useEffect } from 'react';
import { AssignUserModalProps, User, UserRole, SearchedUser } from '@/lib/types';
import { TaskBoardAPI } from '@/lib/api';
import { useUserSearch } from '@/hooks/useUserSearch';
import { canAccessUserSearch } from '@/lib/permissions';
import { UserSearchInput } from './UserSearchInput';
import { UserSearchResults } from './UserSearchResults';
import { X, Search, User as UserIcon, Loader2, Check, ToggleLeft, ToggleRight } from 'lucide-react';

export const AssignUserModal: React.FC<AssignUserModalProps> = ({
  isOpen,
  onClose,
  taskId,
  currentAssignees,
  onAssign,
  userRole = 'Developer',
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize advanced search hook
  const {
    users: searchedUsers,
    loading: searchLoading,
    error: searchError,
    searchUsers,
    clearSearch,
    selectUser: selectSearchedUser,
    selectedUsers: selectedSearchedUsers,
    removeUser: removeSearchedUser,
    clearSelectedUsers: clearSelectedSearchedUsers,
    canSearch,
  } = useUserSearch(userRole, taskId);

  // Determine if we should show advanced search option
  const canUseAdvancedSearch = canAccessUserSearch(userRole);

  // Load available users when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!useAdvancedSearch) {
        loadAvailableUsers();
      }
      setSelectedUsers([...currentAssignees]);
      setSearchTerm('');
      setSearchQuery('');
      clearSearch();
      clearSelectedSearchedUsers();
    }
  }, [isOpen, currentAssignees, useAdvancedSearch, clearSearch, clearSelectedSearchedUsers]);

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await TaskBoardAPI.searchUsersToAssignLegacy();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserSelected = (user: User) => {
    return selectedUsers.some(selected => selected.id === user.id);
  };

  const handleUserToggle = (user: User) => {
    if (isUserSelected(user)) {
      setSelectedUsers(prev => prev.filter(selected => selected.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query, taskId);
    } else {
      clearSearch();
    }
  };

  // Handle user selection from advanced search
  const handleSearchedUserSelect = (user: SearchedUser) => {
    selectSearchedUser(user);
    
    // Convert SearchedUser to User format for compatibility
    const convertedUser: User = {
      id: user.user_id,
      name: user.username,
      email: user.email,
      avatar: undefined,
      role: user.role_str as UserRole,
    };
    
    // Add to selected users if not already selected
    if (!selectedUsers.some(u => u.id === convertedUser.id)) {
      setSelectedUsers(prev => [...prev, convertedUser]);
    }
  };

  // Toggle between basic and advanced search
  const handleSearchModeToggle = () => {
    setUseAdvancedSearch(!useAdvancedSearch);
    setSearchTerm('');
    setSearchQuery('');
    clearSearch();
    clearSelectedSearchedUsers();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userIds = selectedUsers.map(user => user.id);
      await onAssign(taskId, userIds);
      onClose();
    } catch (error) {
      console.error('Failed to assign users:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (selectedUsers.length !== currentAssignees.length) return true;
    return selectedUsers.some(user => !currentAssignees.some(current => current.id === user.id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-white">Assign Users</h2>
            {canUseAdvancedSearch && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {useAdvancedSearch ? 'Advanced' : 'Basic'}
                </span>
                <button
                  onClick={handleSearchModeToggle}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                  title={useAdvancedSearch ? 'Switch to basic search' : 'Switch to advanced search'}
                >
                  {useAdvancedSearch ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors btn-hover-icon"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          {useAdvancedSearch && canUseAdvancedSearch ? (
            <div className="space-y-3">
              <UserSearchInput
                onSearch={handleAdvancedSearch}
                loading={searchLoading}
                error={searchError}
                userRole={userRole}
                placeholder="Search users with advanced filters..."
              />
              {searchError && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-700 rounded p-2">
                  {searchError}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto max-h-80">
          {useAdvancedSearch && canUseAdvancedSearch ? (
            /* Advanced Search Results */
            <UserSearchResults
              users={searchedUsers}
              loading={searchLoading}
              error={searchError}
              onUserSelect={handleSearchedUserSelect}
              selectedUserIds={selectedUsers.map(u => u.id)}
              searchQuery={searchQuery}
              excludedTaskId={taskId}
            />
          ) : loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="p-4 space-y-2">
              {filteredUsers.map((user) => {
                const isSelected = isUserSelected(user);
                const isCurrentAssignee = currentAssignees.some(current => current.id === user.id);
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserToggle(user)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors user-item-hover ${
                      isSelected 
                        ? 'bg-blue-900/50 border border-blue-600' 
                        : 'hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>

                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-200">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name}
                        </p>
                        {isCurrentAssignee && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <UserIcon size={32} className="mb-2" />
              <p className="text-sm">
                {searchTerm ? 'No users found' : 'No users available'}
              </p>
            </div>
          )}
        </div>

        {/* Selected Users Summary */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-t border-gray-700 bg-gray-750">
            <p className="text-sm text-gray-300 mb-2">
              Selected ({selectedUsers.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300"
                >
                  {user.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserToggle(user);
                    }}
                    className="ml-1 hover:text-blue-200 btn-hover-icon"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 btn-hover-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !hasChanges()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center btn-hover-primary"
          >
            {loading && <Loader2 size={16} className="animate-spin mr-2" />}
            Assign Users
          </button>
        </div>
      </div>
    </div>
  );
};