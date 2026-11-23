import { motion } from 'framer-motion'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PhotoSubmission } from '../../lib/supabase'
import { CHALLENGE_LABELS } from '../../data/desafio'

type Props = {
  submission: PhotoSubmission
  guestId?: string
  onLikeToggle?: (id: string, liked: boolean) => void
  onClick?: () => void
}

export function MediaCard({ submission, guestId, onLikeToggle, onClick }: Props) {
  const [liked, setLiked] = useState(submission._liked_by_me ?? false)
  const [likesCount, setLikesCount] = useState(submission._likes_count ?? 0)
  const [toggling, setToggling] = useState(false)

  const challengeLabel = submission.challenge_key
    ? (CHALLENGE_LABELS[submission.challenge_key] ?? submission.challenge_key.replace(/_/g, ' '))
    : '📦 Cápsula do Tempo'

  async function handleLike() {
    if (!guestId || toggling) return
    setToggling(true)
    try {
      if (liked) {
        await supabase
          .from('submission_likes')
          .delete()
          .eq('submission_id', submission.id)
          .eq('guest_id', guestId)
        setLiked(false)
        setLikesCount((n) => n - 1)
        onLikeToggle?.(submission.id, false)
      } else {
        await supabase
          .from('submission_likes')
          .insert({ submission_id: submission.id, guest_id: guestId })
        setLiked(true)
        setLikesCount((n) => n + 1)
        onLikeToggle?.(submission.id, true)
      }
    } finally {
      setToggling(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-card"
    >
      {/* Media */}
      <div
        className="relative bg-brand-cream-dark aspect-square cursor-pointer"
        onClick={onClick}
      >
        {submission.file_type === 'video' ? (
          <video
            src={submission.file_url}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        ) : (
          <img
            src={submission.file_url}
            alt={submission.caption || 'Foto do casamento'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {submission.file_type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white text-lg">▶</div>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-body font-semibold px-2 py-0.5 rounded-full text-brand-dark">
          {challengeLabel}
        </span>
      </div>

      {/* Footer */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-brand-dark text-sm truncate">
            {submission.guests?.name ?? 'Convidado'}
          </p>
          {submission.caption && (
            <p className="font-body text-brand-brown text-xs mt-0.5 line-clamp-2">
              {submission.caption}
            </p>
          )}
        </div>

        <button
          onClick={handleLike}
          disabled={!guestId || toggling}
          className="flex flex-col items-center gap-0.5 shrink-0 disabled:opacity-50"
        >
          <motion.span
            animate={{ scale: liked ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            {liked ? '❤️' : '🤍'}
          </motion.span>
          <span className="font-body text-xs text-brand-brown">{likesCount}</span>
        </button>
      </div>
    </motion.div>
  )
}
