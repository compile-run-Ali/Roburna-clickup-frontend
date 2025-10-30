'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskColumnProps } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  tasks,
  status,
  onTaskClick,
  canCreateTask,
  onCreateTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'border-gray-600 bg-gray-800';
      case 'in_progress':
        return 'border-blue-600 bg-blue-900/20';
      case 'done':
        return 'border-green-600 bg-green-900/20';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  const getColumnTitle = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return title;
    }
  };

  return (
    <div className="flex flex-col h-full min-w-80 max-w-80">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-white text-sm">
            {getColumnTitle(status)}
          </h2>
          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        {/* Add Task Button */}
        {canCreateTask && status === 'todo' && (
          <button
            onClick={onCreateTask}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
            title="Add new task"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-4 min-h-96 transition-colors duration-200 task-column-scroll overflow-y-auto
          ${getColumnColor(status)}
          ${isOver ? 'drop-zone-active' : ''}
        `}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={onTaskClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center">
                  <Plus size={20} className="text-gray-500" />
                </div>
                <p className="text-sm">
                  {status === 'todo' && canCreateTask
                    ? 'Add your first task'
                    : 'No tasks yet'}
                </p>
                {status === 'todo' && canCreateTask && (
                  <button
                    onClick={onCreateTask}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Create task
                  </button>
                )}
              </div>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};