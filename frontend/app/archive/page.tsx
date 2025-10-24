"use client";

import { useEffect, useMemo, useState } from 'react';
import { fetchArchive } from "../api/mock";
import { useRouter } from 'next/navigation';  
export default function ArchivePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archivedData, setArchivedData] = useState<{ projects: any[]; tasks: any[]; feedback: any[] }>({ projects: [], tasks: [], feedback: [] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchArchive()
      .then((data) => { if (isMounted) setArchivedData(data as any); })
      .catch((e) => { if (isMounted) setError('Failed to load archive'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const currentData = useMemo(() => archivedData[activeTab as keyof typeof archivedData] || [], [archivedData, activeTab]);

  return (
    <div className="p-6 roburna-bg-primary min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold roburna-gradient-text mb-1">Archive</h1>
          <p className="roburna-text-secondary">Access archived projects, tasks, and feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search archive..."
              className="pl-10 pr-4 py-2 roburna-input w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 roburna-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="roburna-bg-secondary hover:roburna-bg-tertiary p-2.5 rounded-lg transition-colors">
            <svg className="w-5 h-5 roburna-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.keys(archivedData).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'roburna-gradient text-white'
                : 'roburna-bg-secondary roburna-text-primary hover:roburna-bg-tertiary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Archive Content */}
      <div className="roburna-table rounded-xl overflow-hidden">
        {loading && (
          <div className="p-6 roburna-text-secondary">Loading archive...</div>
        )}
        {error && !loading && (
          <div className="p-6 text-red-400">{error}</div>
        )}
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="roburna-table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Project Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Archived</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Team Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y roburna-border">
                {archivedData.projects.filter(p => JSON.stringify(p).toLowerCase().includes(searchQuery.toLowerCase())).map((project) => (
                  <tr key={project.id} className="roburna-table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium roburna-text-primary">{project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{project.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{project.dateArchived}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{project.teamSize} members</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{project.duration}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="roburna-table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Task Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Assigned To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Archived</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y roburna-border">
                {archivedData.tasks.filter(t => JSON.stringify(t).toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                  <tr key={task.id} className="roburna-table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium roburna-text-primary">{task.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{task.project}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{task.assignedTo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{task.dateArchived}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'High' ? 'bg-red-900 text-red-300' :
                        task.priority === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-green-900 text-green-300'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="roburna-table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Feedback Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Submitted By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Archived</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y roburna-border">
                {archivedData.feedback.filter(f => JSON.stringify(f).toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                  <tr key={item.id} className="roburna-table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium roburna-text-primary">{item.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{item.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{item.submittedBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm roburna-text-secondary">{item.dateArchived}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Implemented' ? 'bg-green-900 text-green-300' :
                        'bg-blue-900 text-blue-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty State */}
      {currentData && currentData.length === 0 && (
        <div className="roburna-card rounded-xl p-12 text-center">
          <svg className="mx-auto h-12 w-12 roburna-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium roburna-text-primary">No archived items</h3>
          <p className="mt-1 text-sm roburna-text-secondary">There are no archived {activeTab} to display.</p>
        </div>
      )}
    </div>
  );
}