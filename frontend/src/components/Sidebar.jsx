import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  ArrowRightLeft,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight,
  LucideNotebookText,
  LucideLogs
} from 'lucide-react'
import { MdOutlineInventory2, MdOutlineAssignmentTurnedIn } from 'react-icons/md'
import { BiPurchaseTag } from 'react-icons/bi'
import { FaPersonMilitaryRifle, FaUsers } from 'react-icons/fa6'
import { getRoleColor, getRoleLabel } from '../utils/roleColorLabel'

export const Sidebar = ({ pageTitle }) => {
  const { user, logout, role } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const mainNavigation = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'base_commander', 'logistics_officer'] },
    { name: 'Stocks & Inventory', path: '/stocks', icon: <MdOutlineInventory2 className="h-5 w-5" />, roles: ['admin', 'base_commander', 'logistics_officer'] },
    { name: 'Purchased Assets', path: '/purchase', icon: <BiPurchaseTag className="h-5 w-5" />, roles: ['admin', 'logistics_officer'] },
    { name: 'Transfered Assets', path: '/transfer', icon: <ArrowRightLeft className="h-5 w-5" />, roles: ['admin', 'logistics_officer'] },
    { name: 'Assigned Assets', path: '/assignment', icon: <MdOutlineAssignmentTurnedIn className="h-5 w-5" />, roles: ['admin', 'base_commander'] },
    { name: 'Expended Assets', path: '/expend', icon: <LucideNotebookText className="h-5 w-5" />, roles: ['admin', 'base_commander'] },
    { name: 'Movement Logs', path: '/reports', icon: <LucideLogs className="h-5 w-5" />, roles: ['admin', 'base_commander', 'logistics_officer'] }
  ]

  const accountItems = [
    { name: 'Profile', path: '/profile', icon: <User className="h-5 w-5" />, roles: ['admin', 'base_commander', 'logistics_officer'] },
    { name: 'Users Page', path: '/users', icon: <FaUsers className="h-5 w-5" />, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" />, roles: ['admin'] }
  ]

  const NavItem = ({ item }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.path}
          className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150
            ${isActive(item.path)
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="truncate">{item.name}</span>
          </div>
          {isActive(item.path) && <ChevronRight className="h-4 w-4 opacity-80" />}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{item.name}</TooltipContent>
    </Tooltip>
  )

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-64 flex-col bg-background border-r shadow-sm relative">

        {/* Header */}
        {/* App logo/title for mobile */}
        <div className="lg:hidden px-3 py-5 border-b">
          <Link to="/" className="flex items-center gap-2 ">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
              <FaPersonMilitaryRifle className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm sm:inline-block">
              Military Assets Management
            </span>
          </Link>
        </div>

        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2 shadow-sm">
            <h1 className="text-sm text-center font-semibold truncate">{pageTitle}</h1>
          </div>
        </div>

        {/* Scrollable Section */}
        <ScrollArea className="flex-1 px-3 pt-3 pb-6 overflow-y-auto">

          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1 px-1">Main Navigation</h3>
            <div className="space-y-1">
              {mainNavigation.filter(i => i.roles.includes(role)).map(i => (
                <NavItem key={i.path} item={i} />
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="mt-4">
            <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1 px-1">Account</h3>
            <div className="space-y-1">
              {accountItems.filter(i => i.roles.includes(role)).map(i => (
                <NavItem key={i.path} item={i} />
              ))}
            </div>
          </div>

         
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-5 bg-background shadow-inner sticky bottom-0">
          <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3 mb-3 border">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
              <Badge variant="outline" className={`text-xs ${getRoleColor(role)}`}>
                {getRoleLabel(role)}
              </Badge>
            </div>
          </div>
          <Button
            onClick={logout}
            size="sm"
            className="w-full justify-start bg-red-500 text-white hover:bg-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
