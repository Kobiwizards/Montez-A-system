"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from './admin-sidebar'
import { TenantSidebar } from './tenant-sidebar'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show sidebar on login page or if not logged in
  if (pathname === '/login' || !user) {
    return null
  }

  return (
    <div
      className={cn(
        "relative border-r bg-card transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-primary text-white rounded-full p-1 shadow-lg hover:bg-primary/90 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* ✅ FIXED: Changed from 'ADMIN' to 'admin' */}
      <div className="flex-1 overflow-y-auto py-6">
        {user?.role === 'admin' ? (
          <AdminSidebar collapsed={collapsed} pathname={pathname} />
        ) : (
          <TenantSidebar collapsed={collapsed} pathname={pathname} />
        )}
      </div>
    </div>
  )
}