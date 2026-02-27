export const dynamic = 'force-dynamic'

import { getAuthenticatedClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettleClient } from './settle-client'
import { formatMonthYear, getMonthEnd, getMonthStart } from '@/lib/utils'
import { computeMemberSummaries, computeMinimumTransactions } from '@/lib/settlement-algorithm'

export default async function SettlePage() {
  const { user, db } = await getAuthenticatedClient()
  if (!user || !db) redirect('/login')

  const { data: member } = await db
    .schema('roomietab')
    .from('members')
    .select('*, household:household_id(id, name)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) redirect('/onboarding/setup')

  const householdId = member.household_id
  const now = new Date()
  const monthStart = getMonthStart(now)
  const monthEnd = getMonthEnd(now)

  const { data: members } = await db
    .schema('roomietab')
    .from('members')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)

  const { data: expenses } = await db
    .schema('roomietab')
    .from('expenses')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_deleted', false)
    .gte('expense_date', monthStart)
    .lte('expense_date', monthEnd)

  const expenseIds = (expenses ?? []).map((e) => e.id)
  const { data: splits } = expenseIds.length > 0
    ? await db
        .schema('roomietab')
        .from('expense_splits')
        .select('*')
        .in('expense_id', expenseIds)
    : { data: [] }

  const allMembers = members ?? []
  const allExpenses = expenses ?? []
  const allSplits = splits ?? []

  const expenseIdSet = new Set(expenseIds)
  const summaries = computeMemberSummaries(allMembers, allExpenses, allSplits, expenseIdSet)
  const transactions = computeMinimumTransactions(
    summaries.map((s) => ({ memberId: s.memberId, netBalance: s.netBalance }))
  )

  return (
    <SettleClient
      currentMember={member}
      household={member.household as { id: string; name: string }}
      members={allMembers}
      summaries={summaries}
      transactions={transactions}
      currentMonth={formatMonthYear(now)}
      monthStart={monthStart}
    />
  )
}
