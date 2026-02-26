'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type SupabaseClientType = ReturnType<typeof createClient>

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  // Lazy ref — only instantiated on first user interaction, not during SSR render
  const supabaseRef = useRef<SupabaseClientType | null>(null)
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const { error } = await getSupabase().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      toast.success('Check your email!', {
        description: 'We sent you a magic link to sign in.',
      })
    } catch (err) {
      toast.error('Failed to send link', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      toast.error('Google sign-in failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50 flex flex-col items-center justify-center p-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3" aria-hidden="true">🏠</div>
        <h1 className="font-caveat font-bold text-4xl text-indigo-700 mb-2">RoomieTab</h1>
        <p className="text-gray-600 text-lg max-w-sm">
          Split expenses with your roommates — settle up with fewer transactions.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['Free forever', 'Real-time sync', 'Min transactions'].map((feat) => (
            <span key={feat} className="bg-white/80 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              ✓ {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6 w-full max-w-sm">
        <h2 className="font-bold text-xl text-gray-900 mb-5">Welcome 👋</h2>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <Input
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={<span aria-hidden="true">✉️</span>}
          >
            Send Magic Link
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          loading={googleLoading}
          onClick={handleGoogle}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
        >
          Continue with Google
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Have an invite link?{' '}
          <Link href="/join" className="text-indigo-600 underline">
            Join a household
          </Link>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        By continuing, you agree to our{' '}
        <a href="#" className="underline">Terms</a> &{' '}
        <a href="#" className="underline">Privacy Policy</a>
      </p>
    </main>
  )
}
