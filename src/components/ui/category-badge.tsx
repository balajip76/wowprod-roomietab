import { cn } from '@/lib/utils'
import { CATEGORIES, type Category } from '@/lib/constants'

interface CategoryBadgeProps {
  category: Category
  compact?: boolean
  size?: 'sm' | 'md'
}

export function CategoryBadge({
  category,
  compact = false,
  size = 'md',
}: CategoryBadgeProps) {
  const config = CATEGORIES[category]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold font-caveat leading-none',
        config.bgClass,
        config.textClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
      )}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {!compact && <span>{config.label}</span>}
    </span>
  )
}
