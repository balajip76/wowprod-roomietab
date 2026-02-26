import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateInviteCode } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, displayName } = await request.json()

    if (!name?.trim() || !displayName?.trim()) {
      return NextResponse.json(
        { error: 'Household name and display name are required' },
        { status: 400 }
      )
    }

    // Check if user already has a household
    const { data: existingMember } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'You already belong to a household' },
        { status: 409 }
      )
    }

    const inviteCode = generateInviteCode()

    // Create household
    const { data: household, error: householdError } = await supabase
      .schema('roomietab')
      .from('households')
      .insert({
        name: name.trim(),
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single()

    if (householdError || !household) {
      return NextResponse.json(
        { error: householdError?.message ?? 'Failed to create household' },
        { status: 500 }
      )
    }

    // Create admin member
    const { data: member, error: memberError } = await supabase
      .schema('roomietab')
      .from('members')
      .insert({
        household_id: household.id,
        user_id: user.id,
        display_name: displayName.trim(),
        email: user.email,
        role: 'admin',
      })
      .select()
      .single()

    if (memberError || !member) {
      // Rollback: delete household
      await supabase.schema('roomietab').from('households').delete().eq('id', household.id)
      return NextResponse.json(
        { error: memberError?.message ?? 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ household, member }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
