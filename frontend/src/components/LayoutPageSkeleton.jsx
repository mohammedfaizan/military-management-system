import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LayoutDashboard,
  ArrowRightLeft,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Search,
  Menu,
  Bell,
  Moon,
  LucideNotebookText,
  LampIcon as LucideLogs,
} from "lucide-react"
import { MdOutlineInventory2, MdOutlineAssignmentTurnedIn } from "react-icons/md"
import { BiPurchaseTag } from "react-icons/bi"
import { FaPersonMilitaryRifle, FaUsers } from "react-icons/fa6"
import { IoLocationSharp } from "react-icons/io5"

export default function LayoutSkeleton() {
  const navigationItems = [
    { icon: <LayoutDashboard className="h-5 w-5 text-muted-foreground" />, name: "Dashboard" },
    { icon: <MdOutlineInventory2 className="h-5 w-5 text-muted-foreground" />, name: "Stocks & Inventory" },
    { icon: <BiPurchaseTag className="h-5 w-5 text-muted-foreground" />, name: "Purchased Assets" },
    { icon: <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />, name: "Transferred Assets" },
    { icon: <MdOutlineAssignmentTurnedIn className="h-5 w-5 text-muted-foreground" />, name: "Assigned Assets" },
    { icon: <LucideNotebookText className="h-5 w-5 text-muted-foreground" />, name: "Expended Assets" },
    { icon: <LucideLogs className="h-5 w-5 text-muted-foreground" />, name: "Movement Logs" },
  ]

  const accountItems = [
    { icon: <User className="h-5 w-5 text-muted-foreground" />, name: "Profile" },
    { icon: <FaUsers className="h-5 w-5 text-muted-foreground" />, name: "Users Page" },
    { icon: <Settings className="h-5 w-5 text-muted-foreground" />, name: "Settings" },
  ]

  return (
    <div className="h-screen flex flex-col bg-background animate-pulse">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="w-full flex h-16 items-center px-4 justify-between sm:space-x-0">
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Button variant="ghost" size="icon" className="lg:hidden" disabled>
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>

            {/* App logo/title for mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <FaPersonMilitaryRifle className="h-4 w-4 text-muted-foreground" />
              </div>
              <Skeleton className="h-5 w-48 hidden sm:block" />
            </div>

            {/* App logo/title for Web */}
            <div className="hidden lg:flex h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <FaPersonMilitaryRifle className="h-4 w-4 text-muted-foreground" />
                </div>
                <Skeleton className="h-5 w-56" />
              </div>
            </div>
          </div>

          {/* Center section with search */}
          <div className="hidden flex flex-1 items-center justify-end lg:justify-center px-2">
            <div className="relative hidden md:block w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full pl-8 rounded-full" disabled />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center justify-end gap-2">
            {/* Role Badge */}
            <div className="md:block hidden">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Location Badge */}
            <div className="md:flex hidden items-center gap-2 bg-muted/50 border border-muted rounded-md px-3 py-1">
              <IoLocationSharp className="text-muted-foreground text-lg" />
              <div className="flex flex-row gap-1 leading-tight text-xs">
                <Skeleton className="h-3 w-8" />
                <span className="text-muted-foreground">,</span>
                <Skeleton className="h-3 w-12" />
              </div>
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" className="ml-2 rounded-full" disabled>
              <Moon size={18} className="text-muted-foreground" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" disabled>
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-muted"></span>
            </Button>

            {/* User Menu */}
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-muted">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden h-full border-r bg-background lg:block lg:w-64 lg:flex-shrink-0">
          <div className="flex h-screen w-64 flex-col bg-background border-r shadow-sm relative">
            {/* Header */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2 shadow-sm">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Scrollable Section */}
            <ScrollArea className="flex-1 px-3 pt-3 pb-6 overflow-y-auto">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1 px-1">Main Navigation</h3>
                <div className="space-y-1">
                  {navigationItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150 hover:bg-muted text-muted-foreground"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account */}
              <div className="mt-4">
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1 px-1">Account</h3>
                <div className="space-y-1">
                  {accountItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150 hover:bg-muted text-muted-foreground"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-6 px-1 mb-20">
                <div className="rounded-lg border bg-card p-3 space-y-2 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Skeleton className="h-4 w-32" />
                  </Button>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t px-4 py-5 bg-background shadow-inner sticky bottom-0">
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3 mb-3 border">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted">
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              </div>
              <Button size="sm" className="w-full justify-start bg-muted text-muted-foreground hover:bg-muted" disabled>
                <LogOut className="mr-2 h-4 w-4" />
                <Skeleton className="h-4 w-12" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Page Content - Scrollable */}
        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="w-full p-2 md:p-6">
              {/* Main content skeleton */}
              <div className="space-y-6">
                {/* Page header skeleton */}
                <div className="flex md:flex-row flex-col md:items-center md:justify-between gap-4">
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>

                {/* Content cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-4 rounded" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Large content area skeleton */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-48" />
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Skeleton key={index} className="h-12 w-full" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
