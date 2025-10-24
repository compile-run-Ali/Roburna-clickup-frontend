'use client'
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { usePermissions } from '@/hooks/usePermissions';

const Navbar = () => {
  const pathname = usePathname();
  const { user, canManageOwnDepartment } = usePermissions();

  // Get current date
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Get page title based on pathname
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/task-board':
        return 'Task Board';
      case '/project-management':
        return 'Project Management';
      case '/performance':
        return 'Performance Analytics';
      case '/client-management':
        return 'Client Management';
      case '/add-member':
        return 'Add Team Member';
      case '/user-management':
        return 'User Management';
      case '/archive':
        return 'Archive';
      case '/feedback':
        return 'Feedback Queue';
      default:
        return 'Roburna Workspace';
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
      redirect: true
    });
  };

  return (
    <div className="roburna-navbar bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
      {/* Enhanced Top Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{getPageTitle()}</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-white/70 text-sm font-medium">{getCurrentDate()}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="roburna-navbar-btn group relative">
            <svg className="w-5 h-5 text-white group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
          </button>

          {/* Invite Member - Only for CEO, Manager, and Assistant Manager */}
          {canManageOwnDepartment() && (
            <Link href="/add-member" className="roburna-navbar-btn-secondary group">
              <svg className="w-4 h-4 text-white group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-white font-medium text-sm group-hover:text-green-300 transition-colors">Invite</span>
            </Link>
          )}

          {/* Settings */}
          <button className="roburna-navbar-btn group">
            <svg className="w-5 h-5 text-white group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Share */}
          <button className="roburna-navbar-btn-secondary group">
            <svg className="w-4 h-4 text-white group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-white font-medium text-sm group-hover:text-green-300 transition-colors">Share</span>
          </button>

          {/* Primary CTA - Add Task */}
          <button className="bg-gray-600 border-2 border-green-400 text-gray-200 group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-green-500 hover:text-white hover:scale-105">
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Add Task</span>
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                <span className="text-white font-bold text-sm">
                  {(user.name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-white font-medium text-sm">{user.name || user.email?.split('@')[0] || 'User'}</p>
                <p className="text-white/60 text-xs">{user.role}</p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="roburna-logout-btn group ml-2"
                title="Logout"
              >
                <svg className="w-5 h-5 text-white group-hover:text-red-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="flex gap-2">
        <button className="roburna-tab-active">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Development</span>
          </div>
        </button>
        <button className="roburna-tab-inactive">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Design</span>
          </div>
        </button>
        <button className="roburna-tab-inactive">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Content</span>
          </div>
        </button>
        <button className="roburna-tab-inactive">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Marketing</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
