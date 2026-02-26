'use client'

import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
  showPulse?: boolean
  isHidden?: boolean
}

export function FloatingActionButton({
  onClick,
  showPulse = false,
  isHidden = false,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Add expense"
      className={cn(
        'fixed bottom-20 right-5 w-14 h-14 rounded-full bg-indigo-500 text-white',
        'shadow-fab flex items-center justify-center z-50',
        'transition-all active:scale-95 hover:bg-indigo-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
        showPulse && 'animate-pulse-scale',
        isHidden && 'opacity-0 pointer-events-none scale-0'
      )}
    >
      <Plus className="w-7 h-7" strokeWidth={2.5} />
    </button>
  )
}
