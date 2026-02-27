import { getAuthenticatedClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, db } = await getAuthenticatedClient()

    if (!user || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, avatarUrl, venmoHandle, paypalEmail, notificationPrefs } = body

    // Verify ownership — only the member themselves can update their profile
    const { data: member } = await db
      .schema('roomietab')
      .from('members')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!member || member.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this profile' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (displayName !== undefined) updateData.display_name = displayName.trim()
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl
    if (venmoHandle !== undefined) updateData.venmo_handle = venmoHandle.trim() || null
    if (paypalEmail !== undefined) updateData.paypal_email = paypalEmail.trim() || null
    if (notificationPrefs !== undefined) updateData.notification_prefs = notificationPrefs

    const { data: updatedMember, error } = await db
      .schema('roomietab')
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
