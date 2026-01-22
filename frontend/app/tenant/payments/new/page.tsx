"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Home,
  Droplets,
  RefreshCw
} from 'lucide-react'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/shared/file-upload'
import { useToast } from '@/lib/hooks/use-toast'
import { paymentApi } from '@/lib/api/payment'
import { useAuth } from '@/components/shared/auth-provider'
import { tenantApi } from '@/lib/api/tenant'

const PAYMENT_TYPES = [
  { id: 'RENT', label: 'Rent Payment', description: 'Monthly apartment rent' },
  { id: 'WATER', label: 'Water Bill', description: 'Water consumption bill' },
  { id: 'OTHER', label: 'Other Payment', description: 'Miscellaneous payments' },
]

const PAYMENT_METHODS = [
  { id: 'MPESA', label: 'M-Pesa', icon: Smartphone, description: 'Mobile money transfer' },
  { id: 'CASH', label: 'Cash', icon: Banknote, description: 'Physical cash payment' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: CreditCard, description: 'Direct bank transfer' },
]

export default function NewPaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [paymentType, setPaymentType] = useState('RENT')
  const [paymentMethod, setPaymentMethod] = useState('MPESA')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState('')
  const [description, setDescription] = useState('')
  const [transactionCode, setTransactionCode] = useState('')
  const [caretakerName, setCaretakerName] = useState('Mwarabu')
  const [files, setFiles] = useState<File[]>([])
  const [tenantInfo, setTenantInfo] = useState<any>(null)

  useEffect(() => {
    fetchTenantInfo()
    setMonth(getCurrentMonth())
  }, [])

  useEffect(() => {
    // Set default amount based on payment type and tenant info
    if (paymentType === 'RENT' && tenantInfo?.rentAmount) {
      setAmount(tenantInfo.rentAmount.toString())
    } else if (paymentType === 'WATER') {
      setAmount('750') // Default water amount
    } else {
      setAmount('')
    }
  }, [paymentType, tenantInfo])

  const fetchTenantInfo = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching tenant info...')
      
      const dashboardResponse = await tenantApi.getDashboard()
      
      if (dashboardResponse.success) {
        setTenantInfo(dashboardResponse.data?.tenant)
        console.log('✅ Tenant info loaded:', dashboardResponse.data?.tenant)
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching tenant info:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your information',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentMonth = () => {
    const date = new Date()
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (files.length === 0 && paymentMethod !== 'CASH') {
      toast({
        title: 'Missing Proof',
        description: 'Please upload payment proof (screenshot or receipt)',
        variant: 'destructive',
      })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      })
      return
    }

    if (!month) {
      toast({
        title: 'Month Required',
        description: 'Please select a payment month',
        variant: 'destructive',
      })
      return
    }

    if (paymentMethod === 'MPESA' && !transactionCode) {
      toast({
        title: 'Transaction Code Required',
        description: 'Please enter your M-Pesa transaction code',
        variant: 'destructive',
      })
      return
    }

    if (paymentMethod === 'CASH' && !caretakerName) {
      toast({
        title: 'Caretaker Required',
        description: 'Please enter the caretaker\'s name',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      console.log('📤 Submitting payment...', {
        type: paymentType,
        method: paymentMethod,
        amount,
        month,
        description,
        transactionCode,
        caretakerName,
        files: files.length
      })

      const paymentData = {
        type: paymentType as 'RENT' | 'WATER' | 'OTHER',
        method: paymentMethod as 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK',
        amount: parseFloat(amount),
        month,
        description,
        transactionCode: paymentMethod === 'MPESA' ? transactionCode : undefined,
        caretakerName: paymentMethod === 'CASH' ? caretakerName : undefined,
        screenshots: files
      }

      const response = await paymentApi.createPayment(paymentData)
      
      console.log('✅ Payment submission response:', response)

      if (response.success) {
        toast({
          title: "Payment Submitted!",
          description: "Your payment has been submitted for verification.",
          variant: "default"
        })

        // Redirect after showing toast
        setTimeout(() => {
          router.push('/tenant/payments')
        }, 2000)
      } else {
        throw new Error(response.message || 'Submission failed')
      }
    } catch (error: any) {
      console.error('❌ Payment submission error:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'RENT': return <Home className="h-5 w-5" />
      case 'WATER': return <Droplets className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading payment form...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tenant Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{tenantInfo?.name || user?.name}</p>
                <p className="text-sm text-gray-600">
                  Apartment {tenantInfo?.apartment || user?.apartment} • 
                  Rent: KSh {tenantInfo?.rentAmount?.toLocaleString() || '15,000'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchTenantInfo}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Submit Payment</h1>
            <p className="text-muted-foreground">
              Upload payment proof or record cash payments
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Select payment type and enter amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Type */}
                <div className="space-y-4">
                  <Label>Payment Type</Label>
                  <RadioGroup
                    value={paymentType}
                    onValueChange={setPaymentType}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {PAYMENT_TYPES.map((type) => (
                      <div key={type.id}>
                        <RadioGroupItem
                          value={type.id}
                          id={type.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={type.id}
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {getPaymentTypeIcon(type.id)}
                            <div className="text-sm font-semibold">
                              {type.label}
                            </div>
                          </div>
                          <div className="text-xs text-center text-gray-500">
                            {type.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Amount and Month */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KSh)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                      step="0.01"
                    />
                    {paymentType === 'RENT' && tenantInfo?.rentAmount && (
                      <p className="text-xs text-gray-500">
                        Your rent is KSh {tenantInfo.rentAmount.toLocaleString()} per month
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month">Payment Month</Label>
                    <Input
                      id="month"
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Format: YYYY-MM (e.g., 2024-01)
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any notes about this payment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  How are you making this payment?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    return (
                      <div key={method.id}>
                        <RadioGroupItem
                          value={method.id}
                          id={`method-${method.id}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`method-${method.id}`}
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Icon className="h-6 w-6 mb-2" />
                          <div className="text-sm font-semibold">{method.label}</div>
                          <div className="text-xs text-center text-gray-500 mt-1">
                            {method.description}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>

                {/* M-Pesa Specific Fields */}
                {paymentMethod === 'MPESA' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="transactionCode">M-Pesa Transaction Code *</Label>
                        <Input
                          id="transactionCode"
                          placeholder="e.g., RF48H9J2K3"
                          value={transactionCode}
                          onChange={(e) => setTransactionCode(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="0712 345 678"
                          defaultValue={user?.phone || ''}
                          required
                        />
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Please ensure the transaction code matches your M-Pesa confirmation message exactly.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Cash Payment Fields */}
                {paymentMethod === 'CASH' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="caretakerName">
                          <User className="h-4 w-4 inline mr-2" />
                          Caretaker Name *
                        </Label>
                        <Input
                          id="caretakerName"
                          placeholder="Enter caretaker's name"
                          value={caretakerName}
                          onChange={(e) => setCaretakerName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cashDate">Payment Date</Label>
                        <Input
                          id="cashDate"
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Please upload a clear photo of the receipt provided by the caretaker.
                        Ensure the receipt shows amount, date, and caretaker's signature.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Bank Transfer Fields */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bankReference">Bank Reference Number *</Label>
                        <Input
                          id="bankReference"
                          placeholder="Bank transaction reference"
                          value={transactionCode}
                          onChange={(e) => setTransactionCode(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankDate">Transfer Date</Label>
                        <Input
                          id="bankDate"
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Upload a screenshot of your bank transfer confirmation.
                        Include reference number, amount, and date.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Payment Proof
                </CardTitle>
                <CardDescription>
                  {paymentMethod === 'CASH' 
                    ? 'Upload cash receipt from caretaker'
                    : 'Upload screenshots or documents as proof of payment'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesChange={setFiles}
                  maxFiles={5}
                  accept="image/*,.pdf"
                />

                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Upload Guidelines</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Clear screenshots of M-Pesa confirmation messages</li>
                        <li>• Cash payment receipts with caretaker signature</li>
                        <li>• Bank transfer confirmations with reference numbers</li>
                        <li>• Multiple files can be uploaded for a single payment</li>
                        <li>• Maximum file size: 5MB each</li>
                        <li>• Accepted formats: JPG, PNG, PDF</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-lg bg-gray-50 border border-gray-200">      
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Ready to submit</p>
                  <p className="text-sm text-gray-600">
                    {files.length} file(s) attached • Amount: KSh {parseFloat(amount || '0').toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={submitting || files.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}