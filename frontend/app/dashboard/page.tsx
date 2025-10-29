"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader, Calendar, CheckCircle, AlertTriangle, Users, FolderOpen } from "lucide-react";

interface Project {
  project_id: string;
  title: string;
  description: string;
  status: string;
  urgency: string;
  budget?: number;
  total_revenue?: number;
  client_id: string;
  client_name: string;
  client_company: string;
  start_date?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const {
    user,
    isLoading
  } = usePermissions();
  const router = useRouter();

  // Project states
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectError(null);

      if (!session?.accessToken) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/get_projects`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const projectsData = await response.json();
      
      // Filter out completed and cancelled projects for active projects section
      const activeProjects = projectsData.filter((project: Project) => 
        project.status !== 'completed' && project.status !== 'cancelled'
      );
      
      setProjects(activeProjects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjectError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load projects when component mounts
  useEffect(() => {
    if (session?.accessToken && user) {
      fetchProjects();
    }
  }, [session?.accessToken, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Calculate stats from real project data
  const stats = {
    activeProjects: projects.length,
    tasksToday: 0, // TODO: Implement when task API is available
    overdueTasks: 4, // TODO: Implement when task API is available
    teamMembers: 12 // TODO: Implement when user API is available
  };

  const escalations = [
    {
      id: 1,
      title: "Database connection timeout",
      project: "StartupXYZ",
      timeAgo: "1 day ago",
      assignee: "Mike Johnson",
      priority: "Urgent",
      status: "Urgent"
    },
    {
      id: 2,
      title: "Database connection timeout",
      project: "StartupXYZ",
      timeAgo: "1 day ago",
      assignee: "Mike Johnson",
      priority: "Resolved",
      status: "Resolved"
    },
    {
      id: 3,
      title: "Database connection timeout",
      project: "StartupXYZ",
      timeAgo: "1 day ago",
      assignee: "Mike Johnson",
      priority: "Urgent",
      status: "Urgent"
    }
  ];



  const dueTasks = [
    {
      id: 1,
      name: "Revise Content Strategy",
      description: "Update existing content to align with new brand guidelines",
      people: ["👤", "👤", "👤"],
      timeline: "01 Feb 2026 - 15 Feb 2026",
      priority: "High"
    },
    {
      id: 2,
      name: "Enhance Search Functionality",
      description: "Improve the search capabilities for better user experience",
      people: ["👤", "👤", "👤"],
      timeline: "16 Feb 2026 - 28 Feb 2026",
      priority: "Medium"
    },
    {
      id: 3,
      name: "Implement New Feature",
      description: "Add a 'dark mode' option for improved user experience",
      people: ["👤", "👤", "👤"],
      timeline: "17 Sep 2025 - 30 Sep 2025",
      priority: "Normal"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Normal':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'bg-green-100 text-green-700';
      case 'planning':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const calculateProgress = (startDate?: string, dueDate?: string) => {
    if (!startDate || !dueDate) return 0;
    
    const start = new Date(startDate).getTime();
    const due = new Date(dueDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > due) return 100;
    
    const totalDuration = due - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  const truncateClientName = (clientName: string, companyName: string, maxLength: number = 25) => {
    const fullName = `${clientName} (${companyName})`;
    if (fullName.length <= maxLength) return fullName;
    return fullName.substring(0, maxLength) + '...';
  };

  const toggleClientExpansion = (projectId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen roburna-bg-primary p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold roburna-gradient-text">Good Morning, {user.name || user.email?.split('@')[0] || 'User'}!</h1>
          <p className="roburna-text-secondary">It's Monday 22 September, 2025.</p>
          {/* Debug info - remove this after fixing */}
          {/* {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-1">
              Debug: name="{user.name}", email="{user.email}", role="{user.role}"
            </p>
          )} */}
        </div>
        <div className="flex items-center gap-3">
          <span className="roburna-status-success px-3 py-1 rounded-full text-sm font-medium">
            {user.role}
          </span>





        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="roburna-stat-card roburna-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="roburna-text-secondary text-sm">Active Projects</h3>
            <FolderOpen className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold roburna-gradient-text">{stats.activeProjects}</div>
          <p className="roburna-text-muted text-sm">+2 from last month</p>
        </div>

        <div className="roburna-stat-card roburna-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="roburna-text-secondary text-sm">Tasks Due Today</h3>
            <CheckCircle className="text-blue-400" size={20} />
          </div>
          <div className="text-3xl font-bold roburna-gradient-text">{stats.tasksToday}</div>
          <p className="roburna-text-muted text-sm">5 Completed</p>
        </div>

        <div className="roburna-stat-card roburna-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="roburna-text-secondary text-sm">Overdue Tasks</h3>
            <AlertTriangle className="text-red-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.overdueTasks}</div>
          <p className="roburna-text-muted text-sm">Requires attention</p>
        </div>

        <div className="roburna-stat-card roburna-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="roburna-text-secondary text-sm">Team Members</h3>
            <Users className="text-purple-400" size={20} />
          </div>
          <div className="text-3xl font-bold roburna-gradient-text">{stats.teamMembers}</div>
          <p className="roburna-text-muted text-sm">4 online</p>
        </div>
      </div>

      {/* Recent Escalations */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold roburna-text-primary mb-4">Recent Escalations</h2>
        <p className="roburna-text-secondary text-sm mb-4">Critical issues requiring attention</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {escalations.map((escalation, index) => (
            <div key={escalation.id} className="roburna-card roburna-slide-up p-4" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium roburna-text-primary">{escalation.title}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${escalation.status === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                  {escalation.status}
                </span>
              </div>
              <p className="text-sm roburna-text-secondary mb-2">{escalation.project} • {escalation.timeAgo}</p>
              <p className="text-sm roburna-text-secondary">Assigned to: {escalation.assignee}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold roburna-text-primary">Active Projects</h2>
            <p className="text-xs roburna-text-muted mt-1">Click on any project card to view all projects</p>
          </div>
          <span className="roburna-gradient text-white px-3 py-1 rounded text-sm font-medium">
            {projects.length}
          </span>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin" size={24} />
            <span className="ml-2 roburna-text-secondary">Loading projects...</span>
          </div>
        ) : projectError ? (
          <div className="roburna-card p-6 text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-400" size={24} />
            <p className="roburna-text-secondary">Failed to load projects</p>
            <p className="text-sm text-red-400 mt-1">{projectError}</p>
            <button 
              onClick={fetchProjects}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="roburna-card p-6 text-center">
            <FolderOpen className="mx-auto mb-2 roburna-text-muted" size={24} />
            <p className="roburna-text-secondary">No active projects found</p>
            <p className="text-sm roburna-text-muted mt-1">Create a new project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.slice(0, 4).map((project, index) => {
              const progress = calculateProgress(project.start_date, project.due_date);
              return (
                <div 
                  key={project.project_id} 
                  className="roburna-card roburna-slide-up p-6 flex flex-col h-full min-h-[400px] cursor-pointer hover:scale-105 transition-all duration-200 group" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push('/project-management')}
                  title="Click to view all projects"
                >
                  {/* Header with title and status */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium roburna-text-primary line-clamp-1 text-lg group-hover:text-green-400 transition-colors">{project.title}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)} ml-2 flex-shrink-0`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {/* Description - fixed height */}
                  <div className="mb-4 flex-grow-0">
                    <p className="text-sm roburna-text-secondary line-clamp-2 min-h-[2.5rem]">
                      {project.description || 'No description available'}
                    </p>
                  </div>

