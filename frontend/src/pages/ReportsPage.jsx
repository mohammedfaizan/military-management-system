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
  Search,
  Filter,
  CalendarIcon,
  ArrowUpDown,
  X,
  ChevronDown,
  Building2,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronLeft,
  ChevronRight,
  User,
  Package,
  Move3dIcon,
} from "lucide-react"
import { IoMdMove } from "react-icons/io";
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { movementAPI } from "../services/api"
import { useAssetBase } from "../context/AssetBaseContext"
import InventorySkeleton from "../components/InventorySkeleton"
import { useAuth } from "../context/AuthContext"

const ReportsPage = () => {
  const { user, isAdmin, isLogisticsOfficer, isCommander } = useAuth()
  const { assets, bases } = useAssetBase()
  const [searchTerm, setSearchTerm] = useState("")
  const [movementData, setMovementData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(4)

  const [selectedAssetFilter, setSelectedAssetFilter] = useState("")

  // Filter states
  const [filters, setFilters] = useState({
    actionType: "All types",
    assetId: "",
    baseId: "",
    dateFrom: null,
    dateTo: null,
    performedBy: "",
  })

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  })

  // Fetch movement data with filters and pagination
  useEffect(() => {
    const fetchMovementData = async () => {
      try {
        setLoading(true)

        // Prepare query params
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          actionType: filters.actionType !== "All types" ? filters.actionType : undefined,
          assetId: selectedAssetFilter || undefined,
          baseId: filters.baseId || undefined,
          dateFrom: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
          dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
          performedBy: filters.performedBy || undefined,
          sortField: sortConfig.key,
          sortDirection: sortConfig.direction,
          search: searchTerm || undefined,
        }

        // Remove undefined params
        const queryParams = Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined))

        const data = await movementAPI.getAll(queryParams)

        setMovementData(data.logs || [])
        setPagination({
          page: data.page || 1,
          limit: data.limit || 10,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        })
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchMovementData()
  }, [filters, sortConfig, selectedAssetFilter, pagination.page, pagination.limit, searchTerm])

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
      actionType: "All types",
      assetId: "",
      baseId: "",
      dateFrom: null,
      dateTo: null,
      performedBy: "",
    })
    setSortConfig({ key: "date", direction: "desc" })
    setPagination((prev) => ({ ...prev, page: 1 }))
    setSelectedAssetFilter("")
  }

  // Calculate stats from current data
  const stats = useMemo(() => {
    const assignments = movementData.filter((log) => log.actionType === "assignment").length
    const expenditures = movementData.filter((log) => log.actionType === "expenditure").length
    const totalQuantity = movementData.reduce(
      (sum, log) => sum + log.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const purchases = 0
    const transfers = 0

    return { assignments, expenditures, totalQuantity, purchases, transfers }
  }, [movementData])

  // Stats cards data
  const statsCards = useMemo(
    () => [
      {
        title: "Total Movement Logs",
        value: pagination.total,
        subtitle: "All recorded movements",
        icon: <FileText className="h-4 w-4 text-blue-600" />,
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Purchases",
        value: stats.purchases,
        subtitle: "Asset acquisitions",
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-600 dark:text-green-400",
      },
      {
        title: "Transfers",
        value: stats.transfers,
        subtitle: "Inter-base transfers",
        icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Assignments",
        value: stats.assignments,
        subtitle: "Asset assignments",
        icon: <TrendingUp className="h-4 w-4 text-purple-600" />,
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        textColor: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Expenditures",
        value: stats.expenditures,
        subtitle: "Asset consumption",
        icon: <TrendingDown className="h-4 w-4 text-red-600" />,
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-600 dark:text-red-400",
      },
      // {
      //   title: "Total Quantity",
      //   value: stats.totalQuantity,
      //   subtitle: "Items moved",
      //   icon: <Package className="h-4 w-4 text-orange-600" />,
      //   bgColor: "bg-orange-100 dark:bg-orange-900/30",
      //   textColor: "text-orange-600 dark:text-orange-400",
      // },
    ],
    [pagination.total, movementData],
  )

  // Auto-scroll carousel
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => {
  //       const maxSlides = Math.ceil(statsCards.length / cardsPerView)
  //       return (prev + 1) % maxSlides
  //     })
  //   }, 3000)

  //   return () => clearInterval(interval)
  // }, [statsCards.length, cardsPerView])

  // Responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1)
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2)
      } else if (window.innerWidth < 1280) {
        setCardsPerView(3)
      } else {
        setCardsPerView(4)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  console.log("Cards per view", cardsPerView);

  const totalSlides = Math.ceil(statsCards.length / cardsPerView);

  // Helper function to get active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (filters.actionType !== "All types") count++
    if (filters.assetId) count++
    if (filters.baseId) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.performedBy) count++
    if (selectedAssetFilter) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const actionTypeVariant = {
    purchase: "success",     // green
    transfer: "warning",     // yellow/orange
    assignment: "default",   // gray/neutral
    expenditure: "destructive", // red
  };

  const getAssetById = (id) => {
    return assets.find((asset) => asset._id === id)
  }



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
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-2">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight flex items-center gap-2">
            <IoMdMove className="md:h-7 md:w-7 h-6 w-6" />
            Movement Reports
          </h1>
          <p className="text-muted-foreground">Track all asset movements, assignments, and expenditures</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {pagination.total} Total Logs
          </Badge>
        </div>
      </div>

      {/* Stats Cards Carousel */}
      <div className="hidden relative overflow-hidden rounded-xl bg-primary/10 p-3">
        <div className="relative">
          {/* Carousel Container */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${(currentSlide * 100) / cardsPerView}%)`,
              width: `${(statsCards.length * 100) / cardsPerView}%`,
            }}
          >
            {statsCards.map((card, index) => (
              <div key={index} className="flex-shrink-0 px-2" style={{ width: `${100 / statsCards.length}%` }}>
                <Card className="h-full bg-secondary  border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{card.title}</CardTitle>
                    <div className={`p-2 rounded-full ${card.bgColor}`}>{card.icon}</div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{card.subtitle}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: Math.ceil(statsCards.length / cardsPerView) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-primary w-6" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mob Filters */}
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
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Compact Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-3">

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
                  <Building2 className="h-3 w-3 mr-2" />
                  {filters.baseId === "All bases" || !filters.baseId
                    ? "Base"
                    : bases.find((b) => b._id === filters.baseId)?.name}
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      (filters.baseId === "All bases" || !filters.baseId) && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, baseId: undefined }))}
                  >
                    All bases
                  </Button>
                  {bases.map((base) => (
                    <Button
                      key={base._id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-8 text-sm",
                        filters.baseId === base._id && "bg-primary/10 text-primary",
                      )}
                      onClick={() => setFilters((prev) => ({ ...prev, baseId: base._id }))}
                    >
                      {base.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Action Type */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Tag className="h-3 w-3 mr-2" />
                {filters.actionType === "All types" ? "Action Type" : filters.actionType}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1 capitalize">
                {["All types", "purchase", "transfer", "assignment", "expenditure"].map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm ",
                      filters.actionType === type && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, actionType: type }))}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Range */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", filters.dateFrom && "border-primary/50 bg-primary/5")}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-primary/50 text-sm">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", filters.dateTo && "border-primary/50 bg-primary/5")}
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
            {filters.actionType !== "All types" && (
              <Badge variant="secondary" className="text-xs">
                {filters.actionType}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, actionType: "All types" }))}
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

      {/* Web Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm hidden md:block">
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
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Compact Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 py-2">
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
                  <Building2 className="h-3 w-3 mr-2" />
                  {filters.baseId === "All bases" || !filters.baseId
                    ? "Base"
                    : bases.find((b) => b._id === filters.baseId)?.name}
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm",
                      (filters.baseId === "All bases" || !filters.baseId) && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, baseId: undefined }))}
                  >
                    All bases
                  </Button>
                  {bases.map((base) => (
                    <Button
                      key={base._id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-8 text-sm",
                        filters.baseId === base._id && "bg-primary/10 text-primary",
                      )}
                      onClick={() => setFilters((prev) => ({ ...prev, baseId: base._id }))}
                    >
                      {base.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Action Type */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Tag className="h-3 w-3 mr-2" />
                {filters.actionType === "All types" ? "Action Type" : filters.actionType}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1 capitalize">
                {["All types", "purchase", "transfer", "assignment", "expenditure"].map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 text-sm ",
                      filters.actionType === type && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, actionType: type }))}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Range */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", filters.dateFrom && "border-primary/50 bg-primary/5")}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-primary/50 text-sm">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", filters.dateTo && "border-primary/50 bg-primary/5")}
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
            {filters.actionType !== "All types" && (
              <Badge variant="secondary" className="text-xs">
                {filters.actionType}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, actionType: "All types" }))}
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

      {/* Movement Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movement Logs</CardTitle>
          <CardDescription>Complete history of all asset movements and transactions</CardDescription>
        </CardHeader>
        <CardContent className='p-3 py-0'>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("date")} className="h-auto p-0 font-semibold">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Asset Details</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementData.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.date), "MMM dd, yyyy")}
                      <div className="text-xs text-muted-foreground">{format(new Date(log.date), "HH:mm")}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={actionTypeVariant[log.actionType] || "default"}
                        className="capitalize"
                      >
                        {log.actionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {log.items.map((item, index) => (
                          <div key={index} className="flex flex-col">
                            <span className="font-medium">{item.asset.name}</span>
                            <span className="text-xs text-muted-foreground capitalize">{item.asset.category}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {log.items.map((item, index) => (
                          <Badge key={index} variant="outline" className="font-mono">
                            {item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{log.base.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.base.district}, {log.base.state}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{log.performedBy.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {log.performedBy.role.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate" title={log.remarks}>
                        {log.remarks}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {movementData.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No movement logs found</h3>
                <p className="text-muted-foreground mb-4">No movement logs match your current filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2 py-4 w-full">

              {/* Pagination Summary */}
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} results
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 md:justify-end w-full md:w-auto">

                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsPage
