"use client"

import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  Camera,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Download,
  MessageSquare,
  User,
  Calendar,
  Banknote,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Payment Instructions Guide</h1>
          <p className="text-muted-foreground">
            Complete step-by-step guide for making payments at Montez A Apartments
          </p>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Easy Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload M-Pesa screenshots or cash receipt photos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold">24/7 Access</h3>
                <p className="text-sm text-muted-foreground">
                  Submit payments anytime from anywhere
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold">Auto Receipts</h3>
                <p className="text-sm text-muted-foreground">
                  Download digital receipts instantly after verification
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Complete Payment Process
                </CardTitle>
                <CardDescription>
                  Follow these 5 simple steps to make your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary-800/30">
                    <Badge className="h-8 w-8 flex items-center justify-center text-lg">1</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Make Your Payment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">M-Pesa Option</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                            <li>• Go to M-Pesa menu</li>
                            <li>• Select "Lipa Na M-Pesa"</li>
                            <li>• Enter Paybill: <strong>247247</strong></li>
                            <li>• Account: Your apartment number</li>
                            <li>• Amount: Your rent/water bill</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Cash Option</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                            <li>• Pay cash to caretaker</li>
                            <li>• Get a signed receipt</li>
                            <li>• Ensure receipt shows:</li>
                            <li>  - Amount paid</li>
                            <li>  - Date of payment</li>
                            <li>  - Caretaker signature</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary-800/30">
                    <Badge className="h-8 w-8 flex items-center justify-center text-lg">2</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Capture Proof</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">M-Pesa Screenshot</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Take a screenshot of the M-Pesa confirmation message showing:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 mt-2 pl-4">
                            <li>• Transaction amount</li>
                            <li>• Transaction date & time</li>
                            <li>• Transaction code (starts with RF)</li>
                            <li>• Your phone number</li>
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Cash Receipt Photo</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Take a clear photo of the receipt showing:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 mt-2 pl-4">
                            <li>• Amount paid</li>
                            <li>• Payment date</li>
                            <li>• Caretaker signature</li>
                            <li>• Receipt number (if any)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary-800/30">
                    <Badge className="h-8 w-8 flex items-center justify-center text-lg">3</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Submit on Portal</h4>
                      <ol className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="font-medium">1.</span>
                          <span>Go to <Link href="/tenant/payments/new" className="text-primary hover:underline">"Make Payment"</Link> page</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">2.</span>
                          <span>Select payment type (Rent/Water)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">3.</span>
                          <span>Enter amount and select month</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">4.</span>
                          <span>Choose payment method (M-Pesa/Cash)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">5.</span>
                          <span>Upload your screenshot/photo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium">6.</span>
                          <span>Click "Submit Payment"</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary-800/30">
                    <Badge className="h-8 w-8 flex items-center justify-center text-lg">4</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Wait for Verification</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Processing Time</p>
                            <p className="text-sm text-muted-foreground">
                              Payments are verified within <strong>24-48 hours</strong> during weekdays
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Status Updates</p>
                            <p className="text-sm text-muted-foreground">
                              You'll receive a notification once your payment is verified
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary-800/30">
                    <Badge className="h-8 w-8 flex items-center justify-center text-lg">5</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Download Receipt</h4>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Once verified, download your receipt from the <Link href="/tenant/receipts" className="text-primary hover:underline">Receipts</Link> page
                        </p>
                        <div className="flex items-center gap-3">
                          <Download className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Receipt Contains</p>
                            <p className="text-sm text-muted-foreground">
                              Your details, payment information, and official Montez A stamp
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How long does verification take?</h4>
                    <p className="text-sm text-muted-foreground">
                      Usually within 24 hours on weekdays. Weekend payments may take until Monday.
                    </p>
                  </div>
                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">What if my screenshot is blurry?</h4>
                    <p className="text-sm text-muted-foreground">
                      You can upload multiple screenshots to ensure all details are clear. If too blurry, admin may request a new screenshot.
                    </p>
                  </div>
                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Can I pay for multiple months at once?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! Specify the months in the description field (e.g., "January & February 2024 rent") and upload proof for the total amount.
                    </p>
                  </div>
                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">What about water bills?</h4>
                    <p className="text-sm text-muted-foreground">
                      Water payments are processed the same way. Select "Water" as payment type and include water bill details in description.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/tenant/payments/new">
                  <Button className="w-full justify-start gap-2">
                    <Upload className="h-4 w-4" />
                    Make Payment Now
                  </Button>
                </Link>
                
                <Link href="/tenant/payments">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Clock className="h-4 w-4" />
                    View Payment History
                  </Button>
                </Link>

                <Link href="/tenant/receipts">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Download Receipts
                  </Button>
                </Link>

                <Link href="/tenant/dashboard">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="h-5 w-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="p-1">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  </div>
                  <p className="text-sm">Keep original receipts until payment is verified</p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  </div>
                  <p className="text-sm">Payments are due by the 5th of each month</p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  </div>
                  <p className="text-sm">Late payments incur a KSh 500 penalty after 5th</p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  </div>
                  <p className="text-sm">Contact admin if verification takes more than 48 hours</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium mb-1">Admin Contact</p>
                  <p className="text-xs text-muted-foreground">
                    Email: admin@monteza.com
                    <br />
                    Phone: 0700 000 000
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                  <p className="text-sm font-medium mb-1">Caretaker (Mwarabu)</p>
                  <p className="text-xs text-muted-foreground">
                    Phone: 0712 345 678
                    <br />
                    Available: 8AM - 6PM Daily
                  </p>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  For urgent matters, please call directly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
