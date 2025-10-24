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

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    department_id: '',
    role_name: ''
  })
  
  const { data: session } = useSession()
  const { user, isCEO } = usePermissions()

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.username) params.append('username', filters.username)
      if (filters.email) params.append('email', filters.email)
      if (filters.department_id) params.append('department_id', filters.department_id)
      if (filters.role_name) params.append('role_name', filters.role_name)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get_subordinate_employees?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`)
      }

      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchEmployees()
    }
  }, [session?.accessToken, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      username: '',
      email: '',
      department_id: '',
      role_name: ''
    })
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
      {/* Search and Filters */}
      <div className="roburna-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="Search by username..."
              className="roburna-input w-full"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="Search by email..."
              className="roburna-input w-full"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Role</label>
            <select
              value={filters.role_name}
              onChange={(e) => handleFilterChange('role_name', e.target.value)}
              className="roburna-select w-full"
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="assistant_manager">Assistant Manager</option>
              <option value="developer">Developer</option>
              <option value="intern">Intern</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="roburna-btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="roburna-error-message p-4 rounded-xl">
          <p>{error}</p>
        </div>
      )}

      {/* Employee List */}
      <div className="roburna-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Employee Directory ({employees.length} employees)
          </h2>
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

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-white/70 mb-2">No employees found</h3>
            <p className="text-white/50">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <div key={employee.user_id} className="roburna-card-dark p-4 hover:scale-105 transition-all duration-300">
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
                <p className="text-white/60 text-xs">{employee.department_name}</p>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-lg transition-colors">
                    View Profile
                  </button>
                  {(isCEO() || user?.role === 'manager' || user?.role === 'assistant_manager') && (
                    <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs py-2 px-3 rounded-lg transition-colors">
                      Manage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeDirectory