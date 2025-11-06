import { useState, useEffect } from "react"
import {
  Plus,
  Eye,
  Trash2,
  ArrowRightLeft,
  FileText,
  MapPin,
  Search,
  Filter,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Package,
  PackageIcon,
  CalendarIcon,
} from "lucide-react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { inventoryAPI, transfersAPI } from "../services/api.js"
import { useAssetBase } from "../context/AssetBaseContext"

import { Calendar } from "@/components/ui/calendar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import InventorySkeleton from "../components/InventorySkeleton.jsx"

const TransferPage = () => {
  const { assets, bases } = useAssetBase()
  const { user, isAdmin, isLogisticsOfficer } = useAuth()
  const [transferData, setTransferData] = useState({
    transferIn: [],
    transferOut: [],
    totalIn: 0,
    totalOut: 0,
    totalPagesIn: 0,
    totalPagesOut: 0,
    currentPage: 1,
    limit: 10,
  })
  const [inventoryData, setInventoryData] = useState([])
  const [filteredTransfers, setFilteredTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [activeTab, setActiveTab] = useState("out")
  const [ createLoading , setCreateLoading] = useState(false)
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssetFilter, setSelectedAssetFilter] = useState("")
  const [selectedBaseFilter, setSelectedBaseFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [baseId, setBaseId] = useState(isAdmin && bases.length > 0 ? bases[0]._id : "")

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
  })

  // Form state
  const [formData, setFormData] = useState({
    items: [{ asset: "", quantity: 1 }],
    toBase: "",
    invoiceNumber: "",
    remarks: "",
    transferDate: new Date().toISOString().split("T")[0],
    fromBase: "",
  })

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const params = {
        page: transferData.currentPage,
        limit: transferData.limit,
        baseId,
        ...(selectedBaseFilter && { baseId: selectedBaseFilter }),
        ...(selectedAssetFilter && { assetId: selectedAssetFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      }

      const data = await transfersAPI.getAll(params)
      setTransferData({
        transferIn: data.transferIn,
        transferOut: data.transferOut,
        totalIn: data.totalIn,
        totalOut: data.totalOut,
        totalPagesIn: data.totalPagesIn,
        totalPagesOut: data.totalPagesOut,
        currentPage: data.currentPage,
        limit: data.limit,
      })

      // Set filtered transfers based on active tab
      if (activeTab === "out") {
        setFilteredTransfers(data.transferOut)
      } else {
        setFilteredTransfers(data.transferIn)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [transferData.currentPage, selectedBaseFilter, selectedAssetFilter, dateFilter, baseId, filters])

  // Add a separate useEffect for tab changes
  useEffect(() => {
    if (activeTab === "out") {
      setFilteredTransfers(transferData.transferOut)
    } else {
      setFilteredTransfers(transferData.transferIn)
    }
  }, [activeTab, transferData])

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
    setSelectedBaseFilter("")
    setDateFilter("")
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
      await transfersAPI.create(createData)
      setShowCreateModal(false)
      resetForm()
      toast.success("Transfer entry done succesfully")
      fetchTransfers()
    } catch (err) {
      toast.error(err.message)
    } finally{
       setCreateLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await transfersAPI.delete(selectedTransfer._id)
      setShowDeleteModal(false)
      setSelectedTransfer(null)
      fetchTransfers()
    } catch (err) {
      // setError(err.message)
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      items: [{ asset: "", quantity: 1 }],
      toBase: "",
      invoiceNumber: "",
      remarks: "",
      transferDate: new Date().toISOString().split("T")[0],
    })
    setSelectedTransfer(null)
  }

  const openViewModal = async (transfer) => {
    try {
      const fullTransfer = await transfersAPI.getById(transfer._id)
      setSelectedTransfer(fullTransfer)
      setShowViewModal(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const openDeleteModal = (transfer) => {
    setSelectedTransfer(transfer)
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
            <ArrowRightLeft className="md:h-7 md:w-7 h-6 w-6" />
            Transfer Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage asset transfers between bases</p>
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
            Create Transfer
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="out" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Transfer Out
          </TabsTrigger>
          <TabsTrigger value="in" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Transfer In
          </TabsTrigger>
        </TabsList>

        <TabsContent value="out" className="space-y-6">
          {/* Mob Filters for Transfer Out */}
          <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters - Outgoing
                </CardTitle>
                {(searchTerm ||
                  (selectedAssetFilter && selectedAssetFilter !== "all") ||
                  (selectedBaseFilter && selectedBaseFilter !== "all") ||
                  dateFilter) && (
                    <Badge variant="secondary" className="text-xs">
                      {
                        [
                          searchTerm,
                          selectedAssetFilter && selectedAssetFilter !== "all",
                          selectedBaseFilter && selectedBaseFilter !== "all",
                          dateFilter,
                        ].filter(Boolean).length
                      }{" "}
                      active
                    </Badge>
                  )}
              </div>

              {/* {(searchTerm ||
                (selectedAssetFilter && selectedAssetFilter !== "all") ||
                (selectedBaseFilter && selectedBaseFilter !== "all") ||
                dateFilter) && ( */}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
              {/* )} */}
            </div>

            {/* Compact Filter Controls */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-1">

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

              {/* Source Base Filter (Admin Only) */}
              {isAdmin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <MapPin className="h-3 w-3 mr-2" />
                      {baseId && baseId !== "all" ? bases.find((b) => b._id === baseId)?.name : "Source"}
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
                          (!baseId || baseId === "all") && "bg-primary/10 text-primary",
                        )}
                        onClick={() => setBaseId("all")}
                      >
                        All sources
                      </Button> */}
                      {bases.map((base) => (
                        <Button
                          key={base._id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 text-sm",
                            baseId === base._id && "bg-primary/10 text-primary",
                          )}
                          onClick={() => setBaseId(base._id)}
                        >
                          {base.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Destination Base Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {selectedBaseFilter && selectedBaseFilter !== "all"
                      ? bases.find((b) => b._id === selectedBaseFilter)?.name
                      : "Destination"}
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
                      All destinations
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
                      To: {bases.find((b) => b._id === selectedBaseFilter)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedBaseFilter("all")} />
                    </Badge>
                  )}
                  {isAdmin && baseId && baseId !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      From: {bases.find((b) => b._id === baseId)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setBaseId("all")} />
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


          {/* Web Compact Filters for Transfer Out */}
          <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters - Outgoing
                </CardTitle>
                {(searchTerm ||
                  (selectedAssetFilter && selectedAssetFilter !== "all") ||
                  (selectedBaseFilter && selectedBaseFilter !== "all") ||
                  dateFilter) && (
                    <Badge variant="secondary" className="text-xs">
                      {
                        [
                          searchTerm,
                          selectedAssetFilter && selectedAssetFilter !== "all",
                          selectedBaseFilter && selectedBaseFilter !== "all",
                          dateFilter,
                        ].filter(Boolean).length
                      }{" "}
                      active
                    </Badge>
                  )}
              </div>

              {/* {(searchTerm ||
                (selectedAssetFilter && selectedAssetFilter !== "all") ||
                (selectedBaseFilter && selectedBaseFilter !== "all") ||
                dateFilter) && ( */}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
              {/* )} */}
            </div>

            {/* Compact Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              {/* <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transfers..."
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

              {/* Source Base Filter (Admin Only) */}
              {isAdmin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <MapPin className="h-3 w-3 mr-2" />
                      {baseId && baseId !== "all" ? bases.find((b) => b._id === baseId)?.name : "Source"}
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
                          (!baseId || baseId === "all") && "bg-primary/10 text-primary",
                        )}
                        onClick={() => setBaseId("all")}
                      >
                        All sources
                      </Button> */}
                      {bases.map((base) => (
                        <Button
                          key={base._id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 text-sm",
                            baseId === base._id && "bg-primary/10 text-primary",
                          )}
                          onClick={() => setBaseId(base._id)}
                        >
                          {base.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Destination Base Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {selectedBaseFilter && selectedBaseFilter !== "all"
                      ? bases.find((b) => b._id === selectedBaseFilter)?.name
                      : "Destination"}
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
                      All destinations
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
                      To: {bases.find((b) => b._id === selectedBaseFilter)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedBaseFilter("all")} />
                    </Badge>
                  )}
                  {isAdmin && baseId && baseId !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      From: {bases.find((b) => b._id === baseId)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setBaseId("all")} />
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

          {/* Transfer Out Table */}
          <Card>
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer Details</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Items Summary</TableHead>
                    <TableHead>Transfer Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{transfer.invoiceNumber}</span>
                          </div>
                          {transfer.remarks && <p className="text-sm text-muted-foreground">{transfer.remarks}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transfer.toBase?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.toBase?.district}, {transfer.toBase?.state}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{getTotalItems(transfer.items)} items</div>
                          <div className="text-sm text-muted-foreground">{transfer.items.length} different assets</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(transfer.transferDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openViewModal(transfer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* <Button variant="ghost" size="sm" onClick={() => openDeleteModal(transfer)}>
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTransfers.length === 0 && (
                <div className="text-center py-12">
                  <ArrowRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No outgoing transfers found</h3>
                  <p className="text-muted-foreground">
                    {transferData.transferOut.length === 0
                      ? "Get started by creating your first transfer."
                      : "Try adjusting your search or filter criteria."}
                  </p>

                  {(isAdmin || isLogisticsOfficer) && filteredTransfers.length === 0 && (
                    <Button onClick={() => setShowCreateModal(true)} className="mt-3">
                      <Plus className="h-4 w-4" />
                      Create Transfer
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in" className="space-y-6">
          {/* Mob Filters for Transfer In */}
          <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters - Incoming
                </CardTitle>
                {(searchTerm ||
                  (selectedAssetFilter && selectedAssetFilter !== "all") ||
                  (selectedBaseFilter && selectedBaseFilter !== "all") ||
                  dateFilter) && (
                    <Badge variant="secondary" className="text-xs">
                      {
                        [
                          searchTerm,
                          selectedAssetFilter && selectedAssetFilter !== "all",
                          selectedBaseFilter && selectedBaseFilter !== "all",
                          dateFilter,
                        ].filter(Boolean).length
                      }{" "}
                      active
                    </Badge>
                  )}
              </div>
              {/* 
              {(searchTerm ||
                (selectedAssetFilter && selectedAssetFilter !== "all") ||
                (selectedBaseFilter && selectedBaseFilter !== "all") ||
                dateFilter) && ( */}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
              {/* )} */}
            </div>

            {/* Compact Filter Controls */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-1">

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

              {/* Source Base Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ArrowLeft className="h-3 w-3 mr-2" />
                    {selectedBaseFilter && selectedBaseFilter !== "all"
                      ? bases.find((b) => b._id === selectedBaseFilter)?.name
                      : "Source"}
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
                      All sources
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

              {/* Destination Base Filter (Admin Only) */}
              {isAdmin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <MapPin className="h-3 w-3 mr-2" />
                      {baseId && baseId !== "all" ? bases.find((b) => b._id === baseId)?.name : "Destination"}
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
                          (!baseId || baseId === "all") && "bg-primary/10 text-primary",
                        )}
                        onClick={() => setBaseId("all")}
                      >
                        All destinations
                      </Button> */}
                      {bases.map((base) => (
                        <Button
                          key={base._id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 text-sm",
                            baseId === base._id && "bg-primary/10 text-primary",
                          )}
                          onClick={() => setBaseId(base._id)}
                        >
                          {base.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Date Filter new */}
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 ",
                      dateFilter && "border-primary/50 bg-primary/5",
                    )}
                  >
                    <CalendarIcon className="h-3 w-3 mr-2" />
                    {dateFilter ? format(dateFilter, "MMM dd") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => setDateFilter(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover> */}

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
                      From: {bases.find((b) => b._id === selectedBaseFilter)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedBaseFilter("all")} />
                    </Badge>
                  )}
                  {isAdmin && baseId && baseId !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      To: {bases.find((b) => b._id === baseId)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setBaseId("all")} />
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

          {/* Web  Filters for Transfer In */}
          <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm hidden md:block">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters - Incoming
                </CardTitle>
                {(searchTerm ||
                  (selectedAssetFilter && selectedAssetFilter !== "all") ||
                  (selectedBaseFilter && selectedBaseFilter !== "all") ||
                  dateFilter) && (
                    <Badge variant="secondary" className="text-xs">
                      {
                        [
                          searchTerm,
                          selectedAssetFilter && selectedAssetFilter !== "all",
                          selectedBaseFilter && selectedBaseFilter !== "all",
                          dateFilter,
                        ].filter(Boolean).length
                      }{" "}
                      active
                    </Badge>
                  )}
              </div>
              {/* 
              {(searchTerm ||
                (selectedAssetFilter && selectedAssetFilter !== "all") ||
                (selectedBaseFilter && selectedBaseFilter !== "all") ||
                dateFilter) && ( */}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
              {/* )} */}
            </div>

            {/* Compact Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              {/* <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transfers..."
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

              {/* Source Base Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ArrowLeft className="h-3 w-3 mr-2" />
                    {selectedBaseFilter && selectedBaseFilter !== "all"
                      ? bases.find((b) => b._id === selectedBaseFilter)?.name
                      : "Source"}
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
                      All sources
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

              {/* Destination Base Filter (Admin Only) */}
              {isAdmin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <MapPin className="h-3 w-3 mr-2" />
                      {baseId && baseId !== "all" ? bases.find((b) => b._id === baseId)?.name : "Destination"}
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
                          (!baseId || baseId === "all") && "bg-primary/10 text-primary",
                        )}
                        onClick={() => setBaseId("all")}
                      >
                        All destinations
                      </Button> */}
                      {bases.map((base) => (
                        <Button
                          key={base._id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 text-sm",
                            baseId === base._id && "bg-primary/10 text-primary",
                          )}
                          onClick={() => setBaseId(base._id)}
                        >
                          {base.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Date Filter new */}
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 ",
                      dateFilter && "border-primary/50 bg-primary/5",
                    )}
                  >
                    <CalendarIcon className="h-3 w-3 mr-2" />
                    {dateFilter ? format(dateFilter, "MMM dd") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => setDateFilter(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover> */}

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
                      From: {bases.find((b) => b._id === selectedBaseFilter)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedBaseFilter("all")} />
                    </Badge>
                  )}
                  {isAdmin && baseId && baseId !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      To: {bases.find((b) => b._id === baseId)?.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setBaseId("all")} />
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

          {/* Transfer In Table */}
          <Card>
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer Details</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Items Summary</TableHead>
                    <TableHead>Transfer Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{transfer.invoiceNumber}</span>
                          </div>
                          {transfer.remarks && <p className="text-sm text-muted-foreground">{transfer.remarks}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transfer.fromBase?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.fromBase?.district}, {transfer.fromBase?.state}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{getTotalItems(transfer.items)} items</div>
                          <div className="text-sm text-muted-foreground">{transfer.items.length} different assets</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(transfer.transferDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openViewModal(transfer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTransfers.length === 0 && (
                <div className="text-center py-12">
                  <ArrowLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No incoming transfers found</h3>
                  <p className="text-muted-foreground">
                    {transferData.transferIn.length === 0
                      ? "No transfers have been received yet."
                      : "Try adjusting your search or filter criteria."}
                  </p>

                  {(isAdmin || isLogisticsOfficer) && filteredTransfers.length === 0 && (
                    <Button onClick={() => setShowCreateModal(true)} className="mt-3">
                      <Plus className="h-4 w-4" />
                      Create Transfer
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {filteredTransfers.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 w-full">

              {/* Pagination Info */}
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(transferData.currentPage - 1) * transferData.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    transferData.currentPage * transferData.limit,
                    activeTab === "out" ? transferData.totalOut : transferData.totalIn,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {activeTab === "out" ? transferData.totalOut : transferData.totalIn}
                </span>{" "}
                transfers
              </div>

              {/* Controls Section */}
              <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end w-full md:w-auto">

                {/* Select Limit */}
                <div className="flex items-center space-x-2">
                  <Select
                    value={transferData.limit.toString()}
                    onValueChange={(value) => {
                      setTransferData((prev) => ({
                        ...prev,
                        limit: Number(value),
                        currentPage: 1,
                      }));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={transferData.limit} />
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

                {/* Pagination Buttons */}
                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setTransferData((prev) => ({ ...prev, currentPage: 1 }))}
                    disabled={transferData.currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setTransferData((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={transferData.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setTransferData((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
                    }
                    disabled={
                      transferData.currentPage ===
                      (activeTab === "out" ? transferData.totalPagesOut : transferData.totalPagesIn) ||
                      (activeTab === "out" ? transferData.totalPagesOut : transferData.totalPagesIn) === 0
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setTransferData((prev) => ({
                        ...prev,
                        currentPage: activeTab === "out"
                          ? transferData.totalPagesOut
                          : transferData.totalPagesIn,
                      }))
                    }
                    disabled={
                      transferData.currentPage ===
                      (activeTab === "out" ? transferData.totalPagesOut : transferData.totalPagesIn) ||
                      (activeTab === "out" ? transferData.totalPagesOut : transferData.totalPagesIn) === 0
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


      {/* Create Transfer Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Transfer</DialogTitle>
            <DialogDescription>Create a new asset transfer to another base.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Transfer Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="TRF-2025-0001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferDate">Transfer Date</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, transferDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="toBase">From Base</Label>
                  <Select
                    value={formData.fromBase}
                    className="w-full"
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fromBase: value }))}
                    required={isAdmin}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select from base" />
                    </SelectTrigger>
                    <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="toBase">Destination Base</Label>
                <Select
                  value={formData.toBase}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, toBase: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination base" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                placeholder="Transfer reason or additional notes..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Items to Transfer</Label>
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
              <Button type="submit" disabled={createLoading}>Create Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Transfer Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>View complete transfer information</DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Transfer Number</Label>
                  <p className="font-medium">{selectedTransfer.invoiceNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Transfer Date</Label>
                  <p className="font-medium">{formatDate(selectedTransfer.transferDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">From Base</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedTransfer.fromBase?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransfer.fromBase?.district}, {selectedTransfer.fromBase?.state}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">To Base</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedTransfer.toBase?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransfer.toBase?.district}, {selectedTransfer.toBase?.state}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTransfer.remarks && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                  <p className="p-3 bg-muted rounded-lg">{selectedTransfer.remarks}</p>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Transferred Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransfer.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.asset.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.asset.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Total Items:</span>
                  <span className="font-bold">{getTotalItems(selectedTransfer.items)}</span>
                </div>
              </div>
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
              Are you sure you want to delete transfer <strong>{selectedTransfer?.invoiceNumber}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedTransfer(null)
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

export default TransferPage
