import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  currentBalance: number
  totalPaid: number
  totalDue: number
  nextPaymentDate?: string
  className?: string
}

export function BalanceCard({
  currentBalance,
  totalPaid,
  totalDue,
  nextPaymentDate,
  className
}: BalanceCardProps) {
  const paymentProgress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0
  const isOverdue = currentBalance > 0
  const hasCredit = currentBalance < 0
  
  return (
    <Card className={cn("border-2", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Balance Overview</span>
          <Badge 
            variant={isOverdue ? "destructive" : hasCredit ? "success" : "default"}
            className="ml-2"
          >
            {isOverdue ? 'Overdue' : hasCredit ? 'Credit' : 'Current'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className={cn(
              "text-2xl font-bold",
              isOverdue ? "text-destructive" : 
              hasCredit ? "text-green-500" : 
              "text-foreground"
            )}>
              {formatCurrency(Math.abs(currentBalance))}
            </span>
          </div>
          
          {currentBalance > 0 && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              ⚠️ Balance overdue. Please make payment to avoid penalties.
            </div>
          )}
          
          {currentBalance < 0 && (
            <div className="text-sm text-green-600 bg-green-500/10 p-2 rounded">
              ✅ You have credit balance. This will be applied to your next payment.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
          </div>
          <Progress value={paymentProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Paid: {formatCurrency(totalPaid)}</span>
            <span>Due: {formatCurrency(totalDue)}</span>
          </div>
        </div>

        {nextPaymentDate && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Next Payment Due</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(nextPaymentDate).toLocaleDateString('en-KE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.ceil((new Date(nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
