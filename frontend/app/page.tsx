import { ArrowRight, Building2, ShieldCheck, Zap, CreditCard, Users, BarChart3, FileText, Home, MessageSquare, Bell, Wallet } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  const features = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Easy Online Payments",
      description: "Pay rent securely via M-Pesa, credit card, or record cash payments with instant verification"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Digital Receipts",
      description: "Get instant digital receipts for all payments, accessible anytime from your dashboard"
    },
    {
      icon: <Home className="h-8 w-8" />,
      title: "Maintenance Requests",
      description: "Submit maintenance requests online and track repair status in real-time"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Payment History",
      description: "View your complete payment history, current balance, and upcoming rent due dates"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Direct Communication",
      description: "Message building management directly through the portal for quick responses"
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your personal data is protected with bank-level encryption and privacy controls"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Building Announcements",
      description: "Stay updated with important building notices, events, and policy changes"
    },
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Balance Tracking",
      description: "Monitor your account balance, payment status, and water bill calculations"
    }
  ]

  const tenantBenefits = [
    "Pay rent online 24/7 from anywhere",
    "Download receipts instantly after payment",
    "Submit maintenance requests with photos",
    "Track your payment history anytime",
    "Receive important building announcements",
    "Message management directly through portal",
    "View water consumption and bills",
    "Access your account on any device"
  ]

  const apartments = [
    { floor: "Ground Floor", units: "1A1, 1A2, 1B1, 1B2" },
    { floor: "First Floor", units: "2A1, 2A2, 2B1, 2B2" },
    { floor: "Second Floor", units: "3A1, 3A2, 3B1, 3B2" },
    { floor: "Third Floor", units: "4A1, 4A2, 4B1, 4B2" },
    { floor: "Fourth Floor", units: "5A1, 5A2, 5B1, 5B2" },
    { floor: "Rooftop", units: "6A1, 6A2 (Two Bedrooms)" },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section - UPDATED FOR TENANTS */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Montez A Apartments - Kizito Road</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to Your
              <span className="gradient-text block">Tenant Portal</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your convenient online portal for Montez A Apartments. Pay rent, track payments, 
              view receipts, submit maintenance requests, and stay connected with building management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="btn-primary gap-2">
                  Tenant Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  See Features
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats - UPDATED FOR TENANT FOCUS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">26</div>
                <p className="text-sm text-muted-foreground">Apartments</p>
              </CardContent>
            </Card>
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">24/7</div>
                <p className="text-sm text-muted-foreground">Portal Access</p>
              </CardContent>
            </Card>
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">Instant</div>
                <p className="text-sm text-muted-foreground">Digital Receipts</p>
              </CardContent>
            </Card>
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">Secure</div>
                <p className="text-sm text-muted-foreground">Online Payments</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tenant Benefits Section - NEW SECTION */}
      <section className="py-16 bg-secondary-900/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Benefits for Tenants</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your apartment experience
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenantBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - UPDATED FOR TENANTS */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Portal Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All the tools you need for a seamless apartment living experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover glass-effect">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apartments Section */}
      <section className="py-20 bg-secondary-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Montez A Apartments</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              5 floors with 26 premium apartments along Kizito Road
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {apartments.map((apt, index) => (
              <Card key={index} className="neumorphic">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 gradient-text">{apt.floor}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Apartment Units</p>
                  <div className="flex flex-wrap gap-2">
                    {apt.units.split(', ').map((unit, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {unit}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - UPDATED FOR TENANTS */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="gradient-border max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Access Your Account?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Login to your tenant portal to pay rent, submit maintenance requests, 
                view your payment history, and stay connected with building management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="btn-primary gap-2">
                    Tenant Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="mailto:management@monteza.com">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    Contact Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-800 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold gradient-text">Montez A Apartments</h3>
              <p className="text-sm text-muted-foreground">Kizito Road • Tenant Portal</p>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>For support: <a href="mailto:support@monteza.com" className="text-primary hover:underline">support@monteza.com</a></p>
              <p className="mt-1">© {new Date().getFullYear()} Montez A Property Management. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}