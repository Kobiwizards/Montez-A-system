"use client"

import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">View building performance and financial analytics</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Building performance metrics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>Analytics dashboard - Coming Soon</p>
              <p className="text-sm mt-2">This page will show occupancy rates, payment trends, and financial reports</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
