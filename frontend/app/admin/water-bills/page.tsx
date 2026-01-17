"use client"

import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminWaterBillsPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Water Bills Management</h1>
          <p className="text-muted-foreground">Manage water readings and bill calculations</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Water Bills</CardTitle>
            <CardDescription>Water consumption and billing management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>Water bills management - Coming Soon</p>
              <p className="text-sm mt-2">This page will manage water meter readings and bill generation</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
