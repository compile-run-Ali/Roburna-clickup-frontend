"use client"

import { useEffect, useMemo, useState } from 'react';
import { fetchFeedback } from "../api/mock";
import { useRouter } from 'next/navigation';
export default function FeedbackQueuePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchFeedback()
      .then((items) => { if (isMounted) setFeedbackItems(items as any[]); })
      .catch(() => { if (isMounted) setError('Failed to load feedback'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800';
  };

  const getCardBgColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 border border-yellow-200';
      case 'In Progress':
        return 'bg-yellow-50 border border-yellow-200';
      case 'Resolved':
        return 'bg-green-50 border border-green-200';
      case 'Escalated':
        return 'bg-red-50 border border-red-200';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  const filteredFeedback = useMemo(() => feedbackItems
    .filter(item => item.status === activeTab)
    .filter(item => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())), [feedbackItems, activeTab, searchQuery]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback Queue</h1>
          <p className="text-gray-600">Control tower for client feedback routing</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
            <span className="mr-1">⚠️</span> 1 Escalated
          </div>
          <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
            <span className="mr-1">🚨</span> 1 Urgent
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <span className="mr-1">⏰</span> 1 Overdue
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex space-x-1 overflow-x-auto">
          {['Pending', 'In Progress', 'Resolved', 'Escalated'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? `bg-${tab === 'Pending' ? 'blue' : tab === 'In Progress' ? 'yellow' : tab === 'Resolved' ? 'green' : 'red'}-100 text-${tab === 'Pending' ? 'blue' : tab === 'In Progress' ? 'yellow' : tab === 'Resolved' ? 'green' : 'red'}-800` 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab} <span className="ml-1 bg-white px-1.5 py-0.5 rounded-full text-xs">{feedbackItems.filter(f => f.status === tab).length}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search feedback, clients, or projects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="text-gray-600">Loading feedback...</div>
      )}
      {error && !loading && (
        <div className="text-red-600">{error}</div>
      )}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <div
            key={item.id}
            className={`${getCardBgColor(item.status)} p-4 rounded-xl shadow-sm transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${
                  item.category === 'Corporate Dashboard' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
              </div>
              <div className="flex space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item.priority}
                </span>
                {item.status === 'Escalated' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Escalated
                  </span>
                )}
                {item.resolved && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    Resolved
                  </span>
                )}
              </div>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-1 text-gray-600">{item.description}</p>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {item.date}
              <span className="mx-1">•</span>
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.timeAgo}
              <span className="mx-1">•</span>
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {item.assignee}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}