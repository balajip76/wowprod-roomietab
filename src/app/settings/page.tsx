export const dynamic = 'force-dynamic'

import { getAuthenticatedClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const { user, db } = await getAuthenticatedClient()
  if (!user || !db) redirect('/login')

  const { data: member } = await db
    .schema('roomietab')
    .from('members')
    .select('*, household:household_id(id, name, invite_code)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) redirect('/onboarding/setup')

  const { data: members } = await db
    .schema('roomietab')
    .from('members')
    .select('*')
    .eq('household_id', member.household_id)
    .eq('is_active', true)

  const { data: recurringTemplates } = await db
    .schema('roomietab')
    .from('recurring_templates')
    .select('*')
    .eq('household_id', member.household_id)
    .eq('is_active', true)

  return (
    <SettingsClient
      currentMember={member}
      household={member.household as { id: string; name: string; invite_code: string }}
      members={members ?? []}
      recurringTemplates={recurringTemplates ?? []}
    />
  )
}
