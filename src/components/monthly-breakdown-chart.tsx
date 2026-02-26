'use client'

import { formatCents } from '@/lib/utils'
import { CATEGORIES, type Category } from '@/lib/constants'
import type { Member } from '@/components/member-avatar-group'

interface CategoryTotal {
  category: Category
  total: number
}

interface MemberTotal {
  member: Member
  paid: number
  share: number
}

interface MonthlyBreakdownChartProps {
  month: string
  categoryTotals: CategoryTotal[]
  memberTotals: MemberTotal[]
  onCategoryClick?: (category: Category) => void
  compact?: boolean
}

const DONUT_COLORS = [
  '#6366F1', '#0D9488', '#D97706', '#DC2626', '#059669', '#0EA5E9', '#8B5CF6', '#6B7280'
]

export function MonthlyBreakdownChart({
  month,
  categoryTotals,
  memberTotals,
  onCategoryClick,
  compact = false,
}: MonthlyBreakdownChartProps) {
  const total = categoryTotals.reduce((sum, c) => sum + c.total, 0)
  const filtered = categoryTotals.filter((c) => c.total > 0)

  // Build donut segments
  let cumulativeAngle = -90
  const radius = 60
  const cx = 80
  const cy = 80
  const strokeWidth = 22

  const segments = filtered.map((item, idx) => {
    const pct = total > 0 ? item.total / total : 0
    const angle = pct * 360
    const startAngle = cumulativeAngle
    cumulativeAngle += angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + angle) * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    return {
      ...item,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
      path: angle > 0 && angle < 360
        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
        : `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`,
      pct,
    }
  })

  return (
    <div className="bg-white rounded-[14px] border border-blue-100 shadow-card px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">📊 {month} Breakdown</h3>
      </div>

      <div className="flex gap-4">
        {/* Donut chart */}
        <div className="shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {segments.length === 0 ? (
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />
            ) : (
              segments.map((seg, idx) => (
                <path
                  key={idx}
                  d={seg.path}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  onClick={() => onCategoryClick?.(seg.category)}
                  className={onCategoryClick ? 'cursor-pointer' : ''}
                />
              ))
            )}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#6B7280">
              Total
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">
              {formatCents(total)}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-1.5 overflow-y-auto max-h-40">
          {filtered.map((item, idx) => {
            const cfg = CATEGORIES[item.category]
            return (
              <button
                key={item.category}
                type="button"
                onClick={() => onCategoryClick?.(item.category)}
                className="w-full flex items-center gap-2 text-left hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                />
                <span className="text-xs text-gray-600 flex-1 truncate">
                  {cfg.emoji} {cfg.label}
                </span>
                <span className="text-xs font-semibold text-gray-900">
                  {formatCents(item.total)}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 italic">No expenses yet</p>
          )}
        </div>
      </div>

      {/* Member bars */}
      {!compact && memberTotals.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Member overview</p>
          <div className="space-y-2">
            {memberTotals.map((mt) => {
              const maxVal = Math.max(...memberTotals.map((m) => Math.max(m.paid, m.share)), 1)
              const paidPct = (mt.paid / maxVal) * 100
              const sharePct = (mt.share / maxVal) * 100
              return (
                <div key={mt.member.id} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 w-14 truncate shrink-0">
                    {mt.member.display_name.split(' ')[0]}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{ width: `${sharePct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 w-14 text-right shrink-0">
                    {formatCents(mt.paid)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Paid
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> Share
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
