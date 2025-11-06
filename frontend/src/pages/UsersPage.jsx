import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, Search, UserCheck, Shield, Building } from "lucide-react"
import { UsersTable } from "../components/modals/users-table"
import { UserFormModal } from "../components/modals/user-form-modal"
import { DeleteUserModal } from "../components/modals/delete-user-modal"
import { userAPI } from "../services/api.js"
import { toast } from "sonner"
import { useAssetBase } from "../context/AssetBaseContext"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { bases, loading: basesLoading } = useAssetBase()

  // Modal states
  const [userModal, setUserModal] = useState({
    isOpen: false,
    mode: "create", // "create" or "edit"
    data: null,
  })

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    data: null,
  })

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.base.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.base.state.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getAll()
      setUsers(data)
    } catch (error) {
      toast('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setUserModal({
      isOpen: true,
      mode: "create",
      data: null,
    })
  }

  const handleEditUser = (user) => {
    setUserModal({
      isOpen: true,
      mode: "edit",
      data: user,
    })
  }

  const handleDeleteUser = (user) => {
    setDeleteModal({
      isOpen: true,
      data: user,
    })
  }

  const handleSaveUser = async (formData) => {
    try {
      if (userModal.mode === "create") {
        await userAPI.create(formData)
        toast('User created successfully', 'success')
      } else {
        await userAPI.update(userModal.data.id || userModal.data._id, formData)
        toast('User updated successfully', 'success')
      }
      setUserModal({ isOpen: false, mode: "create", data: null })
      fetchUsers()
    } catch (error) {
      toast(`Failed to ${userModal.mode} user`, 'error')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await userAPI.delete(deleteModal.data.id || deleteModal.data._id)
      toast('User deleted successfully', 'success')
      setDeleteModal({ isOpen: false, data: null })
      fetchUsers()
    } catch (error) {
      toast('Failed to delete user', 'error')
    }
  }

  const getStatsData = () => {
    const totalUsers = users.length
    const adminUsers = users.filter((user) => user.role === "admin").length
    const activeUsers = users.filter((user) => user.status !== "inactive").length
    const uniqueBases = new Set(users.map((user) => user.base)).size

    return { totalUsers, adminUsers, activeUsers, uniqueBases }
  }

  const { totalUsers, adminUsers, activeUsers, uniqueBases } = getStatsData()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight hidden md:flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <h1 className="text-xl font-bold tracking-tight md:hidden flex items-center gap-2">
            <Users className="h-6 w-6" />
            User
          </h1>
          <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Admin level access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bases Covered</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBases}</div>
            <p className="text-xs text-muted-foreground">Operational bases</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex md:flex-row flex-col items-center justify-between">
            <div>
              <CardTitle>Users Directory</CardTitle>
              <CardDescription>View and manage all system users and their assignments</CardDescription>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-3 py-0'>
          <UsersTable
            users={filteredUsers}
            bases={bases}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            loading={loading || basesLoading}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <UserFormModal
        isOpen={userModal.isOpen}
        onClose={() => setUserModal({ isOpen: false, mode: "create", data: null })}
        onSave={handleSaveUser}
        user={userModal.data}
        mode={userModal.mode}
        bases={bases}
      />

      <DeleteUserModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, data: null })}
        onConfirm={handleConfirmDelete}
        user={deleteModal.data}
      />
    </div>
  )
}
