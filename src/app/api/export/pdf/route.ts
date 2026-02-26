import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getMonthStart, getMonthEnd, formatCents } from '@/lib/utils'
import { parseISO, format } from 'date-fns'
import { computeMemberSummaries, computeMinimumTransactions } from '@/lib/settlement-algorithm'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { householdId, month } = await request.json()

    if (!householdId || !month) {
      return NextResponse.json({ error: 'householdId and month are required' }, { status: 400 })
    }

    // Verify membership
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

    const monthDate = parseISO(month)
    const monthStart = getMonthStart(monthDate)
    const monthEnd = getMonthEnd(monthDate)
    const monthLabel = format(monthDate, 'MMMM yyyy')

    // Get household
    const { data: household } = await supabase
      .schema('roomietab')
      .from('households')
      .select('name')
      .eq('id', householdId)
      .single()

    // Get members
    const { data: members } = await supabase
      .schema('roomietab')
      .from('members')
      .select('id, display_name')
      .eq('household_id', householdId)
      .eq('is_active', true)

    const memberMap = new Map((members ?? []).map((m) => [m.id, m.display_name]))

    // Get expenses
    const { data: expenses } = await supabase
      .schema('roomietab')
      .from('expenses')
      .select('*')
      .eq('household_id', householdId)
      .eq('is_deleted', false)
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)
      .order('expense_date', { ascending: true })

    const expenseIds = (expenses ?? []).map((e) => e.id)
    const { data: splits } = expenseIds.length > 0
      ? await supabase
          .schema('roomietab')
          .from('expense_splits')
          .select('*')
          .in('expense_id', expenseIds)
      : { data: [] }

    const allMembers = members ?? []
    const allExpenses = expenses ?? []
    const allSplits = splits ?? []
    const expenseIdSet = new Set(expenseIds)

    const summaries = computeMemberSummaries(allMembers, allExpenses, allSplits, expenseIdSet)
    const transactions = computeMinimumTransactions(
      summaries.map((s) => ({ memberId: s.memberId, netBalance: s.netBalance }))
    )

    const totalSpend = allExpenses.reduce((sum, e) => sum + e.amount_cents, 0)

    // Sanitize all user-supplied strings to prevent XSS in HTML output
    const esc = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    // Generate plain-text based "PDF" as HTML for simplicity
    // In production, use @react-pdf/renderer or puppeteer
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RoomieTab &#8212; ${esc(monthLabel)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #111827; }
    h1 { color: #6366F1; font-size: 28px; }
    h2 { color: #374151; font-size: 18px; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #EEF2FF; color: #4338CA; font-weight: 600; text-align: left; padding: 8px 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
    .positive { color: #059669; font-weight: 600; }
    .negative { color: #DC2626; font-weight: 600; }
    .total { font-size: 22px; font-weight: 700; color: #6366F1; }
    .footer { margin-top: 48px; font-size: 12px; color: #6B7280; text-align: center; }
  </style>
</head>
<body>
  <h1>&#127968; ${esc(household?.name ?? 'RoomieTab')}</h1>
  <p style="color:#6B7280">Monthly Expense Report &#8212; ${esc(monthLabel)}</p>
  <p class="total">Total Spend: ${esc(formatCents(totalSpend))}</p>

  <h2>&#128203; Expense Details</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Description</th><th>Category</th><th>Paid By</th><th>Amount</th></tr>
    </thead>
    <tbody>
      ${allExpenses.map((e) => `
        <tr>
          <td>${esc(e.expense_date)}</td>
          <td>${esc(e.description)}</td>
          <td>${esc(e.category)}</td>
          <td>${esc(memberMap.get(e.paid_by_member_id) ?? 'Unknown')}</td>
          <td>${esc(formatCents(e.amount_cents))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>&#128101; Member Summary</h2>
  <table>
    <thead>
      <tr><th>Member</th><th>Total Paid</th><th>Total Share</th><th>Net Balance</th></tr>
    </thead>
    <tbody>
      ${summaries.map((s) => `
        <tr>
          <td>${esc(memberMap.get(s.memberId) ?? 'Unknown')}</td>
          <td>${esc(formatCents(s.totalPaid))}</td>
          <td>${esc(formatCents(s.totalShare))}</td>
          <td class="${s.netBalance >= 0 ? 'positive' : 'negative'}">${s.netBalance >= 0 ? '+' : ''}${esc(formatCents(s.netBalance))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>&#129309; Minimum Transactions to Settle</h2>
  ${transactions.length === 0
    ? '<p>All balanced! No transactions needed.</p>'
    : `<table>
    <thead><tr><th>Payer</th><th>&#8594;</th><th>Receiver</th><th>Amount</th></tr></thead>
    <tbody>
      ${transactions.map((t) => `
        <tr>
          <td>${esc(memberMap.get(t.payerMemberId) ?? 'Unknown')}</td>
          <td>&#8594;</td>
          <td>${esc(memberMap.get(t.receiverMemberId) ?? 'Unknown')}</td>
          <td class="negative">${esc(formatCents(t.amountCents))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`}

  <div class="footer">
    Generated by RoomieTab on ${esc(new Date().toLocaleDateString())} &#183; roomietab.app
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="roomietab-${month}.html"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
