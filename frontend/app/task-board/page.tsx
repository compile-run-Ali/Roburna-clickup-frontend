"use client";
import React, { useEffect, useState } from 'react'
import { fetchBoard } from "../api/mock";
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown, Circle, CheckCircle2, Clock, AlertTriangle, MoreHorizontal } from 'lucide-react';

const TaskBoard = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    'In Progress': true,
    'To Do': true,
    'Done': true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchBoard()
      .then((data) => {
        if (isMounted) {
          // Transform data to include task IDs and additional properties
          const transformedTasks = (data as any[]).map((task, index) => ({
            ...task,
            taskId: `ROB-${(index + 1).toString().padStart(2, '0')}`,
            priority: task.priority || ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            assignee: task.assignee || 'Unassigned',
            dueDate: task.dueDate || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            labels: task.labels || ['Feature', 'Bug', 'Enhancement'][Math.floor(Math.random() * 3)]
          }));
          setTasks(transformedTasks);
        }
      })
      .catch(() => { if (isMounted) setError('Failed to load tasks'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, completed: newStatus === 'Completed' }
          : task
      )
    );
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', (e.currentTarget as HTMLElement).outerHTML);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedTask(null);
    setDragOverSection(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, section: string) => {
    e.preventDefault();
    setDragOverSection(section);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the section entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSection(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverSection(null);

    if (draggedTask && draggedTask.status !== targetStatus) {
      const statusMap: { [key: string]: string } = {
        'To Do': 'To Do',
        'In Progress': 'In Progress',
        'Done': 'Completed'
      };

      const newStatus = statusMap[targetStatus] || targetStatus;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === draggedTask.id
            ? { ...task, status: newStatus, completed: newStatus === 'Completed' }
            : task
        )
      );
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'To Do':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Completed':
      case 'Done':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'Medium':
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'Low':
        return <AlertTriangle className="w-3 h-3 text-green-400" />;
      default:
        return null;
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Feature':
        return 'bg-blue-900 text-blue-300';
      case 'Bug':
        return 'bg-red-900 text-red-300';
      case 'Enhancement':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Display
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="px-6 py-4">
        {loading && (
          <div className="text-gray-400 text-center py-8">Loading tasks...</div>
        )}
        {error && !loading && (
          <div className="text-red-400 text-center py-8">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-0">
            {/* Todo Section */}
            <div>
              <div
                className="flex items-center gap-3 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSection('To Do')}
              >
                <Circle className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">Todo</span>
                <span className="text-gray-400 text-sm">{getTasksByStatus('To Do').length}</span>
                <button className="ml-auto p-1 hover:bg-gray-700 rounded transition-all hover:scale-110">
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {expandedSections['To Do'] && (
                <div
                  className={`space-y-0 min-h-[50px] transition-colors ${dragOverSection === 'To Do' ? 'bg-gray-800 border-2 border-dashed border-gray-600' : ''
                    }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'To Do')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'To Do')}
                >
                  {getTasksByStatus('To Do').map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="group flex items-center gap-3 py-2 px-3 hover:bg-gray-800 cursor-pointer roburna-task-item border-l-2 border-transparent hover:border-gray-600"
                      onClick={() => handleTaskClick(task)}
                    >
                      <span className="text-gray-500 text-sm font-mono w-16">{task.taskId}</span>
                      {getStatusIcon(task.status)}
                      <span className="text-white font-medium flex-1 truncate">{task.title}</span>
                      <span className="text-gray-400 text-sm">Oct 17</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In Progress Section */}
            <div>
              <div
                className="flex items-center gap-3 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSection('In Progress')}
              >
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">In Progress</span>
                <span className="text-gray-400 text-sm">{getTasksByStatus('In Progress').length}</span>
                <button className="ml-auto p-1 hover:bg-gray-700 rounded transition-all hover:scale-110">
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {expandedSections['In Progress'] && (
                <div
                  className={`space-y-0 min-h-[50px] transition-colors ${dragOverSection === 'In Progress' ? 'bg-gray-800 border-2 border-dashed border-gray-600' : ''
                    }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'In Progress')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'In Progress')}
                >
                  {getTasksByStatus('In Progress').map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="group flex items-center gap-3 py-2 px-3 hover:bg-gray-800 cursor-pointer roburna-task-item border-l-2 border-transparent hover:border-gray-600"
                      onClick={() => handleTaskClick(task)}
                    >
                      <span className="text-gray-500 text-sm font-mono w-16">{task.taskId}</span>
                      {getStatusIcon(task.status)}
                      <span className="text-white font-medium flex-1 truncate">{task.title}</span>
                      <span className="text-gray-400 text-sm">Oct 17</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Done Section */}
            <div>
              <div
                className="flex items-center gap-3 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSection('Done')}
              >
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Done</span>
                <span className="text-gray-400 text-sm">{getTasksByStatus('Completed').length}</span>
                <button className="ml-auto p-1 hover:bg-gray-700 rounded transition-all hover:scale-110">
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {expandedSections['Done'] && (
                <div
                  className={`space-y-0 min-h-[50px] transition-colors ${dragOverSection === 'Done' ? 'bg-gray-800 border-2 border-dashed border-gray-600' : ''
                    }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'Done')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'Done')}
                >
                  {getTasksByStatus('Completed').map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="group flex items-center gap-3 py-2 px-3 hover:bg-gray-800 cursor-pointer roburna-task-item border-l-2 border-transparent hover:border-gray-600 opacity-60"
                      onClick={() => handleTaskClick(task)}
                    >
                      <span className="text-gray-500 text-sm font-mono w-16">{task.taskId}</span>
                      {getStatusIcon(task.status)}
                      <span className="text-white font-medium flex-1 truncate line-through">{task.title}</span>
                      <span className="text-gray-400 text-sm">Oct 17</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedTask.status)}
                  <h2 className="text-xl font-semibold text-white">{selectedTask.title}</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Task Details */}
              <div className="space-y-6">
                {/* Task ID and Status */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-400">Task ID:</span>
                  <span className="text-sm text-white font-mono">{selectedTask.taskId}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLabelColor(selectedTask.labels)}`}>
                    {selectedTask.labels}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                  <p className="text-white leading-relaxed">{selectedTask.description}</p>
                </div>

                {/* Assignee and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Assignee</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {selectedTask.assignee?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-white">{selectedTask.assignee}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Due Date</h3>
                    <span className="text-sm text-white">{selectedTask.dueDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-all hover:scale-105">
                    Mark Complete
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-all hover:scale-105">
                    Edit Task
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-all hover:scale-105">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskBoard