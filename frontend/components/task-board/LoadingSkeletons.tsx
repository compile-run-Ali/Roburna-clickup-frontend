'use client';

import React from 'react';

// Task Card Skeleton
export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-3">
      <div className="animate-pulse">
        {/* Title */}
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        
        {/* Description */}
        <div className="h-3 bg-gray-700 rounded mb-1"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3 mb-3"></div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

// Task Column Skeleton
export const TaskColumnSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full min-w-80 max-w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="w-8 h-5 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 bg-gray-800">
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    </div>
  );
};

// Kanban Board Skeleton
export const KanbanBoardSkeleton: React.FC = () => {
  return (
    <div className="flex h-full space-x-6 p-6 overflow-x-auto">
      <TaskColumnSkeleton />
      <TaskColumnSkeleton />
      <TaskColumnSkeleton />
    </div>
  );
};

// Project Selector Skeleton
export const ProjectSelectorSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 24, 
  className = '' 
}) => {
  return (
    <div className={`inline-block animate-spin ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="24"
          className="opacity-75"
        />
      </svg>
    </div>
  );
};

// Full Page Loading
export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={48} className="text-blue-400 mb-4" />
        <p className="text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  );
};

// Inline Loading
export const InlineLoading: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <LoadingSpinner size={spinnerSizes[size]} className="text-gray-400" />
      <span className={`text-gray-500 ${sizeClasses[size]}`}>{message}</span>
    </div>
  );
};

// Button Loading State
export const ButtonLoading: React.FC<{ children: React.ReactNode; loading?: boolean }> = ({ 
  children, 
  loading = false 
}) => {
  return (
    <>
      {loading && <LoadingSpinner size={16} className="mr-2" />}
      {children}
    </>
  );
};

// Empty State Component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-300 mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};