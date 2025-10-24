"use client";
import React, { useEffect, useState } from 'react'
import { fetchProjects } from "../api/mock";

const ProjectManagement = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchProjects()
      .then((data) => { if (isMounted) setProjects(data as any[]); })
      .catch(() => { if (isMounted) setError('Failed to load projects'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="w-full h-full roburna-bg-primary p-6 overflow-y-auto">
      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full roburna-text-secondary">Loading projects...</div>
        )}
        {error && !loading && (
          <div className="col-span-full text-red-400">{error}</div>
        )}
        {!loading && !error && projects.map((p) => (
          <div key={p.id} className="roburna-card roburna-fade-in rounded-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold roburna-text-primary">{p.title}</h3>
              <span className="roburna-status-success px-3 py-1 rounded-full text-xs font-medium">{p.status}</span>
            </div>
            <p className="roburna-text-secondary text-sm mb-4">{p.description}</p>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm roburna-text-secondary font-medium">Progress</span>
                <span className="text-sm font-bold roburna-text-primary">{p.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="roburna-gradient h-2 rounded-full" style={{ width: `${p.progressPercent}%` }}></div>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {p.tags.map((tag: string) => (
                <span key={tag} className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
              ))}
              <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                {p.priority}
              </span>
            </div>
            <div className="space-y-2 text-sm roburna-text-secondary">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due Date: {new Date(p.dueDate).toDateString()}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {p.members} members
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectManagement