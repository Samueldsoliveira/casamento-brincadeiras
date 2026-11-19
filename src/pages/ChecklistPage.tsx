import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CHECKLIST_ITEMS, TOTAL_CHECKLIST_XP } from '../data/checklist'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Guest } from '../lib/supabase'
import { LocalModeBanner } from '../components/ui/LocalModeBanner'

type Props = { guest: Guest; onXpGained: () => void }

const LOCAL_KEY = (guestId: string) => `checklist_${guestId}`

export function ChecklistPage({ guest, onXpGained }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        try {
          const stored = localStorage.getItem(LOCAL_KEY(guest.id))
          if (stored) setCompleted(new Set(JSON.parse(stored)))
        } catch {}
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('checklist_completions')
        .select('item_key')
        .eq('guest_id', guest.id)
      if (data) setCompleted(new Set(data.map((d) => d.item_key)))
      setLoading(false)
    }
    load()
  }, [guest.id])

  async function toggle(key: string) {
    if (toggling) return
    setToggling(key)
    const isCompleted = completed.has(key)

    try {
      if (!isSupabaseConfigured) {
        const next = new Set(completed)
        if (isCompleted) next.delete(key)
        else {
          next.add(key)
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#E8C0CB', '#9A9862', '#F2D9E0'] })
          toast.success('+10 XP! 🎉 (modo local)', { icon: '⭐' })
          onXpGained()
        }
        setCompleted(next)
        try { localStorage.setItem(LOCAL_KEY(guest.id), JSON.stringify([...next])) } catch {}
        return
      }
      if (isCompleted) {
        await supabase
          .from('checklist_completions')
          .delete()
          .eq('guest_id', guest.id)
          .eq('item_key', key)
        setCompleted((prev) => { const next = new Set(prev); next.delete(key); return next })
      } else {
        await supabase
          .from('checklist_completions')
          .insert({ guest_id: guest.id, item_key: key })
        setCompleted((prev) => new Set([...prev, key]))
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#E8C0CB', '#9A9862', '#F2D9E0'] })
        toast.success('+10 XP! 🎉', { icon: '⭐' })
        onXpGained()
      }
    } catch {
      toast.error('Erro. Tente novamente.')
    } finally {
      setToggling(null)
    }
  }

  const progress = completed.size
  const percent = Math.round((progress / CHECKLIST_ITEMS.length) * 100)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-20 pb-28">
      {!isSupabaseConfigured && <LocalModeBanner />}
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-brand-dark text-2xl font-bold italic">
          Checklist da Festa
        </h2>
        <p className="font-body text-brand-brown text-sm mt-1">
          Pra você não esquecer de nada! ✨
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 mb-5 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body font-semibold text-brand-dark text-sm">
            {progress}/{CHECKLIST_ITEMS.length} concluídos
          </span>
          <span className="font-body font-semibold text-brand-sage text-sm">
            {progress * 10} / {TOTAL_CHECKLIST_XP} XP
          </span>
        </div>
        <div className="h-2 bg-brand-cream-dark rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-brand-rose rounded-full"
          />
        </div>
        {percent === 100 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-brand-sage font-semibold text-sm text-center mt-2"
          >
            🎊 Parabéns! Você aproveitou tudo!
          </motion.p>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {CHECKLIST_ITEMS.map((item, i) => {
            const done = completed.has(item.key)
            return (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggle(item.key)}
                disabled={toggling === item.key}
                className={`
                  w-full flex items-center gap-3 p-4 rounded-2xl text-left
                  transition-all duration-200 shadow-card
                  ${done
                    ? 'bg-brand-rose-light border-2 border-brand-rose'
                    : 'bg-white border-2 border-transparent hover:border-brand-rose-light'
                  }
                `}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={`font-body flex-1 text-base ${done ? 'line-through text-brand-brown' : 'text-brand-dark font-medium'}`}>
                  {item.label}
                </span>
                <motion.div
                  animate={{ scale: done ? [1.3, 1] : 1, opacity: done ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-6 rounded-full bg-brand-sage flex items-center justify-center shrink-0"
                  style={{ opacity: done ? 1 : 0 }}
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </motion.div>
                {!done && (
                  <div className="w-6 h-6 rounded-full border-2 border-brand-cream-dark shrink-0" />
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
