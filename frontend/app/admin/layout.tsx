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
    console.log('🔍 Admin Layout Auth Check:', {
      isLoading,
      isAuthenticated,
      user: user ? {
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      } : null
    })

    // Wait for loading to complete
    if (isLoading) return

    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // Check if user has admin role (case insensitive)
    const userRole = user?.role?.toString().toUpperCase()
    if (userRole !== 'ADMIN') {
      console.log(`❌ Not admin (role: ${userRole}), redirecting to login`)
      router.push('/login')
      return
    }

    console.log('✅ Admin access granted')
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

  // If not authenticated or not admin, show nothing (will redirect)
  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Access denied. Redirecting to login...</p>
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