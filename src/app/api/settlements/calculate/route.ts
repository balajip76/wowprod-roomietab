import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { computeMemberSummaries, computeMinimumTransactions } from '@/lib/settlement-algorithm'
import { getMonthStart, getMonthEnd } from '@/lib/utils'
import { parseISO } from 'date-fns'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { householdId, month } = await request.json()

    if (!householdId || !month) {
      return NextResponse.json({ error: 'householdId and month are required' }, { status: 400 })
    }

    // Verify membership
    const { data: member } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id')
      .eq('household_id', householdId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this household' }, { status: 403 })
    }

    const monthDate = parseISO(month)
    const monthStart = getMonthStart(monthDate)
    const monthEnd = getMonthEnd(monthDate)

    // Get all active members
    const { data: members } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id, display_name')
      .eq('household_id', householdId)
      .eq('is_active', true)

    // Get month's expenses
    const { data: expenses } = await supabase
      .schema('roomietab')
      .from('expenses')
      .select('id, paid_by_member_id, amount_cents, is_deleted')
      .eq('household_id', householdId)
      .eq('is_deleted', false)
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)

    const expenseIds = (expenses ?? []).map((e) => e.id)

    // Get splits
    const { data: splits } = expenseIds.length > 0
      ? await supabase
          .schema('roomietab')
          .from('expense_splits')
          .select('expense_id, member_id, amount_cents')
          .in('expense_id', expenseIds)
      : { data: [] }

    const allMembers = members ?? []
    const allExpenses = expenses ?? []
    const allSplits = splits ?? []
    const expenseIdSet = new Set(expenseIds)

    const memberSummaries = computeMemberSummaries(allMembers, allExpenses, allSplits, expenseIdSet)
    const transactions = computeMinimumTransactions(
      memberSummaries.map((s) => ({ memberId: s.memberId, netBalance: s.netBalance }))
    )

    return NextResponse.json({ transactions, memberSummaries })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