                  {/* Urgency badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getUrgencyColor(project.urgency)}`}>
                      <AlertTriangle size={12} className="mr-1" />
                      {project.urgency}
                    </span>
                  </div>

                  {/* Progress section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="roburna-text-secondary">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="roburna-gradient h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project details - fixed height section */}
                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-sm roburna-text-secondary">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span className="text-xs">Due: {formatDate(project.due_date)}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm roburna-text-secondary">
                      <FolderOpen size={14} className="flex-shrink-0 mt-0.5" />
                      <div className="min-h-[2.5rem] flex flex-col justify-center flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when expanding client name
                            toggleClientExpansion(project.project_id);
                          }}
                          className="text-xs text-left hover:text-blue-400 transition-colors cursor-pointer"
                          title="Click to expand/collapse client name"
                        >
                          Client: {expandedClients.has(project.project_id) 
                            ? `${project.client_name} (${project.client_company})`
                            : truncateClientName(project.client_name, project.client_company)
                          }
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm roburna-text-secondary">
                      <Users size={14} className="flex-shrink-0" />
                      <span className="text-xs">Created: {formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {/* Manage Team button - always at bottom */}
                  <div className="mt-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking manage team
                        router.push('/project-management');
                      }}
                      className="w-full px-4 py-3 border-2 border-green-500 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <Users size={16} />
                      Manage Team
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Due Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold roburna-text-primary">Due Task</h2>
          <span className="roburna-status-error px-3 py-1 rounded text-sm font-medium">3</span>
        </div>

        <div className="roburna-card overflow-hidden roburna-slide-up">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 roburna-table-header text-sm font-medium">
            <div className="col-span-3">Task Name</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">People</div>
            <div className="col-span-2">Timeline Date</div>
            <div className="col-span-2">Priority</div>
          </div>

          {dueTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 roburna-table-row">
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="font-medium roburna-text-primary">{task.name}</span>
                </div>
              </div>
              <div className="col-span-3">
                <span className="roburna-text-secondary text-sm">{task.description}</span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  {task.people.map((person, index) => (
                    <div key={index} className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                      {person}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <span className="roburna-text-secondary text-sm">{task.timeline}</span>
              </div>
              <div className="col-span-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}