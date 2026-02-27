import { getAuthenticatedClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, db } = await getAuthenticatedClient()

    if (!user || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin
    const { data: member } = await db
      .schema('roomietab')
      .from('members')
      .select('role')
      .eq('household_id', id)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can invite' }, { status: 403 })
    }

    const { emails } = await request.json()

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails array is required' }, { status: 400 })
    }

    // In a real app, send invitation emails via Supabase Auth or email provider.
    // For now, return the count of emails to be sent.
    // The invite link approach is preferred (shareable link).

    return NextResponse.json({ sent: emails.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
