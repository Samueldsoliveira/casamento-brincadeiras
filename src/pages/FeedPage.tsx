import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { MediaCard } from '../components/ui/MediaCard'
import { PhotoGallery } from '../components/ui/PhotoGallery'
import { Button } from '../components/ui/Button'
import { LocalModeBanner } from '../components/ui/LocalModeBanner'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { prepareFile } from '../lib/mediaUtils'
import type { PhotoSubmission, Guest } from '../lib/supabase'

type Props = { guest: Guest }

const BUCKET = 'wedding-media'

export function FeedPage({ guest }: Props) {
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)

  const loadFeed = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('photo_submissions')
      .select('*, guests(name), submission_likes(id, guest_id)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      const enriched = data.map((s) => ({
        ...s,
        _likes_count: (s.submission_likes as { id: string; guest_id: string }[])?.length ?? 0,
        _liked_by_me: (s.submission_likes as { id: string; guest_id: string }[])?.some(
          (l) => l.guest_id === guest.id
        ) ?? false,
      }))
      setSubmissions(enriched as PhotoSubmission[])
    }
    setLoading(false)
  }, [guest.id])

  useEffect(() => {
    loadFeed()
    const channel = supabase
      .channel('feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photo_submissions' }, () => {
        loadFeed()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadFeed])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0]
    if (!raw) return
    const toastId = raw.type.startsWith('image') ? toast.loading('Comprimindo foto...') : undefined
    const { file, error } = await prepareFile(raw)
    if (toastId) toast.dismiss(toastId)
    if (error) { toast.error(error); return }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error('Selecione uma foto ou vídeo primeiro!')
      return
    }
    setUploading(true)
    try {
      const ext = selectedFile.name.split('.').pop()
      const path = `${guest.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, selectedFile, { upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const fileType = selectedFile.type.startsWith('video') ? 'video' : 'image'
      const { error: insertError } = await supabase.from('photo_submissions').insert({
        guest_id: guest.id,
        challenge_key: null,
        file_url: urlData.publicUrl,
        file_type: fileType,
        caption: caption.trim() || null,
      })
      if (insertError) throw insertError

      toast.success('Publicado na cápsula do tempo! 📸')
      setShowUpload(false)
      setCaption('')
      setSelectedFile(null)
      setPreviewUrl(null)
      loadFeed()
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-20 pb-28">
      {!isSupabaseConfigured && <LocalModeBanner />}
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-brand-dark text-2xl font-bold italic">
          Galeria da Festa
        </h2>
        <p className="font-body text-brand-brown text-sm mt-1">
          Fotos e vídeos dos convidados em tempo real ✨
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-brand-brown text-sm">Carregando...</p>
        </div>
      ) : submissions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-5xl mb-3">📷</div>
          <p className="font-heading text-brand-dark text-lg italic">Nenhuma foto ainda!</p>
          <p className="font-body text-brand-brown text-sm mt-1">
            Seja o primeiro a publicar na cápsula do tempo.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {submissions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <MediaCard
                  submission={s}
                  guestId={guest.id}
                  onClick={() => setGalleryIndex(i)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Gallery modal */}
      <AnimatePresence>
        {galleryIndex !== null && (
          <PhotoGallery
            submissions={submissions}
            initialIndex={galleryIndex}
            onClose={() => setGalleryIndex(null)}
            guestId={guest.id}
          />
        )}
      </AnimatePresence>

      {/* Floating add button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUpload(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-brand-rose rounded-full shadow-card-hover flex items-center justify-center text-2xl z-30"
      >
        +
      </motion.button>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false) }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-brand-dark text-xl font-semibold italic">
                  📦 Cápsula do Tempo
                </h3>
                <button onClick={() => setShowUpload(false)} className="text-brand-brown text-xl">×</button>
              </div>

              {/* Preview */}
              {previewUrl ? (
                <div className="relative mb-4 rounded-2xl overflow-hidden aspect-square bg-brand-cream-dark">
                  {selectedFile?.type.startsWith('video') ? (
                    <video src={previewUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <button
                    onClick={() => { setPreviewUrl(null); setSelectedFile(null) }}
                    className="absolute top-2 right-2 bg-black/60 text-white w-7 h-7 rounded-full text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full mb-4 h-40 rounded-2xl border-2 border-dashed border-brand-rose-light
                    flex flex-col items-center justify-center gap-2 text-brand-brown
                    hover:bg-brand-rose-light/30 transition-colors"
                >
                  <span className="text-3xl">📷</span>
                  <span className="font-body text-sm">Selecionar foto ou vídeo</span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Uma legenda (opcional)..."
                maxLength={200}
                className="w-full px-4 py-3 rounded-2xl border-2 border-brand-cream-dark bg-brand-cream
                  font-body text-brand-dark placeholder:text-brand-brown/50
                  focus:outline-none focus:border-brand-rose mb-4"
              />

              <Button fullWidth onClick={handleUpload} loading={uploading} size="lg">
                Publicar na Cápsula 📸
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
