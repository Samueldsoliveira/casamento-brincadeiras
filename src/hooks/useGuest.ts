import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, type Guest } from '../lib/supabase'

const STORAGE_KEY = 'wedding_guest'

function localGuest(name: string): Guest {
  return { id: `local-${Date.now()}`, name, created_at: new Date().toISOString() }
}

export function useGuest() {
  const [guest, setGuest] = useState<Guest | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (guest) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(guest))
      } catch {}
    }
  }, [guest])

  async function login(name: string): Promise<Guest> {
    setLoading(true)
    try {
      const trimmed = name.trim()
      // Modo local: sem Supabase configurado, cria guest apenas no localStorage
      if (!isSupabaseConfigured) {
        const g = localGuest(trimmed)
        setGuest(g)
        return g
      }
      const { data, error } = await supabase
        .from('guests')
        .insert({ name: trimmed })
        .select()
        .single()
      if (error) throw error
      setGuest(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setGuest(null)
  }

  return { guest, login, logout, loading }
}
