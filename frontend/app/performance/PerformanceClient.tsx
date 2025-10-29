"use client";

import { ExtendedUser } from "@/app/api/auth/[...nextauth]/options";
import { usePermissions } from "@/hooks/usePermissions";

interface PerformanceClientProps {
  user: ExtendedUser;
}

export default function PerformanceClient({ user }: PerformanceClientProps) {
  const { isCEO, isManager } = usePermissions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {isCEO() ? "Organization-wide performance metrics" : "Department performance overview"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user.role}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Access Level Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 transition-all hover:scale-102">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isCEO() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={isCEO() ? 'text-green-700 font-medium' : 'text-gray-500'}>
                All Departments Access
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isManager() || isCEO() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={isManager() || isCEO() ? 'text-green-700 font-medium' : 'text-gray-500'}>
                Performance Metrics Access
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all hover:scale-105">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Performance</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <p className="text-gray-600 text-sm">Overall team efficiency</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all hover:scale-105">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks Completed</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">142</div>
            <p className="text-gray-600 text-sm">This month</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all hover:scale-105">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Projects</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
            <p className="text-gray-600 text-sm">Currently in progress</p>
          </div>
        </div>

        {/* Department-specific content */}
        {isCEO() ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all hover:scale-102">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Departments Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Development</span>
                <span className="text-green-600 font-semibold">92% Efficiency</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Design</span>
                <span className="text-blue-600 font-semibold">88% Efficiency</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Finance</span>
                <span className="text-purple-600 font-semibold">95% Efficiency</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Human Resource</span>
                <span className="text-orange-600 font-semibold">87% Efficiency</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all hover:scale-102">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {user.department} Department Performance
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Team Members</span>
                <span className="text-blue-600 font-semibold">12 Active</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Department Efficiency</span>
                <span className="text-green-600 font-semibold">89%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Monthly Goals</span>
                <span className="text-purple-600 font-semibold">7/10 Completed</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}