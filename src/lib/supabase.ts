import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Faltam variáveis de ambiente do Supabase.\n' +
    'Crie o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
)

export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co'

export type Guest = {
  id: string
  name: string
  created_at: string
}

export type ChecklistCompletion = {
  id: string
  guest_id: string
  item_key: string
  completed_at: string
}

export type PhotoSubmission = {
  id: string
  guest_id: string
  challenge_key: string | null
  file_url: string
  file_type: 'image' | 'video'
  caption: string
  created_at: string
  guests?: { name: string }
  submission_likes?: { id: string }[]
  _likes_count?: number
  _liked_by_me?: boolean
}

export type MatchResult = {
  id: string
  guest_id: string
  samuel_pct: number
  margerie_pct: number
  completed_at: string
}
