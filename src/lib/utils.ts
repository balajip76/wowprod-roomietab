import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function parseCentsFromDollarString(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return 0
  return Math.round(num * 100)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMMM yyyy')
}

export function getMonthStart(date: Date = new Date()): string {
  return format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd')
}

export function getMonthEnd(date: Date = new Date()): string {
  return format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd')
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getMemberColor(index: number): string {
  const colors = [
    '#6366F1', // indigo
    '#0D9488', // teal
    '#D97706', // amber
    '#DC2626', // red
    '#059669', // emerald
  ]
  return colors[index % colors.length]
}

export function getMemberBgColor(index: number): string {
  const colors = [
    '#EEF2FF', // indigo-50
    '#CCFBF1', // teal-100
    '#FEF3C7', // amber-100
    '#FEE2E2', // red-100
    '#DCFCE7', // green-100
  ]
  return colors[index % colors.length]
}
