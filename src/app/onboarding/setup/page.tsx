'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function SetupPage() {
  const router = useRouter()
  const [householdName, setHouseholdName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [inviteLink, setInviteLink] = useState('')

  const addEmail = () => {
    const trimmed = emailInput.trim()
    if (trimmed && !inviteEmails.includes(trimmed)) {
      setInviteEmails([...inviteEmails, trimmed])
      setEmailInput('')
    }
  }

  const removeEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!householdName.trim()) errs.name = 'Household name is required'
    if (!displayName.trim()) errs.displayName = 'Your name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: householdName.trim(),
          displayName: displayName.trim(),
          inviteEmails,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create household')

      setInviteLink(`${window.location.origin}/join/${data.household.invite_code}`)
      toast.success('Household created!', {
        description: `Welcome to ${householdName}!`,
      })
      router.push('/')
    } catch (err) {
      toast.error('Failed to create household', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50 flex flex-col items-center justify-center p-4">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">✓</span>
        <div className="w-8 h-px bg-indigo-300" />
        <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">2</span>
        <div className="w-8 h-px bg-gray-200" />
        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</span>
      </div>

      <div className="text-center mb-6">
        <h1 className="font-caveat font-bold text-3xl text-indigo-700">🏠 RoomieTab</h1>
        <p className="text-gray-600 mt-1">Set up your household</p>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6 w-full max-w-md space-y-4">
        {/* Household name */}
        <Input
          label="Household name"
          value={householdName}
          onChange={setHouseholdName}
          placeholder="e.g. Maple House 🍁"
          error={errors.name}
        />

        {/* Display name */}
        <Input
          label="Your display name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="e.g. Maya"
          error={errors.displayName}
        />

        {/* Invite roommates */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Invite roommates (optional)</p>
          <div className="flex gap-2">
            <Input
              type="email"
              value={emailInput}
              onChange={setEmailInput}
              placeholder="roommate@email.com"
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={addEmail}
              disabled={inviteEmails.length >= 4}
            >
              Add
            </Button>
          </div>
          {inviteEmails.length > 0 && (
            <div className="mt-2 space-y-1">
              {inviteEmails.map((email) => (
                <div key={email} className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-1.5">
                  <span className="flex-1 text-sm text-indigo-700">{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-gray-400 hover:text-red-500 text-lg"
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite link */}
        {inviteLink && (
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-indigo-600 mb-1">🔗 Shareable invite link</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 text-xs bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-indigo-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  toast.success('Link copied!')
                }}
                className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          onClick={handleCreate}
          icon={<span aria-hidden="true">🏠</span>}
        >
          Create Household →
        </Button>
      </div>
    </main>
  )
}
