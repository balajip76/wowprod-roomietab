'use client'

import { useState } from 'react'
import { NavBar } from '@/components/nav-bar'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ExpenseCard } from '@/components/expense-card'
import { AddExpenseDrawer, type NewExpense } from '@/components/add-expense-drawer'
import { Input } from '@/components/ui/input'
import { CategoryBadge } from '@/components/ui/category-badge'
import { formatCents, formatDate } from '@/lib/utils'
import { CATEGORY_LIST, type Category } from '@/lib/constants'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { parseISO } from 'date-fns'

interface Props {
  currentMember: { id: string; display_name: string; avatar_url: string | null; household_id: string }
  household: { id: string; name: string }
  members: Array<{ id: string; display_name: string; avatar_url: string | null; email: string | null }>
  expenses: Array<{
    id: string; description: string; amount_cents: number; category: string
    paid_by_member_id: string; expense_date: string; is_recurring: boolean; receipt_url: string | null
  }>
  splits: Array<{ expense_id: string; member_id: string; amount_cents: number }>
  currentMonth: string
}

export function ExpensesClient({ currentMember, household, members, expenses, splits, currentMonth }: Props) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')

  const getMember = (id: string) => members.find((m) => m.id === id) ?? { id, display_name: 'Unknown', avatar_url: null, email: null }
  const getMyShare = (expenseId: string) => splits.find((s) => s.expense_id === expenseId && s.member_id === currentMember.id)?.amount_cents ?? 0
  const getMemberIndex = (id: string) => members.findIndex((m) => m.id === id)

  const filtered = expenses.filter((e) => {
    if (activeCategory !== 'all' && e.category !== activeCategory) return false
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Group by date
  const byDate = filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
    const key = e.expense_date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount_cents, 0)
  const myTotal = filtered.reduce((sum, e) => sum + getMyShare(e.id), 0)

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Expense deleted', {
        action: { label: 'Undo', onClick: () => router.refresh() },
      })
      router.refresh()
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  const handleSave = async (expense: NewExpense) => {
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

  return (
    <>
      <NavBar householdName={household.name} />

      <main className="pb-24 md:pb-8 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <h1 className="font-bold text-xl text-gray-900">🧾 {currentMonth}</h1>
        </div>

        {/* Search */}
        <div className="mb-3">
          <Input
            type="search"
            placeholder="Search expenses…"
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${activeCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
              className={`shrink-0 ${activeCategory === cat ? 'ring-2 ring-indigo-500' : 'opacity-70 hover:opacity-100'}`}
            >
              <CategoryBadge category={cat} size="sm" />
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="bg-white rounded-xl border border-blue-100 p-3 mb-4 grid grid-cols-3 text-center text-xs">
          <div>
            <div className="font-bold text-gray-900">{formatCents(totalAmount)}</div>
            <div className="text-gray-500">Total</div>
          </div>
          <div>
            <div className="font-bold text-gray-900">{filtered.length}</div>
            <div className="text-gray-500">Expenses</div>
          </div>
          <div>
            <div className="font-bold text-gray-900">{formatCents(myTotal)}</div>
            <div className="text-gray-500">Your share</div>
          </div>
        </div>

        {/* Expense list grouped by date */}
        {Object.keys(byDate).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2" aria-hidden="true">💸</div>
            <p className="text-sm">No expenses found</p>
          </div>
        ) : (
          Object.entries(byDate).map(([date, exps]) => (
            <div key={date} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 border-t border-dashed border-blue-200" />
                <span className="text-xs text-gray-400 font-medium shrink-0">
                  {formatDate(parseISO(date))}
                </span>
                <div className="flex-1 border-t border-dashed border-blue-200" />
              </div>
              <div className="space-y-2">
                {exps.map((exp) => {
                  const paidBy = getMember(exp.paid_by_member_id)
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
                      paidByIndex={getMemberIndex(exp.paid_by_member_id)}
                      onDelete={() => handleDelete(exp.id)}
                    />
                  )
                })}
              </div>
            </div>
          ))
        )}
      </main>

      <FloatingActionButton onClick={() => setDrawerOpen(true)} isHidden={drawerOpen} />
      <AddExpenseDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        members={members}
        currentUserId={currentMember.id}
      />
    </>
  )
}
