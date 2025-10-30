'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCardProps } from '@/lib/types';
import { Calendar, User } from 'lucide-react';

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // Debug logging to see what data the task card is receiving
  console.log('=== TASK CARD RENDERING ===');
  console.log('Task ID:', task.id);
  console.log('Task title:', task.title);
  console.log('Task description:', task.description);
  console.log('Task priority:', task.priority);
  console.log('Task labels:', task.labels);
  console.log('Full task object:', JSON.stringify(task, null, 2));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      {...listeners}
      className={`
        task-card bg-gray-800 rounded-lg border border-gray-700 p-4 mb-3 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:border-gray-600 focus-ring
        ${isDragging ? 'task-drag-overlay opacity-50' : ''}
        ${isOverdue ? 'border-l-4 border-l-red-400' : ''}
        ${task.status === 'todo' ? 'status-todo' : ''}
        ${task.status === 'in_progress' ? 'status-in-progress' : ''}
        ${task.status === 'done' ? 'status-done' : ''}
        ${task.priority === 'high' ? 'priority-high' : ''}
        ${task.priority === 'medium' ? 'priority-medium' : ''}
        ${task.priority === 'low' ? 'priority-low' : ''}
      `}
      onClick={() => onClick(task)}
    >
      {/* Task Title */}
      <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">
        {task.title || task.name || 'Untitled Task'}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-300 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Metadata */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex items-center space-x-1">
          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex -space-x-1">
              {task.assignees.slice(0, 3).map((assignee, idx) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-gray-200"
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
                <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-gray-300">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <User size={12} />
              <span className="text-xs ml-1">Unassigned</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center text-xs ${
            isOverdue ? 'text-red-400' : 'text-gray-400'
          }`}>
            <Calendar size={12} />
            <span className="ml-1">{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Priority Indicator */}
      {task.priority && (
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            task.priority.toLowerCase() === 'high' 
              ? 'bg-red-900/50 text-red-300'
              : task.priority.toLowerCase() === 'medium'
              ? 'bg-yellow-900/50 text-yellow-300'
              : 'bg-green-900/50 text-green-300'
          }`}>
            {task.priority}
          </span>
        </div>
      )}

      {/* Labels */}
      {task.labels && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.split(',').slice(0, 2).map((label, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300"
            >
              {label.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};