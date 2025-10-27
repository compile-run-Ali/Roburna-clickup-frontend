'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'

interface Employee {
  user_id: string
  username: string
  email: string
  role_name: string
  department_name: string
  organization_name: string
}

const RoleManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newRole, setNewRole] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: session } = useSession()
  const { user, isCEO, isManager, isAssistantManager } = usePermissions()

  const availableRoles = () => {
    if (isCEO()) {
      return ['manager', 'assistant_manager', 'developer', 'intern']
    } else if (isManager()) {
      return ['assistant_manager', 'developer', 'intern']
    } else if (isAssistantManager()) {
      return ['developer', 'intern']
    }
    return []
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get_subordinate_employees`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }

      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const updateEmployeeRole = async () => {
    if (!selectedEmployee || !newRole) return

    try {
      setIsUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/update_subordinate_role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.user_id,
          new_role_name: newRole
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update role')
      }

      const data = await response.json()
      setSuccess(data.message)
      setSelectedEmployee(null)
      setNewRole('')
      await fetchEmployees() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchEmployees()
    }
  }, [session?.accessToken])

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

  const canUpdateRole = (employeeRole: string) => {
    const userRole = user?.role?.toLowerCase()
    const empRole = employeeRole?.toLowerCase()
    
    if (isCEO()) return true
    if (isManager()) return ['assistant_manager', 'developer', 'intern'].includes(empRole)
    if (isAssistantManager()) return ['developer', 'intern'].includes(empRole)
    
    return false
  }

  if (loading) {
    return (
      <div className="roburna-card p-8">
        <div className="flex items-center justify-center">
          <div className="roburna-spinner w-8 h-8 mr-3"></div>
          <span className="text-white">Loading employees...</span>
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

      {/* Role Management Header */}
      <div className="roburna-card p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Role Management</h2>
        <p className="text-white/70">Update roles for employees in your organization</p>
      </div>

      {/* Employee List */}
      <div className="roburna-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">
            Manageable Employees ({employees.filter(emp => canUpdateRole(emp.role_name)).length})
          </h3>
          <button
            onClick={fetchEmployees}
            className="roburna-btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {employees.filter(emp => canUpdateRole(emp.role_name)).length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="text-lg font-medium text-white/70 mb-2">No manageable employees</h3>
            <p className="text-white/50">You don't have permission to manage any employee roles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees
              .filter(emp => canUpdateRole(emp.role_name))
              .map((employee) => (
                <div key={employee.user_id} className="roburna-card-dark p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {employee.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRoleColor(employee.role_name)}`}>
                      {employee.role_name?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white mb-1">{employee.username}</h3>
                  <p className="text-white/70 text-sm mb-2">{employee.email}</p>
                  <p className="text-white/60 text-xs mb-4">{employee.department_name}</p>
                  
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setNewRole(employee.role_name)
                    }}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm py-2 px-3 rounded-lg transition-colors"
                  >
                    Update Role
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Role Update Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Update Role</h3>
            
            <div className="mb-4">
              <p className="text-white/70 mb-2">Employee: <span className="text-white font-medium">{selectedEmployee.username}</span></p>
              <p className="text-white/70 mb-4">Current Role: <span className="text-white font-medium">{selectedEmployee.role_name?.replace('_', ' ')}</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-white/70 text-sm font-medium mb-2">New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="roburna-select w-full"
              >
                <option value="">Select new role</option>
                {availableRoles().map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={updateEmployeeRole}
                disabled={isUpdating || !newRole || newRole === selectedEmployee.role_name}
                className="flex-1 roburna-btn-primary disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Role'}
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null)
                  setNewRole('')
                }}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleManagement