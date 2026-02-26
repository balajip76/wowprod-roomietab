import { cn, formatCents, getInitials, getMemberBgColor, getMemberColor } from '@/lib/utils'
import type { Member } from '@/components/member-avatar-group'

interface BalanceSummaryCardProps {
  member: Member
  totalPaid: number
  totalOwed: number
  netBalance: number
  isCurrentUser?: boolean
  compact?: boolean
  colorIndex?: number
}

export function BalanceSummaryCard({
  member,
  totalPaid,
  totalOwed,
  netBalance,
  isCurrentUser,
  compact,
  colorIndex = 0,
}: BalanceSummaryCardProps) {
  const isPositive = netBalance >= 0
  const bgColor = getMemberBgColor(colorIndex)
  const textColor = getMemberColor(colorIndex)

  return (
    <div
      className={cn(
        'bg-white rounded-[14px] border px-4 py-3 shadow-card',
        isCurrentUser ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-blue-100'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {member.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar_url}
            alt={member.display_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {getInitials(member.display_name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {member.display_name}
            {isCurrentUser && (
              <span className="ml-1 text-xs text-indigo-500">(you)</span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-3 gap-1 text-center text-xs text-gray-500 mb-2">
          <div>
            <div className="font-semibold text-gray-900 text-sm">{formatCents(totalPaid)}</div>
            <div>Paid</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{formatCents(totalOwed)}</div>
            <div>Share</div>
          </div>
          <div>
            <div
              className={cn(
                'font-bold text-sm',
                isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {isPositive ? '+' : ''}{formatCents(netBalance)}
            </div>
            <div>Net</div>
          </div>
        </div>
      )}

      {compact && (
        <div
          className={cn(
            'font-bold text-lg',
            isPositive ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {isPositive ? '+' : ''}{formatCents(netBalance)}
        </div>
      )}
    </div>
  )
}
