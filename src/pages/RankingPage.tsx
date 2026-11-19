import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Guest } from '../lib/supabase'
import { LocalModeBanner } from '../components/ui/LocalModeBanner'

type RankRow = {
  guest_id: string
  name: string
  xp: number
  checklist_count: number
  desafio_count: number
  match_done: boolean
  likes_received: number
  posts_count: number
}

type Props = { guest: Guest }

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_COLORS = [
  'bg-amber-50 border-amber-300',
  'bg-slate-50 border-slate-300',
  'bg-orange-50 border-orange-200',
]

export function RankingPage({ guest }: Props) {
  const [ranking, setRanking] = useState<RankRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    loadRanking()
    const channel = supabase
      .channel('ranking-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_completions' }, loadRanking)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_submissions' }, loadRanking)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_likes' }, loadRanking)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results' }, loadRanking)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadRanking() {
    setLoading(true)
    const [guestsRes, checklistRes, submissionsRes, likesRes, matchRes] = await Promise.all([
      supabase.from('guests').select('id, name'),
      supabase.from('checklist_completions').select('guest_id'),
      supabase.from('photo_submissions').select('guest_id, challenge_key, id'),
      supabase.from('submission_likes').select('submission_id, photo_submissions(guest_id)'),
      supabase.from('match_results').select('guest_id'),
    ])

    if (!guestsRes.data) { setLoading(false); return }

    const checklistByGuest = new Map<string, number>()
    for (const c of checklistRes.data ?? []) {
      checklistByGuest.set(c.guest_id, (checklistByGuest.get(c.guest_id) ?? 0) + 1)
    }

    const desafioByGuest = new Map<string, number>()
    const postsByGuest = new Map<string, number>()
    for (const s of submissionsRes.data ?? []) {
      if (s.challenge_key) {
        desafioByGuest.set(s.guest_id, (desafioByGuest.get(s.guest_id) ?? 0) + 1)
      } else {
        postsByGuest.set(s.guest_id, (postsByGuest.get(s.guest_id) ?? 0) + 1)
      }
    }

    const submissionOwners = new Map<string, string>()
    for (const s of submissionsRes.data ?? []) {
      submissionOwners.set(s.id, s.guest_id)
    }

    const likesByGuest = new Map<string, number>()
    for (const l of likesRes.data ?? []) {
      const sub = l.photo_submissions as unknown as { guest_id: string } | null
      if (sub?.guest_id) {
        likesByGuest.set(sub.guest_id, (likesByGuest.get(sub.guest_id) ?? 0) + 1)
      }
    }

    const matchGuests = new Set((matchRes.data ?? []).map((m) => m.guest_id))

    const rows: RankRow[] = guestsRes.data.map((g) => {
      const checklist = checklistByGuest.get(g.id) ?? 0
      const desafio = desafioByGuest.get(g.id) ?? 0
      const match = matchGuests.has(g.id)
      const likes = likesByGuest.get(g.id) ?? 0
      const posts = postsByGuest.get(g.id) ?? 0
      const xp = checklist * 10 + desafio * 25 + (match ? 150 : 0) + likes * 5 + posts * 20
      return {
        guest_id: g.id,
        name: g.name,
        xp,
        checklist_count: checklist,
        desafio_count: desafio,
        match_done: match,
        likes_received: likes,
        posts_count: posts,
      }
    })

    rows.sort((a, b) => b.xp - a.xp)
    setRanking(rows)
    setLoading(false)
  }

  const myRank = ranking.findIndex((r) => r.guest_id === guest.id) + 1

  return (
    <div className="max-w-lg mx-auto px-4 pt-20 pb-28">
      {!isSupabaseConfigured && <LocalModeBanner />}
      <div className="text-center mb-6">
        <h2 className="font-heading text-brand-dark text-2xl font-bold italic">
          Ranking
        </h2>
        <p className="font-body text-brand-brown text-sm mt-1">
          Quem está dominando a festa? 🏆
        </p>
      </div>

      {/* My position */}
      {myRank > 0 && (
        <div className="bg-brand-rose-light rounded-2xl p-3 mb-5 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-2">
            <span className="text-xl">{myRank <= 3 ? MEDALS[myRank - 1] : `#${myRank}`}</span>
            <span className="font-body font-semibold text-brand-dark text-sm">
              Você está em {myRank}º lugar!
            </span>
          </div>
          <span className="font-body font-semibold text-brand-dark">
            ⭐ {ranking[myRank - 1]?.xp ?? 0} XP
          </span>
        </div>
      )}

      {/* XP guide */}
      <div className="bg-white rounded-2xl p-4 mb-5 shadow-card">
        <p className="font-body font-semibold text-brand-dark text-sm mb-2">Como ganhar XP:</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Checklist item', xp: '+10 XP' },
            { label: 'Desafio das fotos', xp: '+25 XP' },
            { label: 'Quiz Match', xp: '+150 XP' },
            { label: 'Post (cápsula)', xp: '+20 XP' },
            { label: 'Like recebido', xp: '+5 XP' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between bg-brand-cream rounded-xl px-3 py-1.5">
              <span className="font-body text-brand-brown text-xs">{item.label}</span>
              <span className="font-body font-semibold text-brand-sage text-xs">{item.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((row, i) => {
            const isMe = row.guest_id === guest.id
            const isTop = i < 3
            return (
              <motion.div
                key={row.guest_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`
                  flex items-center gap-3 p-3 rounded-2xl border-2 shadow-card
                  ${isMe ? 'bg-brand-rose-light border-brand-rose' : isTop ? MEDAL_COLORS[i] : 'bg-white border-transparent'}
                `}
              >
                <span className="text-xl w-8 text-center">
                  {i < 3 ? MEDALS[i] : <span className="font-body text-brand-brown text-sm font-semibold">#{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-brand-dark text-sm truncate">
                    {row.name} {isMe ? '(você)' : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {row.checklist_count > 0 && <span className="text-xs text-brand-brown">✅ {row.checklist_count}</span>}
                    {row.desafio_count > 0 && <span className="text-xs text-brand-brown">📸 {row.desafio_count}</span>}
                    {row.match_done && <span className="text-xs text-brand-brown">💞 Match</span>}
                    {row.likes_received > 0 && <span className="text-xs text-brand-brown">❤️ {row.likes_received}</span>}
                  </div>
                </div>
                <span className="font-body font-bold text-brand-dark shrink-0">
                  ⭐ {row.xp}
                </span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
