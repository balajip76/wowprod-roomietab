export const dynamic = 'force-dynamic'

import { getAuthenticatedClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExpensesClient } from './expenses-client'
import { formatMonthYear, getMonthEnd, getMonthStart } from '@/lib/utils'

export default async function ExpensesPage() {
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
    .order('expense_date', { ascending: false })

  const expenseIds = (expenses ?? []).map((e) => e.id)
  const { data: splits } = expenseIds.length > 0
    ? await db
        .schema('roomietab')
        .from('expense_splits')
        .select('*')
        .in('expense_id', expenseIds)
    : { data: [] }

  return (
    <ExpensesClient
      currentMember={member}
      household={member.household as { id: string; name: string }}
      members={members ?? []}
      expenses={expenses ?? []}
      splits={splits ?? []}
      currentMonth={formatMonthYear(now)}
    />
  )
}
