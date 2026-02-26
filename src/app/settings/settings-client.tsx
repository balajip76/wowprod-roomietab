'use client'

import { useState } from 'react'
import { NavBar } from '@/components/nav-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MemberAvatarGroup } from '@/components/member-avatar-group'
import { formatCents } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  currentMember: {
    id: string; display_name: string; avatar_url: string | null; email: string | null
    venmo_handle: string | null; paypal_email: string | null
    notification_prefs: { new_expense?: boolean; tagged?: boolean; month_end?: boolean; recurring?: boolean }
    role: string; household_id: string
  }
  household: { id: string; name: string; invite_code: string }
  members: Array<{ id: string; display_name: string; avatar_url: string | null; email: string | null }>
  recurringTemplates: Array<{ id: string; description: string; amount_cents: number; day_of_month: number; category: string }>
}

export function SettingsClient({ currentMember, household, members, recurringTemplates }: Props) {
  const router = useRouter()
  // Lazy init to avoid SSR instantiation issues
  const getSupabase = () => createClient()

  const [displayName, setDisplayName] = useState(currentMember.display_name)
  const [venmoHandle, setVenmoHandle] = useState(currentMember.venmo_handle ?? '')
  const [paypalEmail, setPaypalEmail] = useState(currentMember.paypal_email ?? '')
  const [saving, setSaving] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    new_expense: currentMember.notification_prefs?.new_expense ?? true,
    tagged: currentMember.notification_prefs?.tagged ?? true,
    month_end: currentMember.notification_prefs?.month_end ?? true,
    recurring: currentMember.notification_prefs?.recurring ?? false,
  })
  // household name handled directly from props

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${household.invite_code}`
    : `/join/${household.invite_code}`

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${currentMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          venmoHandle: venmoHandle || null,
          paypalEmail: paypalEmail || null,
          notificationPrefs: notifPrefs,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Profile updated!')
      router.refresh()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await getSupabase().auth.signOut()
    router.push('/login')
  }

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <NavBar householdName={household.name} />

      <main className="pb-24 md:pb-8 px-4 max-w-2xl mx-auto">
        <div className="py-4">
          <h1 className="font-bold text-xl text-gray-900">⚙️ Settings</h1>
        </div>

        {/* Profile */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">👤 Profile</h2>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-4 space-y-3">
            <Input label="Display name" value={displayName} onChange={setDisplayName} />
            <Input label="Venmo handle" value={venmoHandle} onChange={setVenmoHandle} placeholder="@username" />
            <Input label="PayPal email" type="email" value={paypalEmail} onChange={setPaypalEmail} placeholder="you@paypal.com" />
            <Button variant="primary" size="sm" loading={saving} onClick={handleSaveProfile}>Save Profile</Button>
          </div>
        </section>

        {/* Household */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🏠 Household</h2>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{household.name}</span>
              <span className="text-xs text-gray-400">{members.length} members</span>
              {currentMember.role === 'admin' && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
            <MemberAvatarGroup members={members} size="md" />
            <div className="flex items-center gap-2 bg-indigo-50 rounded-xl p-2">
              <span className="text-xs text-indigo-700 flex-1 truncate">{inviteLink}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Link copied!') }}
                className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🔔 Notifications</h2>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-4 space-y-3">
            {[
              { key: 'new_expense' as const, label: '💰 New expenses added' },
              { key: 'tagged' as const, label: '🏷️ Tagged in expense' },
              { key: 'month_end' as const, label: '📅 Month-end reminder' },
              { key: 'recurring' as const, label: '🔄 Recurring alerts' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  role="switch"
                  aria-checked={notifPrefs[key]}
                  onClick={() => toggleNotif(key)}
                  className={`w-11 h-6 rounded-full transition-colors ${notifPrefs[key] ? 'bg-indigo-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recurring expenses */}
        {recurringTemplates.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🔄 Recurring Expenses</h2>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-4 space-y-2">
              {recurringTemplates.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{t.description}</span>
                    <span className="ml-2 text-xs text-gray-500">{formatCents(t.amount_cents)} · {t.day_of_month}th</span>
                  </div>
                  <button className="text-xs text-indigo-600">Edit</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Data & Export */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📦 Data &amp; Export</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button variant="secondary" icon={<span aria-hidden="true">📄</span>}>Export PDF</Button>
            <Button variant="secondary" icon={<span aria-hidden="true">📊</span>}>Export CSV</Button>
          </div>
        </section>

        <Button
          variant="destructive"
          fullWidth
          onClick={handleSignOut}
          icon={<span aria-hidden="true">🚪</span>}
        >
          Sign Out
        </Button>
      </main>
    </>
  )
}
