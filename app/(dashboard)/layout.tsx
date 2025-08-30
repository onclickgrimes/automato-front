import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContainer } from '@/components/dashboard/container'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <DashboardContainer user={user} profile={profile}>
      {children}
    </DashboardContainer>
  )
}