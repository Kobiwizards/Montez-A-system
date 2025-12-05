import { ArrowRight, Building2, ShieldCheck, Zap, CreditCard, Users, BarChart3, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  const features = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Easy Payment Processing",
      description: "Upload M-Pesa screenshots or record cash payments with caretaker verification"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description: "Track occupancy rates, payment status, and financial reports in real-time"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Automated Receipts",
      description: "Generate and download professional receipts for all transactions"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Tenant Portal",
      description: "Dedicated portal for tenants to view balances, upload payments, and access receipts"
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Secure & Reliable",
      description: "Bank-level security with encrypted data storage and backup"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Automated Water Bills",
      description: "Calculate water bills automatically based on units consumed"
    }
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Montez A Apartments - Kizito Road</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Modern Property
              <span className="gradient-text block">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline rent collection, automate receipts, and manage 26 apartments with our 
              professional management platform designed specifically for Montez A.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="btn-primary gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">26</div>
                <p className="text-sm text-muted-foreground">Total Apartments</p>
              </CardContent>
            </Card>
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">KSh 423K</div>
                <p className="text-sm text-muted-foreground">Monthly Collection</p>
              </CardContent>
            </Card>
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">100%</div>
                <p className="text-sm text-muted-foreground">Digital Payments</p>
              </CardContent>
            </Card>
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold gradient-text">24/7</div>
                <p className="text-sm text-muted-foreground">System Access</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete solution for modern property management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="gradient-border max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our modern property management system today and experience seamless rent collection,
                automated receipts, and real-time analytics.
              </p>
              <Link href="/login">
                <Button size="lg" className="btn-primary gap-2">
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-800 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold gradient-text">Montez A Management</h3>
              <p className="text-sm text-muted-foreground">Kizito Road, Professional Property Management</p>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Montez A Property Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}