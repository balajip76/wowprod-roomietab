import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    const body = await request.json()
    const { description, amountCents, category, splitType, paidByMemberId, splitConfig, dayOfMonth, isActive } = body

    // Get existing template to verify membership
    const { data: existing } = await supabase
      .schema('roomietab')
      .from('recurring_templates')
      .select('household_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
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

    const updateData: Record<string, unknown> = {}
    if (description !== undefined) updateData.description = description.trim()
    if (amountCents !== undefined) updateData.amount_cents = amountCents
    if (category !== undefined) updateData.category = category
    if (splitType !== undefined) updateData.split_type = splitType
    if (paidByMemberId !== undefined) updateData.paid_by_member_id = paidByMemberId
    if (splitConfig !== undefined) updateData.split_config = splitConfig
    if (dayOfMonth !== undefined) updateData.day_of_month = dayOfMonth
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: template, error } = await supabase
      .schema('roomietab')
      .from('recurring_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template })
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

    // Get template to verify membership
    const { data: existing } = await supabase
      .schema('roomietab')
      .from('recurring_templates')
      .select('household_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
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

    // Soft-delete
    const { error } = await supabase
      .schema('roomietab')
      .from('recurring_templates')
      .update({ is_active: false })
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
