'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt, Handshake, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/settle', label: 'Settle', icon: Handshake },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface NavBarProps {
  householdName?: string
  unreadCount?: number
}

export function NavBar({ householdName, unreadCount }: NavBarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-blue-100 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="font-caveat font-bold text-2xl text-indigo-600">
            🏠 RoomieTab
          </span>
          {householdName && (
            <span className="text-gray-400 text-sm">/ {householdName}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {label === 'Expenses' && unreadCount && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 bg-white border-t border-blue-100 flex md:hidden z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 transition-colors relative',
                isActive ? 'text-indigo-600' : 'text-gray-500'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full" />
              )}
              <div className="relative">
                <Icon className="w-5 h-5" />
                {label === 'Expenses' && unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
