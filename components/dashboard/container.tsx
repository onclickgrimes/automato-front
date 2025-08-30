'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
}

interface DashboardContainerProps {
  children: React.ReactNode
  user: User
  profile: Profile | null
}

export function DashboardContainer({ children, user, profile }: DashboardContainerProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Proteção contra hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderização segura durante hidratação
  if (!mounted) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Sidebar placeholder */}
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm" />
        
        {/* Main content placeholder */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="h-16 bg-white border-b border-gray-200" />
          <main className="flex-1 py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main content */}
      <div
        className={cn(
          'flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300',
          // Desktop padding adjustment
          // Mobile: full width
          'ml-0'
        )}
      >
        <div className="sticky top-0 z-30 flex-shrink-0">
          <DashboardHeader 
            user={user} 
            profile={profile} 
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        </div>

        <main className="flex-1 py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}