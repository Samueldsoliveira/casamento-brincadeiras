import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { DESAFIO_ITEMS, type DesafioItem } from '../data/desafio'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Guest } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { LocalModeBanner } from '../components/ui/LocalModeBanner'

type Props = { guest: Guest; onXpGained: () => void }

const BUCKET = 'wedding-media'

export function DesafioPage({ guest, onXpGained }: Props) {
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState<DesafioItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      const { data } = await supabase
        .from('photo_submissions')
        .select('challenge_key')
        .eq('guest_id', guest.id)
        .not('challenge_key', 'is', null)
      if (data) setSubmitted(new Set(data.map((d) => d.challenge_key as string)))
      setLoading(false)
    }
    load()
  }, [guest.id])

  function openItem(item: DesafioItem) {
    if (submitted.has(item.key)) return
    setActiveItem(item)
    setPreviewUrl(null)
    setSelectedFile(null)
    setCaption('')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast.error('Arquivo muito grande! Máximo 50MB.'); return }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!selectedFile || !activeItem) { toast.error('Selecione um arquivo primeiro!'); return }
    setUploading(true)
    try {
      const ext = selectedFile.name.split('.').pop()
      const path = `${guest.id}/${activeItem.key}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, selectedFile, { upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const fileType = selectedFile.type.startsWith('video') ? 'video' : 'image'

      const { error: insertError } = await supabase.from('photo_submissions').insert({
        guest_id: guest.id,
        challenge_key: activeItem.key,
        file_url: urlData.publicUrl,
        file_type: fileType,
        caption: caption.trim() || null,
      })
      if (insertError) throw insertError

      setSubmitted((prev) => new Set([...prev, activeItem.key]))
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 }, colors: ['#E8C0CB', '#9A9862', '#C9A468'] })
      toast.success('+25 XP! Desafio concluído! 🎉', { icon: '📸' })
      onXpGained()
      setActiveItem(null)
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const doneCount = submitted.size

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-20 pb-28">
      {!isSupabaseConfigured && <LocalModeBanner />}
      <div className="text-center mb-6">
        <h2 className="font-heading text-brand-dark text-2xl font-bold italic">
          Desafio das Fotos
        </h2>
        <p className="font-body text-brand-brown text-sm mt-1">
          Compartilhe com a gente! {doneCount}/{DESAFIO_ITEMS.length} concluídos
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 mb-5 shadow-card">
        <div className="h-2 bg-brand-cream-dark rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(doneCount / DESAFIO_ITEMS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-brand-sage rounded-full"
          />
        </div>
        <p className="font-body text-brand-brown text-xs text-center mt-2">
          {doneCount * 25} / {DESAFIO_ITEMS.length * 25} XP do desafio
        </p>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 gap-3">
        {DESAFIO_ITEMS.map((item, i) => {
          const done = submitted.has(item.key)
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openItem(item)}
              disabled={done}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl text-left
                transition-all duration-200 shadow-card
                ${done
                  ? 'bg-brand-sage/10 border-2 border-brand-sage'
                  : 'bg-white border-2 border-transparent hover:border-brand-rose active:scale-98'
                }
              `}
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-body font-semibold text-sm ${done ? 'text-brand-sage line-through' : 'text-brand-dark'}`}>
                  {item.label}
                </p>
                {!done && (
                  <p className="font-body text-brand-brown text-xs mt-0.5">{item.tip}</p>
                )}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-brand-sage' : 'bg-brand-cream-dark'}`}>
                <span className={done ? 'text-white text-sm' : 'text-brand-brown text-sm'}>
                  {done ? '✓' : '+25'}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Upload sheet */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setActiveItem(null) }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{activeItem.emoji}</span>
                <button onClick={() => setActiveItem(null)} className="text-brand-brown text-xl">×</button>
              </div>
              <h3 className="font-heading text-brand-dark text-lg font-semibold italic mb-1">
                {activeItem.label}
              </h3>
              <p className="font-body text-brand-brown text-sm mb-4">{activeItem.tip}</p>

              {previewUrl ? (
                <div className="relative mb-4 rounded-2xl overflow-hidden aspect-video bg-brand-cream-dark">
                  {selectedFile?.type.startsWith('video') ? (
                    <video src={previewUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <button
                    onClick={() => { setPreviewUrl(null); setSelectedFile(null) }}
                    className="absolute top-2 right-2 bg-black/60 text-white w-7 h-7 rounded-full text-sm"
                  >×</button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full mb-4 h-36 rounded-2xl border-2 border-dashed border-brand-rose-light
                    flex flex-col items-center justify-center gap-2 text-brand-brown
                    hover:bg-brand-rose-light/30 transition-colors"
                >
                  <span className="text-3xl">📷</span>
                  <span className="font-body text-sm">Tirar foto ou selecionar vídeo</span>
                </button>
              )}

              <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" onChange={handleFileChange} className="hidden" />

              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Legenda (opcional)..."
                maxLength={200}
                className="w-full px-4 py-3 rounded-2xl border-2 border-brand-cream-dark bg-brand-cream
                  font-body text-brand-dark placeholder:text-brand-brown/50
                  focus:outline-none focus:border-brand-rose mb-4"
              />

              <Button fullWidth onClick={handleSubmit} loading={uploading} variant="sage" size="lg">
                Enviar Desafio! 📸 +25 XP
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
