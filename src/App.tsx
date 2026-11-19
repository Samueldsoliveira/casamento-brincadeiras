import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import { TopBar } from './components/layout/TopBar'
import { useGuest } from './hooks/useGuest'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { AdminPage } from './pages/AdminPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { DesafioPage } from './pages/DesafioPage'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { MatchPage } from './pages/MatchPage'
import { RankingPage } from './pages/RankingPage'

function AppInner() {
  const { guest, login, logout, loading } = useGuest()
  const location = useLocation()
  const [xp, setXp] = useState(0)

  const loadXp = useCallback(async () => {
    if (!guest || !isSupabaseConfigured) return
    const [checklistRes, desafioRes, postsRes, likesRes, matchRes] = await Promise.all([
      supabase.from('checklist_completions').select('id', { count: 'exact' }).eq('guest_id', guest.id),
      supabase.from('photo_submissions').select('id', { count: 'exact' }).eq('guest_id', guest.id).not('challenge_key', 'is', null),
      supabase.from('photo_submissions').select('id', { count: 'exact' }).eq('guest_id', guest.id).is('challenge_key', null),
      supabase.from('submission_likes').select('photo_submissions!inner(guest_id)', { count: 'exact' }).eq('photo_submissions.guest_id', guest.id),
      supabase.from('match_results').select('id', { count: 'exact' }).eq('guest_id', guest.id),
    ])
    const checklist = (checklistRes.count ?? 0) * 10
    const desafio = (desafioRes.count ?? 0) * 25
    const posts = (postsRes.count ?? 0) * 20
    const likes = (likesRes.count ?? 0) * 5
    const match = (matchRes.count ?? 0) > 0 ? 150 : 0
    setXp(checklist + desafio + posts + likes + match)
  }, [guest])

  useEffect(() => {
    if (guest) loadXp()
  }, [guest, loadXp])

  if (location.pathname === '/painel-do-casal') {
    return <AdminPage />
  }

  if (!guest) return <LoginPage onLogin={login} loading={loading} />

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      <TopBar guest={guest} xp={xp} onLogout={logout} />
      <BottomNav />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Routes location={location}>
              <Route path="/" element={<FeedPage guest={guest} />} />
              <Route path="/checklist" element={<ChecklistPage guest={guest} onXpGained={loadXp} />} />
              <Route path="/desafio" element={<DesafioPage guest={guest} onXpGained={loadXp} />} />
              <Route path="/ranking" element={<RankingPage guest={guest} />} />
              <Route path="/match" element={<MatchPage guest={guest} onXpGained={loadXp} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Lato, sans-serif',
            background: '#fff',
            color: '#2C2C2C',
            border: '1px solid #E8C0CB',
            borderRadius: '16px',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  )
}
