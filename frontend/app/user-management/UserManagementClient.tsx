'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'
import EmployeeDirectory from '@/app/user-management/components/EmployeeDirectory'
import UserProfile from '@/app/user-management/components/UserProfile'
import RoleManagement from '@/app/user-management/components/RoleManagement'
import DepartmentManagement from '@/app/user-management/components/DepartmentManagement'

type TabType = 'directory' | 'profile' | 'roles' | 'departments'

const UserManagementClient = () => {
    const [activeTab, setActiveTab] = useState<TabType>('directory')
    const { user, isCEO, isManager, isAssistantManager } = usePermissions()
    const { data: session } = useSession()

    const tabs = [
        {
            id: 'directory' as TabType,
            name: 'Employee Directory',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            available: true
        },
        {
            id: 'profile' as TabType,
            name: 'My Profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            available: true
        },
        {
            id: 'roles' as TabType,
            name: 'Role Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.25-1.5a.75.75 0 00-1.5 0v1.5H9.75a.75.75 0 000 1.5h4.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5V9z" />
                </svg>
            ),
            available: isManager() || isCEO() || isAssistantManager()
        },
        {
            id: 'departments' as TabType,
            name: 'Department Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            available: isCEO()
        }
    ].filter(tab => tab.available)

    return (
        <div className="min-h-screen roburna-bg-primary p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-white/70">Manage users, roles, and departments in your organization</p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'roburna-gradient text-white shadow-lg'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="roburna-fade-in">
                    {activeTab === 'directory' && <EmployeeDirectory />}
                    {activeTab === 'profile' && <UserProfile />}
                    {activeTab === 'roles' && <RoleManagement />}
                    {activeTab === 'departments' && <DepartmentManagement />}
                </div>
            </div>
        </div>
    )
}

export default UserManagementClient