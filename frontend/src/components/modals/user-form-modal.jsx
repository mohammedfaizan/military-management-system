import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

const roles = [
  { value: "admin", label: "Admin" },
  { value: "base_commander", label: "Base Commander" },
  { value: "logistics_officer", label: "Logistics Officer" },
  // { value: "user", label: "User" },
]

export function UserFormModal({ isOpen, onClose, onSave, user, mode, bases }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    base: "",
    state: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Don't populate password for security
        role: user.role || "",
        base: user.base || "",
        state: user.state || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        base: "",
        state: "",
      })
    }
  }, [user, mode, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Don't send empty password for edit mode
      const submitData = { ...formData }
      if (mode === "edit" && !submitData.password) {
        delete submitData.password
      }

      await onSave(submitData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getBaseName = (baseId) => {
    const base = bases.find((b) => b.id === baseId || b._id === baseId)
    return base ? base.name : baseId
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? "Create New User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system. All fields are required."
              : "Update user information. Leave password empty to keep current password."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password {mode === "edit" && "(Leave empty to keep current)"}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={mode === "create" ? "Enter password" : "Enter new password"}
                  required={mode === "create"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role !== "admin" &&
              <div className="space-y-2">
                <Label htmlFor="base">Base Assignment</Label>
                <Select value={formData.base._id} onValueChange={(value) => handleChange("base", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base" />
                  </SelectTrigger>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base.id || base._id} value={base.id || base._id}>
                        {base.name} - {base.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }

          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
