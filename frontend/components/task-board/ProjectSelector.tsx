'use client';

import React, { useState, useMemo } from 'react';
import { ProjectSelectorProps } from '@/lib/types';
import { ChevronDown, Folder, Loader2, Search, CheckCircle } from 'lucide-react';

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  userRole,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project => {
      const name = (project.name || project.title || '').toLowerCase();
      const description = (project.description || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [projects, searchQuery]);

  const handleProjectSelect = (project: any) => {
    onProjectSelect(project);
    setIsOpen(false);
    setSearchQuery(''); // Reset search when project is selected
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
        <Loader2 size={16} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-300">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Folder size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-white">
            {selectedProject ? (
              selectedProject.name || selectedProject.title || 'Unnamed Project'
            ) : (
              'Select a project'
            )}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClose}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden flex flex-col">
            {/* Search bar */}
            {projects.length > 3 && (
              <div className="p-3 border-b border-gray-700">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            
            {/* Project count */}
            {filteredProjects.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-700 bg-gray-750">
                <span className="text-xs text-gray-400">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
              </div>
            )}
            
            {/* Projects list */}
            <div className="overflow-y-auto max-h-64">
              {filteredProjects.length > 0 ? (
                <div className="py-1">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedProject && 
                      ((project.id && project.id === selectedProject.id) || 
                       (project.project_id && project.project_id === selectedProject.project_id));
                    
                    return (
                      <button
                        key={project.id || project.project_id}
                        onClick={() => handleProjectSelect(project)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors ${
                          isSelected ? 'bg-gray-700/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Folder size={14} className={isSelected ? 'text-blue-400' : 'text-gray-400'} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-400' : 'text-white'
                            }`}>
                              {project.name || project.title || 'Unnamed Project'}
                            </p>
                            {project.description && (
                              <p className="text-xs text-gray-400 truncate">
                                {project.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle size={16} className="text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-sm text-gray-400 text-center">
                  {searchQuery ? (
                    <>
                      <p className="mb-1">No projects found</p>
                      <p className="text-xs">Try a different search term</p>
                    </>
                  ) : (
                    'No projects available'
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};