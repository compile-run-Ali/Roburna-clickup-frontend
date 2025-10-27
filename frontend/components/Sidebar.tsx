'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { usePermissions } from '@/hooks/usePermissions'

const Sidebar = () => {
  const pathname = usePathname()
  const { user, canAccessPerformance, canManageOwnDepartment } = usePermissions()



  return (
    <div className="flex flex-col w-64 roburna-bg-secondary text-white h-full overflow-y-hidden relative border-r border-gray-700">
      <div className="flex flex-col h-full">

        {/* Header Section */}
        <Link href="/" className="group">
          <div className="flex items-center px-4 py-4 transition-all duration-300 hover:roburna-bg-tertiary rounded-lg mx-2 mt-2">
            <div className="flex items-center space-x-3">
              {/* Roburna Logo */}
              <div className="w-8 h-8 roburna-bg-tertiary rounded-lg flex items-center justify-center border border-gray-600 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold roburna-gradient-text tracking-wide">ROBURNA</h1>
                <p className="text-xs roburna-text-secondary font-medium">Project Management</p>
              </div>
            </div>
          </div>
        </Link>
        

        {/* Main Navigation */}
        <div className="flex-1 px-4">
          <div className="mb-4">
            <h2 className="text-xs font-semibold roburna-text-muted uppercase tracking-wider mb-2 px-3">Navigation</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/dashboard'
                  ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                  : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                  }`}>
                  <div className="w-4 h-4 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              </li>

              <li>
                <Link href="/task-board" className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/task-board'
                  ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                  : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                  }`}>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Task Board</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </Link>
              </li>

              <li>
                <Link href="/project-management" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/project-management'
                  ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                  : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                  }`}>
                  <div className="w-4 h-4 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Projects</span>
                </Link>
              </li>

              <li>
                <Link href="/feedback" className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/feedback'
                  ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                  : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                  }`}>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Feedback</span>
                  </div>
                  <div className="w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-white text-xs font-bold">8</span>
                  </div>
                </Link>
              </li>

              <li>
                <Link href="/archive" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/archive'
                  ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                  : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                  }`}>
                  <div className="w-4 h-4 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Archive</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Management Section */}
          {(canAccessPerformance() || canManageOwnDepartment() || user?.role?.toLowerCase() === "ceo") && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold roburna-text-muted uppercase tracking-wider mb-2 px-3">Management</h2>
              <ul className="space-y-1">
                {/* User Management - For all management roles */}
                <li>
                  <Link href="/user-management" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/user-management'
                    ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                    : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                    }`}>
                    <div className="w-4 h-4 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">User Management</span>
                  </Link>
                </li>

                {/* Performance - Only for CEO and Managers */}
                {canAccessPerformance() && (
                  <li>
                    <Link href="/performance" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/performance'
                      ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                      : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                      }`}>
                      <div className="w-4 h-4 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Performance</span>
                    </Link>
                  </li>
                )}

                {/* Client Management - CEO only */}
                {user?.role?.toLowerCase() === "ceo" && (
                  <li>
                    <Link href="/client-management" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/client-management'
                      ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                      : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                      }`}>
                      <div className="w-4 h-4 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Client Management</span>
                    </Link>
                  </li>
                )}

                {/* Add Member - Only for roles with management permissions */}
                {canManageOwnDepartment() && (
                  <li>
                    <Link href="/add-member" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === '/add-member'
                      ? 'roburna-bg-tertiary roburna-text-primary border-l-4 border-green-400'
                      : 'roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary'
                      }`}>
                      <div className="w-4 h-4 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Add Member</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Departments Section */}
        <div className="px-4 pb-4 mt-auto">
          <div className="roburna-card-dark rounded-lg p-3 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold roburna-text-secondary uppercase tracking-wider">Departments</h3>
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </div>

            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center justify-between px-2 py-1.5 transition-all duration-300 roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span className="font-medium text-xs">Development</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between px-2 py-1.5 transition-all duration-300 roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-xs">Content</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between px-2 py-1.5 transition-all duration-300 roburna-text-secondary hover:roburna-bg-tertiary hover:roburna-text-primary rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="font-medium text-xs">Design</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar