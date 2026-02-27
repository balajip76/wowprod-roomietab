export const dynamic = 'force-dynamic'

import { getAuthenticatedClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'
import { formatMonthYear, getMonthEnd, getMonthStart } from '@/lib/utils'
import { computeMemberSummaries, computeMinimumTransactions } from '@/lib/settlement-algorithm'
import type { Category } from '@/lib/constants'

export default async function DashboardPage() {
  const { user, db } = await getAuthenticatedClient()
  if (!user || !db) redirect('/login')

  // Get user's household member record
  const { data: member } = await db
    .schema('roomietab')
    .from('members')
    .select('*, household:household_id(id, name, invite_code)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) redirect('/onboarding/setup')

  const householdId = member.household_id
  const now = new Date()
  const monthStart = getMonthStart(now)
  const monthEnd = getMonthEnd(now)

  // Get all household members
  const { data: members } = await db
    .schema('roomietab')
    .from('members')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('joined_at')

  // Get this month's expenses
  const { data: expenses } = await db
    .schema('roomietab')
    .from('expenses')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_deleted', false)
    .gte('expense_date', monthStart)
    .lte('expense_date', monthEnd)
    .order('expense_date', { ascending: false })

  // Get splits for this month's expenses
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

  // Compute summaries
  const expenseIdSet = new Set(expenseIds)
  const summaries = computeMemberSummaries(allMembers, allExpenses, allSplits, expenseIdSet)
  const transactions = computeMinimumTransactions(
    summaries.map((s) => ({ memberId: s.memberId, netBalance: s.netBalance }))
  )

  // Category totals for chart
  const categoryTotals = Object.entries(
    allExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount_cents
      return acc
    }, {})
  ).map(([category, total]) => ({ category: category as Category, total }))

  // My summary
  const mySummary = summaries.find((s) => s.memberId === member.id)

  const currentMonth = formatMonthYear(now)

  return (
    <DashboardClient
      currentMember={member}
      household={member.household as { id: string; name: string; invite_code: string }}
      members={allMembers}
      expenses={allExpenses}
      splits={allSplits}
      summaries={summaries}
      transactions={transactions}
      categoryTotals={categoryTotals}
      mySummary={mySummary ?? null}
      currentMonth={currentMonth}
    />
  )
}
