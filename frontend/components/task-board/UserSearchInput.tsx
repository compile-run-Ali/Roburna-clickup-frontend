'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';

interface UserSearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  userRole?: string;
  className?: string;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
  onSearch,
  placeholder,
  loading = false,
  disabled = false,
  error = null,
  userRole,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate role-specific placeholder text
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (userRole) {
      case 'CEO':
      case 'Manager':
        return 'Search by username, email, or department ID...';
      case 'Assistant Manager':
        return 'Search team members by username or email...';
      default:
        return 'Search users...';
    }
  };

  // Handle input change with debouncing handled by parent
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onSearch(query);
        break;
      case 'Escape':
        e.preventDefault();
        handleClear();
        break;
    }
  };

  // Focus management
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Auto-focus when component mounts (optional)
  useEffect(() => {
    if (!disabled && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  return (
    <div className={`user-search-input-container ${className}`}>
      {/* Search Input */}
      <div className={`relative transition-all duration-200 ${
        isFocused 
          ? 'ring-2 ring-blue-500 ring-opacity-50' 
          : error 
          ? 'ring-2 ring-red-500 ring-opacity-50' 
          : ''
      }`}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search 
              size={16} 
              className={`transition-colors duration-200 ${
                isFocused 
                  ? 'text-blue-400' 
                  : error 
                  ? 'text-red-400' 
                  : 'text-gray-400'
              }`} 
            />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={getPlaceholder()}
            disabled={disabled || loading}
            className={`
              w-full pl-10 pr-12 py-3 
              bg-gray-700 border border-gray-600 
              text-white placeholder-gray-400
              rounded-lg transition-all duration-200
              focus:outline-none focus:ring-0 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 bg-red-900/10' : ''}
              ${isFocused ? 'border-blue-500 bg-gray-600' : ''}
            `}
            aria-label="Search users"
            aria-describedby={error ? 'search-error' : undefined}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Right Side Icons */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
            {/* Loading Spinner */}
            {loading && (
              <Loader2 
                size={16} 
                className="animate-spin text-blue-400" 
                aria-label="Searching..."
              />
            )}

            {/* Clear Button */}
            {query && !loading && (
              <button
                onClick={handleClear}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors btn-hover-icon"
                aria-label="Clear search"
                type="button"
              >
                <X size={14} />
              </button>
            )}

            {/* Error Icon */}
            {error && !loading && (
              <AlertCircle 
                size={16} 
                className="text-red-400" 
                aria-label="Search error"
              />
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          id="search-error" 
          className="mt-2 flex items-center space-x-2 text-sm text-red-400"
          role="alert"
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Hints */}
      {isFocused && !query && !error && (
        <div className="mt-2 text-xs text-gray-500">
          <div className="space-y-1">
            {userRole === 'CEO' || userRole === 'Manager' ? (
              <>
                <div>• Type username to search by name</div>
                <div>• Type email@domain.com to search by email</div>
                <div>• Type numbers to search by department ID</div>
                <div className="text-blue-400">• You can search across all departments</div>
              </>
            ) : userRole === 'Assistant Manager' ? (
              <>
                <div>• Search your team members by username or email</div>
                <div className="text-yellow-400">• Results limited to your department</div>
                <div>• You can assign developers and interns</div>
              </>
            ) : (
              <div>• Start typing to search for users</div>
            )}
          </div>
        </div>
      )}

      {/* Query Type Indicator */}
      {query && isFocused && (
        <div className="mt-2 text-xs text-gray-400">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-800 border border-gray-600">
            {query.includes('@') ? (
              <>📧 Email search</>
            ) : /^\d+$/.test(query.trim()) ? (
              <>🏢 Department search</>
            ) : (
              <>👤 Username search</>
            )}
          </span>
        </div>
      )}
    </div>
  );
};