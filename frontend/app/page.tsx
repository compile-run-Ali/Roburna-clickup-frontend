'use client'
import Link from 'next/link'
import { usePermissions } from '@/hooks/usePermissions'

const LandingPage = () => {
  const { user, isAuthenticated } = usePermissions()
  return (
    <div className="min-h-screen roburna-bg-primary">
      {/* Enhanced Header with Roburna Gradient */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 roburna-testnet-gradient opacity-95"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-wide">ROBURNA</h1>
                <p className="text-sm text-white/80 font-medium">Project Management Platform</p>
              </div>
            </div>

            {/* Enhanced Navigation Buttons - Conditional based on auth status */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                // Show user info and dashboard button for logged-in users
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/30">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-white font-medium text-sm">{user?.name}</p>
                      <p className="text-white/60 text-xs">{user?.role}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="roburna-btn-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                // Show login/register buttons for non-authenticated users
                <>
                  <Link
                    href="/login"
                    className="text-white/90 hover:text-white font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="roburna-btn-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Roburna Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 roburna-testnet-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white/90 text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                {isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Next-Generation Project Management'}
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 text-white">
              {isAuthenticated ? (
                <>
                  Ready to Continue
                  <span className="block bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    Your Work?
                  </span>
                </>
              ) : (
                <>
                  Streamline Your
                  <span className="block bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    Project Workflow
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              {isAuthenticated ? (
                `Access your dashboard, manage tasks, and collaborate with your team. 
                Continue where you left off and keep your projects moving forward.`
              ) : (
                `Powerful, intuitive project management platform designed to help teams collaborate seamlessly, 
                track progress efficiently, and deliver exceptional results with confidence.`
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                // Show dashboard and workspace buttons for logged-in users
                <>
                  <Link
                    href="/dashboard"
                    className="group bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white px-10 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:scale-105 border border-white/30"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Go to Dashboard</span>
                    </span>
                  </Link>
                  
                  <Link
                    href="/task-board"
                    className="group border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-md px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Task Board</span>
                    </span>
                  </Link>
                </>
              ) : (
                // Show sign up and login buttons for non-authenticated users
                <>
                  <Link
                    href="/sign-up"
                    className="group bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 border border-white/30"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Start Free Trial</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="group border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-md px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </span>
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-16 flex justify-center items-center space-x-8 text-white/70">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm">Active Users</div>
              </div>
              <div className="w-px h-8 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm">Uptime</div>
              </div>
              <div className="w-px h-8 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 roburna-bg-secondary relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/50 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-green-500/20 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Comprehensive Feature Set
              </span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block roburna-gradient-text">Manage Projects</span>
            </h2>
            <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools your team needs to plan, 
              execute, and deliver projects successfully with enterprise-grade security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="roburna-card group hover:scale-105 transition-all duration-300 p-8">
              <div className="w-14 h-14 roburna-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Task Management</h3>
              <p className="text-white/70 leading-relaxed">
                Create, assign, and track tasks with ease. Set priorities, due dates, and 
                monitor progress in real-time with advanced filtering.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="roburna-card group hover:scale-105 transition-all duration-300 p-8">
              <div className="w-14 h-14 roburna-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Team Collaboration</h3>
              <p className="text-white/70 leading-relaxed">
                Work together seamlessly with your team. Share files, communicate, and 
                collaborate on projects in real-time with integrated chat.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="roburna-card group hover:scale-105 transition-all duration-300 p-8">
              <div className="w-14 h-14 roburna-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Analytics & Reports</h3>
              <p className="text-white/70 leading-relaxed">
                Get insights into your project performance with detailed analytics and 
                customizable reports with AI-powered recommendations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="roburna-card group hover:scale-105 transition-all duration-300 p-8">
              <div className="w-14 h-14 roburna-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Timeline Management</h3>
              <p className="text-white/70 leading-relaxed">
                Plan and visualize project timelines with interactive Gantt charts and 
                milestone tracking with dependency management.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="roburna-card group hover:scale-105 transition-all duration-300 p-8">
              <div className="w-14 h-14 roburna-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Feedback System</h3>
              <p className="text-white/70 leading-relaxed">
                Collect and manage feedback from team members and stakeholders efficiently 
                with automated workflows and notifications.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="roburna-card group hover:scale-105 transition-all duration-300 p-8">
              <div className="w-14 h-14 roburna-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Client Management</h3>
              <p className="text-white/70 leading-relaxed">
                Manage client relationships and project communications in one centralized 
                platform with CRM integration and billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section with Roburna Gradient */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 roburna-testnet-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-white">
              Trusted by Teams
              <span className="block bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of teams who have transformed their project management 
              and achieved unprecedented productivity with Roburna.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">50,000+</div>
                <div className="text-white/80 font-medium">Active Projects</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">200,000+</div>
                <div className="text-white/80 font-medium">Team Members</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">99.9%</div>
                <div className="text-white/80 font-medium">Uptime SLA</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-white/80 font-medium">Expert Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 roburna-bg-secondary relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/30 to-transparent"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="roburna-card-dark p-12 rounded-3xl">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-green-500/20 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Ready to Get Started?
              </span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6">
              Transform Your
              <span className="block roburna-gradient-text">Project Management</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of teams who have already streamlined their workflow and 
              achieved remarkable results with our comprehensive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                // Show workspace buttons for logged-in users
                <>
                  <Link
                    href="/dashboard"
                    className="group roburna-btn-primary px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Open Dashboard</span>
                    </span>
                  </Link>
                  
                  <Link
                    href="/project-management"
                    className="group roburna-btn-secondary px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Manage Projects</span>
                    </span>
                  </Link>
                </>
              ) : (
                // Show sign up and login buttons for non-authenticated users
                <>
                  <Link
                    href="/sign-up"
                    className="group roburna-btn-primary px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Start Free Trial</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="group roburna-btn-secondary px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </span>
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-12 flex justify-center items-center space-x-6 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer with Roburna Theme */}
      <footer className="relative bg-slate-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 roburna-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">ROBURNA</h3>
                  <p className="text-white/60">Project Management Platform</p>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed max-w-md">
                Empowering teams worldwide to deliver exceptional projects with our 
                comprehensive, intuitive project management platform.
              </p>
            </div>
            
            {/* Quick Links - Conditional based on auth status */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {isAuthenticated ? (
                  // Show workspace links for logged-in users
                  <>
                    <li><Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">Dashboard</Link></li>
                    <li><Link href="/task-board" className="text-white/70 hover:text-white transition-colors">Task Board</Link></li>
                    <li><Link href="/project-management" className="text-white/70 hover:text-white transition-colors">Projects</Link></li>
                    <li><Link href="/performance" className="text-white/70 hover:text-white transition-colors">Performance</Link></li>
                  </>
                ) : (
                  // Show auth links for non-authenticated users
                  <>
                    <li><Link href="/login" className="text-white/70 hover:text-white transition-colors">Login</Link></li>
                    <li><Link href="/sign-up" className="text-white/70 hover:text-white transition-colors">Sign Up</Link></li>
                    <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
                    <li><a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a></li>
                  </>
                )}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-white/60">
                  © 2025 Roburna Labs. All rights reserved.
                </p>
                <p className="text-sm text-white/40 mt-1">
                  Built with ❤️ for teams who build amazing things.
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-white/60">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
  )
}

export default LandingPage
