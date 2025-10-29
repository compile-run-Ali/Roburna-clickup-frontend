'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { ChevronDown, Mail, Users, Shield, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { getSession } from 'next-auth/react';
import { canManageOwnDepartment } from '@/lib/auth-utils';

interface FormData {
  email: string;
  role: string;
  department: string;
}

interface ApiResponse {
  message?: string;
  success?: boolean;
  [key: string]: any;
}

export default function AddMember() {
  const { user, isLoading, canInviteRole, getInvitableRoles, canManageAllDepartments } = usePermissions();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    role: 'Developer',
    department: '',
  });

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<{ id: string, name: string }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const fetchDepartments = async (): Promise<void> => {
    try {
      setLoadingDepartments(true);
      const session = await getSession();

      if (!session?.accessToken) {
        console.error('❌ No access token available');
        // Fallback to user's department if no session
        if (user?.department) {
          console.log('🔄 Using user department as fallback:', user.department);
          setAvailableDepartments([{ id: 'user-dept', name: user.department }]);
          setFormData(prev => ({ ...prev, department: user.department }));
        }
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log('🔧 Backend URL from env:', backendUrl);

      if (!backendUrl) {
        console.error('❌ NEXT_PUBLIC_BACKEND_URL environment variable is not set');
        // Use user's department as fallback
        if (user?.department) {
          console.log('🔄 Using user department as fallback:', user.department);
          setAvailableDepartments([{ id: 'user-dept', name: user.department }]);
          setFormData(prev => ({ ...prev, department: user.department }));
        }
        return;
      }

      const apiUrl = `${backendUrl}/organization/get_organization_departments`;
      console.log('🌐 Full API URL:', apiUrl);
      console.log('🔑 Access Token:', session.accessToken ? 'Present' : 'Missing');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const departmentsData = await response.json();
        console.log('✅ Fetched departments successfully:', departmentsData);
        console.log('📊 Number of departments:', departmentsData.length);

        // Map the backend response format to frontend format
        const mappedDepartments = departmentsData.map((dept: any) => ({
          id: dept.department_id,
          name: dept.department_name
        }));

        setAvailableDepartments(mappedDepartments);

        // Set first department as default if none selected
        if (mappedDepartments.length > 0 && !formData.department) {
          console.log('🎯 Setting default department:', mappedDepartments[0].name);
          setFormData(prev => ({ ...prev, department: mappedDepartments[0].name }));
        }
      } else if (response.status === 403) {
        // Handle CEO-only restriction - use user's department as fallback
        console.log('⚠️ API restricted to CEO users (403 Forbidden)');
        console.log('👤 Current user role:', user?.role);
        console.log('🏢 User department:', user?.department);

        if (user?.department) {
          console.log('🔄 Using user department as fallback:', user.department);
          setAvailableDepartments([{ id: 'user-dept', name: user.department }]);
          setFormData(prev => ({ ...prev, department: user.department }));
        } else {
          console.error('❌ No user department available for fallback');
          console.log('💡 User may need to be assigned to a department first');
          setAvailableDepartments([]);
        }
      } else {
        console.error('❌ Failed to fetch departments:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('📄 Error response body:', errorText);

        // Fallback to user's department if API fails
        if (user?.department) {
          console.log('🔄 Using fallback department:', user.department);
          setAvailableDepartments([{ id: 'user-dept', name: user.department }]);
          setFormData(prev => ({ ...prev, department: user.department }));
        }
      }
    } catch (error) {
      console.error('🚨 Network error fetching departments:', error);
      // Fallback to user's department if API fails
      if (user?.department) {
        console.log('🔄 Using fallback department due to error:', user.department);
        setAvailableDepartments([{ id: 'user-dept', name: user.department }]);
        setFormData(prev => ({ ...prev, department: user.department }));
      }
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendInvite();
    }
  };

  const handleSendInvite = async (): Promise<void> => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.email.trim()) {
      setErrorMessage('Email address is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!formData.department.trim()) {
      setErrorMessage('Please select a department');
      return;
    }

    // Check if user has permission to invite this role
    if (!canInviteRole(formData.role.toLowerCase().replace(/\s+/g, '_'))) {
      setErrorMessage(`You don't have permission to invite ${formData.role}s`);
      return;
    }

    setLoading(true);

    try {
      // Get session for authentication
      const session = await getSession();

      console.log('Current session:', session);

      if (!session || !session.user) {
        setErrorMessage('Authentication required. Please login again.');
        router.push('/login');
        return;
      }

      const requestBody = {
        email: formData.email,
        role_name: formData.role,
        department_name: formData.department,
      };

      // Log the request for debugging
      console.log('Sending invite request:', requestBody);

      // Prepare headers - handle different token scenarios
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Try to get the access token from session
      if (session.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      } else if (session.user.id) {
        // Fallback: use user ID as a temporary token (you may need to adjust this based on your backend)
        headers['Authorization'] = `Bearer ${session.user.id}`;
      }

      // For testing: if using test token, simulate success
      if (session.accessToken === "test_token_123") {
        console.log("Using test mode - simulating successful invite");
        setSuccessMessage('Invite sent successfully! (Test Mode)');
        setFormData({
          email: '',
          role: availableRoles[0] || 'Developer',
          department: availableDepartments[0]?.name || ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      console.log('Request headers:', headers);
      console.log('Backend URL: http://127.0.0.1:8000');

      const response = await fetch(`http://127.0.0.1:8000/auth/req_employee_via_email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      let responseData: ApiResponse;

      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setErrorMessage('Invalid response from server. Please try again.');
        return;
      }

      if (response.ok) {
        setSuccessMessage('Invite sent successfully!');
        setFormData({
          email: '',
          role: availableRoles[0] || 'Developer',
          department: availableDepartments[0]?.name || ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // Log the full response for debugging
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        // Handle specific error cases
        if (response.status === 422) {
          // Extract validation errors if available
          const validationErrors = responseData.detail;
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors.map((err: any) =>
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ');
            setErrorMessage(`Validation error: ${errorMessages}`);
          } else {
            setErrorMessage('Validation error: Please check your input data.');
          }
        } else if (response.status === 401) {
          setErrorMessage('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          setErrorMessage('You do not have permission to send invites.');
        } else if (response.status === 500) {
          // Handle server errors more gracefully
          const errorDetail = responseData.detail || responseData.message || 'Internal server error';
          if (errorDetail.includes('Multiple rows were found')) {
            setErrorMessage('Database configuration issue. Please contact your administrator.');
          } else if (errorDetail.includes('Department') && errorDetail.includes('not found')) {
            setErrorMessage('The selected department is not available in your organization.');
          } else {
            setErrorMessage('Server error occurred. Please try again later or contact support.');
          }
        } else {
          setErrorMessage(
            responseData.message || responseData.detail || 'Failed to send invite. Please try again.'
          );
        }
      }
    } catch (err) {
      console.error('Network error:', err);

      // Check if it's a network connectivity issue
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setErrorMessage('Unable to connect to server. Please check if the backend is running and try again.');
      } else {
        setErrorMessage('Network error occurred. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Set available roles based on user permissions
      const invitableRoles = getInvitableRoles();
      setAvailableRoles(invitableRoles);

      // Set first available role as default
      if (invitableRoles.length > 0) {
        setFormData(prev => ({ ...prev, role: invitableRoles[0] }));
      }

      // Fetch departments from API
      fetchDepartments();
    }
  }, [user?.role, user?.department, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen roburna-bg-primary">
      {/* Header */}
      <header className="roburna-header">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold roburna-gradient-text">Add Team Member</h1>
              <p className="roburna-text-secondary mt-1">Invite new members to your organization</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 roburna-text-secondary rounded-lg">
                <Users size={20} />
              </button>
              <button className="p-2 roburna-text-secondary rounded-lg">
                <Shield size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 roburna-success-message rounded-lg p-4 flex items-center gap-3 animate-in">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 roburna-error-message rounded-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}





        {/* Add Member Form */}
        <div className="roburna-form-container roburna-fade-in p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold roburna-text-primary mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 roburna-text-muted pointer-events-none" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="member@example.com"
                  className="w-full pl-10 pr-4 py-2.5 roburna-input roburna-text-primary"
                />
              </div>
              <p className="text-xs roburna-text-muted mt-1">Enter the member's email address</p>
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-semibold roburna-text-primary mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 roburna-select appearance-none"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 roburna-text-muted pointer-events-none" size={18} />
              </div>
              <p className="text-xs roburna-text-muted mt-1">Select member's role</p>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-sm font-semibold roburna-text-primary mb-2">
                Department
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 roburna-select appearance-none"
                  disabled={loadingDepartments || (!canManageAllDepartments() && availableDepartments.length <= 1)}
                >
                  {loadingDepartments ? (
                    <option value="">Loading departments...</option>
                  ) : availableDepartments.length === 0 ? (
                    <option value="">No departments available</option>
                  ) : (
                    availableDepartments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))
                  )}
                </select>
                {loadingDepartments ? (
                  <Loader className="absolute right-3 top-3 roburna-text-muted animate-spin" size={18} />
                ) : (
                  <ChevronDown className="absolute right-3 top-3 roburna-text-muted pointer-events-none" size={18} />
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs roburna-text-muted">
                  {loadingDepartments
                    ? 'Loading departments...'
                    : availableDepartments.length === 0
                      ? 'No departments available - Contact CEO to assign you to a department'
                      : canManageAllDepartments()
                        ? 'Select any department (CEO access)'
                        : 'Limited to your department'
                  }
                </p>
                {!loadingDepartments && availableDepartments.length === 0 && (
                  <button
                    onClick={fetchDepartments}
                    className="text-xs text-blue-400 underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendInvite}
            disabled={loading}
            type="button"
            className="w-full md:w-auto roburna-btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </main>
    </div>
  );
}