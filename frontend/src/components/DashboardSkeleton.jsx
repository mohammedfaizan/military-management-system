import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  TrendingUp,
  Activity,
  Users,
  ShoppingCart,
  Zap,
  Download,
  Send,
  Filter,
  BarChart3,
  Eye,
  Tag,
  Building2,
  CalendarIcon,
  ChevronDown,
} from "lucide-react"

export default function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight">
            <Skeleton className="h-8 w-64" />
          </h1>
          <div className="mt-2">
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Button variant="outline" size="sm" disabled>
            <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-20" />
          </Button>
        </div>
      </div>

      {/* Mobile Filters Skeleton */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              Filters
            </CardTitle>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-2">
          <Button variant="outline" size="sm" className="h-9" disabled>
            <Tag className="h-3 w-3 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-16" />
            <ChevronDown className="h-3 w-3 ml-2 text-muted-foreground" />
          </Button>

          <Button variant="outline" size="sm" className="h-9" disabled>
            <Building2 className="h-3 w-3 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-20" />
            <ChevronDown className="h-3 w-3 ml-2 text-muted-foreground" />
          </Button>

          <Button variant="outline" size="sm" className="h-9" disabled>
            <CalendarIcon className="h-3 w-3 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-24" />
          </Button>
        </div>
      </Card>

      {/* Desktop Filters Skeleton */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              Filters
            </CardTitle>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" disabled>
            <Tag className="h-3 w-3 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-16" />
            <ChevronDown className="h-3 w-3 ml-2 text-muted-foreground" />
          </Button>

          <Button variant="outline" size="sm" className="h-9" disabled>
            <Building2 className="h-3 w-3 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-20" />
            <ChevronDown className="h-3 w-3 ml-2 text-muted-foreground" />
          </Button>

          <Button variant="outline" size="sm" className="h-9" disabled>
            <CalendarIcon className="h-3 w-3 mr-2 text-muted-foreground" />
            <Skeleton className="h-4 w-24" />
          </Button>
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
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Movement</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-20" />
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
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expended</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-26" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers In</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers Out</CardTitle>
            <Send className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      </div>

      {/* Asset Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 py-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">Closing</TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50">Net Movement</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">Expended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-6 w-12 rounded-full ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
