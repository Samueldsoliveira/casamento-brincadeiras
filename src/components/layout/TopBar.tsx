import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Guest } from '../../lib/supabase'

type Props = {
  guest: Guest | null
  xp: number
  onLogout?: () => void
}

export function TopBar({ guest, xp, onLogout }: Props) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-brand-rose-light"
    >
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => guest && onLogout && setShowMenu((v) => !v)}
          className="flex flex-col leading-tight text-left"
        >
          <span className="font-heading text-brand-dark font-semibold text-sm italic">
            Samuel & Margerie
          </span>
          {guest && (
            <span className="font-body text-brand-brown text-xs">
              Olá, {guest.name.split(' ')[0]}! 👋
            </span>
          )}
        </button>

        {guest && (
          <div className="flex items-center gap-1.5 bg-brand-rose-light px-3 py-1 rounded-full">
            <span className="text-xs">⭐</span>
            <span className="font-body font-semibold text-brand-dark text-sm">
              {xp} XP
            </span>
          </div>
        )}
      </div>

      {/* Logout menu */}
      {showMenu && onLogout && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-14 left-0 right-0 bg-white border-b border-brand-cream-dark px-4 py-3 flex items-center justify-between"
        >
          <span className="font-body text-brand-brown text-sm">
            Trocar de convidado?
          </span>
          <button
            onClick={() => { setShowMenu(false); onLogout() }}
            className="font-body font-semibold text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full"
          >
            Sair
          </button>
        </motion.div>
      )}
    </motion.header>
  )
}
