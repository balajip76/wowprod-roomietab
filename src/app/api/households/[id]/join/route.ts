import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MAX_HOUSEHOLD_MEMBERS } from '@/lib/constants'

export async function POST(
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

    const { inviteCode, displayName } = await request.json()

    if (!displayName?.trim()) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    // Verify invite code matches household
    const { data: household } = await supabase
      .schema('roomietab')
      .from('households')
      .select('id, name, invite_code')
      .eq('id', id)
      .single()

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    if (inviteCode && household.invite_code !== inviteCode) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 })
    }

    // Check if user already a member
    const { data: existingMember } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id')
      .eq('household_id', id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }

    // Check member count
    const { count } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', id)
      .eq('is_active', true)

    if ((count ?? 0) >= MAX_HOUSEHOLD_MEMBERS) {
      return NextResponse.json(
        { error: `Household is full (max ${MAX_HOUSEHOLD_MEMBERS} members)` },
        { status: 409 }
      )
    }

    // Join household
    const { data: member, error } = await supabase
      .schema('roomietab')
      .from('members')
      .insert({
        household_id: id,
        user_id: user.id,
        display_name: displayName.trim(),
        email: user.email,
        role: 'member',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
