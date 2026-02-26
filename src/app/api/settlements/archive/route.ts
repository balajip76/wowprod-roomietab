import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface TransactionInput {
  payerMemberId: string
  receiverMemberId: string
  amountCents: number
  isSettled: boolean
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { householdId, month, transactions } = await request.json()

    if (!householdId || !month) {
      return NextResponse.json({ error: 'householdId and month are required' }, { status: 400 })
    }

    // Verify membership (any member can archive)
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

    // Parse month to first day
    const monthDate = new Date(month)
    const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`

    // Create or update settlement record
    const { data: settlement, error: settlementError } = await supabase
      .schema('roomietab')
      .from('settlements')
      .upsert(
        {
          household_id: householdId,
          month: monthStr,
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: member.id,
        },
        { onConflict: 'household_id,month' }
      )
      .select()
      .single()

    if (settlementError || !settlement) {
      return NextResponse.json(
        { error: settlementError?.message ?? 'Failed to create settlement' },
        { status: 500 }
      )
    }

    // Delete existing transactions and re-create
    await supabase
      .schema('roomietab')
      .from('settlement_transactions')
      .delete()
      .eq('settlement_id', settlement.id)

    // Insert transactions
    let settlementTransactions = null
    if (transactions && (transactions as TransactionInput[]).length > 0) {
      const txnRows = (transactions as TransactionInput[]).map((t) => ({
        settlement_id: settlement.id,
        payer_member_id: t.payerMemberId,
        receiver_member_id: t.receiverMemberId,
        amount_cents: t.amountCents,
        is_settled: t.isSettled ?? false,
        settled_at: t.isSettled ? new Date().toISOString() : null,
      }))

      const { data: txns, error: txnsError } = await supabase
        .schema('roomietab')
        .from('settlement_transactions')
        .insert(txnRows)
        .select()

      if (txnsError) {
        return NextResponse.json({ error: txnsError.message }, { status: 500 })
      }
      settlementTransactions = txns
    }

    return NextResponse.json({ settlement, transactions: settlementTransactions }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
