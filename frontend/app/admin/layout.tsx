"use client"

import { ReactNode, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Log EVERYTHING for debugging
    console.log('='.repeat(50))
    console.log('🔍 ADMIN LAYOUT DEBUG:')
    console.log('isLoading:', isLoading)
    console.log('isAuthenticated:', isAuthenticated)
    console.log('User object:', user)
    console.log('User role:', user?.role)
    console.log('User role type:', typeof user?.role)
    console.log('User role uppercase:', user?.role?.toUpperCase())
    console.log('LocalStorage token:', localStorage.getItem('token'))
    console.log('LocalStorage user:', localStorage.getItem('user'))
    console.log('='.repeat(50))

    // Wait for loading to complete
    if (isLoading) {
      console.log('⏳ Still loading auth state...')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('❌ Not authenticated - redirecting to login')
      router.push('/login')
      return
    }

    // Check if user has admin role
    const userRole = user?.role?.toString().toUpperCase()
    if (userRole !== 'ADMIN') {
      console.log(`❌ Role check failed - got "${userRole}" but expected "ADMIN"`)
      router.push('/login')
      return
    }

    console.log('✅ Admin access GRANTED!')
  }, [isAuthenticated, user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
          <p className="text-xs text-muted-foreground mt-2">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or not admin, show access denied
  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">You don't have permission to access this page.</p>
          <div className="text-left text-sm text-red-500 bg-white p-3 rounded border border-red-200">
            <p className="font-mono">Debug Info:</p>
            <p>isAuthenticated: {String(isAuthenticated)}</p>
            <p>User exists: {user ? 'Yes' : 'No'}</p>
            <p>User role: {user?.role || 'undefined'}</p>
            <p>Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Render admin layout
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}