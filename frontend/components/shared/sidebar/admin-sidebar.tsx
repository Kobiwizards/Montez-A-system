import Link from 'next/link'
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Settings,
  Users,
  Droplets,
  Bell,
  Shield,
  Download,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  collapsed: boolean
  pathname: string
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/tenants', label: 'Tenants', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/payments/pending', label: 'Pending', icon: Bell },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/water-bills', label: 'Water Bills', icon: Droplets },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar({ collapsed, pathname }: AdminSidebarProps) {
  return (
    <div className="space-y-1 px-3">
      {adminNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "hover:bg-secondary-800 hover:text-foreground",
              collapsed ? "justify-center" : ""
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}

      {/* Quick Actions */}
      {!collapsed && (
        <div className="mt-8 pt-6 border-t border-secondary-800">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-secondary-800 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-secondary-800 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Reports</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-secondary-800 transition-colors">
              <Shield className="h-4 w-4" />
              <span>Admin Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}