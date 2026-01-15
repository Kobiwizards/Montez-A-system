"use client"

import { useState } from 'react'
import { Calculator, Droplets, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/shared/header'

export default function WaterCalculatorPage() {
  const [currentReading, setCurrentReading] = useState('')
  const [previousReading, setPreviousReading] = useState('')
  const [units, setUnits] = useState(0)
  const [amount, setAmount] = useState(0)
  const [rate] = useState(150) // KSh per unit
  
  const calculateWaterBill = () => {
    const current = parseFloat(currentReading) || 0
    const previous = parseFloat(previousReading) || 0
    
    if (current < previous) {
      alert('Error: Current reading cannot be less than previous reading')
      return
    }
    
    const calculatedUnits = current - previous
    const calculatedAmount = calculatedUnits * rate
    
    setUnits(calculatedUnits)
    setAmount(calculatedAmount)
  }
  
  const resetCalculator = () => {
    setCurrentReading('')
    setPreviousReading('')
    setUnits(0)
    setAmount(0)
  }

  // Example calculation
  const calculateExample = () => {
    setPreviousReading('1250')
    setCurrentReading('1285')
    const calculatedUnits = 1285 - 1250
    setUnits(calculatedUnits)
    setAmount(calculatedUnits * rate)
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto p-6 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/tenant/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            Water Bill Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate your water bill based on meter readings. Rate: KSh {rate} per unit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Card */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Enter Meter Readings
              </CardTitle>
              <CardDescription>
                Input your current and previous meter readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="previous">Previous Meter Reading</Label>
                  <Input
                    id="previous"
                    type="number"
                    placeholder="e.g., 1250"
                    value={previousReading}
                    onChange={(e) => setPreviousReading(e.target.value)}
                    min="0"
                    step="0.1"
                    className="input-focus"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your last recorded meter reading
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current">Current Meter Reading</Label>
                  <Input
                    id="current"
                    type="number"
                    placeholder="e.g., 1285"
                    value={currentReading}
                    onChange={(e) => setCurrentReading(e.target.value)}
                    min="0"
                    step="0.1"
                    className="input-focus"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your current meter reading
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={calculateWaterBill} className="flex-1 btn-primary">
                  Calculate Bill
                </Button>
                <Button onClick={calculateExample} variant="outline">
                  Load Example
                </Button>
                <Button onClick={resetCalculator} variant="ghost">
                  Reset
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Note:</strong> Water is billed at KSh {rate} per unit. 
                  One unit = 1000 liters (1 cubic meter).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculation Results
              </CardTitle>
              <CardDescription>
                Your water consumption and bill amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Summary Box */}
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Units Consumed</p>
                    <p className="text-3xl font-bold text-primary">{units.toFixed(1)} units</p>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    =
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">KSh {amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Previous Reading:</span>
                    <span className="font-medium">{previousReading || '0'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Current Reading:</span>
                    <span className="font-medium">{currentReading || '0'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Rate per Unit:</span>
                    <span className="font-medium">KSh {rate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Units Consumed:</span>
                    <span className="font-bold">{units.toFixed(1)} units</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-primary/20">
                    <span className="text-lg font-bold">Total Bill:</span>
                    <span className="text-3xl font-bold text-primary">
                      KSh {amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Display */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculation Formula:
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  (Current Reading - Previous Reading) × Rate = Total Bill
                </p>
                {currentReading && previousReading && (
                  <div className="bg-white p-3 rounded border font-mono text-sm">
                    ({currentReading} - {previousReading}) × {rate} = KSh {amount.toFixed(2)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Billing Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>Readings taken around 25th of each month</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>Bills generated by 1st of following month</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>Payment due with monthly rent</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span>Ensure meter is accessible for monthly reading</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span>Report meter issues immediately to management</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span>Keep your own records of meter readings</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  For questions about water bills or meter readings:
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="mailto:management@monteza.com">
                      Email Management
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/tenant/instructions">
                      View Instructions
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Scenarios */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sample Calculations</CardTitle>
            <CardDescription>Common water usage scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Low Usage</h4>
                <p className="text-sm text-muted-foreground mb-2">Previous: 1000, Current: 1003</p>
                <div className="font-mono text-sm">
                  (1003 - 1000) × 150 = KSh 450
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Average Usage</h4>
                <p className="text-sm text-muted-foreground mb-2">Previous: 1250, Current: 1285</p>
                <div className="font-mono text-sm">
                  (1285 - 1250) × 150 = KSh 5,250
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">High Usage</h4>
                <p className="text-sm text-muted-foreground mb-2">Previous: 2000, Current: 2040</p>
                <div className="font-mono text-sm">
                  (2040 - 2000) × 150 = KSh 6,000
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
