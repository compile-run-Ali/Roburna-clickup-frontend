'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-[#1E7145] text-white h-full">
      {/* Header Section */}
      <div className="flex items-center px-6 py-6">
        <div className="flex items-center space-x-3">
          {/* Tree Logo */}
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1E7145]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ROBURNA</h1>
            <p className="text-sm text-gray-300">Labs</p>
          </div>
        </div>
      </div>

      {/* Project/Context Selector */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between bg-[#388E3C] rounded-lg px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#1E7145] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-white">BigRex</span>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-6">
        <ul className="space-y-2">
          <li>
            <Link href="/home" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-white">Home</span>
            </Link>
          </li>
          
          <li>
            <Link href="/task-board" className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              pathname === '/task-board' 
                ? 'bg-white text-[#1E7145]' 
                : 'hover:bg-[#388E3C] text-white'
            }`}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">My Tasks Board</span>
              </div>
              <span className="bg-[#FFC107] text-white text-xs px-2 py-1 rounded">NEW</span>
            </Link>
          </li>
          
          <li>
            <Link href="/project-management" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Projects Management</span>
            </Link>
          </li>
          
          <li>
            <Link href="/feedback" className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Feedback Queue</span>
              </div>
              <span className="bg-[#FFC107] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">8</span>
            </Link>
          </li>
          
          <li>
            <Link href="/client-management" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Client Management</span>
            </Link>
          </li>
          
          <li>
            <Link href="/performance" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Performance</span>
            </Link>
          </li>
          
          <li>
            <Link href="/archive" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Archive</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Departments Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Departments</h3>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Development</span>
            </a>
          </li>
          
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Design</span>
            </a>
          </li>
          
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#388E3C] transition-colors text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Content Creation</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar