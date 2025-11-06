import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  Search,
  Filter,
  CalendarIcon,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Package2,
  Plus,
  X,
  ChevronDown,
  Building2,
  Tag,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { inventoryAPI } from "../services/api"
import { useDebounce } from "use-debounce"
import { useAuth } from "../context/AuthContext"
import { useAssetBase } from "../context/AssetBaseContext"
import { Link } from "react-router-dom"
import { lowStockConstant } from "../utils/constants"
import InventorySkeleton from "../components/InventorySkeleton"

const StocksPage = () => {
  const { user, isAdmin, isLogisticsOfficer } = useAuth()
  const { bases } = useAssetBase()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)

  const [inventoryData, setInventoryData] = useState([])
  const [baseInfo, setBaseInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    asset: "",
    category: "All categories",
    minQuantity: "",
    maxQuantity: "",
    dateFrom: null,
    dateTo: null,
    showLowStock: false,
    base_id: isAdmin && bases.length > 0 ? bases[0]._id : "",
  })

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  })

  // Fetch inventory data with filters
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true)

        // Prepare query params
        const params = {
          asset: filters.asset,
          category: filters.category !== "All categories" ? filters.category : undefined,
          minQuantity: filters.minQuantity,
          maxQuantity: filters.maxQuantity,
          showLowStock: filters.showLowStock ? "true" : undefined,
          dateFrom: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
          dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
          sortField: sortConfig.key,
          sortDirection: sortConfig.direction,
          base_id: filters.base_id,
        }

        // Remove undefined params
        const queryParams = Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined))
        console.log("Calling Stocks API with:", queryParams)
        const data = await inventoryAPI.getMyStock(queryParams)

        setInventoryData(data.stocks)
        setBaseInfo(data.base)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchInventoryData()
  }, [filters, sortConfig]) // Re-fetch when filters or sort change

  // Update your useEffect to use debouncedSearchTerm
  // useEffect(() => {
  //   setFilters((prev) => ({ ...prev, asset: debouncedSearchTerm }))
  // }, [debouncedSearchTerm])

  useEffect(() => {
    if (debouncedSearchTerm !== filters.asset) {
      setFilters((prev) => ({ ...prev, asset: debouncedSearchTerm }))
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
      asset: "",
      category: "All categories",
      minQuantity: "",
      maxQuantity: "",
      dateFrom: null,
      dateTo: null,
      showLowStock: false,
      base_id: user?.role === "admin" && bases.length > 0 ? bases[0]._id : "",
    })
    setSortConfig({ key: null, direction: "asc" })
  }

  // Calculate low stock count from current filtered results
  const lowStockCount = useMemo(() => {
    return inventoryData.filter((item) => item.quantity < lowStockConstant).length
  }, [inventoryData])

  // Helper function to get active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (filters.category !== "All categories") count++
    if (filters.base_id && filters.base_id !== "All bases") count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.showLowStock) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  if (loading) {
    return (
      <InventorySkeleton />
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
      {/* Header with base info */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-2">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="md:h-7 md:w-7 h-6 w-6" />
            {baseInfo ? `${baseInfo.name} Inventory` : "Inventory Management"}
          </h1>
          <p className="text-muted-foreground">
            {baseInfo ? `${baseInfo.district}, ${baseInfo.state}` : "Manage your asset inventory"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} Low Stock
            </Badge>
          )}
          <Badge variant="outline">{inventoryData.length} Items</Badge>
        </div>
      </div>

      {/* Mob view Compact Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">

        {/* Header */}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className=" h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Compact Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-2">

          {/* Search */}
          {/* <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9  focus:border-primary/50 focus:ring-primary/20"
            />
          </div> */}

          {/* Category */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 ">
                <Tag className="h-3 w-3 mr-2" />
                {filters.category === "All categories" ? "Category" : filters.category}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {["All categories", "weapon", "vehicle", "ammunition", "equipment"].map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      filters.category === category && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, category }))}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Base Selector (Admin Only) */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 ">
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

          <Separator orientation="vertical" className="h-6" />

          {/* Low Stock Toggle */}
          <Button
            variant={filters.showLowStock ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, showLowStock: !prev.showLowStock }))}
            className={cn("h-9", !filters.showLowStock && "")}
          >
            <AlertTriangle className="h-3 w-3 mr-2" />
            Low Stock
          </Button>
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
            {filters.category !== "All categories" && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, category: "All categories" }))}
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
            {filters.showLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, showLowStock: false }))}
                />
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Web Compact Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        {/* Header */}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className=" h-8 px-2"
            >
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
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9  focus:border-primary/50 focus:ring-primary/20"
            />
          </div> */}

          <Separator orientation="vertical" className="h-6" />

          {/* Category */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 ">
                <Tag className="h-3 w-3 mr-2" />
                {filters.category === "All categories" ? "Category" : filters.category}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {["All categories", "weapon", "vehicle", "ammunition", "equipment"].map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      filters.category === category && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, category }))}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Base Selector (Admin Only) */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 ">
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

          <Separator orientation="vertical" className="h-6" />

          {/* Low Stock Toggle */}
          <Button
            variant={filters.showLowStock ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, showLowStock: !prev.showLowStock }))}
            className={cn("h-9", !filters.showLowStock && "")}
          >
            <AlertTriangle className="h-3 w-3 mr-2" />
            Low Stock
          </Button>
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
            {filters.category !== "All categories" && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, category: "All categories" }))}
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
            {filters.showLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, showLowStock: false }))}
                />
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Data</CardTitle>
          <CardDescription>Complete overview of your asset inventory with detailed metrics</CardDescription>
        </CardHeader>
        <CardContent className='p-3 py-0'>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Alert</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      // onClick={() => handleSort("asset")}
                      className="h-auto p-0 font-semibold"
                    >
                      Asset
                      {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  {/* <TableHead>Location</TableHead> */}
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("quantity")} className="h-auto p-0 font-semibold">
                      Quantity
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("purchased")}
                      className="h-auto p-0 font-semibold"
                    >
                      Purchased
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("expended")}
                      className="h-auto p-0 font-semibold"
                    >
                      Expended
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("assigned")}
                      className="h-auto p-0 font-semibold"
                    >
                      Assigned
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Transferred Out</TableHead>
                  <TableHead>Transferred In</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map((item) => (
                  <TableRow key={item._id} className={item.quantity < lowStockConstant ? "bg-destructive/5" : ""}>
                    <TableCell>
                      {item.quantity < lowStockConstant && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{item?.asset?.name}</div>
                        <div className="text-sm text-muted-foreground">{item?.asset?.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item?.asset?.category}</Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="secondary">{item.asset.category}</Badge>
                    </TableCell> */}
                    <TableCell className="text-center">
                      <Badge variant={item.quantity < lowStockConstant ? "destructive" : "default"} className="font-mono">
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-center">{item.purchased}</TableCell>
                    <TableCell className="font-mono text-center">{item.expended}</TableCell>
                    <TableCell className="font-mono text-center">{item.assigned}</TableCell>
                    <TableCell className="font-mono text-center">{item.transferredOut}</TableCell>
                    <TableCell className="font-mono text-center">{item.transferredIn}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item?.updatedAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {inventoryData.length === 0 && (
              <>
                <div className="text-center py-12">
                  <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No inventory items found matching your filters.</h3>
                  <p className="text-muted-foreground mb-4">
                    {inventoryData.length === 0
                      ? "Get started by creating your first purchase bill."
                      : "Try adjusting your search or filter criteria."}
                  </p>

                  {(isAdmin || isLogisticsOfficer) && inventoryData.length === 0 && (
                    <Button asChild>
                      <Link to="/purchase">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Purchase Bill
                      </Link>
                    </Button>
                  )}

                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StocksPage
