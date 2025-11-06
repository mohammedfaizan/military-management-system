import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Shield, Building2, Edit, Settings, LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"

export const ProfilePage = () => {
  const { user, role, isAdmin } = useAuth()

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: { label: "Super Admin", color: "bg-destructive", icon: Shield },
      base_commander: { label: "Base Commander", color: "bg-primary", icon: Shield },
      logistics_officer: { label: "Logistics Officer", color: "bg-primary", icon: Building2 },
    }
    return roleMap[role] || { label: role, color: "bg-muted", icon: Shield }
  }

  const roleInfo = getRoleDisplay(user.role)
  const RoleIcon = roleInfo.icon

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="md:text-3xl text-xl font-bold text-foreground">Profile Dashboard</h1>
          <p className="text-muted-foreground">Manage your account information and settings</p>
        </div>

        {/* Main Profile Card */}
        <Card className="overflow-hidden shadow-xl border-0 bg-card/80 backdrop-blur-sm py-0">
          <div className="h-32 bg-primary/10"></div>
          <CardContent className="relative pt-0 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt={user.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-2">{user.name}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  <Badge className={`${roleInfo.color} text-secondary px-3 py-1 text-sm font-medium`}>
                    <RoleIcon className="w-4 h-4 mr-1" />
                    {roleInfo.label}
                  </Badge>
                  {user.baseName && (
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      <Building2 className="w-4 h-4 mr-1" />
                      {user.baseName}
                    </Badge>
                  )}
                </div>
              </div>

              {isAdmin &&
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Link to={"/users"} className="flex items-center gap-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={"/settings"}>
                      <Settings className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>}
            </div>

            <Separator className="my-6" />

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="font-medium text-foreground">{user.email}</p>
                    </div>
                  </div>
                  {user.state && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">{user.state}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Role & Access */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Role & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <RoleIcon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Role</p>
                      <p className="font-medium text-foreground">{roleInfo.label}</p>
                    </div>
                  </div>
                  {user.baseName && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned Base</p>
                        <p className="font-medium text-foreground">{user.baseName}</p>
                      </div>
                    </div>
                  )}
                 
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            {/* <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Settings className="w-6 h-6" />
                  <span>Account Settings</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span>Security</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Additional Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20">
            <div className="text-2xl font-bold text-primary">Active</div>
            <div className="text-sm text-primary/70">Account Status</div>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/20">
            <div className="text-2xl font-bold text-secondary-foreground">Verified</div>
            <div className="text-sm text-muted-foreground">Email Status</div>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/20 border-accent/20">
            <div className="text-2xl font-bold text-accent-foreground">2FA</div>
            <div className="text-sm text-muted-foreground">Security Level</div>
          </Card>
        </div> */}
      </div>
    </div>
  )
}
