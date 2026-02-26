'use client'

import { cn, getInitials, getMemberColor, getMemberBgColor } from '@/lib/utils'
import Image from 'next/image'

export interface Member {
  id: string
  display_name: string
  avatar_url?: string | null
  email?: string | null
}

interface MemberAvatarGroupProps {
  members: Member[]
  selectable?: boolean
  selected?: string[]
  onToggle?: (memberId: string) => void
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  maxDisplay?: number
}

const sizeMap = {
  sm: { outer: 'w-6 h-6', text: 'text-[9px]', offset: '-ml-1.5' },
  md: { outer: 'w-9 h-9', text: 'text-[11px]', offset: '-ml-2' },
  lg: { outer: 'w-12 h-12', text: 'text-sm', offset: '-ml-3' },
}

export function MemberAvatar({
  member,
  size = 'md',
  colorIndex = 0,
}: {
  member: Member
  size?: 'sm' | 'md' | 'lg'
  colorIndex?: number
}) {
  const { outer, text } = sizeMap[size]
  const initials = getInitials(member.display_name)
  const bgColor = getMemberBgColor(colorIndex)
  const textColor = getMemberColor(colorIndex)

  if (member.avatar_url) {
    return (
      <div className={cn('rounded-full overflow-hidden border-2 border-white', outer)}>
        <Image
          src={member.avatar_url}
          alt={member.display_name}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full border-2 border-white flex items-center justify-center font-bold',
        outer,
        text
      )}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {initials}
    </div>
  )
}

export function MemberAvatarGroup({
  members,
  selectable = false,
  selected = [],
  onToggle,
  size = 'md',
  showLabels = false,
  maxDisplay = 5,
}: MemberAvatarGroupProps) {
  const { outer, text, offset } = sizeMap[size]
  const displayMembers = members.slice(0, maxDisplay)

  if (selectable) {
    return (
      <div className="flex flex-wrap gap-3">
        {displayMembers.map((member, idx) => {
          const isSelected = selected.includes(member.id)
          const initials = getInitials(member.display_name)
          const bgColor = getMemberBgColor(idx)
          const textColor = getMemberColor(idx)

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onToggle?.(member.id)}
              className={cn(
                'flex flex-col items-center gap-1 transition-all',
                !isSelected && 'opacity-40'
              )}
            >
              <div
                className={cn(
                  'rounded-full border-2 flex items-center justify-center font-bold transition-all',
                  outer,
                  text,
                  isSelected
                    ? 'border-indigo-500 scale-110'
                    : 'border-gray-200'
                )}
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={member.display_name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  initials
                )}
              </div>
              {showLabels && (
                <span className="text-[10px] text-gray-600 font-medium max-w-[48px] truncate">
                  {member.display_name.split(' ')[0]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {displayMembers.map((member, idx) => (
        <div
          key={member.id}
          className={cn(idx > 0 && offset)}
          title={member.display_name}
        >
          <MemberAvatar member={member} size={size} colorIndex={idx} />
        </div>
      ))}
    </div>
  )
}
