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

    // Check admin role
    const { data: member } = await db
      .schema('roomietab')
      .from('members')
      .select('role')
      .eq('household_id', id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can update household' }, { status: 403 })
    }

    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: household, error } = await db
      .schema('roomietab')
      .from('households')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ household })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
