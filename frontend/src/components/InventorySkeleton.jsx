import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Filter, AlertTriangle, ArrowUpDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function InventorySkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-pulse">
      {/* Header with base info */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-2">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="md:h-7 md:w-7 h-6 w-6 text-muted-foreground" />
            <Skeleton className="h-8 w-64" />
          </h1>
          <div className="mt-2">
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Mobile Filters Skeleton */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm block md:hidden">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              {/* Filters */}
            </CardTitle>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-2 mt-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
          <Separator orientation="vertical" className="h-6" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <span className="text-primary/50 text-sm">to</span>
          <Skeleton className="h-9 w-16 rounded-md" />
          <Separator orientation="vertical" className="h-6" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </Card>

      {/* Desktop Filters Skeleton */}
      <Card className="bg-secondary/50 rounded-xl p-4 shadow-sm md:block hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              {/* Filters */}
            </CardTitle>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Separator orientation="vertical" className="h-6" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />

          <div className="flex items-center gap-1">
            <Skeleton className="h-9 w-16 rounded-md" />
            <span className="text-primary/50 text-sm">to</span>
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>

          <Separator orientation="vertical" className="h-6" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Active Filters Skeleton */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary/20">
          <span className="text-xs text-primary/50 font-medium">Active filters:</span>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </Card>

      {/* Inventory Table Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-96" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 py-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="w-[50px]"></TableHead> */}
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-semibold">
                      {/* Asset */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-semibold">
                      {/* Quantity */}
                      {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-semibold">
                      {/* Purchased */}
                      {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-semibold">
                      {/* Expended */}
                      {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-semibold">
                      {/* Assigned */}
                      {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    {/* Transferred Out */}
                    </TableHead>
                  <TableHead>
                    {/* Transferred In */}
                    </TableHead>
                  <TableHead>
                    {/* Last Updated */}
                    </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Generate multiple skeleton rows */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {index % 3 === 0 && (
                        <div className="flex justify-center">
                          {/* <AlertTriangle className="h-4 w-4 text-muted-foreground" /> */}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
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
