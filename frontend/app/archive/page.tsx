"use client";

import { useEffect, useMemo, useState } from 'react';
import { fetchArchive } from "../api/mock";

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archivedData, setArchivedData] = useState<{ projects: any[]; tasks: any[]; feedback: any[] }>({ projects: [], tasks: [], feedback: [] });

  useEffect(() => {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Archive</h1>
          <p className="text-gray-600">Access archived projects, tasks, and feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search archive..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Archive Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="p-6 text-gray-600">Loading archive...</div>
        )}
        {error && !loading && (
          <div className="p-6 text-red-600">{error}</div>
        )}
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Project Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Archived</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Team Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedData.projects.filter(p => JSON.stringify(p).toLowerCase().includes(searchQuery.toLowerCase())).map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{project.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{project.dateArchived}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{project.teamSize} members</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{project.duration}</div>
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
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Task Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Archived</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedData.tasks.filter(t => JSON.stringify(t).toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{task.project}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{task.assignedTo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{task.dateArchived}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
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
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Feedback Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Archived</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedData.feedback.filter(f => JSON.stringify(f).toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{item.submittedBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{item.dateArchived}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Implemented' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
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
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No archived items</h3>
          <p className="mt-1 text-sm text-gray-500">There are no archived {activeTab} to display.</p>
        </div>
      )}
    </div>
  );
}