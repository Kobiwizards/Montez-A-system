import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { 
  CreditCard, 
  Droplets, 
  Home, 
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react'

interface QuickStatsProps {
  rentAmount?: number
  waterBill?: number
  daysInApartment?: number
  lastPaymentDate?: string
  paymentsThisMonth?: number
  pendingPayments?: number
  className?: string
}

export function QuickStats({
  rentAmount = 0,
  waterBill = 0,
  daysInApartment = 0,
  lastPaymentDate,
  paymentsThisMonth = 0,
  pendingPayments = 0,
  className
}: QuickStatsProps) {
  const stats = [
    {
      title: "Monthly Rent",
      value: formatCurrency(rentAmount),
      icon: <Home className="h-4 w-4" />,
      color: "bg-blue-500/10 text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Water Bill",
      value: formatCurrency(waterBill),
      icon: <Droplets className="h-4 w-4" />,
      color: "bg-cyan-500/10 text-cyan-600",
      borderColor: "border-cyan-200"
    },
    {
      title: "Days in Apartment",
      value: daysInApartment.toString(),
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-purple-500/10 text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Payments This Month",
      value: paymentsThisMonth.toString(),
      icon: <CreditCard className="h-4 w-4" />,
      color: "bg-green-500/10 text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Pending Payments",
      value: pendingPayments.toString(),
      icon: <Clock className="h-4 w-4" />,
      color: "bg-yellow-500/10 text-yellow-600",
      borderColor: "border-yellow-200"
    },
    {
      title: "Last Payment",
      value: lastPaymentDate ? formatDate(lastPaymentDate, 'short') : 'Never',
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "bg-emerald-500/10 text-emerald-600",
      borderColor: "border-emerald-200"
    },
  ]

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={cn(
            "border transition-all hover:shadow-md",
            stat.borderColor
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={cn("p-2 rounded-full", stat.color)}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}