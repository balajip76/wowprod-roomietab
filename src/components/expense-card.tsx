'use client'

import { cn, formatCents, formatDate } from '@/lib/utils'
import { CATEGORIES, type Category } from '@/lib/constants'
import { CategoryBadge } from '@/components/ui/category-badge'
import { MemberAvatar, type Member } from '@/components/member-avatar-group'
import { Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface ExpenseCardProps {
  id: string
  description: string
  amount: number
  category: Category
  paidBy: Member
  splitMembers: Member[]
  myShare: number
  date: string
  isRecurring?: boolean
  receiptUrl?: string | null
  onEdit?: () => void
  onDelete?: () => void
  paidByIndex?: number
}

export function ExpenseCard({
  description,
  amount,
  category,
  paidBy,
  myShare,
  date,
  isRecurring,
  onEdit,
  onDelete,
  paidByIndex = 0,
}: ExpenseCardProps) {
  const [swiped, setSwiped] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-[14px]">
      {/* Swipe actions */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 flex items-center gap-1 px-2 bg-white transition-transform',
          swiped ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {onEdit && (
          <button
            onClick={() => { setSwiped(false); onEdit() }}
            className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"
            aria-label="Edit expense"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => { setSwiped(false); onDelete() }}
            className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"
            aria-label="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        className={cn(
          'flex items-center gap-3 bg-white rounded-[14px] border border-blue-100 px-4 py-3 shadow-card hover:shadow-card-hover transition-all cursor-pointer select-none',
          swiped && 'translate-x-[-88px]'
        )}
        onClick={() => setSwiped(!swiped)}
      >
        {/* Category icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0',
            CATEGORIES[category].bgClass
          )}
          aria-hidden="true"
        >
          {CATEGORIES[category].emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-[15px] truncate">
              {description}
            </span>
            {isRecurring && (
              <span title="Recurring" className="text-indigo-500">
                <RefreshCw className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <CategoryBadge category={category} size="sm" />
            <span className="text-xs text-gray-400">·</span>
            <MemberAvatar member={paidBy} size="sm" colorIndex={paidByIndex} />
            <span className="text-xs text-gray-500 truncate">
              {paidBy.display_name}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formatDate(date)}</span>
          </div>
        </div>

        {/* Amounts */}
        <div className="text-right shrink-0">
          <div className="font-bold text-gray-900">{formatCents(amount)}</div>
          <div className="text-xs text-gray-400">
            your share: {formatCents(myShare)}
          </div>
        </div>
      </div>
    </div>
  )
}
