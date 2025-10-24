'use client'
import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import UserManagementClient from './UserManagementClient'

const UserManagementPage = () => {
  const { user, isAuthenticated, isLoading } = usePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen roburna-bg-primary flex items-center justify-center">
        <div className="roburna-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen roburna-bg-primary flex items-center justify-center">
        <div className="roburna-card p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/70">Please log in to access user management.</p>
        </div>
      </div>
    )
  }

  return <UserManagementClient />
}

export default UserManagementPage