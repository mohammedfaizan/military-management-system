import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Mail, MapPin, Building } from "lucide-react"

const getRoleColor = (role) => {
  const colors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    base_commander: "bg-blue-100 text-blue-800 border-blue-200",
    logistics_officer: "bg-green-100 text-green-800 border-green-200",
    user: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return colors[role] || colors.user
}

const getRoleLabel = (role) => {
  const labels = {
    admin: "Admin",
    base_commander: "Base Commander",
    logistics_officer: "Logistics Officer",
    user: "User",
  }
  return labels[role] || role
}

export function UsersTable({ users, bases, onEdit, onDelete, loading }) {

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No users found</div>
        <p className="text-sm text-muted-foreground">Create your first user to get started</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Base Assignment</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id || user._id} className="hover:bg-muted/30">
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Building className="h-3 w-3" />
                    {user?.base?.name || "Base"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {user?.base?.state || "India"}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {user?.base?.name || "India"}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.role !== "admin" &&
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
