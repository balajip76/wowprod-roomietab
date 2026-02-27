import { getAuthenticatedClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getMonthStart, getMonthEnd, formatCents } from '@/lib/utils'
import { parseISO } from 'date-fns'

export async function POST(request: Request) {
  try {
    const { user, db } = await getAuthenticatedClient()

    if (!user || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { householdId, month } = await request.json()

    if (!householdId || !month) {
      return NextResponse.json({ error: 'householdId and month are required' }, { status: 400 })
    }

    // Verify membership
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

    const monthDate = parseISO(month)
    const monthStart = getMonthStart(monthDate)
    const monthEnd = getMonthEnd(monthDate)

    // Get all members (for lookup)
    const { data: members } = await db
      .schema('roomietab')
      .from('members')
      .select('id, display_name')
      .eq('household_id', householdId)

    const memberMap = new Map((members ?? []).map((m) => [m.id, m.display_name]))

    // Get expenses
    const { data: expenses } = await db
      .schema('roomietab')
      .from('expenses')
      .select('*, expense_splits(*)')
      .eq('household_id', householdId)
      .eq('is_deleted', false)
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)
      .order('expense_date', { ascending: true })

    // Build CSV
    const rows: string[] = [
      'Date,Description,Category,Total,Paid By,Split Among,My Share',
    ]

    for (const expense of expenses ?? []) {
      const paidByName = memberMap.get(expense.paid_by_member_id) ?? 'Unknown'
      const splits = expense.expense_splits as Array<{ member_id: string; amount_cents: number }>
      const splitNames = splits.map((s) => memberMap.get(s.member_id) ?? '?').join(' + ')
      const myShare = splits.find((s) => s.member_id === member.id)?.amount_cents ?? 0

      rows.push([
        expense.expense_date,
        `"${expense.description.replace(/"/g, '""')}"`,
        expense.category,
        formatCents(expense.amount_cents),
        `"${paidByName}"`,
        `"${splitNames}"`,
        formatCents(myShare),
      ].join(','))
    }

    const csv = rows.join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="roomietab-${month}.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
