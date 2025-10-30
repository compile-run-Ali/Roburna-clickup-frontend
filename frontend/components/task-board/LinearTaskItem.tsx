'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCardProps } from '@/lib/types';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  User,
  GripVertical,
  MoreHorizontal
} from 'lucide-react';

export const LinearTaskItem: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle size={16} className="text-gray-400" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-400" />;
      case 'done':
        return <CheckCircle2 size={16} className="text-green-400" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group linear-task-item flex items-center space-x-3 p-3 rounded-lg border border-transparent
        cursor-pointer
        ${isDragging ? 'dragging' : ''}
        ${task.status === 'done' ? 'opacity-60' : ''}
      `}
      onClick={() => onClick(task)}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="linear-drag-handle cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} className="text-gray-500" />
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0">
        <div className="linear-status-icon">
          {getStatusIcon(task.status)}
        </div>
      </div>

      {/* Task ID */}
      <div className="flex-shrink-0">
        <span className="text-xs text-gray-500 font-mono">
          {task.id.slice(0, 8)}
        </span>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className={`text-sm font-medium truncate ${
            task.status === 'done' ? 'text-gray-400 line-through' : 'text-white'
          }`}>
            {task.title}
          </h3>
          
          {/* Priority Badge */}
          {task.priority && task.priority !== 'medium' && (
            <span className={`text-xs px-2 py-1 rounded-full linear-priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labels.split(',').slice(0, 3).map((label, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full"
              >
                {label.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Assignees */}
      <div className="flex-shrink-0">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee, idx) => (
              <div
                key={assignee.id}
                className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-xs font-medium text-gray-200"
                title={assignee.name}
              >
                {assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  assignee.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-medium text-gray-300">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <User size={16} />
          </div>
        )}
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className={`flex-shrink-0 flex items-center space-x-1 text-xs ${
          isOverdue ? 'text-red-400' : 'text-gray-400'
        }`}>
          <Calendar size={12} />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      )}

      {/* More Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle more actions menu
          }}
          className="p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors btn-hover-icon"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};