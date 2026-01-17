"use client"

import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPaymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payments Management</h1>
          <p className="text-muted-foreground">View and manage all tenant payments</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>All payment transactions will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>Payments management page - Coming Soon</p>
              <p className="text-sm mt-2">This page will show all payment transactions from tenants</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
