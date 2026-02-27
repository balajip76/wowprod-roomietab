import { getAuthenticatedClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface SplitConfig {
  memberId: string
  amountCents: number
  percentage?: number
  shares?: number
}

export async function POST(request: Request) {
  try {
    const { user, db } = await getAuthenticatedClient()

    if (!user || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      householdId,
      description,
      amountCents,
      category,
      splitType,
      paidByMemberId,
      expenseDate,
      splits,
      isRecurring = false,
      recurringDay,
    } = body

    // Validate required fields
    if (!householdId || !description?.trim() || !amountCents || !paidByMemberId || !splits) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amountCents <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Validate splits sum equals total
    const splitSum = (splits as SplitConfig[]).reduce((sum, s) => sum + s.amountCents, 0)
    if (splitSum !== amountCents) {
      return NextResponse.json(
        { error: `Split amounts (${splitSum}) must equal total (${amountCents})` },
        { status: 400 }
      )
    }

    // Verify user is a member of the household
    const { data: member } = await db
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

    // Create expense
    const { data: expense, error: expenseError } = await db
      .schema('roomietab')
      .from('expenses')
      .insert({
        household_id: householdId,
        description: description.trim(),
        amount_cents: amountCents,
        category: category ?? 'other',
        split_type: splitType ?? 'equal',
        paid_by_member_id: paidByMemberId,
        expense_date: expenseDate ?? new Date().toISOString().split('T')[0],
        is_recurring: isRecurring,
        recurring_day: recurringDay ?? null,
      })
      .select()
      .single()

    if (expenseError || !expense) {
      return NextResponse.json(
        { error: expenseError?.message ?? 'Failed to create expense' },
        { status: 500 }
      )
    }

    // Create splits
    const splitRows = (splits as SplitConfig[]).map((s) => ({
      expense_id: expense.id,
      member_id: s.memberId,
      amount_cents: s.amountCents,
      percentage: s.percentage ?? null,
      shares: s.shares ?? null,
    }))

    const { data: expenseSplits, error: splitsError } = await db
      .schema('roomietab')
      .from('expense_splits')
      .insert(splitRows)
      .select()

    if (splitsError) {
      // Rollback: delete expense
      await db.schema('roomietab').from('expenses').delete().eq('id', expense.id)
      return NextResponse.json({ error: splitsError.message }, { status: 500 })
    }

    return NextResponse.json({ expense, splits: expenseSplits }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
