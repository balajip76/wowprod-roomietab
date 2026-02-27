import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'roomietab' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: import('@supabase/ssr').CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase admin client using the service_role key.
 * Uses the plain @supabase/supabase-js client (NOT @supabase/ssr) so the
 * service_role JWT is used directly — no cookie-based session override.
 * This client bypasses RLS entirely.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'roomietab' },
      auth: { persistSession: false },
    }
  )
}

/**
 * Verify the user is authenticated and return both the user and an admin DB client.
 * Use this in API routes for database operations — the admin client (service_role)
 * bypasses RLS, which is safe since auth is verified first via getUser().
 */
export async function getAuthenticatedClient() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null, db: null }
  }
  const db = createAdminClient()
  return { user, db }
}
