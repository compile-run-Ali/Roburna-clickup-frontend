'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'

const UserProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<any>(null)
  
  // Form states
  const [usernameForm, setUsernameForm] = useState({
    newUsername: '',
    isEditing: false
  })
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    isEditing: false
  })

  const { data: session, update } = useSession()
  const { user } = usePermissions()

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get_user_details`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data = await response.json()
      setUserDetails(data)
      setUsernameForm(prev => ({ ...prev, newUsername: data.username }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchUserDetails()
    }
  }, [session?.accessToken])

  const updateUsername = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/update_username`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_username: usernameForm.newUsername
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update username')
      }

      const data = await response.json()
      setSuccess(data.message)
      setUsernameForm(prev => ({ ...prev, isEditing: false }))
      await fetchUserDetails() // Refresh user details
      
      // Update the session to reflect the new username
      if (session && update) {
        try {
          await update({
            user: {
              ...session.user,
              name: usernameForm.newUsername
            }
          })
          console.log('Session updated successfully with new username')
        } catch (updateError) {
          console.log('Session update failed, but username was updated successfully:', updateError)
          // The username was updated successfully even if session update failed
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username')
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match')
        return
      }

      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/update_password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update password')
      }

      const data = await response.json()
      setSuccess(data.message)
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        isEditing: false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'ceo': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'manager': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'assistant_manager': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'developer': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'intern': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-white/20 text-white border-white/30'
    }
  }

  if (loading && !userDetails) {
    return (
      <div className="roburna-card p-8">
        <div className="flex items-center justify-center">
          <div className="roburna-spinner w-8 h-8 mr-3"></div>
          <span className="text-white">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="roburna-success-message p-4 rounded-lg">
          <p>{success}</p>
        </div>
      )}
      
      {error && (
        <div className="roburna-error-message p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Profile Overview */}
      <div className="roburna-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Profile Overview</h2>
        
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {userDetails?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{userDetails?.username}</h3>
            <p className="text-white/70 mb-2">{userDetails?.email}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRoleColor(userDetails?.role_name)}`}>
                {userDetails?.role_name?.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-white/60 text-sm">
                {userDetails?.department_name} • {userDetails?.organization_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Username Management */}
      <div className="roburna-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Username</h3>
          <button
            onClick={() => setUsernameForm(prev => ({ ...prev, isEditing: !prev.isEditing }))}
            className="roburna-btn-secondary text-sm"
          >
            {usernameForm.isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {usernameForm.isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">New Username</label>
              <input
                type="text"
                value={usernameForm.newUsername}
                onChange={(e) => setUsernameForm(prev => ({ ...prev, newUsername: e.target.value }))}
                className="roburna-input w-full"
                placeholder="Enter new username"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={updateUsername}
                disabled={loading || !usernameForm.newUsername.trim()}
                className="roburna-btn-primary disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Username'}
              </button>
              <button
                onClick={() => setUsernameForm(prev => ({ ...prev, isEditing: false, newUsername: userDetails?.username }))}
                className="roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white/70">{userDetails?.username}</p>
        )}
      </div>

      {/* Password Management */}
      <div className="roburna-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Password</h3>
          <button
            onClick={() => setPasswordForm(prev => ({ ...prev, isEditing: !prev.isEditing }))}
            className="roburna-btn-secondary text-sm"
          >
            {passwordForm.isEditing ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        
        {passwordForm.isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="roburna-input w-full"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="roburna-input w-full"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="roburna-input w-full"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={updatePassword}
                disabled={loading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="roburna-btn-primary disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                onClick={() => setPasswordForm({
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                  isEditing: false
                })}
                className="roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white/70">••••••••••••</p>
        )}
      </div>

      {/* Account Information */}
      <div className="roburna-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Email</label>
            <p className="text-white">{userDetails?.email}</p>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Role</label>
            <p className="text-white">{userDetails?.role_name?.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Department</label>
            <p className="text-white">{userDetails?.department_name}</p>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Organization</label>
            <p className="text-white">{userDetails?.organization_name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile