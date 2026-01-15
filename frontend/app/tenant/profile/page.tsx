"use client"

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Home, Calendar, FileText, AlertCircle, Edit, Save, X, Key } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/components/shared/auth-provider'

export default function TenantProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    notes: ''
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        notes: user.notes || ''
      })
    }
  }, [user])
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }
  
  const saveProfile = () => {
    // TODO: Implement API call to update profile
    console.log('Saving profile:', formData)
    // Mock API call
    setTimeout(() => {
      alert('Profile updated successfully!')
      setIsEditing(false)
    }, 500)
  }
  
  const changePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!')
      return
    }
    
    // TODO: Implement API call to change password
    console.log('Changing password:', passwordData)
    // Mock API call
    setTimeout(() => {
      alert('Password changed successfully!')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }, 500)
  }
  
  const cancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        notes: user.notes || ''
      })
    }
    setIsEditing(false)
  }
  
  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsChangingPassword(false)
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto p-6 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/tenant/dashboard">
            <Button variant="ghost" className="gap-2">
              <X className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <User className="h-8 w-8" />
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your account details and contact information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={saveProfile} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button onClick={cancelEdit} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleProfileChange}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                          placeholder="john@example.com"
                          disabled // Email usually cannot be changed
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleProfileChange}
                          placeholder="07XX XXX XXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleProfileChange}
                          placeholder="Emergency contact name and phone"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleProfileChange}
                        placeholder="Any additional information or preferences..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{user?.name || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email Address</p>
                          <p className="font-medium">{user?.email || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{user?.phone || 'Not set'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Emergency Contact</p>
                          <p className="font-medium">{user?.emergencyContact || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Additional Notes</p>
                          <p className="font-medium">{user?.notes || 'No notes'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Account Information (Non-editable) */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Home className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Apartment</p>
                          <p className="font-bold text-lg">{user?.apartment || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Move-in Date</p>
                          <p className="font-bold text-lg">
                            {user?.moveInDate ? new Date(user.moveInDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Account Status</p>
                          <Badge variant="success" className="mt-1">
                            {user?.status || 'ACTIVE'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password for security
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={changePassword}>
                        Update Password
                      </Button>
                      <Button onClick={cancelPasswordChange} variant="outline">
                        Cancel
                      </Button>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Password must be at least 6 characters long
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      For security reasons, we recommend changing your password regularly.
                    </p>
                    <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="gap-2">
                      <Key className="h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info & Actions */}
          <div className="space-y-6">
            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{user?.name || 'Tenant'}</h3>
                    <p className="text-muted-foreground">Apartment {user?.apartment}</p>
                    <Badge className="mt-2" variant="outline">
                      {user?.role || 'TENANT'}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="w-full space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.phone || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Unit {user?.apartment}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Password Change</span>
                    <span className="text-sm font-medium">30 days ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Created</span>
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Login</span>
                    <span className="text-sm font-medium">Today, 10:30 AM</span>
                  </div>
                </div>
                
                <Separator />
                
                <Alert className="bg-green-50 border-green-200">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-700">
                    Your account is secure. All your data is encrypted.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/instructions">
                    View Instructions
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="mailto:support@monteza.com">
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Rental Agreement</p>
                        <p className="text-xs text-muted-foreground">PDF • Signed</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">ID Copy</p>
                        <p className="text-xs text-muted-foreground">Uploaded</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
