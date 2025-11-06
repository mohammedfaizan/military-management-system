import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  CalendarIcon,
  Package,
  ArrowUpDown,
  Plus,
  X,
  ChevronDown,
  Building2,
  Tag,
  Eye,
  Trash2,
  UserCheck,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { assignmentAPI, expenditureAPI, inventoryAPI } from "../services/api"
import { useDebounce } from "use-debounce"
import { useAuth } from "../context/AuthContext"
import { useAssetBase } from "../context/AssetBaseContext"
import { Link } from "react-router-dom"
import InventorySkeleton from "../components/InventorySkeleton"
import { toast } from "sonner"

const AssignmentPage = () => {
  const { user, isAdmin, isLogisticsOfficer, isCommander } = useAuth()
  const { assets, bases } = useAssetBase()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)

  const [assignmentData, setAssignmentData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [baseInfo, setBaseInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  const [selectedAssetFilter, setSelectedAssetFilter] = useState("")
  const [createLoading, setCreateLoading] = useState(false)
  // Form states
  const [assignForm, setAssignForm] = useState({
    assignedTo: "",
    items: [{ asset: "", quantity: 1 }],
    remarks: "",
    assignDate: new Date(),
    base: ""
  })

  const [expendForm, setExpendForm] = useState({
    expendedBy: "",
    remarks: "",
    expendDate: new Date(),
    base: ""
  })

  // Filter states
  const [filters, setFilters] = useState({
    assignedTo: "",
    status: "All statuses",
    dateFrom: null,
    dateTo: null,
    base_id: isAdmin && bases.length > 0 ? bases[0]._id : "",
  })

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  })

  const fetchAssignmentData = async () => {
    try {
      setLoading(true)

      const params = {
        assignedTo: filters.assignedTo,
        status: filters.status !== "All statuses" ? filters.status : undefined,
        dateFrom: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
        dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
        sortField: sortConfig.key,
        sortDirection: sortConfig.direction,
        baseId: filters.base_id,
        assetId: selectedAssetFilter || undefined
      }

      const queryParams = Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined))
      console.log("Calling Assign API with:", queryParams)
      const data = await assignmentAPI.getAll(queryParams)

      setAssignmentData(data.assignments || [])
      setBaseInfo(data.base)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Fetch assignments data
  useEffect(() => {
    fetchAssignmentData()
  }, [filters, sortConfig, selectedAssetFilter])

  // Fetch inventory for assignment modal
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await inventoryAPI.getMyStock()
        setInventoryData(data.stocks || [])
      } catch (err) {
        console.error("Failed to fetch inventory:", err)
      }
    }

    if (isAssignModalOpen) {
      fetchInventory()
    }
  }, [isAssignModalOpen])

  // useEffect(() => {
  //   setFilters((prev) => ({ ...prev, assignedTo: debouncedSearchTerm }))
  // }, [debouncedSearchTerm])

  useEffect(() => {
  if (debouncedSearchTerm !== filters.assignedTo) {
    setFilters((prev) => ({ ...prev, assignedTo: debouncedSearchTerm }))
  }
}, [debouncedSearchTerm])

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilters({
      assignedTo: "",
      status: "All statuses",
      dateFrom: null,
      dateTo: null,
      base_id: user?.role === "admin" && bases.length > 0 ? bases[0]._id : "",
    })
    setSortConfig({ key: null, direction: "asc" })
    setSelectedAssetFilter("")
  }

  // Handle assignment creation
  const handleCreateAssignment = async () => {
    setCreateLoading(true)
    try {
      const assignmentData = {
        ...assignForm,
        assignDate: assignForm.assignDate.toISOString(),
      }

      await assignmentAPI.create(assignmentData)
      setIsAssignModalOpen(false)
      setAssignForm({
        assignedTo: "",
        items: [{ asset: "", quantity: 1 }],
        remarks: "",
        assignDate: new Date(),
      })
      toast.success("Assignment entry done succesfully")
      // Refresh data
      fetchAssignmentData()
    } catch (err) {
      console.error("Failed to create assignment:", err)
      toast.error(err.message)
    } finally {
      setCreateLoading(false)

    }
  }

  // Handle mark as expended
  const handleMarkAsExpended = async (data) => {
    try {
      const expendData = {
        expendedBy: expendForm.expendedBy,
        items: selectedItems.map((item) => ({
          asset: item.asset._id,
          quantity: item.quantity,
        })),
        remarks: expendForm.remarks,
        expendDate: expendForm.expendDate.toISOString(),
        base: isAdmin ? data.base._id : ""
      }

      await expenditureAPI.markAssignedAsExpended(expendData, selectedAssignment._id)
      setIsViewModalOpen(false)
      setSelectedItems([])

      // Refresh data
      fetchAssignmentData()
    } catch (err) {
      console.error("Failed to mark as expended:", err)
    }
  }

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    try {
      await assignmentAPI.delete(selectedAssignment._id)
      setIsDeleteModalOpen(false)
      setSelectedAssignment(null)

      // Refresh data
      window.location.reload()
    } catch (err) {
      console.error("Failed to delete assignment:", err)
    }
  }

  const addItemToAssignment = () => {
    setAssignForm((prev) => ({
      ...prev,
      items: [...prev.items, { asset: "", quantity: 1 }],
    }))
  }

  const removeItemFromAssignment = (index) => {
    setAssignForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateAssignmentItem = (index, field, value) => {
    setAssignForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  // Calculate stats
  const totalAssignments = assignmentData.length
  const expendedAssignments = assignmentData.filter((a) => a.isExpended).length
  const activeAssignments = assignmentData.filter((a) => !a.isExpended).length
  const totalItemsAssigned = assignmentData.reduce(
    (sum, assignment) => sum + assignment.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (filters.status !== "All statuses") count++
    if (filters.base_id && filters.base_id !== "All bases") count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }

  const getAssetById = (id) => {
    return assets.find((asset) => asset._id === id)
  }


  const activeFiltersCount = getActiveFiltersCount()

  if (loading) {
    return (
      <InventorySkeleton />
    )
  }

  if (error) {
    return (
      <div className="flex items-start justify-center min-h-screen mt-10">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-2">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight">
            {baseInfo ? `${baseInfo.name} Assignments` : "Assignment Management"}
          </h1>
          <p className="text-muted-foreground">
            {baseInfo ? `${baseInfo.district}, ${baseInfo.state}` : "Manage asset assignments"}
          </p>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {expendedAssignments > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {expendedAssignments} Expended
            </Badge>
          )}
          <Badge variant="outline">{totalAssignments} Total</Badge>

          <Button variant="outline" asChild>
            <Link to="/stocks">
              <Package className="mr-0 h-4 w-4" />
              View Stocks
            </Link>
          </Button>

          {(isAdmin || isCommander) && (
            // Create Assignment
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-0 h-4 w-4" />
                  Assign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>Assign assets to personnel for field operations</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={assignForm.assignedTo}
                      onChange={(e) => setAssignForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="Enter personnel name"
                    />
                  </div>

                  {/* Add this section for base selection (admin only) */}
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="base">Base</Label>
                      <Select
                        value={assignForm?.base || ""}
                        onValueChange={(value) => setAssignForm((prev) => ({ ...prev, base: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select base" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="all">All bases</SelectItem> */}
                          {bases
                            .filter((base) => base._id !== user?.base?._id)
                            .map((base) => (
                              <SelectItem key={base._id} value={base._id}>
                                {base.name} - {base.district}, {base.state}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Items to Assign</Label>
                    {assignForm.items.map((item, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Select
                          value={item.asset}
                          onValueChange={(value) => updateAssignmentItem(index, "asset", value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                          <SelectContent>
                            {isAdmin
                              ? assets.map((asset) => (
                                <SelectItem key={asset._id} value={asset._id}>
                                  {asset.name} ({asset.category})
                                </SelectItem>
                              ))
                              : inventoryData.map((stock) => (
                                <SelectItem key={stock.asset._id} value={stock.asset._id}>
                                  {stock.asset.name} (Available: {stock.quantity})
                                </SelectItem>
                              ))
                            }
                          </SelectContent>

                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateAssignmentItem(index, "quantity", Number.parseInt(e.target.value))}
                          className="w-20"
                        />
                        {assignForm.items.length > 1 && (
                          <Button variant="outline" size="icon" onClick={() => removeItemFromAssignment(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addItemToAssignment} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignDate">Assignment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(assignForm.assignDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={assignForm.assignDate}
                          onSelect={(date) => setAssignForm((prev) => ({ ...prev, assignDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={assignForm.remarks}
                      onChange={(e) => setAssignForm((prev) => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Enter assignment remarks"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssignment} disabled={createLoading}>Create Assignment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Mob Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-2">

          {/* Asset Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Package className="h-3 w-3 mr-2" />
                {selectedAssetFilter && selectedAssetFilter !== "all"
                  ? getAssetById(selectedAssetFilter)?.name
                  : "Asset"}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1 max-h-60 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {/* All Assets Option */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start h-8 text-sm",
                    (!selectedAssetFilter || selectedAssetFilter === null) && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setSelectedAssetFilter(null)}
                >
                  All assets
                </Button>

                {/* Asset Buttons */}
                {assets.map((asset) => (
                  <Button
                    key={asset._id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      selectedAssetFilter === asset._id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => setSelectedAssetFilter(asset._id)}
                  >
                    {asset.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>

          </Popover>

          {/* Status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Tag className="h-3 w-3 mr-2" />
                {filters.status === "All statuses" ? "Status" : filters.status}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {["All statuses", "Active", "Expended"].map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      filters.status === status && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Base Selector (Admin Only) */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Building2 className="h-3 w-3 mr-2" />
                  {filters.base_id === "All bases" || !filters.base_id
                    ? "Base"
                    : bases.find((b) => b._id === filters.base_id)?.name}
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      (filters.base_id === "All bases" || !filters.base_id) && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, base_id: "All bases" }))}
                  >
                    All bases
                  </Button> */}
                  {bases.map((base) => (
                    <Button
                      key={base._id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-8 text-sm",
                        filters.base_id === base._id && "bg-primary/10 text-primary",
                      )}
                      onClick={() => setFilters((prev) => ({ ...prev, base_id: base._id }))}
                    >
                      {base.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Date Range New */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 ",
                    filters.dateFrom && "border-primary/50 bg-primary/5",
                  )}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  // onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                  onSelect={(date) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: date,
                      dateTo: prev.dateTo && date && date > prev.dateTo ? null : prev.dateTo,
                    }));
                  }}

                  initialFocus
                  disabled={(date) => {
                    // ❌ Disable all dates after dateTo
                    return filters.dateTo ? date > filters.dateTo : false;
                  }}
                />
              </PopoverContent>
            </Popover>

            <span className="text-primary/50 text-sm">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 ",
                    filters.dateTo && "border-primary/50 bg-primary/5",
                  )}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateTo ? format(filters.dateTo, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, dateTo: date }))}
                  initialFocus
                  disabled={(date) => {
                    // ❌ Disable all dates before dateFrom
                    return filters.dateFrom ? date < filters.dateFrom : false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary/20">
            <span className="text-xs text-primary/50 font-medium">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchTerm}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {filters.status !== "All statuses" && (
              <Badge variant="secondary" className="text-xs">
                {filters.status}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, status: "All statuses" }))}
                />
              </Badge>
            )}
            {filters.base_id && filters.base_id !== "All bases" && (
              <Badge variant="secondary" className="text-xs">
                {bases.find((b) => b._id === filters.base_id)?.name}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, base_id: "All bases" }))}
                />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="text-xs">
                From: {format(filters.dateFrom, "MMM dd")}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, dateFrom: null }))}
                />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="text-xs">
                To: {format(filters.dateTo, "MMM dd")}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, dateTo: null }))}
                />
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/*Web Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* Asset Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Package className="h-3 w-3 mr-2" />
                {selectedAssetFilter && selectedAssetFilter !== "all"
                  ? getAssetById(selectedAssetFilter)?.name
                  : "Asset"}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1 max-h-60 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {/* All Assets Option */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start h-8 text-sm",
                    (!selectedAssetFilter || selectedAssetFilter === null) && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setSelectedAssetFilter(null)}
                >
                  All assets
                </Button>

                {/* Asset Buttons */}
                {assets.map((asset) => (
                  <Button
                    key={asset._id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      selectedAssetFilter === asset._id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => setSelectedAssetFilter(asset._id)}
                  >
                    {asset.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>

          </Popover>

          {/* Status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Tag className="h-3 w-3 mr-2" />
                {filters.status === "All statuses" ? "Status" : filters.status}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {["All statuses", "Active", "Expended"].map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      filters.status === status && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Base Selector (Admin Only) */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Building2 className="h-3 w-3 mr-2" />
                  {filters.base_id === "All bases" || !filters.base_id
                    ? "Base"
                    : bases.find((b) => b._id === filters.base_id)?.name}
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      (filters.base_id === "All bases" || !filters.base_id) && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, base_id: "All bases" }))}
                  >
                    All bases
                  </Button> */}
                  {bases.map((base) => (
                    <Button
                      key={base._id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-8 text-sm",
                        filters.base_id === base._id && "bg-primary/10 text-primary",
                      )}
                      onClick={() => setFilters((prev) => ({ ...prev, base_id: base._id }))}
                    >
                      {base.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Date Range New */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 ",
                    filters.dateFrom && "border-primary/50 bg-primary/5",
                  )}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  // onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                  onSelect={(date) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: date,
                      dateTo: prev.dateTo && date && date > prev.dateTo ? null : prev.dateTo,
                    }));
                  }}

                  initialFocus
                  disabled={(date) => {
                    // ❌ Disable all dates after dateTo
                    return filters.dateTo ? date > filters.dateTo : false;
                  }}
                />
              </PopoverContent>
            </Popover>

            <span className="text-primary/50 text-sm">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 ",
                    filters.dateTo && "border-primary/50 bg-primary/5",
                  )}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateTo ? format(filters.dateTo, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, dateTo: date }))}
                  initialFocus
                  disabled={(date) => {
                    // ❌ Disable all dates before dateFrom
                    return filters.dateFrom ? date < filters.dateFrom : false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary/20">
            <span className="text-xs text-primary/50 font-medium">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchTerm}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {filters.status !== "All statuses" && (
              <Badge variant="secondary" className="text-xs">
                {filters.status}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, status: "All statuses" }))}
                />
              </Badge>
            )}
            {filters.base_id && filters.base_id !== "All bases" && (
              <Badge variant="secondary" className="text-xs">
                {bases.find((b) => b._id === filters.base_id)?.name}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, base_id: "All bases" }))}
                />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="text-xs">
                From: {format(filters.dateFrom, "MMM dd")}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, dateFrom: null }))}
                />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="text-xs">
                To: {format(filters.dateTo, "MMM dd")}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, dateTo: null }))}
                />
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Records</CardTitle>
          <CardDescription>Complete overview of asset assignments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("assignedTo")}
                      className="h-auto p-0 font-semibold"
                    >
                      Assigned To
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("assignDate")}
                      className="h-auto p-0 font-semibold"
                    >
                      Assign Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentData.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>
                      <Badge variant={assignment.isExpended ? "secondary" : "default"}>
                        {assignment.isExpended ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Expended
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{assignment.assignedTo}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {assignment.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{item.asset.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.quantity} {item.asset.unit}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(assignment.assignDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {assignment.remarks}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setIsViewModalOpen(true)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {/* {(isAdmin || isCommander) && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={assignment.isExpended}
                            onClick={() => {
                              setSelectedAssignment(assignment)
                              setIsDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )} */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {assignmentData.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No assignments found</h3>
                <p className="text-muted-foreground mb-4">
                  {assignmentData.length === 0
                    ? "Get started by creating your first assignment."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {(isAdmin || isCommander) && assignmentData.length === 0 && (
                  <Button onClick={() => setIsAssignModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Assignment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>View assignment information and mark items as expended</DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                  <p className="font-medium">{selectedAssignment.assignedTo}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Assignment Date</Label>
                  <p className="font-medium">{format(new Date(selectedAssignment.assignDate), "PPP")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Base</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedAssignment.base?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAssignment.base?.district}, {selectedAssignment.base?.state}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={selectedAssignment.isExpended ? "secondary" : "default"}>
                    {selectedAssignment.isExpended ? "Expended" : "Active"}
                  </Badge>
                </div>
              </div>

              {/* Remarks */}
              {selectedAssignment.remarks && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                  <p className="p-3 bg-muted rounded-lg">{selectedAssignment.remarks}</p>
                </div>
              )}

              {/* Assigned Items */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Assigned Items</Label>
                <div className="space-y-2">
                  {selectedAssignment.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedItems.some((si) => si.asset._id === item.asset._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems((prev) => [...prev, item]);
                            } else {
                              setSelectedItems((prev) =>
                                prev.filter((si) => si.asset._id !== item.asset._id)
                              );
                            }
                          }}
                          disabled={selectedAssignment.isExpended || item.isExpended}
                        />
                        <div>
                          <p className="font-medium">{item.asset.name}</p>
                          <p className="text-sm text-muted-foreground">{item.asset.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.quantity} {item.asset.unit}
                        </p>
                        {item.isExpended && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Expended
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expend Form */}
              {!selectedAssignment.isExpended && selectedItems.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-lg">Mark Selected Items as Expended</h4>

                  <div className="space-y-2">
                    <Label htmlFor="expendedBy" className="text-sm text-muted-foreground">Expended By</Label>
                    <Input
                      id="expendedBy"
                      value={expendForm.expendedBy}
                      onChange={(e) => setExpendForm((prev) => ({ ...prev, expendedBy: e.target.value }))}
                      placeholder="Enter personnel name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expendRemarks" className="text-sm text-muted-foreground">Expenditure Remarks</Label>
                    <Textarea
                      id="expendRemarks"
                      value={expendForm.remarks}
                      onChange={(e) => setExpendForm((prev) => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Enter expenditure remarks"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Expenditure Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(expendForm.expendDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expendForm.expendDate}
                          onSelect={(date) =>
                            setExpendForm((prev) => ({ ...prev, expendDate: date }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {!selectedAssignment?.isExpended && selectedItems.length > 0 && (
              <Button onClick={() => handleMarkAsExpended(selectedAssignment)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Expended
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="py-4">
              <p>
                <strong>Assigned To:</strong> {selectedAssignment.assignedTo}
              </p>
              <p>
                <strong>Items:</strong> {selectedAssignment.items.length} item(s)
              </p>
              <p>
                <strong>Date:</strong> {format(new Date(selectedAssignment.assignDate), "PPP")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAssignment}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AssignmentPage
