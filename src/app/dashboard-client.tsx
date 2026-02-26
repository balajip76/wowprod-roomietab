'use client'

import { useState } from 'react'
import { NavBar } from '@/components/nav-bar'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { BalanceSummaryCard } from '@/components/balance-summary-card'
import { ExpenseCard } from '@/components/expense-card'
import { MonthlyBreakdownChart } from '@/components/monthly-breakdown-chart'
import { AddExpenseDrawer, type NewExpense } from '@/components/add-expense-drawer'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/constants'
import type { MemberSummary, SettlementTransaction } from '@/lib/settlement-algorithm'

interface DashboardClientProps {
  currentMember: {
    id: string
    display_name: string
    user_id: string | null
    avatar_url: string | null
    household_id: string
  }
  household: { id: string; name: string; invite_code: string }
  members: Array<{
    id: string
    display_name: string
    avatar_url: string | null
    email: string | null
  }>
  expenses: Array<{
    id: string
    description: string
    amount_cents: number
    category: string
    paid_by_member_id: string
    expense_date: string
    is_recurring: boolean
    receipt_url: string | null
  }>
  splits: Array<{ expense_id: string; member_id: string; amount_cents: number }>
  summaries: MemberSummary[]
  transactions: SettlementTransaction[]
  categoryTotals: { category: Category; total: number }[]
  mySummary: MemberSummary | null
  currentMonth: string
}

export function DashboardClient({
  currentMember,
  household,
  members,
  expenses,
  splits,
  summaries,
  transactions,
  categoryTotals,
  mySummary,
  currentMonth,
}: DashboardClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  const recentExpenses = expenses.slice(0, 3)

  const handleSaveExpense = async (expense: NewExpense) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ householdId: household.id, ...expense }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to save')
    toast.success(`${expense.description} added!`)
    router.refresh()
  }

  const getMemberById = (id: string) =>
    members.find((m) => m.id === id) ?? { id, display_name: 'Unknown', avatar_url: null, email: null }

  const getMyShare = (expenseId: string) => {
    const split = splits.find(
      (s) => s.expense_id === expenseId && s.member_id === currentMember.id
    )
    return split?.amount_cents ?? 0
  }

  const memberTotals = summaries.map((s) => ({
    member: getMemberById(s.memberId),
    paid: s.totalPaid,
    share: s.totalShare,
  }))

  return (
    <>
      <NavBar householdName={household.name} />

      <main className="pb-24 md:pb-8 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="font-caveat font-bold text-2xl text-indigo-700">
              🏠 {household.name}
            </h1>
            <p className="text-sm text-gray-500">{currentMonth}</p>
          </div>
        </div>

        {/* Hero balance card */}
        {mySummary && (
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white mb-6 shadow-[4px_4px_0_#4338CA]">
            <p className="text-indigo-200 text-sm font-medium">My balance this month</p>
            <p
              className={`text-4xl font-bold mt-1 ${mySummary.netBalance >= 0 ? 'text-white' : 'text-red-200'}`}
            >
              {mySummary.netBalance >= 0 ? '+' : ''}{formatCents(mySummary.netBalance)}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <p className="text-indigo-200 text-xs">You paid</p>
                <p className="font-semibold text-sm">{formatCents(mySummary.totalPaid)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs">Your share</p>
                <p className="font-semibold text-sm">{formatCents(mySummary.totalShare)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs">
                  {mySummary.netBalance >= 0 ? 'Owed to you' : 'You owe'}
                </p>
                <p className="font-semibold text-sm">{formatCents(Math.abs(mySummary.netBalance))}</p>
              </div>
            </div>
          </div>
        )}

        {/* Roommate balances */}
        {summaries.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">🏠 Roommate Balances</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {summaries.map((s, idx) => {
                const m = getMemberById(s.memberId)
                return (
                  <BalanceSummaryCard
                    key={s.memberId}
                    member={m}
                    totalPaid={s.totalPaid}
                    totalOwed={s.totalShare}
                    netBalance={s.netBalance}
                    isCurrentUser={s.memberId === currentMember.id}
                    compact
                    colorIndex={idx}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Monthly breakdown chart */}
        {categoryTotals.length > 0 && (
          <div className="mb-6">
            <MonthlyBreakdownChart
              month={currentMonth}
              categoryTotals={categoryTotals}
              memberTotals={memberTotals}
              compact={false}
            />
          </div>
        )}

        {/* Recent expenses */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">🧾 Recent Expenses</h2>
            <a href="/expenses" className="text-sm text-indigo-600">View all →</a>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2" aria-hidden="true">💸</div>
              <p className="text-sm">No expenses yet this month</p>
              <p className="text-xs mt-1">Tap the + button to add your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((exp) => {
                const paidBy = getMemberById(exp.paid_by_member_id)
                const paidByIndex = members.findIndex((m) => m.id === exp.paid_by_member_id)
                return (
                  <ExpenseCard
                    key={exp.id}
                    id={exp.id}
                    description={exp.description}
                    amount={exp.amount_cents}
                    category={exp.category as Category}
                    paidBy={paidBy}
                    splitMembers={members}
                    myShare={getMyShare(exp.id)}
                    date={exp.expense_date}
                    isRecurring={exp.is_recurring}
                    receiptUrl={exp.receipt_url}
                    paidByIndex={paidByIndex >= 0 ? paidByIndex : 0}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Settlement CTA */}
        {transactions.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-indigo-800">🤝 Ready to settle?</p>
              <p className="text-sm text-indigo-600">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} clears all debts
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/settle')}
            >
              Settle Up
            </Button>
          </div>
        )}
      </main>

      <FloatingActionButton
        onClick={() => setDrawerOpen(true)}
        isHidden={drawerOpen}
      />

      <AddExpenseDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveExpense}
        members={members}
        currentUserId={currentMember.id}
      />
    </>
  )
}
