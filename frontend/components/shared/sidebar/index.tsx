"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminSidebar } from './admin-sidebar'
import { TenantSidebar } from './tenant-sidebar'
import { useAuth } from '../auth-provider'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-secondary-800 bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto py-6">
        {user?.role === 'admin' ? (
          <AdminSidebar collapsed={collapsed} pathname={pathname} />
        ) : (
          <TenantSidebar collapsed={collapsed} pathname={pathname} />
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-secondary-800 p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-secondary-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}