'use client'

import { cn, formatCents, getInitials, getMemberBgColor, getMemberColor } from '@/lib/utils'
import type { Member } from '@/components/member-avatar-group'
import { ArrowRight, CheckCircle } from 'lucide-react'

interface SettlementTransactionRowProps {
  id: string
  payer: Member
  receiver: Member
  amount: number
  isSettled: boolean
  onSettle: (id: string) => void
  venmoUrl?: string
  paypalUrl?: string
  zelleUrl?: string
  payerIndex?: number
  receiverIndex?: number
}

function MiniAvatar({ member, colorIndex }: { member: Member; colorIndex: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {member.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.avatar_url}
          alt={member.display_name}
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm"
          style={{
            backgroundColor: getMemberBgColor(colorIndex),
            color: getMemberColor(colorIndex),
          }}
        >
          {getInitials(member.display_name)}
        </div>
      )}
      <span className="text-[10px] text-gray-600 font-medium">
        {member.display_name.split(' ')[0]}
      </span>
    </div>
  )
}

export function SettlementTransactionRow({
  id,
  payer,
  receiver,
  amount,
  isSettled,
  onSettle,
  venmoUrl,
  paypalUrl,
  zelleUrl,
  payerIndex = 0,
  receiverIndex = 1,
}: SettlementTransactionRowProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-blue-200 bg-blue-50/30 p-3 space-y-2 transition-opacity',
        isSettled && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSettled}
          onChange={() => onSettle(id)}
          className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
          aria-label={`Mark transaction from ${payer.display_name} to ${receiver.display_name} as settled`}
        />
        <div className="flex-1 flex items-center justify-between gap-2">
          <MiniAvatar member={payer} colorIndex={payerIndex} />

          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 border-b-2 border-dashed border-gray-300" />
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <span
              className={cn(
                'font-bold text-lg',
                isSettled ? 'line-through text-gray-400' : 'text-gray-900'
              )}
            >
              {formatCents(amount)}
            </span>
            {isSettled && (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <CheckCircle className="w-3 h-3" /> Settled
              </span>
            )}
          </div>

          <MiniAvatar member={receiver} colorIndex={receiverIndex} />
        </div>
      </div>

      {!isSettled && (venmoUrl || paypalUrl || zelleUrl) && (
        <div className="flex gap-2 pl-7">
          {venmoUrl && (
            <a
              href={venmoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold py-1.5 px-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              💙 Venmo
            </a>
          )}
          {paypalUrl && (
            <a
              href={paypalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold py-1.5 px-2 rounded-lg bg-blue-900 text-white hover:bg-blue-950 transition-colors"
            >
              🅿️ PayPal
            </a>
          )}
          {zelleUrl && (
            <a
              href={zelleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold py-1.5 px-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              ⚡ Zelle
            </a>
          )}
        </div>
      )}
    </div>
  )
}
