'use client'

import { useState } from 'react'
import { NavBar } from '@/components/nav-bar'
import { SettlementTransactionRow } from '@/components/settlement-transaction-row'
import { Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { AddExpenseDrawer, type NewExpense } from '@/components/add-expense-drawer'
import { generateVenmoUrl, generatePaypalUrl, generateZelleUrl } from '@/lib/payment-links'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { MemberSummary, SettlementTransaction } from '@/lib/settlement-algorithm'
import { formatCents } from '@/lib/utils'

interface Props {
  currentMember: { id: string; display_name: string; avatar_url: string | null; household_id: string }
  household: { id: string; name: string }
  members: Array<{ id: string; display_name: string; avatar_url: string | null; email: string | null; venmo_handle?: string | null; paypal_email?: string | null }>
  summaries: MemberSummary[]
  transactions: SettlementTransaction[]
  currentMonth: string
  monthStart: string
}

export function SettleClient({ currentMember, household, members, summaries, transactions, currentMonth, monthStart }: Props) {
  const router = useRouter()
  const [settled, setSettled] = useState<Set<string>>(new Set())
  const [archiving, setArchiving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const getMember = (id: string) => members.find((m) => m.id === id) ?? { id, display_name: 'Unknown', avatar_url: null, email: null, venmo_handle: null, paypal_email: null }
  const getMemberIndex = (id: string) => members.findIndex((m) => m.id === id)

  const toggleSettle = (txnKey: string) => {
    setSettled((prev) => {
      const next = new Set(prev)
      if (next.has(txnKey)) next.delete(txnKey)
      else next.add(txnKey)
      return next
    })
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      const res = await fetch('/api/settlements/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId: household.id,
          month: monthStart,
          transactions: transactions.map((t, idx) => ({
            payerMemberId: t.payerMemberId,
            receiverMemberId: t.receiverMemberId,
            amountCents: t.amountCents,
            isSettled: settled.has(`${idx}`),
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to archive')
      toast.success(`${currentMonth} archived!`)
      router.push('/')
    } catch {
      toast.error('Failed to archive month')
    } finally {
      setArchiving(false)
    }
  }

  const handleExportCsv = async () => {
    const res = await fetch('/api/export/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ householdId: household.id, month: monthStart }),
    })
    if (!res.ok) { toast.error('Export failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roomietab-${monthStart}.csv`
    a.click()
    URL.revokeObjectURL(url)
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

  // Settlement complete check removed (used for future feature)

  return (
    <>
      <NavBar householdName={household.name} />

      <main className="pb-24 md:pb-8 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="py-4">
          <h1 className="font-bold text-xl text-gray-900">🤝 Settle {currentMonth}</h1>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white mb-6 shadow-[4px_4px_0_#4338CA]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl" aria-hidden="true">🤝</span>
            <h2 className="font-bold text-xl">Settle {currentMonth}</h2>
          </div>
          {transactions.length === 0 ? (
            <p className="text-indigo-200">All settled! No transactions needed.</p>
          ) : (
            <>
              <p className="text-2xl font-bold">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} clear all debts</p>
              <p className="text-indigo-200 text-sm mt-1">✓ Minimum possible — algorithm optimized</p>
            </>
          )}
        </div>

        {/* Member summary table */}
        <section className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">📋 Member Summary</h2>
          <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-3 text-gray-500 font-medium">Member</th>
                  <th className="text-right p-3 text-gray-500 font-medium">Paid</th>
                  <th className="text-right p-3 text-gray-500 font-medium">Share</th>
                  <th className="text-right p-3 text-gray-500 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => {
                  const m = getMember(s.memberId)
                  const isPositive = s.netBalance >= 0
                  return (
                    <tr key={s.memberId} className="border-b border-gray-50">
                      <td className="p-3 font-medium text-gray-900">
                        {m.display_name}
                        {s.memberId === currentMember.id && (
                          <span className="ml-1 text-xs text-indigo-500">(you)</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-gray-700">{formatCents(s.totalPaid)}</td>
                      <td className="p-3 text-right text-gray-700">{formatCents(s.totalShare)}</td>
                      <td className={`p-3 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{formatCents(s.netBalance)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Minimum transactions */}
        {transactions.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">⚡ Minimum Transactions</h2>
            <div className="space-y-3">
              {transactions.map((txn, idx) => {
                const payer = getMember(txn.payerMemberId)
                const receiver = getMember(txn.receiverMemberId)
                const txnKey = `${idx}`
                const receiverWithPayment = members.find((m) => m.id === txn.receiverMemberId)
                return (
                  <SettlementTransactionRow
                    key={txnKey}
                    id={txnKey}
                    payer={payer}
                    receiver={receiver}
                    amount={txn.amountCents}
                    isSettled={settled.has(txnKey)}
                    onSettle={toggleSettle}
                    venmoUrl={generateVenmoUrl(receiverWithPayment?.venmo_handle, txn.amountCents)}
                    paypalUrl={generatePaypalUrl(receiverWithPayment?.paypal_email, txn.amountCents)}
                    zelleUrl={generateZelleUrl()}
                    payerIndex={getMemberIndex(txn.payerMemberId)}
                    receiverIndex={getMemberIndex(txn.receiverMemberId)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Archive & Export */}
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={archiving}
            onClick={handleArchive}
            icon={<span aria-hidden="true">📁</span>}
          >
            Archive {currentMonth} &amp; Start Next Month
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleExportCsv} icon={<span aria-hidden="true">📊</span>}>
              Export CSV
            </Button>
            <Button variant="secondary" icon={<span aria-hidden="true">📄</span>}>
              Export PDF
            </Button>
          </div>
        </div>
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
