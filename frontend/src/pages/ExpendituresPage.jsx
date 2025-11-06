import { useState, useEffect } from "react"
import {
  Plus,
  Eye,
  Trash2,
  DollarSign,
  CalendarIcon,
  FileText,
  MapPin,
  Search,
  Filter,
  X,
  User,
  ChevronDown,
  Package,
} from "lucide-react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { expenditureAPI, inventoryAPI } from "../services/api.js"
import { useAssetBase } from "../context/AssetBaseContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { getRoleColor, getRoleLabel } from "../utils/roleColorLabel.js"
import { Link } from "react-router-dom"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import InventorySkeleton from "../components/InventorySkeleton.jsx"

const ExpendituresPage = () => {
  const { assets, bases } = useAssetBase()
  const { user, isAdmin, isLogisticsOfficer } = useAuth()
  const [expenditureData, setExpenditureData] = useState({
    expenditures: [],
    total: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    base: "",
  })

  const [inventoryData, setInventoryData] = useState([])
  const [filteredExpenditures, setFilteredExpenditures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExpenditure, setSelectedExpenditure] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssetFilter, setSelectedAssetFilter] = useState("")
  const [selectedBaseFilter, setSelectedBaseFilter] = useState(isAdmin && bases.length > 0 ? bases[0]._id : "")
  const [dateFilter, setDateFilter] = useState("")
  const [expendedByFilter, setExpendedByFilter] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    expendedBy: "",
    items: [{ asset: "", quantity: 1 }],
    remarks: "",
    expendDate: new Date().toISOString().split("T")[0],
  })

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
  })

  const fetchExpenditures = async () => {
    try {
      setLoading(true)
      const params = {
        page: expenditureData.currentPage,
        limit: expenditureData.limit,
        ...(selectedBaseFilter && { baseId: selectedBaseFilter }),
        ...(selectedAssetFilter && { assetId: selectedAssetFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(expendedByFilter && { expendedBy: expendedByFilter }),
        ...(searchTerm && { search: searchTerm }),
      }

      const data = await expenditureAPI.getAll(params)
      setExpenditureData({
        expenditures: data.expenditures,
        total: data.total,
        currentPage: data.currentPage,
        limit: data.limit,
        totalPages: data.totalPages,
      })

      // Apply client-side filtering if needed
      let filtered = data.expenditures
      if (searchTerm) {
        filtered = filtered.filter(
          (exp) =>
            exp.expendedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.items.some((item) => item.asset.name.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }
      setFilteredExpenditures(filtered)
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenditures()
  }, [expenditureData.currentPage, selectedBaseFilter, selectedAssetFilter, dateFilter, expendedByFilter, filters])

  useEffect(() => {
    // Apply search filter on client side
    let filtered = expenditureData.expenditures
    if (searchTerm) {
      filtered = filtered.filter(
        (exp) =>
          exp.expendedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.items.some((item) => item.asset.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }
    setFilteredExpenditures(filtered)
  }, [searchTerm, expenditureData.expenditures])

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

    if (showCreateModal) {
      fetchInventory()
    }
  }, [showCreateModal])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAssetFilter("")
    setDateFilter("")
    setExpendedByFilter("")
    setFilters({
      dateFrom: null,
      dateTo: null,
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const createData = {
        ...formData,
        items: formData.items.filter((item) => item.asset && item.quantity > 0),
      }
      await expenditureAPI.create(createData)
      setShowCreateModal(false)
      resetForm()
      toast.success("Expenditure entry done successfully")
      fetchExpenditures()
    } catch (err) {
      // setError(err.message)
      toast.error(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await expenditureAPI.delete(selectedExpenditure._id)
      setShowDeleteModal(false)
      setSelectedExpenditure(null)
      fetchExpenditures()
      toast.success("Expenditure deleted successfully")
    } catch (err) {
      // setError(err.message)
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      expendedBy: "",
      items: [{ asset: "", quantity: 1 }],
      remarks: "",
      expendDate: new Date().toISOString().split("T")[0],
    })
    setSelectedExpenditure(null)
  }

  const openViewModal = async (expenditure) => {
    try {
      const fullExpenditure = await expenditureAPI.getById(expenditure._id)
      setSelectedExpenditure(fullExpenditure)
      setShowViewModal(true)
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const openDeleteModal = (expenditure) => {
    setSelectedExpenditure(expenditure)
    setShowDeleteModal(true)
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { asset: "", quantity: 1 }],
    }))
  }

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  const getTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getAssetById = (id) => {
    return assets.find((asset) => asset._id === id)
  }

  const getBaseById = (id) => {
    return bases.find((base) => base._id === id)
  }

  if (loading) {
    return (
      <InventorySkeleton />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold flex items-center gap-2">
            <DollarSign className="md:h-7 md:w-7 h-6 w-6" />
            Expenditure Management
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage asset expenditures</p>
        </div>

        <div className="flex gap-2 items-center">
          <Button variant="outline" asChild>
            <Link to="/stocks">
              <Package className="mr-2 h-4 w-4" />
              View Stocks
            </Link>
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Expend
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Mob Compact Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {(searchTerm ||
              (selectedAssetFilter && selectedAssetFilter !== "all") ||
              (selectedBaseFilter && selectedBaseFilter !== "all") ||
              expendedByFilter ||
              dateFilter) && (
                <Badge variant="secondary" className="text-xs">
                  {
                    [
                      searchTerm,
                      selectedAssetFilter && selectedAssetFilter !== "all",
                      selectedBaseFilter && selectedBaseFilter !== "all",
                      expendedByFilter,
                      dateFilter,
                    ].filter(Boolean).length
                  }{" "}
                  active
                </Badge>
              )}
          </div>

          {(searchTerm ||
            (selectedAssetFilter && selectedAssetFilter !== "all") ||
            (selectedBaseFilter && selectedBaseFilter !== "all") ||
            expendedByFilter ||
            dateFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
        </div>

        {/* Compact Filter Controls */}
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

          {/* Base Filter (Admin Only) */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <MapPin className="h-3 w-3 mr-2" />
                  {selectedBaseFilter && selectedBaseFilter !== "all"
                    ? bases.find((b) => b._id === selectedBaseFilter)?.name
                    : "Base"}
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
                      (!selectedBaseFilter || selectedBaseFilter === "all") && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setSelectedBaseFilter("all")}
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
                        selectedBaseFilter === base._id && "bg-primary/10 text-primary",
                      )}
                      onClick={() => setSelectedBaseFilter(base._id)}
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

          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* Active Filters Display */}
        {(searchTerm ||
          (selectedAssetFilter && selectedAssetFilter !== "all") ||
          (selectedBaseFilter && selectedBaseFilter !== "all") ||
          expendedByFilter ||
          dateFilter) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary/20">
              <span className="text-xs text-primary/50 font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchTerm}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
                </Badge>
              )}
              {selectedAssetFilter && selectedAssetFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {getAssetById(selectedAssetFilter)?.name}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedAssetFilter("all")} />
                </Badge>
              )}
              {selectedBaseFilter && selectedBaseFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {bases.find((b) => b._id === selectedBaseFilter)?.name}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedBaseFilter("all")} />
                </Badge>
              )}
              {expendedByFilter && (
                <Badge variant="secondary" className="text-xs">
                  By: {expendedByFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setExpendedByFilter("")} />
                </Badge>
              )}
              {dateFilter && (
                <Badge variant="secondary" className="text-xs">
                  Date: {formatDate(dateFilter)}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateFilter("")} />
                </Badge>
              )}
            </div>
          )}
      </Card>

      {/* Web Compact Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {(searchTerm ||
              (selectedAssetFilter && selectedAssetFilter !== "all") ||
              (selectedBaseFilter && selectedBaseFilter !== "all") ||
              expendedByFilter ||
              dateFilter) && (
                <Badge variant="secondary" className="text-xs">
                  {
                    [
                      searchTerm,
                      selectedAssetFilter && selectedAssetFilter !== "all",
                      selectedBaseFilter && selectedBaseFilter !== "all",
                      expendedByFilter,
                      dateFilter,
                    ].filter(Boolean).length
                  }{" "}
                  active
                </Badge>
              )}
          </div>

          {(searchTerm ||
            (selectedAssetFilter && selectedAssetFilter !== "all") ||
            (selectedBaseFilter && selectedBaseFilter !== "all") ||
            expendedByFilter ||
            dateFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
        </div>

        {/* Compact Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          {/* <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search expenditures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 focus:border-primary/50 focus:ring-primary/20"
            />
          </div> */}

          <Separator orientation="vertical" className="h-6" />

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

          {/* Base Filter (Admin Only) */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <MapPin className="h-3 w-3 mr-2" />
                  {selectedBaseFilter && selectedBaseFilter !== "all"
                    ? bases.find((b) => b._id === selectedBaseFilter)?.name
                    : "Base"}
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
                      (!selectedBaseFilter || selectedBaseFilter === "all") && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setSelectedBaseFilter("all")}
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
                        selectedBaseFilter === base._id && "bg-primary/10 text-primary",
                      )}
                      onClick={() => setSelectedBaseFilter(base._id)}
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


          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* Active Filters Display */}
        {(searchTerm ||
          (selectedAssetFilter && selectedAssetFilter !== "all") ||
          (selectedBaseFilter && selectedBaseFilter !== "all") ||
          expendedByFilter ||
          dateFilter) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary/20">
              <span className="text-xs text-primary/50 font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchTerm}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
                </Badge>
              )}
              {selectedAssetFilter && selectedAssetFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {getAssetById(selectedAssetFilter)?.name}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedAssetFilter("all")} />
                </Badge>
              )}
              {selectedBaseFilter && selectedBaseFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {bases.find((b) => b._id === selectedBaseFilter)?.name}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedBaseFilter("all")} />
                </Badge>
              )}
              {expendedByFilter && (
                <Badge variant="secondary" className="text-xs">
                  By: {expendedByFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setExpendedByFilter("")} />
                </Badge>
              )}
              {dateFilter && (
                <Badge variant="secondary" className="text-xs">
                  Date: {formatDate(dateFilter)}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateFilter("")} />
                </Badge>
              )}
            </div>
          )}
      </Card>

      {/* Expenditures Table */}
      <Card>
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expenditure Details</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Expended By</TableHead>
                <TableHead>Items Summary</TableHead>
                <TableHead>Expend Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenditures.map((expenditure) => (
                <TableRow key={expenditure._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">EXP-{expenditure._id.slice(-6).toUpperCase()}</span>
                      </div>
                      {expenditure.remarks && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{expenditure.remarks}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{expenditure.base?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {expenditure.base?.district}, {expenditure.base?.state}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{expenditure.expendedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{getTotalItems(expenditure.items)} items</div>
                      <div className="text-sm text-muted-foreground">{expenditure.items.length} different assets</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(expenditure.expendDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openViewModal(expenditure)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* <Button variant="ghost" size="sm" onClick={() => openDeleteModal(expenditure)}>
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExpenditures.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No expenditures found</h3>
              <p className="text-muted-foreground">
                {expenditureData.expenditures.length === 0
                  ? "Get started by creating your first expenditure."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredExpenditures.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full">

              {/* Pagination Summary */}
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(expenditureData.currentPage - 1) * expenditureData.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(expenditureData.currentPage * expenditureData.limit, expenditureData.total)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{expenditureData.total}</span> expenditures
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end w-full md:w-auto">

                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <Select
                    value={expenditureData.limit.toString()}
                    onValueChange={(value) => {
                      setExpenditureData((prev) => ({
                        ...prev,
                        limit: Number(value),
                        currentPage: 1,
                      }));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={expenditureData.limit} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm font-medium">per page</p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setExpenditureData((prev) => ({ ...prev, currentPage: 1 }))}
                    disabled={expenditureData.currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setExpenditureData((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage - 1,
                      }))
                    }
                    disabled={expenditureData.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setExpenditureData((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage + 1,
                      }))
                    }
                    disabled={
                      expenditureData.currentPage === expenditureData.totalPages ||
                      expenditureData.totalPages === 0
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setExpenditureData((prev) => ({
                        ...prev,
                        currentPage: expenditureData.totalPages,
                      }))
                    }
                    disabled={
                      expenditureData.currentPage === expenditureData.totalPages ||
                      expenditureData.totalPages === 0
                    }
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Create Expenditure Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Expenditure</DialogTitle>
            <DialogDescription>Record a new asset expenditure.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expendedBy">Expended By</Label>
                <Input
                  id="expendedBy"
                  value={formData.expendedBy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expendedBy: e.target.value }))}
                  placeholder="Officer/Personnel name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expendDate">Expend Date</Label>
                <Input
                  id="expendDate"
                  type="date"
                  value={formData.expendDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expendDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                placeholder="Reason for expenditure or additional notes..."
              />
            </div>

            {/* Add this section for base selection (admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="base">For Base</Label>
                <Select
                  value={formData?.base || ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, base: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="all">All bases</SelectItem> */}
                    {bases.map((base) => (
                      <SelectItem key={base._id} value={base._id}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Items to Expend</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Select value={item.asset} onValueChange={(value) => updateItem(index, "asset", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset" />
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
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                        placeholder="Qty"
                        required
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>Create Expenditure</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Expenditure Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expenditure Details</DialogTitle>
            <DialogDescription>View complete expenditure information</DialogDescription>
          </DialogHeader>
          {selectedExpenditure && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Expenditure ID</Label>
                  <p className="font-medium">EXP-{selectedExpenditure._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Expend Date</Label>
                  <p className="font-medium">{formatDate(selectedExpenditure.expendDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Expended By</Label>
                  <p className="font-medium">{selectedExpenditure.expendedBy}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Base</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedExpenditure.base?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedExpenditure.base?.district}, {selectedExpenditure.base?.state}
                    </p>
                  </div>
                </div>
              </div>

              {selectedExpenditure.remarks && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                  <p className="p-3 bg-muted rounded-lg">{selectedExpenditure.remarks}</p>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Expended Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedExpenditure.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.asset.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.asset.category}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.asset.unit}</TableCell>
                          <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Total Items:</span>
                  <span className="font-bold">{getTotalItems(selectedExpenditure.items)}</span>
                </div>
              </div>

              {/* {selectedExpenditure.approvedBy && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Approved By</Label>
                  <p className="font-medium">{selectedExpenditure.approvedBy.name}</p>
                  <Badge variant="outline" className={getRoleColor(selectedExpenditure.approvedBy.role)}>
                    {getRoleLabel(selectedExpenditure.approvedBy.role)}
                  </Badge>
                </div>
              )} */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expenditure record? This action cannot be undone and will permanently
              remove the expenditure data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedExpenditure(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ExpendituresPage
