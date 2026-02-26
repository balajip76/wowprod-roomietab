'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (!displayName.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/households/join-by-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code, displayName: displayName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to join')
      toast.success('Joined household!')
      router.push('/')
    } catch (err) {
      toast.error('Failed to join', {
        description: err instanceof Error ? err.message : 'Check the invite link.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3" aria-hidden="true">🏠</div>
        <h1 className="font-caveat font-bold text-3xl text-indigo-700">RoomieTab</h1>
        <p className="text-gray-600 mt-2">You&apos;ve been invited to join a household!</p>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6 w-full max-w-sm space-y-4">
        <h2 className="font-bold text-xl text-gray-900">Join Household</h2>
        <Input
          label="Your display name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="e.g. Jordan"
        />
        <Button variant="primary" fullWidth loading={loading} onClick={handleJoin}>
          Join Household
        </Button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 underline">Sign in</a>
        </p>
      </div>
    </main>
  )
}
