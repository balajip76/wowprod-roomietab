'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn, formatCents, parseCentsFromDollarString } from '@/lib/utils'
import { CATEGORIES, CATEGORY_LIST, SPLIT_TYPES, type Category, type SplitType } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MemberAvatarGroup, type Member } from '@/components/member-avatar-group'
import { X } from 'lucide-react'
import { format } from 'date-fns'

export interface SplitConfig {
  memberId: string
  amountCents: number
  percentage?: number
  shares?: number
}

export interface NewExpense {
  description: string
  amountCents: number
  category: Category
  splitType: SplitType
  paidByMemberId: string
  expenseDate: string
  splits: SplitConfig[]
}

interface AddExpenseDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (expense: NewExpense) => Promise<void>
  members: Member[]
  currentUserId: string
  defaultCategory?: Category
}

function computeEqualSplits(amountCents: number, memberIds: string[]): SplitConfig[] {
  if (memberIds.length === 0) return []
  const base = Math.floor(amountCents / memberIds.length)
  const remainder = amountCents - base * memberIds.length
  return memberIds.map((memberId, idx) => ({
    memberId,
    amountCents: idx === 0 ? base + remainder : base,
  }))
}

export function AddExpenseDrawer({
  isOpen,
  onClose,
  onSave,
  members,
  currentUserId,
  defaultCategory = 'other',
}: AddExpenseDrawerProps) {
  const [amountStr, setAmountStr] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>(defaultCategory)
  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [paidByMemberId, setPaidByMemberId] = useState(currentUserId)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((m) => m.id))
  const [splits, setSplits] = useState<SplitConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const amountCents = parseCentsFromDollarString(amountStr)

  const recomputeSplits = useCallback(() => {
    if (splitType === 'equal') {
      setSplits(computeEqualSplits(amountCents, selectedMemberIds))
    } else if (splitType === 'percentage') {
      const pct = selectedMemberIds.length > 0 ? 100 / selectedMemberIds.length : 0
      const base = Math.floor((amountCents * pct) / 100)
      setSplits(
        selectedMemberIds.map((memberId, idx) => ({
          memberId,
          amountCents: idx === 0 ? amountCents - base * (selectedMemberIds.length - 1) : base,
          percentage: pct,
        }))
      )
    } else if (splitType === 'shares') {
      setSplits(
        selectedMemberIds.map((memberId) => ({
          memberId,
          amountCents: Math.floor(amountCents / Math.max(selectedMemberIds.length, 1)),
          shares: 1,
        }))
      )
    }
  }, [splitType, amountCents, selectedMemberIds])

  useEffect(() => {
    if (splitType !== 'exact') {
      recomputeSplits()
    }
  }, [splitType, amountCents, selectedMemberIds, recomputeSplits])

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setAmountStr('')
      setDescription('')
      setCategory(defaultCategory)
      setSplitType('equal')
      setPaidByMemberId(currentUserId)
      setSelectedMemberIds(members.map((m) => m.id))
      setSplits([])
      setErrors({})
      setExpenseDate(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [isOpen, currentUserId, defaultCategory, members])

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const updateSplitAmount = (memberId: string, value: string) => {
    const cents = parseCentsFromDollarString(value)
    setSplits((prev) =>
      prev.map((s) => (s.memberId === memberId ? { ...s, amountCents: cents } : s))
    )
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!amountStr || amountCents <= 0) errs.amount = 'Enter a valid amount'
    if (!description.trim()) errs.description = 'Description is required'
    if (selectedMemberIds.length === 0) errs.members = 'Select at least one member'
    if (splitType === 'exact') {
      const total = splits.reduce((sum, s) => sum + s.amountCents, 0)
      if (total !== amountCents) {
        errs.splits = `Splits must sum to ${formatCents(amountCents)} (currently ${formatCents(total)})`
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await onSave({
        description: description.trim(),
        amountCents,
        category,
        splitType,
        paidByMemberId,
        expenseDate,
        splits:
          splits.length > 0
            ? splits.filter((s) => selectedMemberIds.includes(s.memberId))
            : computeEqualSplits(amountCents, selectedMemberIds),
      })
      onClose()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Find paidBy member index for correct color
  const paidByIndex = members.findIndex((m) => m.id === paidByMemberId)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-[20px] border-t-2 border-blue-200 shadow-drawer z-50 max-h-[92vh] overflow-y-auto animate-slide-up md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-[18px] md:max-h-[90vh]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3">
            <h2 id="add-expense-title" className="font-bold text-xl text-gray-900">
              Add Expense
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                autoFocus
                className={cn(
                  'w-full pl-10 pr-4 py-3 text-3xl font-bold rounded-[10px] border bg-gray-50 text-gray-900',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400',
                  errors.amount ? 'border-red-400' : 'border-blue-200'
                )}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">⚠ {errors.amount}</p>}
          </div>

          {/* Description */}
          <Input
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="e.g. Whole Foods run"
            error={errors.description}
            className="mb-4"
          />

          {/* Date */}
          <Input
            label="Date"
            type="date"
            value={expenseDate}
            onChange={setExpenseDate}
            className="mb-4"
          />

          {/* Paid by */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Paid by</p>
            <MemberAvatarGroup
              members={members}
              selectable
              selected={[paidByMemberId]}
              onToggle={(id) => setPaidByMemberId(id)}
              size="md"
              showLabels
            />
          </div>

          {/* Split among */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Split among</p>
            <MemberAvatarGroup
              members={members}
              selectable
              selected={selectedMemberIds}
              onToggle={toggleMember}
              size="md"
              showLabels
            />
            {errors.members && <p className="mt-1 text-xs text-red-600">⚠ {errors.members}</p>}
          </div>

          {/* Per-person amounts (equal split preview) */}
          {splitType === 'equal' && splits.length > 0 && amountCents > 0 && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-xl">
              <p className="text-xs font-semibold text-indigo-600 mb-1">Each pays</p>
              <div className="flex flex-wrap gap-2">
                {splits.map((s) => {
                  const m = members.find((mem) => mem.id === s.memberId)
                  return m ? (
                    <span key={s.memberId} className="text-xs text-indigo-700">
                      {m.display_name.split(' ')[0]}: {formatCents(s.amountCents)}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Exact split inputs */}
          {splitType === 'exact' && (
            <div className="mb-4 space-y-2">
              {selectedMemberIds.map((memberId) => {
                const m = members.find((mem) => mem.id === memberId)
                const split = splits.find((s) => s.memberId === memberId)
                return m ? (
                  <div key={memberId} className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 w-20 truncate">{m.display_name.split(' ')[0]}</span>
                    <Input
                      type="currency"
                      value={split ? String(split.amountCents / 100) : ''}
                      onChange={(v) => updateSplitAmount(memberId, v)}
                      placeholder="0.00"
                    />
                  </div>
                ) : null
              })}
              {errors.splits && <p className="text-xs text-red-600">⚠ {errors.splits}</p>}
            </div>
          )}

          {/* Split type tabs */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Split type</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SPLIT_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSplitType(value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0 transition-colors',
                    splitType === value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <span aria-hidden="true">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Category</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORY_LIST.map((cat) => {
                const cfg = CATEGORIES[cat]
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors',
                      category === cat
                        ? 'ring-2 ring-indigo-500 ' + cfg.bgClass + ' ' + cfg.textClass
                        : cfg.bgClass + ' ' + cfg.textClass + ' opacity-60 hover:opacity-100'
                    )}
                  >
                    <span aria-hidden="true">{cfg.emoji}</span>
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* paidByIndex info used only for display; satisfying unused warning */}
          <span className="hidden">{paidByIndex}</span>

          {errors.form && (
            <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">⚠ {errors.form}</p>
          )}

          {/* Save CTA */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            onClick={handleSave}
          >
            {amountCents > 0
              ? `Save Expense — ${formatCents(amountCents)}`
              : 'Save Expense'}
          </Button>
        </div>
      </div>
    </>
  )
}
