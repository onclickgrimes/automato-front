"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Instagram,
  MessageCircle,
  Facebook,
  Clock,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Instagram',
    href: '/dashboard/instagram',
    icon: Instagram,
  },
  {
    name: 'WhatsApp',
    href: '/dashboard/whatsapp',
    icon: MessageCircle,
  },
  {
    name: 'Facebook',
    href: '/dashboard/facebook',
    icon: Facebook,
  },
  {
    name: 'Rotinas',
    href: '/dashboard/routines',
    icon: Clock,
  },
  {
    name: 'Proxies',
    href: '/dashboard/proxies',
    icon: Globe,
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobileOpen?: boolean
  setIsMobileOpen?: (open: boolean) => void
}

export function DashboardSidebar({ 
  collapsed, 
  setCollapsed, 
  isMobileOpen = false, 
  setIsMobileOpen 
}: DashboardSidebarProps) {
  const pathname = usePathname()

  // Fechar sidebar mobile ao clicar em um link
  const handleLinkClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  // Fechar sidebar mobile ao pressionar ESC
  useEffect(() => {
    // Verificar se estamos no cliente antes de acessar document
    if (typeof window === 'undefined') return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && setIsMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileOpen, setIsMobileOpen])

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300",
        "lg:relative lg:translate-x-0",
        collapsed ? "w-16" : "w-64",
        // Mobile styles
        "fixed inset-y-0 left-0 z-50 lg:static",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900">Automato</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            {/* Botão de fechar mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen?.(false)}
              className="h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Botão de colapsar desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 hidden lg:flex"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href} onClick={handleLinkClick}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 transition-all duration-200",
                    collapsed && "justify-center px-0",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
                    !isActive && "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    !collapsed && "mr-3"
                  )} />
                  {!collapsed && (
                    <span className="truncate text-left">{item.name}</span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          {!collapsed && (
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium">Automato SaaS</p>
              <p className="text-gray-400">v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}