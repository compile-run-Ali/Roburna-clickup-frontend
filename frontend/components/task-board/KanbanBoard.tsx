'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanBoardProps, Task, TaskStatus } from '@/lib/types';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { canCreateTask } from '@/lib/permissions';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskStatusUpdate,
  onTaskClick,
  userRole,
  projectId,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Only update if status actually changed
    if (task.status !== newStatus) {
      onTaskStatusUpdate(taskId, newStatus);
    }
  };

  const handleCreateTask = () => {
    // This will be handled by the parent component
    // For now, we'll trigger the task click with a special flag
    onTaskClick({ id: 'create-new', title: '', status: 'todo' } as Task);
  };

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  const userCanCreateTask = canCreateTask(userRole, true); // Assume user has access to current project

  return (
    <div className="flex-1 overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full space-x-6 p-6 overflow-x-auto">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              title={column.title}
              tasks={tasksByStatus[column.id]}
              status={column.id}
              onTaskClick={onTaskClick}
              canCreateTask={userCanCreateTask && column.id === 'todo'}
              onCreateTask={handleCreateTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="task-drag-overlay">
              <TaskCard
                task={activeTask}
                index={0}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};