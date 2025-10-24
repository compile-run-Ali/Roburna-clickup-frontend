"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { Loader, Calendar, CheckCircle, AlertTriangle, Users, FolderOpen, Clock, User, Flag } from "lucide-react";

export default function DashboardPage() {
  const {
    user,
    isLoading,
    canAccessPerformance,
    canManageOwnDepartment
  } = usePermissions();
  const router = useRouter();

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

  // Mock data for the dashboard
  const stats = {
    activeProjects: 18,
    tasksToday: 0,
    overdueTasks: 4,
    teamMembers: 12
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

  const projects = [
    {
      id: 1,
      name: "Improve Security Measures",
      description: "Implement two-factor authentication and data encryption.",
      progress: 68,
      status: "Active",
      dueDate: "19th Oct 2025",
      members: 4,
      tags: ["Planning", "High"]
    },
    {
      id: 2,
      name: "Blockpals Logo Creation",
      description: "Implement two-factor authentication and data encryption.",
      progress: 68,
      status: "Active",
      dueDate: "19th Oct 2025",
      members: 4,
      tags: ["Planning", "High"]
    },
    {
      id: 3,
      name: "Vybes Platform to Launch",
      description: "Implement two-factor authentication and data encryption.",
      progress: 68,
      status: "Active",
      dueDate: "19th Oct 2025",
      members: 4,
      tags: ["Planning", "High"]
    },
    {
      id: 4,
      name: "Improve Security Measures",
      description: "Implement two-factor authentication and data encryption.",
      progress: 68,
      status: "Active",
      dueDate: "19th Oct 2025",
      members: 4,
      tags: ["Planning", "High"]
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
    switch (status) {
      case 'Urgent':
        return 'bg-red-500';
      case 'Resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
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
          <h2 className="text-lg font-semibold roburna-text-primary">Active Projects</h2>
          <span className="roburna-gradient text-white px-3 py-1 rounded text-sm font-medium">3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <div key={project.id} className="roburna-card roburna-slide-up p-6" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium roburna-text-primary">{project.name}</h3>
                <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded">
                  {project.status}
                </span>
              </div>
              <p className="text-sm roburna-text-secondary mb-4">{project.description}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="roburna-text-secondary">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="roburna-gradient h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {project.tags.map((tag, index) => (
                  <span key={index} className={`px-2 py-1 text-xs font-medium rounded ${tag === 'Planning' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm roburna-text-secondary">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Due Date: {project.dueDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{project.members} members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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