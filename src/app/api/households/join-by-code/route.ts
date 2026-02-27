import { getAuthenticatedClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MAX_HOUSEHOLD_MEMBERS } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const { user, db } = await getAuthenticatedClient()

    if (!user || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inviteCode, displayName } = await request.json()

    if (!inviteCode?.trim() || !displayName?.trim()) {
      return NextResponse.json({ error: 'Invite code and display name are required' }, { status: 400 })
    }

    // Find household by invite code
    const { data: household } = await db
      .schema('roomietab')
      .from('households')
      .select('id, name, invite_code')
      .eq('invite_code', inviteCode.trim())
      .single()

    if (!household) {
      return NextResponse.json({ error: 'Invalid invite code. Household not found.' }, { status: 404 })
    }

    // Check if user already a member
    const { data: existingMember } = await db
      .schema('roomietab')
      .from('members')
      .select('id, household_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (existingMember) {
      if (existingMember.household_id === household.id) {
        return NextResponse.json({ error: 'You are already a member of this household' }, { status: 409 })
      }
      return NextResponse.json({ error: 'You already belong to a different household' }, { status: 409 })
    }

    // Check member count
    const { count } = await db
      .schema('roomietab')
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', household.id)
      .eq('is_active', true)

    if ((count ?? 0) >= MAX_HOUSEHOLD_MEMBERS) {
      return NextResponse.json(
        { error: `This household is full (max ${MAX_HOUSEHOLD_MEMBERS} members)` },
        { status: 409 }
      )
    }

    // Join household
    const { data: member, error } = await db
      .schema('roomietab')
      .from('members')
      .insert({
        household_id: household.id,
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

    return NextResponse.json({ member, household }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
