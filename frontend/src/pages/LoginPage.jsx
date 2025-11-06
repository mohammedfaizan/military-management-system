"use client"
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Mail, Shield, Eye, EyeOff, Loader2, CheckCircle, Copy, User, Crown, Truck, Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { FaPersonMilitaryRifle } from "react-icons/fa6"

const demoCredentials = [
  {
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    title: "System Administrator",
    description: "Full system access and management privileges",
    icon: Crown,
    color: "from-red-500 to-red-600",
  },
  {
    email: "alpha@example.com",
    password: "secure123",
    role: "base_commander",
    title: "Base Commander",
    description: "Command operations and strategic oversight",
    icon: Shield,
    color: "from-blue-500 to-blue-600",
  },
  {
    email: "logistics@example.com",
    password: "secure456",
    role: "logistics_officer",
    title: "Logistics Officer",
    description: "Supply chain and inventory management",
    icon: Truck,
    color: "from-green-500 to-green-600",
  },
]

export const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastSubmit, setLastSubmit] = useState(0)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [copiedField, setCopiedField] = useState("")

  const navigate = useNavigate()
  const { login } = useAuth()

  // Throttling: prevent multiple submissions within 2 seconds
  const THROTTLE_DELAY = 2000

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault()
      // Throttling check
      const now = Date.now()
      if (now - lastSubmit < THROTTLE_DELAY) {
        return
      }
      setLastSubmit(now)
      setLoading(true)
      setError("")
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/signin`,
          {
            email,
            password,
          },
          { withCredentials: true },
        )

        login(res.data.user)
        toast.success("Login successful", "success")
        navigate("/")
      } catch (err) {
        const msg = err?.response?.data?.message || "Login failed"
        toast.error(msg, "error")
      } finally {
        setLoading(false)
      }
    },
    [email, password, lastSubmit],
  )

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`${field} copied to clipboard`)
      setTimeout(() => setCopiedField(""), 2000)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const applyCredentials = (credentials) => {
    setEmail(credentials.email)
    setPassword(credentials.password)
    setDemoModalOpen(false)
    toast.success(`Applied ${credentials.title} credentials`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/90 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary/10 to-secondary/90 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-secondary/20 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center py-2">
            <div className="hidden flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="md:text-2xl text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <FaPersonMilitaryRifle className="h-5 w-5 text-primary" />
                <span>Military Asset & Inventory</span>
              </CardTitle>

              <CardDescription className="text-slate-600 dark:text-slate-400">
                Secure access to military asset management system
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/50">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="officer@military.gov"
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
              </div>
            </div>

            <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Use Demo Credentials
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
                style={{
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* IE/Edge */,
                }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Demo Credentials
                  </DialogTitle>
                  <DialogDescription>
                    Select a role to test the system with pre-configured demo accounts. Click to apply credentials
                    directly or copy them individually.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                  {demoCredentials.map((cred, index) => {
                    const IconComponent = cred.icon
                    return (
                      <Card
                        key={index}
                        className="relative overflow-hidden border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 hover:shadow-md"
                      >
                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${cred.color}`} />
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center shadow-sm`}
                              >
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                  {cred.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{cred.description}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {cred.role.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                  {cred.email}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(cred.email, `${cred.role}-email`)}
                                className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                {copiedField === `${cred.role}-email` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                  {cred.password}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(cred.password, `${cred.role}-password`)}
                                className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                {copiedField === `${cred.role}-password` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <Button
                            onClick={() => applyCredentials(cred)}
                            className={`w-full bg-gradient-to-r ${cred.color} hover:opacity-90 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md`}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Use {cred.title} Account
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Demo Environment Notice</p>
                      <p className="text-amber-700 dark:text-amber-300">
                        These are demonstration accounts for testing purposes only. In a production environment, use
                        your assigned military credentials.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Need assistance?{" "}
                <Link
                  href="/support"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Contact IT Support
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
