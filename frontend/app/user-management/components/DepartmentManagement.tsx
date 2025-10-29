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
  department_id: string
  organization_name: string
}

interface Department {
  id: string
  name: string
  employeeCount: number
}

const DepartmentManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newDepartmentId, setNewDepartmentId] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const fetchingRef = React.useRef(false)

  // Department creation/editing states
  const [showCreateDepartment, setShowCreateDepartment] = useState(false)
  const [showEditDepartment, setShowEditDepartment] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Department deletion states
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const { data: session } = useSession()
  const { isCEO } = usePermissions()

  const fetchDepartments = React.useCallback(async () => {
    if (!session?.accessToken || fetchingRef.current) return

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)

      // Fetch departments directly from the API
      const deptResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organization/get_organization_departments`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!deptResponse.ok) {
        throw new Error('Failed to fetch departments')
      }

      const departmentsData = await deptResponse.json()
      console.log('Fetched departments:', departmentsData)

      // Fetch employees to get employee counts per department
      const empResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get_subordinate_employees`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      let employeesData = []
      if (empResponse.ok) {
        employeesData = await empResponse.json()
        setEmployees(employeesData)
      }

      // Combine department data with employee counts
      const departmentsWithCounts = departmentsData.map((dept: any) => {
        const employeeCount = employeesData.filter((emp: any) => emp.department_id === dept.department_id).length
        return {
          id: dept.department_id,
          name: dept.department_name,
          employeeCount: employeeCount
        }
      })

      setDepartments(departmentsWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [session?.accessToken])

  // Keep the old function name for backward compatibility
  const fetchEmployees = fetchDepartments

  const updateEmployeeDepartment = React.useCallback(async () => {
    if (!selectedEmployee || !newDepartmentId || !session?.accessToken) return

    try {
      setIsUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/update_user_department`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.user_id,
          new_department_id: newDepartmentId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update department')
      }

      const data = await response.json()
      setSuccess(data.message)
      setSelectedEmployee(null)
      setNewDepartmentId('')
      await fetchEmployees() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department')
    } finally {
      setIsUpdating(false)
    }
  }, [selectedEmployee, newDepartmentId, session?.accessToken, fetchEmployees])

  const createDepartment = React.useCallback(async () => {
    if (!newDepartmentName.trim() || !session?.accessToken) return

    try {
      setIsCreating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organization/create_organization_department`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department_name: newDepartmentName.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create department')
      }

      const data = await response.json()
      setSuccess(`Department "${newDepartmentName}" created successfully!`)
      setShowCreateDepartment(false)
      setNewDepartmentName('')
      await fetchEmployees() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department')
    } finally {
      setIsCreating(false)
    }
  }, [newDepartmentName, session?.accessToken, fetchEmployees])

  const updateDepartmentName = React.useCallback(async () => {
    if (!editingDepartment || !newDepartmentName.trim() || !session?.accessToken) return

    try {
      setIsEditing(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organization/update_organization_department_name/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_department_name: newDepartmentName.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update department name')
      }

      const data = await response.json()
      setSuccess(`Department name updated to "${newDepartmentName}" successfully!`)
      setShowEditDepartment(false)
      setEditingDepartment(null)
      setNewDepartmentName('')
      await fetchEmployees() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department name')
    } finally {
      setIsEditing(false)
    }
  }, [editingDepartment, newDepartmentName, session?.accessToken, fetchEmployees])

  const deleteDepartment = React.useCallback(async () => {
    if (!departmentToDelete || !session?.accessToken) return

    try {
      setIsDeleting(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organization/delete_organization_department/${departmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete department')
      }

      const data = await response.json()
      setSuccess(data.message || `Department "${departmentToDelete.name}" has been deleted successfully!`)
      setDepartmentToDelete(null)
      await fetchEmployees() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department')
    } finally {
      setIsDeleting(false)
    }
  }, [departmentToDelete, session?.accessToken, fetchEmployees])

  // Store isCEO result to avoid function calls in useEffect
  const isUserCEO = isCEO()

  useEffect(() => {
    if (session?.accessToken && isUserCEO) {
      fetchEmployees()
    }
  }, [session?.accessToken, isUserCEO, fetchEmployees])

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

  const getDepartmentColor = (index: number) => {
    const colors = [
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'bg-red-500/20 text-red-300 border-red-500/30',
    ]
    return colors[index % colors.length]
  }

  if (!isUserCEO) {
    return (
      <div className="roburna-card p-8 text-center">
        <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-medium text-white/70 mb-2">Access Restricted</h3>
        <p className="text-white/50">Only CEOs can manage departments</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="roburna-card p-8">
        <div className="flex items-center justify-center">
          <div className="roburna-spinner w-8 h-8 mr-3"></div>
          <span className="text-white">Loading departments...</span>
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

      {/* Department Overview */}
      <div className="roburna-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Department Management</h2>
          <button
            onClick={() => setShowCreateDepartment(true)}
            className="roburna-btn-primary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {departments.map((dept, index) => (
            <div key={dept.id} className="roburna-card-dark p-4 group hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{dept.name}</h3>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDepartmentColor(index)}`}>
                  {dept.employeeCount} employees
                </span>
              </div>


              <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingDepartment(dept)
                    setNewDepartmentName(dept.name)
                    setShowEditDepartment(true)
                  }}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs py-2 px-3 rounded-lg transition-colors"
                >
                  Edit Name
                </button>
                <button
                  onClick={() => setDepartmentToDelete(dept)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Department Card */}
          <div
            onClick={() => setShowCreateDepartment(true)}
            className="roburna-card-dark p-4 border-2 border-dashed border-white/30 hover:border-white/50 cursor-pointer transition-all duration-300 hover:scale-105 flex items-center justify-center"
          >
            <div className="text-center">
              <svg className="w-8 h-8 text-white/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-white/70 text-sm font-medium">Add Department</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Department Management */}
      <div className="roburna-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">
            Employee Department Assignment ({employees.length} employees)
          </h3>
          <button
            onClick={() => fetchEmployees()}
            disabled={loading}
            className="roburna-btn-secondary flex items-center space-x-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-white/70 mb-2">No employees found</h3>
            <p className="text-white/50">No employees to manage</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
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
                    setNewDepartmentId(employee.department_id)
                  }}
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm py-2 px-3 rounded-lg transition-colors"
                >
                  Change Department
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Update Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Change Department</h3>

            <div className="mb-4">
              <p className="text-white/70 mb-2">Employee: <span className="text-white font-medium">{selectedEmployee.username}</span></p>
              <p className="text-white/70 mb-4">Current Department: <span className="text-white font-medium">{selectedEmployee.department_name}</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-white/70 text-sm font-medium mb-2">New Department</label>
              <select
                value={newDepartmentId}
                onChange={(e) => setNewDepartmentId(e.target.value)}
                className="roburna-select w-full"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={updateEmployeeDepartment}
                disabled={isUpdating || !newDepartmentId || newDepartmentId === selectedEmployee.department_id}
                className="flex-1 roburna-btn-primary disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Department'}
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null)
                  setNewDepartmentId('')
                }}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateDepartment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create New Department</h3>

            <div className="mb-6">
              <label className="block text-white/70 text-sm font-medium mb-2">Department Name</label>
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newDepartmentName.trim()) {
                    createDepartment()
                  } else if (e.key === 'Escape') {
                    setShowCreateDepartment(false)
                    setNewDepartmentName('')
                  }
                }}
                placeholder="Enter department name..."
                className="roburna-input w-full"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={createDepartment}
                disabled={isCreating || !newDepartmentName.trim()}
                className="flex-1 roburna-btn-primary disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Department'}
              </button>
              <button
                onClick={() => {
                  setShowCreateDepartment(false)
                  setNewDepartmentName('')
                }}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartment && editingDepartment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Edit Department Name</h3>

            <div className="mb-4">
              <p className="text-white/70 mb-4">Current Name: <span className="text-white font-medium">{editingDepartment.name}</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-white/70 text-sm font-medium mb-2">New Department Name</label>
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newDepartmentName.trim() && newDepartmentName !== editingDepartment?.name) {
                    updateDepartmentName()
                  } else if (e.key === 'Escape') {
                    setShowEditDepartment(false)
                    setEditingDepartment(null)
                    setNewDepartmentName('')
                  }
                }}
                placeholder="Enter new department name..."
                className="roburna-input w-full"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={updateDepartmentName}
                disabled={isEditing || !newDepartmentName.trim() || newDepartmentName === editingDepartment.name}
                className="flex-1 roburna-btn-primary disabled:opacity-50"
              >
                {isEditing ? 'Updating...' : 'Update Name'}
              </button>
              <button
                onClick={() => {
                  setShowEditDepartment(false)
                  setEditingDepartment(null)
                  setNewDepartmentName('')
                }}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation Modal */}
      {departmentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete Department</h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <p className="text-white/70 text-center mb-4">
                Are you sure you want to delete this department? This action cannot be undone.
              </p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-white font-medium mb-1">{departmentToDelete.name}</p>
                <p className="text-white/60 text-sm">{departmentToDelete.employeeCount} employees currently assigned</p>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm">
                  <strong>Warning:</strong> All employees in this department will need to be reassigned to other departments before deletion.
                </p>
              </div>
              
              <p className="text-red-300 text-sm text-center">
                This will permanently remove the department from your organization.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDepartmentToDelete(null)}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={deleteDepartment}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentManagement