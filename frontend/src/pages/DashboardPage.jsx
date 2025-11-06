import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  Package,
  TrendingUp,
  Building2,
  Tag,
  ChevronDown,
  Activity,
  ShoppingCart,
  Send,
  Download,
  Users,
  Zap,
  Filter,
  X,
  BarChart3,
  PieChart,
  Eye,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { formatInTimeZone } from 'date-fns-tz'
import { cn } from "@/lib/utils"
import { dataSummaryAPI } from "../services/api.js"
import { useAssetBase } from "../context/AssetBaseContext"
import { istTimeZone } from "../utils/constants.js"
import DashboardSkeleton from "../components/DashboardSkeleton.jsx"

const DashboardPage = () => {
  const { user, isAdmin } = useAuth()
  const { bases } = useAssetBase()
  const navigate = useNavigate()
  const [summaryData, setSummaryData] = useState([])
  const [baseInfo, setBaseInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMovement, setSelectedMovement] = useState(null)
  const [showMovementDialog, setShowMovementDialog] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    date: Date.now() - 24 * 60 * 60 * 1000,
    dateFrom: null,
    dateTo: null,
    category: "All categories",
    base_id: "",
  })

  useEffect(() => {
    if (isAdmin && bases.length > 0) {
      const savedBaseId = localStorage.getItem("selected_base_id")
      const defaultBaseId = savedBaseId || bases[0]._id
      if (!filters.base_id) {
        setFilters((prev) => ({ ...prev, base_id: defaultBaseId }))
      }
    }
  }, [isAdmin, bases])

  useEffect(() => {
    if (filters.base_id) {
      localStorage.setItem("selected_base_id", filters.base_id)
    }
  }, [filters.base_id])


  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAdmin && !filters.base_id) return
      try {
        setLoading(true)

        const params = {
          date: filters.date ? format(filters.date, "yyyy-MM-dd") : undefined,
          dateFrom: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
          dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
          category: filters.category !== "All categories" ? filters.category : undefined,
          ...(isAdmin ? { base_id: filters.base_id } : {}),
        }


        const queryParams = Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined))

        const data = await dataSummaryAPI.getMyStock(queryParams)
        setSummaryData(data.summaries)
        setBaseInfo(data.base)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [filters])


  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    if (!summaryData.length)
      return {
        totalOpeningBalance: 0,
        totalClosingBalance: 0,
        totalNetMovements: 0,
        totalPurchases: 0,
        totalTransfersIn: 0,
        totalTransfersOut: 0,
        totalAssigned: 0,
        totalExpended: 0,
        assetCount: 0,
      }

    return summaryData.reduce(
      (acc, item) => ({
        totalOpeningBalance: acc.totalOpeningBalance + item.openingBalance,
        totalClosingBalance: acc.totalClosingBalance + item.closingBalance,
        totalNetMovements: acc.totalNetMovements + item.netMovements,
        totalPurchases: acc.totalPurchases + item.purchases,
        totalTransfersIn: acc.totalTransfersIn + item.transfersIn,
        totalTransfersOut: acc.totalTransfersOut + item.transfersOut,
        totalAssigned: acc.totalAssigned + item.assigned,
        totalExpended: acc.totalExpended + item.expended,
        assetCount: acc.assetCount + 1,
      }),
      {
        totalOpeningBalance: 0,
        totalClosingBalance: 0,
        totalNetMovements: 0,
        totalPurchases: 0,
        totalTransfersIn: 0,
        totalTransfersOut: 0,
        totalAssigned: 0,
        totalExpended: 0,
        assetCount: 0,
      },
    )
  }, [summaryData])

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      category: "All categories",
      base_id: user?.role === "admin" && bases.length > 0 ? bases[0]._id : "",
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.category !== "All categories") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const handleNetMovementClick = (item) => {
    setSelectedMovement(item)
    setShowMovementDialog(true)
  }

  if (loading) {
    return (
      <DashboardSkeleton />
    )
  }

  if (error) {
    return (
      <div className="flex items-start justify-center min-h-screen mt-10">
        <Card className="w-full max-w-md shadow-xl border-destructive/40">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive text-2xl">Something Went Wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              className="gap-2 hover:bg-primary/10"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 animate-spin-on-hover" />
              Refresh Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            {baseInfo ? `${baseInfo.name} - ${baseInfo.district}, ${baseInfo.state}` : "Asset inventory summary"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {metrics.assetCount} Assets
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate("/stocks")}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Mob Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
        <div className="flex items-center justify-between mb-3">
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
          {/* Date Range */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", filters.date && "border-primary/50 bg-primary/5")}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {
                    filters.date
                      ? (formatInTimeZone(filters.date, istTimeZone, "MMM dd, yyyy"))
                      : "As on Date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

          </div>

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
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
          {isAdmin && bases.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Building2 className="h-3 w-3 mr-2" />
                  {bases.find((b) => b._id === filters.base_id)?.name || "Select Base"}
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
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
        </div>
      </Card>

      {/* Web Filters */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        <div className="flex items-center justify-between mb-3">
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
          {/* Date */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", filters.date && "border-primary/50 bg-primary/5")}
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {
                    filters.date
                      ? (formatInTimeZone(filters.date, istTimeZone, "MMM dd, yyyy"))
                      : "As on Date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
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
          {isAdmin && bases.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Building2 className="h-3 w-3 mr-2" />
                  {bases.find((b) => b._id === filters.base_id)?.name || "Select Base"}
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
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

        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOpeningBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total starting inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClosingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory level</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() =>
            handleNetMovementClick({
              purchases: metrics.totalPurchases,
              transfersIn: metrics.totalTransfersIn,
              transfersOut: metrics.totalTransfersOut,
              netMovements: metrics.totalNetMovements,
            })
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Movement</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.totalNetMovements.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Click for breakdown</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAssigned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Assets in use</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">New acquisitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expended</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.totalExpended.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Assets consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers In</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalTransfersIn.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Received transfers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers Out</CardTitle>
            <Send className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.totalTransfersOut.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sent transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Summary</CardTitle>
          <CardDescription>Detailed breakdown by asset type</CardDescription>
        </CardHeader>
        <CardContent className='p-3 py-0'>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">Closing</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleNetMovementClick(metrics)}
                  >
                    Net Movement
                  </TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">Expended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{item.asset.name}</div>
                        <div className="text-sm text-muted-foreground">{item.asset.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.asset.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.openingBalance.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{item.closingBalance.toLocaleString()}</TableCell>
                    <TableCell
                      className="text-right font-mono cursor-pointer hover:bg-primary/5 rounded"
                      onClick={() => handleNetMovementClick(item)}
                    >
                      <Badge
                        variant={
                          item.netMovements > 0 ? "default" : item.netMovements < 0 ? "destructive" : "secondary"
                        }
                      >
                        {item.netMovements > 0 ? "+" : ""}
                        {item.netMovements.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.assigned.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{item.expended.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {summaryData.length === 0 && (
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No data available</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Net Movement Detail Dialog */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Net Movement Breakdown</DialogTitle>
            <DialogDescription>Detailed view of inventory movements</DialogDescription>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4">

              {selectedMovement.asset &&
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="default" className="text-sm">
                    {selectedMovement.asset.name}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    {selectedMovement.asset.category}
                  </Badge>
                </div>}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                    Purchases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{selectedMovement.purchases?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="h-4 w-4 text-blue-600" />
                      Transfers In
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      +{selectedMovement.transfersIn?.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Send className="h-4 w-4 text-red-600" />
                      Transfers Out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      -{selectedMovement.transfersOut?.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Separator />

              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Net Movement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {selectedMovement.netMovements > 0 ? "+" : ""}
                    {selectedMovement.netMovements?.toLocaleString() || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Purchases + Transfers In - Transfers Out</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardPage
