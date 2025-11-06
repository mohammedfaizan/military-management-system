import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Package, FileText, MapPin, Search, Filter, X, CalendarIcon, Eye } from "lucide-react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { inventoryAPI, purchasesAPI } from "../services/api"
import { useAssetBase } from "../context/AssetBaseContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ChevronDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"
import { BiPurchaseTag } from "react-icons/bi";
import InventorySkeleton from "../components/InventorySkeleton";

const PurchasePage = () => {
  const { assets, bases } = useAssetBase()
  const { user, isAdmin, isLogisticsOfficer } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [filteredPurchases, setFilteredPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [inventoryData, setInventoryData] = useState([])
  const [showViewModal, setShowViewModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssetFilter, setSelectedAssetFilter] = useState("")
  const [selectedBaseFilter, setSelectedBaseFilter] = useState(isAdmin && bases.length > 0 ? bases[0]._id : "");
  const [dateFilter, setDateFilter] = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
  })

  // Form state
  const [formData, setFormData] = useState({
    items: [{ asset: "", quantity: 1 }],
    invoiceNumber: "",
    remarks: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    base: ""
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedBaseFilter && { baseId: selectedBaseFilter }),
        ...(selectedAssetFilter && { assetId: selectedAssetFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      };

      const data = await purchasesAPI.getAll(params);
      setPurchases(data.purchases);
      setFilteredPurchases(data.purchases)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        pages: data.pages,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect dependencies
  useEffect(() => {
    fetchPurchases();
  }, [pagination.page, selectedBaseFilter, selectedAssetFilter, dateFilter, filters]);

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
      await purchasesAPI.create(createData)
      setShowCreateModal(false)
      resetForm()
      toast.success("Purchased bill added")
      fetchPurchases()
    } catch (err) {
      // setError(err.message)
      toast.error(err.message);
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        ...formData,
        items: formData.items.filter((item) => item.asset && item.quantity > 0),
      }
      await purchasesAPI.update(selectedPurchase._id, updateData)
      setShowEditModal(false)
      resetForm()
      fetchPurchases()
    } catch (err) {
      // setError(err.message)
      toast(err.message, "destructive");
    }
  }

  const handleDelete = async () => {
    try {
      await purchasesAPI.delete(selectedPurchase._id)
      setShowDeleteModal(false)
      setSelectedPurchase(null)
      fetchPurchases()
    } catch (err) {
      toast(err.message, "destructive");
    }
  }

  const resetForm = () => {
    setFormData({
      items: [{ asset: "", quantity: 1 }],
      invoiceNumber: "",
      remarks: "",
      purchaseDate: new Date().toISOString().split("T")[0],
    })
    setSelectedPurchase(null)
  }

  const openEditModal = (purchase) => {
    setSelectedPurchase(purchase)
    setFormData({
      items: purchase.items.map((item) => ({
        asset: item.asset._id,
        quantity: item.quantity,
      })),
      invoiceNumber: purchase.invoiceNumber,
      remarks: purchase.remarks,
      purchaseDate: new Date(purchase.purchaseDate).toISOString().split("T")[0],
    })
    setShowEditModal(true)
  }

  const openViewModal = (purchase) => {
    setSelectedPurchase(purchase)
    setFormData({
      items: purchase.items.map((item) => ({
        asset: item.asset._id,
        quantity: item.quantity,
      })),
      invoiceNumber: purchase.invoiceNumber,
      remarks: purchase.remarks,
      purchaseDate: new Date(purchase.purchaseDate).toISOString().split("T")[0],
    })
    setShowViewModal(true)
  }

  const openDeleteModal = (purchase) => {
    setSelectedPurchase(purchase)
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
            <BiPurchaseTag className="md:h-7 md:w-7 h-6 w-6" />
            Purchase Bills
          </h1>
          <p className="text-muted-foreground mt-1">Manage your purchase bills and inventory records</p>
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
            Add Bill
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

      {/* Mob Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {(searchTerm || (selectedAssetFilter && selectedAssetFilter !== "all") || (selectedBaseFilter && selectedBaseFilter !== "all") || dateFilter) && (
              <Badge variant="secondary" className="text-xs">
                {[searchTerm, selectedAssetFilter && selectedAssetFilter !== "all", selectedBaseFilter && selectedBaseFilter !== "all", dateFilter].filter(Boolean).length} active
              </Badge>
            )}
          </div>

          {(searchTerm || (selectedAssetFilter && selectedAssetFilter !== "all") || (selectedBaseFilter && selectedBaseFilter !== "all") || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2"
            >
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

          {/* Base Selector (Admin Only) */}
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
                      (!selectedBaseFilter || selectedBaseFilter === "all") && "bg-primary/10 text-primary"
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
                        selectedBaseFilter === base._id && "bg-primary/10 text-primary"
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
        {(searchTerm || (selectedAssetFilter && selectedAssetFilter !== "all") || (selectedBaseFilter && selectedBaseFilter !== "all") || dateFilter) && (
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
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSelectedAssetFilter("all")}
                />
              </Badge>
            )}
            {selectedBaseFilter && selectedBaseFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {bases.find((b) => b._id === selectedBaseFilter)?.name}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSelectedBaseFilter("all")}
                />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="text-xs">
                Date: {formatDate(dateFilter)}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setDateFilter("")}
                />
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Web Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {(searchTerm || (selectedAssetFilter && selectedAssetFilter !== "all") || (selectedBaseFilter && selectedBaseFilter !== "all") || dateFilter) && (
              <Badge variant="secondary" className="text-xs">
                {[searchTerm, selectedAssetFilter && selectedAssetFilter !== "all", selectedBaseFilter && selectedBaseFilter !== "all", dateFilter].filter(Boolean).length} active
              </Badge>
            )}
          </div>

          {(searchTerm || (selectedAssetFilter && selectedAssetFilter !== "all") || (selectedBaseFilter && selectedBaseFilter !== "all") || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Compact Filter Controls */}
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

          {/* Base Selector (Admin Only) */}
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
                      (!selectedBaseFilter || selectedBaseFilter === "all") && "bg-primary/10 text-primary"
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
                        selectedBaseFilter === base._id && "bg-primary/10 text-primary"
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
        {(searchTerm || (selectedAssetFilter && selectedAssetFilter !== "all") || (selectedBaseFilter && selectedBaseFilter !== "all") || dateFilter) && (
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
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSelectedAssetFilter("all")}
                />
              </Badge>
            )}
            {selectedBaseFilter && selectedBaseFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {bases.find((b) => b._id === selectedBaseFilter)?.name}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSelectedBaseFilter("all")}
                />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="text-xs">
                Date: {formatDate(dateFilter)}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setDateFilter("")}
                />
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Details</TableHead>
                <TableHead>Base Location</TableHead>
                <TableHead>Items Summary</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{purchase.invoiceNumber}</span>
                      </div>
                      {purchase.remarks && <p className="text-sm text-muted-foreground">{purchase.remarks}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{purchase.base?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.base?.district}, {purchase.base?.state}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{getTotalItems(purchase.items)} items</div>
                      <div className="text-sm text-muted-foreground">{purchase.items.length} different assets</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(purchase.purchaseDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openViewModal(purchase)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(purchase)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button variant="ghost" size="sm" onClick={() => openDeleteModal(purchase)}>
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPurchases.length === 0 && (
            <>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No purchase bills found</h3>
                <p className="text-muted-foreground">
                  {purchases.length === 0
                    ? "Get started by creating your first purchase bill."
                    : "Try adjusting your search or filter criteria."}
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                  <Plus className="h-4 w-4" />
                  Add Bill
                </Button>
              </div>
            </>
          )}

          {filteredPurchases.length > 0 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 px-2 py-3 w-full">

              {/* Pagination Info */}
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span> bills
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                {/* Page size selector */}
                <div className="flex items-center space-x-2">
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => {
                      setPagination(prev => ({
                        ...prev,
                        limit: Number(value),
                        page: 1,
                      }));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pagination.limit} />
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
                    onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages || pagination.pages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                    disabled={pagination.page === pagination.pages || pagination.pages === 0}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Bill</DialogTitle>
            <DialogDescription>Add a new purchase bill to your inventory records.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
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
              />
            </div>

            {/* Add this section for base selection (admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="base">Base</Label>
                <Select
                  value={formData?.base || ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, base: value }))}
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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={item.asset} // Just use the actual value
                        onValueChange={(value) => updateItem(index, "asset", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset._id} value={asset._id}>
                              {asset.name} ({asset.category})
                            </SelectItem>
                          ))
                          }
                          {/* {isAdmin
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
                          } */}
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
              <Button type="submit" disabled={createLoading}>Create Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Bill</DialogTitle>
            <DialogDescription>Update the purchase bill information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editInvoiceNumber">Invoice Number</Label>
                <Input
                  id="editInvoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPurchaseDate">Purchase Date</Label>
                <Input
                  id="editPurchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRemarks">Remarks</Label>
              <Textarea
                id="editRemarks"
                value={formData.remarks}
                onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Add this section for base selection (admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="editBase">Base</Label>
                <Select
                  value={formData.base || ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, base: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All bases</SelectItem>
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
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={item.asset} // Just use the actual value
                        onValueChange={(value) => updateItem(index, "asset", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset._id} value={asset._id}>
                              {asset.name} ({asset.category})
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
                  setShowEditModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>View complete purchase information</DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Invoice Number</Label>
                  <p className="font-medium">{selectedPurchase.invoiceNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Purchase Date</Label>
                  <p className="font-medium">{formatDate(selectedPurchase.purchaseDate)}</p>
                </div>
              </div>

              {/* Remarks */}
              {selectedPurchase.remarks && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Remarks</Label>
                  <p className="p-3 bg-muted rounded-lg">{selectedPurchase.remarks}</p>
                </div>
              )}

              {/* Base info (admin only) */}
              {isAdmin && selectedPurchase.base && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Base</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedPurchase.base.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPurchase.base.district}, {selectedPurchase.base.state}
                    </p>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Items</Label>
                <div className="border rounded-lg overflow-x-auto">
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
                      {selectedPurchase.items.map((item, index) => (
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
                  <span className="font-bold">{getTotalItems(selectedPurchase.items)}</span>
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
              Are you sure you want to delete purchase bill <strong>{selectedPurchase?.invoiceNumber}</strong>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedPurchase(null)
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

export default PurchasePage
