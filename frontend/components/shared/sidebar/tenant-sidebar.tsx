import Link from 'next/link'
import {
  Home,
  CreditCard,
  FileText,
  User,
  Upload,
  History,
  Calculator,
  HelpCircle,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TenantSidebarProps {
  collapsed: boolean
  pathname: string
}

const tenantNavItems = [
  { href: '/tenant/dashboard', label: 'Dashboard', icon: Home },
  { href: '/tenant/payments/new', label: 'Make Payment', icon: Upload },
  { href: '/tenant/payments', label: 'Payment History', icon: History },
  { href: '/tenant/receipts', label: 'Receipts', icon: Receipt },
  { href: '/tenant/water-calculator', label: 'Water Calculator', icon: Calculator },
  { href: '/tenant/profile', label: 'Profile', icon: User },
  { href: '/tenant/instructions', label: 'Instructions', icon: HelpCircle },
]

export function TenantSidebar({ collapsed, pathname }: TenantSidebarProps) {
  return (
    <div className="space-y-1 px-3">
      {tenantNavItems.map((item) => {
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

      {/* Payment Status */}
      {!collapsed && (
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="text-xs text-muted-foreground mb-2">Quick Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Balance Due</span>
              <span className="font-semibold">KSh 15,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next Payment</span>
              <span className="text-sm text-success">On Time</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}