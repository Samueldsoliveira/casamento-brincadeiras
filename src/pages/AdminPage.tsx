import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type StorageStats = {
  total_files: number
  mb_used: number
  gb_used: number
  mb_remaining: number
  pct_used: number
  photos: number
  videos: number
  avg_photo_kb: number
  avg_video_mb: number
}

type GuestRow = {
  id: string
  name: string
  created_at: string
  checklist_count: number
  desafio_count: number
  posts_count: number
  match_done: boolean
  xp: number
  mb_used: number
}

type SubmissionRow = {
  id: string
  guest_name: string
  challenge_key: string | null
  file_type: string
  file_url: string
  created_at: string
}

type MatchRow = {
  guest_name: string
  samuel_pct: number
  margerie_pct: number
  completed_at: string
}

export function AdminPage() {
  const [storage, setStorage] = useState<StorageStats | null>(null)
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'convidados' | 'midias' | 'match'>('overview')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadStorage(), loadGuests(), loadSubmissions(), loadMatches()])
    setLoading(false)
  }

  async function loadStorage() {
    const { data, error } = await supabase.rpc('get_storage_stats')
    if (!error && data) setStorage(data as StorageStats)
  }

  async function loadGuests() {
    const [guestsRes, checklistRes, desafioRes, postsRes, matchRes, storageByGuestRes] = await Promise.all([
      supabase.from('guests').select('id, name, created_at').order('created_at', { ascending: false }),
      supabase.from('checklist_completions').select('guest_id'),
      supabase.from('photo_submissions').select('guest_id').not('challenge_key', 'is', null),
      supabase.from('photo_submissions').select('guest_id').is('challenge_key', null),
      supabase.from('match_results').select('guest_id'),
      supabase.rpc('get_storage_by_guest'),
    ])

    const checklistMap = new Map<string, number>()
    for (const r of checklistRes.data ?? []) checklistMap.set(r.guest_id, (checklistMap.get(r.guest_id) ?? 0) + 1)
    const desafioMap = new Map<string, number>()
    for (const r of desafioRes.data ?? []) desafioMap.set(r.guest_id, (desafioMap.get(r.guest_id) ?? 0) + 1)
    const postsMap = new Map<string, number>()
    for (const r of postsRes.data ?? []) postsMap.set(r.guest_id, (postsMap.get(r.guest_id) ?? 0) + 1)
    const matchSet = new Set((matchRes.data ?? []).map((r) => r.guest_id))
    const mbMap = new Map<string, number>()
    for (const r of (storageByGuestRes.data ?? []) as { guest_id: string; mb_used: number }[]) {
      mbMap.set(r.guest_id, r.mb_used)
    }

    const rows: GuestRow[] = (guestsRes.data ?? []).map((g) => {
      const c = checklistMap.get(g.id) ?? 0
      const d = desafioMap.get(g.id) ?? 0
      const p = postsMap.get(g.id) ?? 0
      const m = matchSet.has(g.id)
      return {
        ...g,
        checklist_count: c,
        desafio_count: d,
        posts_count: p,
        match_done: m,
        xp: c * 10 + d * 25 + (m ? 150 : 0) + p * 20,
        mb_used: mbMap.get(g.id) ?? 0,
      }
    }).sort((a, b) => b.xp - a.xp)

    setGuests(rows)
  }

  async function loadSubmissions() {
    const { data } = await supabase
      .from('photo_submissions')
      .select('id, guest_id, challenge_key, file_type, file_url, created_at, guests(name)')
      .order('created_at', { ascending: false })
      .limit(100)

    setSubmissions((data ?? []).map((s) => ({
      id: s.id,
      guest_name: (s.guests as unknown as { name: string } | null)?.name ?? '—',
      challenge_key: s.challenge_key,
      file_type: s.file_type,
      file_url: s.file_url,
      created_at: s.created_at,
    })))
  }

  async function loadMatches() {
    const { data } = await supabase
      .from('match_results')
      .select('samuel_pct, margerie_pct, completed_at, guests(name)')
      .order('completed_at', { ascending: false })

    setMatches((data ?? []).map((m) => ({
      guest_name: (m.guests as unknown as { name: string } | null)?.name ?? '—',
      samuel_pct: m.samuel_pct,
      margerie_pct: m.margerie_pct,
      completed_at: m.completed_at,
    })))
  }

  const storageColor = !storage ? 'bg-brand-sage' :
    storage.pct_used > 80 ? 'bg-red-400' :
    storage.pct_used > 50 ? 'bg-amber-400' : 'bg-brand-sage'

  const TABS = [
    { id: 'overview', label: '📊 Visão Geral' },
    { id: 'convidados', label: '👥 Convidados' },
    { id: 'midias', label: '📸 Mídias' },
    { id: 'match', label: '💞 Match' },
  ] as const

  return (
    <div className="min-h-screen bg-brand-cream px-4 pt-8 pb-16 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🛡️</div>
        <h1 className="font-heading text-brand-dark text-3xl font-bold italic">Painel do Casal</h1>
        <p className="font-body text-brand-brown text-sm mt-1">Dados internos — só para Samuel & Margerie</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-brand-brown text-sm">Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-4 py-2 rounded-full font-body text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-dark text-brand-cream'
                    : 'bg-white text-brand-brown hover:bg-brand-cream-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Convidados', value: guests.length, icon: '👥' },
                  { label: 'Quiz Match feitos', value: matches.length, icon: '💞' },
                  { label: 'Fotos enviadas', value: submissions.filter(s => s.file_type === 'image').length, icon: '📷' },
                  { label: 'Vídeos enviados', value: submissions.filter(s => s.file_type === 'video').length, icon: '🎥' },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-2xl p-4 shadow-card text-center">
                    <div className="text-2xl mb-1">{card.icon}</div>
                    <div className="font-heading text-brand-dark text-3xl font-bold">{card.value}</div>
                    <div className="font-body text-brand-brown text-xs mt-0.5">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Storage card */}
              {storage ? (
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-brand-dark font-semibold italic text-lg">Armazenamento</h3>
                    <span className={`font-body text-xs font-semibold px-2 py-1 rounded-full ${
                      storage.pct_used > 80 ? 'bg-red-100 text-red-700' :
                      storage.pct_used > 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {storage.pct_used}% usado
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="h-4 bg-brand-cream-dark rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(storage.pct_used, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${storageColor}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Usado', value: `${storage.mb_used} MB`, sub: `${storage.gb_used} GB` },
                      { label: 'Disponível', value: `${storage.mb_remaining} MB`, sub: 'do 1 GB gratuito' },
                      { label: 'Total de arquivos', value: storage.total_files, sub: `${storage.photos} fotos / ${storage.videos} vídeos` },
                      { label: 'Média por arquivo', value: `${storage.avg_photo_kb ?? 0} KB`, sub: `foto · ${storage.avg_video_mb ?? 0} MB vídeo` },
                    ].map((item) => (
                      <div key={item.label} className="bg-brand-cream rounded-xl p-3">
                        <div className="font-heading text-brand-dark font-bold text-lg">{item.value}</div>
                        <div className="font-body text-brand-brown text-xs">{item.label}</div>
                        <div className="font-body text-brand-brown/60 text-xs">{item.sub}</div>
                      </div>
                    ))}
                  </div>

                  {storage.pct_used > 70 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <p className="font-body text-amber-800 text-xs font-semibold">
                        ⚠️ Acima de 70% — considere ativar o Supabase Pro ($25/mês · 100 GB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                  <p className="font-body text-amber-800 text-sm font-semibold">
                    ⚠️ Função de storage não encontrada
                  </p>
                  <p className="font-body text-amber-700 text-xs mt-1">
                    Execute o arquivo <code>supabase-admin-functions.sql</code> no SQL Editor do Supabase.
                  </p>
                </div>
              )}

              {/* Checklist popularity */}
              <div className="bg-white rounded-2xl p-4 shadow-card">
                <h3 className="font-heading text-brand-dark font-semibold italic mb-3">Engajamento Geral</h3>
                {[
                  { label: 'Fizeram o quiz Match', value: matches.length, total: guests.length, color: 'bg-brand-rose' },
                  { label: 'Enviaram pelo menos 1 mídia', value: [...new Set(submissions.map(s => s.guest_name))].length, total: guests.length, color: 'bg-brand-sage' },
                ].map((item) => (
                  <div key={item.label} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-brand-brown text-xs">{item.label}</span>
                      <span className="font-body text-brand-dark text-xs font-semibold">{item.value}/{item.total}</span>
                    </div>
                    <div className="h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CONVIDADOS */}
          {activeTab === 'convidados' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="font-body text-brand-brown text-xs text-right mb-2">{guests.length} convidados cadastrados</p>
              {guests.map((g, i) => (
                <div key={g.id} className="bg-white rounded-2xl p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-brand-brown text-xs">#{i + 1}</span>
                        <span className="font-body font-semibold text-brand-dark text-sm">{g.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {g.checklist_count > 0 && <span className="font-body text-brand-brown text-xs">✅ {g.checklist_count} checklist</span>}
                        {g.desafio_count > 0 && <span className="font-body text-brand-brown text-xs">📸 {g.desafio_count} desafio</span>}
                        {g.posts_count > 0 && <span className="font-body text-brand-brown text-xs">📦 {g.posts_count} post</span>}
                        {g.match_done && <span className="font-body text-brand-brown text-xs">💞 match</span>}
                        {g.mb_used > 0 && <span className="font-body text-brand-brown text-xs">💾 {g.mb_used} MB</span>}
                      </div>
                      <p className="font-body text-brand-brown/50 text-xs mt-0.5">
                        {new Date(g.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="shrink-0 bg-brand-rose-light px-2 py-1 rounded-full">
                      <span className="font-body font-bold text-brand-dark text-sm">⭐ {g.xp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* MÍDIAS */}
          {activeTab === 'midias' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="font-body text-brand-brown text-xs text-right mb-2">{submissions.length} arquivos (mais recentes primeiro)</p>
              {submissions.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-3">
                  <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    {s.file_type === 'video' ? (
                      <div className="w-14 h-14 rounded-xl bg-brand-dark flex items-center justify-center text-white text-2xl">▶</div>
                    ) : (
                      <img src={s.file_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    )}
                  </a>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-brand-dark text-xs truncate">{s.guest_name}</p>
                    <p className="font-body text-brand-brown text-xs">
                      {s.file_type === 'video' ? '🎥 Vídeo' : '📷 Foto'} ·{' '}
                      {s.challenge_key ? `Desafio: ${s.challenge_key.replace(/_/g, ' ')}` : '📦 Cápsula'}
                    </p>
                    <p className="font-body text-brand-brown/50 text-xs">
                      {new Date(s.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* MATCH */}
          {activeTab === 'match' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="font-body text-brand-brown text-xs text-right mb-2">{matches.length} quizzes concluídos</p>

              {/* Samuel vs Margerie média */}
              {matches.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
                  <h3 className="font-heading text-brand-dark font-semibold italic mb-3 text-center">Média geral dos convidados</h3>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-brand-brown w-16 text-right">🤵 Samuel</span>
                    <div className="flex-1 h-3 bg-brand-cream-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-rose rounded-full"
                        style={{ width: `${Math.round(matches.reduce((s, m) => s + m.samuel_pct, 0) / matches.length)}%` }}
                      />
                    </div>
                    <span className="font-body font-bold text-brand-dark text-sm w-10">
                      {Math.round(matches.reduce((s, m) => s + m.samuel_pct, 0) / matches.length)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-body text-xs text-brand-brown w-16 text-right">👰 Margerie</span>
                    <div className="flex-1 h-3 bg-brand-cream-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-sage rounded-full"
                        style={{ width: `${Math.round(matches.reduce((s, m) => s + m.margerie_pct, 0) / matches.length)}%` }}
                      />
                    </div>
                    <span className="font-body font-bold text-brand-dark text-sm w-10">
                      {Math.round(matches.reduce((s, m) => s + m.margerie_pct, 0) / matches.length)}%
                    </span>
                  </div>
                </div>
              )}

              {matches.map((m) => (
                <div key={m.guest_name + m.completed_at} className="bg-white rounded-2xl p-3 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body font-semibold text-brand-dark text-sm">{m.guest_name}</span>
                    <span className="font-body text-brand-brown/50 text-xs">
                      {new Date(m.completed_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-body text-xs text-brand-brown w-6">🤵</span>
                    <div className="flex-1 h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                      <div className="h-full bg-brand-rose rounded-full" style={{ width: `${m.samuel_pct}%` }} />
                    </div>
                    <span className="font-body text-xs font-semibold text-brand-dark w-10">{m.samuel_pct}%</span>
                    <span className="font-body text-xs text-brand-brown w-6">👰</span>
                    <div className="flex-1 h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                      <div className="h-full bg-brand-sage rounded-full" style={{ width: `${m.margerie_pct}%` }} />
                    </div>
                    <span className="font-body text-xs font-semibold text-brand-dark w-10">{m.margerie_pct}%</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Refresh */}
          <button
            onClick={loadAll}
            className="w-full mt-6 py-3 rounded-2xl border-2 border-brand-cream-dark font-body text-brand-brown text-sm font-semibold hover:bg-white transition-colors"
          >
            🔄 Atualizar dados
          </button>
        </>
      )}
    </div>
  )
}
