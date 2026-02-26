import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface SplitConfig {
  memberId: string
  amountCents: number
  percentage?: number
  shares?: number
}

export async function PUT(
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

    // Get existing expense to verify household membership
    const { data: existing } = await supabase
      .schema('roomietab')
      .from('expenses')
      .select('household_id, amount_cents')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Verify membership
    const { data: member } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id')
      .eq('household_id', existing.household_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const { description, amountCents, category, splitType, paidByMemberId, expenseDate, splits } = body

    // Validate splits if provided
    if (splits && amountCents) {
      const splitSum = (splits as SplitConfig[]).reduce((sum, s) => sum + s.amountCents, 0)
      if (splitSum !== amountCents) {
        return NextResponse.json(
          { error: `Split amounts (${splitSum}) must equal total (${amountCents})` },
          { status: 400 }
        )
      }
    }

    // Update expense
    const updateData: Record<string, unknown> = {}
    if (description !== undefined) updateData.description = description.trim()
    if (amountCents !== undefined) updateData.amount_cents = amountCents
    if (category !== undefined) updateData.category = category
    if (splitType !== undefined) updateData.split_type = splitType
    if (paidByMemberId !== undefined) updateData.paid_by_member_id = paidByMemberId
    if (expenseDate !== undefined) updateData.expense_date = expenseDate

    const { data: expense, error: expenseError } = await supabase
      .schema('roomietab')
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (expenseError) {
      return NextResponse.json({ error: expenseError.message }, { status: 500 })
    }

    // Update splits if provided
    let updatedSplits = null
    if (splits) {
      // Delete old splits
      await supabase.schema('roomietab').from('expense_splits').delete().eq('expense_id', id)

      // Insert new splits
      const splitRows = (splits as SplitConfig[]).map((s) => ({
        expense_id: id,
        member_id: s.memberId,
        amount_cents: s.amountCents,
        percentage: s.percentage ?? null,
        shares: s.shares ?? null,
      }))

      const { data: newSplits, error: splitsError } = await supabase
        .schema('roomietab')
        .from('expense_splits')
        .insert(splitRows)
        .select()

      if (splitsError) {
        return NextResponse.json({ error: splitsError.message }, { status: 500 })
      }
      updatedSplits = newSplits
    }

    return NextResponse.json({ expense, splits: updatedSplits })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get expense to verify household membership
    const { data: existing } = await supabase
      .schema('roomietab')
      .from('expenses')
      .select('household_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const { data: member } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id')
      .eq('household_id', existing.household_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
      .schema('roomietab')
      .from('expenses')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
