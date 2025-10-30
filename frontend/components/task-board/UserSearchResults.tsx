'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SearchedUser } from '@/lib/types';
import { User, Building, Mail, UserCheck, Loader2, AlertCircle } from 'lucide-react';

interface UserSearchResultsProps {
  users: SearchedUser[];
  loading: boolean;
  error?: string | null;
  onUserSelect: (user: SearchedUser) => void;
  selectedUserIds: string[];
  searchQuery: string;
  maxResults?: number;
  className?: string;
  excludedTaskId?: string | null;
  excludedCount?: number;
}

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  users,
  loading,
  error,
  onUserSelect,
  selectedUserIds,
  searchQuery,
  maxResults = 50,
  className = '',
  excludedTaskId,
  excludedCount = 0,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Limit results to prevent performance issues
  const displayedUsers = users.slice(0, maxResults);
  const hasMoreResults = users.length > maxResults;

  // Reset focused index when users change
  useEffect(() => {
    setFocusedIndex(-1);
    itemRefs.current = itemRefs.current.slice(0, displayedUsers.length);
  }, [displayedUsers.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!displayedUsers.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < displayedUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : displayedUsers.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < displayedUsers.length) {
            onUserSelect(displayedUsers[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [displayedUsers, focusedIndex, onUserSelect]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [focusedIndex]);

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400 text-gray-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Check if user is already selected
  const isUserSelected = (userId: string) => {
    return selectedUserIds.includes(userId);
  };

  // Handle user selection
  const handleUserClick = (user: SearchedUser, index: number) => {
    setFocusedIndex(index);
    onUserSelect(user);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'ceo':
        return 'bg-purple-900/50 text-purple-300 border-purple-600';
      case 'manager':
        return 'bg-blue-900/50 text-blue-300 border-blue-600';
      case 'assistant manager':
        return 'bg-green-900/50 text-green-300 border-green-600';
      case 'developer':
        return 'bg-orange-900/50 text-orange-300 border-orange-600';
      case 'intern':
        return 'bg-gray-900/50 text-gray-300 border-gray-600';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-600';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`user-search-results ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-blue-400" />
          <span className="ml-3 text-gray-300">Searching users...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`user-search-results ${className}`}>
        <div className="flex items-center justify-center py-8 text-red-400">
          <AlertCircle size={24} />
          <div className="ml-3">
            <div className="font-medium">Search failed</div>
            <div className="text-sm text-red-300 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!displayedUsers.length && searchQuery.trim()) {
    return (
      <div className={`user-search-results ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <User size={32} className="mb-3" />
          <div className="text-center">
            <div className="font-medium">No users found</div>
            <div className="text-sm text-gray-500 mt-1">
              No users match "{searchQuery}"
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Try searching by username, email, or department
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No search query
  if (!searchQuery.trim()) {
    return (
      <div className={`user-search-results ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <User size={32} className="mb-3" />
          <div className="text-center">
            <div className="font-medium">Start typing to search</div>
            <div className="text-sm text-gray-500 mt-1">
              Search for users by name, email, or department
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-search-results ${className}`} ref={resultsRef}>
      {/* Results Header */}
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </span>
            {excludedTaskId && (
              <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full border border-yellow-600">
                Excluding assigned users
              </span>
            )}
          </div>
          {hasMoreResults && (
            <span className="text-xs text-gray-500">
              Showing first {maxResults} results
            </span>
          )}
        </div>
        {excludedTaskId && (
          <div className="mt-1 text-xs text-gray-400">
            Users already assigned to this task are automatically excluded from results
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="max-h-80 overflow-y-auto">
        <div className="p-2 space-y-1">
          {displayedUsers.map((user, index) => {
            const isSelected = isUserSelected(user.user_id);
            const isFocused = index === focusedIndex;
            
            return (
              <div
                key={user.user_id}
                ref={el => { itemRefs.current[index] = el; }}
                onClick={() => handleUserClick(user, index)}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg cursor-pointer 
                  transition-all duration-200 user-item-hover
                  ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                  ${isSelected 
                    ? 'bg-blue-900/30 border border-blue-600/50' 
                    : 'hover:bg-gray-700/50 border border-transparent'
                  }
                `}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleUserClick(user, index);
                  }
                }}
              >
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-200 border-2 border-gray-500">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <UserCheck size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  {/* Name and Role */}
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-white truncate">
                      {highlightSearchTerm(user.username, searchQuery)}
                    </h3>
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                      ${getRoleBadgeColor(user.role_str)}
                    `}>
                      {user.role_str}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                    <Mail size={12} />
                    <span className="truncate">
                      {highlightSearchTerm(user.email, searchQuery)}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Building size={12} />
                    <span className="truncate">
                      {highlightSearchTerm(user.department_name, searchQuery)}
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <UserCheck size={12} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with additional info */}
      {hasMoreResults && (
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-500 text-center">
            {users.length - maxResults} more users available. Refine your search to see more specific results.
          </div>
        </div>
      )}
    </div>
  );
};