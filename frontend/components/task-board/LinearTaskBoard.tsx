'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanBoardProps, Task, TaskStatus } from '@/lib/types';
import { LinearTaskItem } from './LinearTaskItem';
import { 
  Filter, 
  Settings, 
  Plus, 
  Search,
  ChevronDown,
  Circle,
  Clock,
  CheckCircle2,
  Archive
} from 'lucide-react';

type ViewFilter = 'all' | 'active' | 'backlog' | 'done';

export const LinearTaskBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskStatusUpdate,
  onTaskClick,
  userRole,
  projectId,
}) => {
  console.log('=== LINEAR TASK BOARD RENDER ===');
  console.log('Tasks prop:', tasks.length);
  console.log('Project ID:', projectId);
  console.log('User Role:', userRole);
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter tasks based on current view
  const filteredTasks = useMemo(() => {
    console.log('=== LINEAR TASK BOARD FILTERING ===');
    console.log('Total tasks received:', tasks.length);
    console.log('Current filter:', currentFilter);
    console.log('Search query:', searchQuery);
    console.log('Tasks details:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    
    let filtered = tasks;

    // Apply view filter
    switch (currentFilter) {
      case 'active':
        filtered = tasks.filter(task => task.status === 'todo' || task.status === 'in_progress');
        break;
      case 'backlog':
        filtered = tasks.filter(task => task.status === 'todo');
        break;
      case 'done':
        filtered = tasks.filter(task => task.status === 'done');
        break;
      case 'all':
      default:
        filtered = tasks;
        break;
    }

    console.log('After status filter:', filtered.length);

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.labels?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    console.log('Final filtered tasks:', filtered.length);
    console.log('Filtered tasks details:', filtered.map(t => ({ id: t.id, title: t.title, status: t.status })));

    return filtered;
  }, [tasks, currentFilter, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      console.log('No drop target found');
      return;
    }

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.log('Task not found:', taskId);
      return;
    }

    // Handle status change based on drop target
    let newStatus: TaskStatus | null = null;
    
    const overId = over.id as string;
    console.log('Drop target ID:', overId);
    
    // Map drop zones to statuses
    if (overId === 'todo-zone' || overId.includes('backlog')) {
      newStatus = 'todo';
    } else if (overId === 'in_progress-zone' || overId.includes('active')) {
      newStatus = 'in_progress';
    } else if (overId === 'done-zone' || overId.includes('done')) {
      newStatus = 'done';
    }

    console.log('Current status:', task.status, 'New status:', newStatus);

    if (newStatus && task.status !== newStatus) {
      console.log('Updating task status from', task.status, 'to', newStatus);
      onTaskStatusUpdate(taskId, newStatus);
    } else {
      console.log('No status change needed or invalid drop target');
    }
  };

  const handleCreateTask = () => {
    onTaskClick({ id: 'create-new', title: '', status: 'todo' } as Task);
  };

  const getFilterIcon = (filter: ViewFilter) => {
    switch (filter) {
      case 'all':
        return <Circle size={16} className="text-gray-400" />;
      case 'active':
        return <Clock size={16} className="text-blue-400" />;
      case 'backlog':
        return <Archive size={16} className="text-gray-400" />;
      case 'done':
        return <CheckCircle2 size={16} className="text-green-400" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const getFilterCount = (filter: ViewFilter) => {
    switch (filter) {
      case 'all':
        return tasks.length;
      case 'active':
        return tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
      case 'backlog':
        return tasks.filter(t => t.status === 'todo').length;
      case 'done':
        return tasks.filter(t => t.status === 'done').length;
      default:
        return 0;
    }
  };

  const filters: { id: ViewFilter; label: string }[] = [
    { id: 'all', label: 'All issues' },
    { id: 'active', label: 'Active' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'done', label: 'Done' },
  ];

  // Status Drop Zone Component
  const StatusDropZone: React.FC<{ status: TaskStatus; children: React.ReactNode }> = ({ status, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `${status}-zone`,
    });

    return (
      <div
        ref={setNodeRef}
        className={`transition-all duration-200 rounded-lg ${
          isOver 
            ? 'bg-blue-900/30 border-2 border-blue-500/70 shadow-lg transform scale-105' 
            : activeTask 
            ? 'border-2 border-dashed border-gray-600/50 hover:border-blue-500/30' 
            : ''
        }`}
      >
        {children}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 rounded-lg pointer-events-none">
            <div className="text-blue-300 text-sm font-medium">
              Drop to change status to {status === 'todo' ? 'Backlog' : status === 'in_progress' ? 'Active' : 'Done'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 linear-sidebar border-r border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Views</h2>
            <button
              onClick={handleCreateTask}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors btn-hover-icon"
              title="Create new task"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex-1 p-2">
          <nav className="space-y-1">
            {filters.map((filter) => {
              const isDropZone = filter.id === 'backlog' || filter.id === 'active' || filter.id === 'done';
              const status = filter.id === 'backlog' ? 'todo' : filter.id === 'active' ? 'in_progress' : filter.id === 'done' ? 'done' : null;
              
              const buttonContent = (
                <button
                  key={filter.id}
                  onClick={() => setCurrentFilter(filter.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors linear-sidebar-nav-item ${
                    currentFilter === filter.id
                      ? 'active bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getFilterIcon(filter.id)}
                    <span>{filter.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getFilterCount(filter.id)}
                  </span>
                </button>
              );

              return isDropZone && status ? (
                <div key={filter.id} className="relative">
                  <StatusDropZone status={status}>
                    {buttonContent}
                  </StatusDropZone>
                </div>
              ) : (
                buttonContent
              );
            })}
          </nav>
          
          {/* Dedicated Drop Zones when dragging */}
          {activeTask && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-400 text-center mb-2">Drop to change status:</div>
              
              {/* Backlog Drop Zone */}
              <StatusDropZone status="todo">
                <div className="p-2 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-center space-x-2">
                    <Archive size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-300">Backlog</span>
                  </div>
                </div>
              </StatusDropZone>

              {/* Active Drop Zone */}
              <StatusDropZone status="in_progress">
                <div className="p-2 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock size={14} className="text-blue-400" />
                    <span className="text-xs text-gray-300">Active</span>
                  </div>
                </div>
              </StatusDropZone>

              {/* Done Drop Zone */}
              <StatusDropZone status="done">
                <div className="p-2 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 size={14} className="text-green-400" />
                    <span className="text-xs text-gray-300">Done</span>
                  </div>
                </div>
              </StatusDropZone>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-white capitalize">
                {currentFilter === 'all' ? 'All Issues' : currentFilter}
              </h1>
              <span className="text-sm text-gray-400">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="linear-search-input pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors btn-hover-secondary"
              >
                <Filter size={16} />
                <span className="text-sm">Filter</span>
              </button>

              {/* Display Options */}
              <button className="flex items-center space-x-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors btn-hover-secondary">
                <Settings size={16} />
                <span className="text-sm">Display</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-auto">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="p-4">
              {filteredTasks.length > 0 ? (
                <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {filteredTasks.map((task, index) => (
                      <LinearTaskItem
                        key={task.id}
                        task={task}
                        index={index}
                        onClick={onTaskClick}
                      />
                    ))}
                  </div>
                </SortableContext>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      {getFilterIcon(currentFilter)}
                    </div>
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      No {currentFilter} issues
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {searchQuery 
                        ? `No issues match "${searchQuery}"`
                        : `There are no ${currentFilter} issues in this project.`
                      }
                    </p>
                    {currentFilter !== 'done' && (
                      <button
                        onClick={handleCreateTask}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-hover-primary"
                      >
                        Create your first task
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="linear-task-dragging">
                  <LinearTaskItem
                    task={activeTask}
                    index={0}
                    onClick={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};