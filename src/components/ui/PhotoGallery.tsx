import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { PhotoSubmission } from '../../lib/supabase'
import { CHALLENGE_LABELS } from '../../data/desafio'

type Props = {
  submissions: PhotoSubmission[]
  initialIndex: number
  onClose: () => void
  guestId?: string
}

export function PhotoGallery({ submissions, initialIndex, onClose, guestId: _guestId }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  const current = submissions[index]

  function prev() {
    if (index === 0) return
    setDirection(-1)
    setIndex((i) => i - 1)
  }

  function next() {
    if (index === submissions.length - 1) return
    setDirection(1)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])

  if (!current) return null

  const tag = current.challenge_key
    ? (CHALLENGE_LABELS[current.challenge_key] ?? current.challenge_key.replace(/_/g, ' '))
    : '📦 Cápsula do Tempo'

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div>
          <p className="font-body font-semibold text-white text-sm">{current.guests?.name ?? 'Convidado'}</p>
          <p className="font-body text-white/50 text-xs">{tag}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-white/50 text-xs">{index + 1} / {submissions.length}</span>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>
      </div>

      {/* Media */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center px-2"
          >
            {current.file_type === 'video' ? (
              <video
                src={current.file_url}
                className="max-w-full max-h-full rounded-xl object-contain"
                controls
                playsInline
                autoPlay
              />
            ) : (
              <img
                src={current.file_url}
                alt={current.caption || 'Foto'}
                className="max-w-full max-h-full rounded-xl object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        {index > 0 && (
          <button
            onClick={prev}
            className="absolute left-2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            ‹
          </button>
        )}
        {index < submissions.length - 1 && (
          <button
            onClick={next}
            className="absolute right-2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            ›
          </button>
        )}
      </div>

      {/* Caption + dots */}
      <div className="shrink-0 px-4 py-3">
        {current.caption && (
          <p className="font-body text-white/80 text-sm text-center mb-3">{current.caption}</p>
        )}
        {/* Dots */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {submissions.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i) }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
