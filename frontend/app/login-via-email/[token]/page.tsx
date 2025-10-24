'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface InviteData {
  receiver_email: string
  receiver_role_id: string
  receiver_department_id: string
  sender_email: string
  organization_id: string
  exp?: number // JWT expiration timestamp
}

interface FormData {
  username: string
  password: string
  confirmPassword: string
}

const LoginViaEmailPage = () => {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)

  // Verify invite token using API
  const verifyInviteToken = async (token: string): Promise<void> => {
    try {
      console.log('Verifying token:', token)

      const response = await fetch(`http://127.0.0.1:8000/auth/verify_invite_token/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Verification response status:', response.status)
      
      const responseData = await response.json()
      console.log('Verification response data:', responseData)

      if (response.ok) {
        console.log('Token verification successful')
        // Token is valid, decode it to get invitation data for display
        const decoded = decodeTokenForDisplay(token)
        if (decoded) {
          console.log('Decoded token data:', decoded)
          setInviteData(decoded)
        } else {
          console.error('Failed to decode token for display')
          toast.error("Unable to read invitation data")
          setTimeout(() => router.push('/login'), 2000)
        }
      } else {
        console.error('Token verification failed:', response.status, responseData)
        
        // Show detailed error information
        let errorMessage = "Invalid or expired invitation link"
        
        if (response.status === 422) {
          if (responseData.detail && Array.isArray(responseData.detail)) {
            const validationErrors = responseData.detail.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ')
            errorMessage = `Validation error: ${validationErrors}`
          } else {
            errorMessage = "Invalid invitation token format"
          }
        } else if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.detail) {
          errorMessage = responseData.detail
        }
        
        toast.error(errorMessage)
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (error) {
      console.error('Token verification error:', error)
      toast.error("Unable to verify invitation. Please try again later.")
      setTimeout(() => router.push('/login'), 2000)
    } finally {
      setIsValidatingToken(false)
    }
  }

  // Decode JWT token for display purposes only (after API verification)
  const decodeTokenForDisplay = (token: string): InviteData | null => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token for display:', error)
      return null
    }
  }

  useEffect(() => {
    if (token) {
      console.log('Token from URL:', token)
      console.log('Token length:', token.length)
      
      // First check if token has valid JWT structure
      const parts = token.split('.')
      console.log('Token parts count:', parts.length)
      
      if (parts.length !== 3) {
        console.error('Invalid JWT structure - should have 3 parts separated by dots')
        toast.error("Invalid invitation link format")
        setTimeout(() => router.push('/login'), 2000)
        setIsValidatingToken(false)
        return
      }
      
      verifyInviteToken(token)
    } else {
      toast.error("No invitation token provided")
      setTimeout(() => router.push('/login'), 2000)
      setIsValidatingToken(false)
    }
  }, [token, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!inviteData) {
      toast.error("Invalid invitation data")
      return
    }

    setIsLoading(true)

    try {
      console.log('Registering user with token:', token)
      
      const requestBody = {
        username: formData.username,
        password: formData.password,
      }
      
      console.log('Registration request body:', requestBody)

      const response = await fetch(`http://127.0.0.1:8000/auth/register_via_token/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Registration response status:', response.status)
      
      const responseData = await response.json()
      console.log('Registration response data:', responseData)

      if (response.ok) {
        console.log('Registration successful')
        toast.success("Account created successfully! Redirecting to login...")
        
        // Clear form
        setFormData({
          username: '',
          password: '',
          confirmPassword: ''
        })

        // Redirect to login page after success
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        console.error('Registration failed:', response.status, responseData)
        
        // Handle specific error cases
        if (response.status === 422) {
          const validationErrors = responseData.detail
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ')
            toast.error(`Validation error: ${errorMessages}`)
          } else {
            toast.error('Validation error: Please check your input data')
          }
        } else {
          toast.error(responseData.message || responseData.detail || 'Registration failed')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error("Something went wrong. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E7145] mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">This invitation link is invalid or has expired.</p>
          <Link 
            href="/login"
            className="bg-[#1E7145] text-white px-6 py-2 rounded-lg hover:bg-[#388E3C] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        pauseOnHover
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Branding */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1E7145] rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1E7145]">ROBURNA</h1>
              <p className="text-sm text-gray-600">Labs</p>
            </div>
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You've been invited to join the organization
        </p>
        
        {/* Invitation Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Invited by:</span> {inviteData.sender_email}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Your email:</span> {inviteData.receiver_email}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E7145] focus:border-[#1E7145] sm:text-sm ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E7145] focus:border-[#1E7145] sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E7145] focus:border-[#1E7145] sm:text-sm ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#1E7145] focus:ring-[#1E7145] border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-[#1E7145] hover:text-[#388E3C]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#1E7145] hover:text-[#388E3C]">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E7145] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E7145] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E7145] transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginViaEmailPage