import { getAuthenticatedClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface SplitConfigItem {
  memberId: string
  amountCents?: number
  percentage?: number
  shares?: number
}

export async function POST(request: Request) {
  try {
    // Verify this is a cron request with a secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await getAuthenticatedClient()
    if (!db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const dayOfMonth = today.getDate()
    const dateStr = today.toISOString().split('T')[0]

    // Get all active recurring templates for today's day
    const { data: templates } = await db
      .schema('roomietab')
      .from('recurring_templates')
      .select('*')
      .eq('day_of_month', dayOfMonth)
      .eq('is_active', true)

    if (!templates || templates.length === 0) {
      return NextResponse.json({ created: 0 })
    }

    let created = 0

    for (const template of templates) {
      try {
        // Get active household members for equal split
        const { data: members } = await db
          .schema('roomietab')
          .from('members')
          .select('id')
          .eq('household_id', template.household_id)
          .eq('is_active', true)

        if (!members || members.length === 0) continue

        // Compute splits
        let splits: Array<{ expense_id: string; member_id: string; amount_cents: number; percentage: number | null; shares: number | null }>

        const splitConfig = template.split_config as SplitConfigItem[]

        if (template.split_type === 'equal' || !splitConfig?.length) {
          const base = Math.floor(template.amount_cents / members.length)
          const remainder = template.amount_cents - base * members.length
          splits = members.map((m, idx) => ({
            expense_id: '',
            member_id: m.id,
            amount_cents: idx === 0 ? base + remainder : base,
            percentage: null,
            shares: null,
          }))
        } else {
          splits = splitConfig.map((sc) => ({
            expense_id: '',
            member_id: sc.memberId,
            amount_cents: sc.amountCents ?? 0,
            percentage: sc.percentage ?? null,
            shares: sc.shares ?? null,
          }))
        }

        // Create expense
        const { data: expense, error: expenseError } = await db
          .schema('roomietab')
          .from('expenses')
          .insert({
            household_id: template.household_id,
            description: template.description,
            amount_cents: template.amount_cents,
            category: template.category,
            split_type: template.split_type,
            paid_by_member_id: template.paid_by_member_id,
            expense_date: dateStr,
            is_recurring: true,
            recurring_day: dayOfMonth,
            recurring_template_id: template.id,
          })
          .select()
          .single()

        if (expenseError || !expense) continue

        // Create splits
        const splitRows = splits.map((s) => ({ ...s, expense_id: expense.id }))
        await db.schema('roomietab').from('expense_splits').insert(splitRows)

        // Update last_generated_at
        await db
          .schema('roomietab')
          .from('recurring_templates')
          .update({ last_generated_at: today.toISOString() })
          .eq('id', template.id)

        created++
      } catch {
        // Continue with next template on error
      }
    }

    return NextResponse.json({ created })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
