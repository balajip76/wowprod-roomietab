import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
      splitConfig,
      dayOfMonth,
    } = body

    if (!householdId || !description || !amountCents || !paidByMemberId || !dayOfMonth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (dayOfMonth < 1 || dayOfMonth > 31) {
      return NextResponse.json({ error: 'Day of month must be between 1 and 31' }, { status: 400 })
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

    const { data: template, error } = await supabase
      .schema('roomietab')
      .from('recurring_templates')
      .insert({
        household_id: householdId,
        description: description.trim(),
        amount_cents: amountCents,
        category: category ?? 'other',
        split_type: splitType ?? 'equal',
        paid_by_member_id: paidByMemberId,
        split_config: splitConfig ?? [],
        day_of_month: dayOfMonth,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
