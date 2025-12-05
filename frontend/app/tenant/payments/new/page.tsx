"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  CreditCard, 
  Cash, 
  Smartphone, 
  AlertCircle,
  CheckCircle,
  FileText
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
import { CashPaymentForm } from '@/components/tenant/cash-payment-form'
import { useToast } from '@/lib/hooks/use-toast'

const PAYMENT_TYPES = [
  { id: 'rent', label: 'Rent Payment', amount: 15000, description: 'Monthly apartment rent' },
  { id: 'water', label: 'Water Bill', amount: 0, description: 'Water consumption bill' },
  { id: 'other', label: 'Other Payment', amount: 0, description: 'Miscellaneous payments' },
]

const PAYMENT_METHODS = [
  { id: 'mpesa', label: 'M-Pesa', icon: Smartphone, description: 'Mobile money transfer' },
  { id: 'cash', label: 'Cash', icon: Cash, description: 'Physical cash payment' },
  { id: 'bank', label: 'Bank Transfer', icon: CreditCard, description: 'Direct bank transfer' },
]

export default function NewPaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [paymentType, setPaymentType] = useState('rent')
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [amount, setAmount] = useState('15000')
  const [month, setMonth] = useState('')
  const [description, setDescription] = useState('')
  const [transactionCode, setTransactionCode] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Payment Submitted!",
        description: "Your payment has been submitted for verification.",
      })
      
      router.push('/tenant/payments')
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentMonth = () => {
    const date = new Date()
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
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
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="mb-2">
                            <div className="text-lg font-semibold">
                              KSh {type.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {type.label}
                            </div>
                          </div>
                          <div className="text-xs text-center">
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="month">Payment Month</Label>
                    <Input
                      id="month"
                      type="month"
                      value={month || getCurrentMonth()}
                      onChange={(e) => setMonth(e.target.value)}
                      required
                    />
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
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Icon className="h-6 w-6 mb-2" />
                          <div className="text-sm font-semibold">{method.label}</div>
                          <div className="text-xs text-center text-muted-foreground mt-1">
                            {method.description}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>

                {/* M-Pesa Specific Fields */}
                {paymentMethod === 'mpesa' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="transactionCode">M-Pesa Transaction Code</Label>
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
                          defaultValue="0712345678"
                          required
                        />
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please ensure the transaction code matches your M-Pesa confirmation message.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Cash Payment Form */}
                {paymentMethod === 'cash' && (
                  <CashPaymentForm />
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
                  Upload screenshots or documents as proof of payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesChange={setFiles}
                  maxFiles={5}
                  accept="image/*,.pdf"
                />
                
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Upload Guidelines</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Clear screenshots of M-Pesa confirmation messages</li>
                        <li>• Bank transfer slips or receipts</li>
                        <li>• Cash payment receipts with caretaker signature</li>
                        <li>• Multiple files can be uploaded for a single payment</li>
                        <li>• Maximum file size: 5MB each</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-lg bg-secondary-800/50 border border-secondary-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">Ready to submit</p>
                  <p className="text-sm text-muted-foreground">
                    {files.length} file(s) attached • Amount: KSh {parseInt(amount).toLocaleString()}
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
                  className="btn-primary gap-2"
                  disabled={isSubmitting || files.length === 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment'}
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