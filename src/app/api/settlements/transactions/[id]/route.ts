import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isSettled } = await request.json()

    if (typeof isSettled !== 'boolean') {
      return NextResponse.json({ error: 'isSettled must be a boolean' }, { status: 400 })
    }

    // Verify household membership via settlement join
    const { data: txn } = await supabase
      .schema('roomietab')
      .from('settlement_transactions')
      .select('id, settlement_id, settlements!inner(household_id)')
      .eq('id', id)
      .single()

    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const settlementsData = txn.settlements as unknown as { household_id: string }
    const householdId = settlementsData.household_id

    const { data: member } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id')
      .eq('household_id', householdId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { data: transaction, error } = await supabase
      .schema('roomietab')
      .from('settlement_transactions')
      .update({
        is_settled: isSettled,
        settled_at: isSettled ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
