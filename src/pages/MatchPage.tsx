import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { MATCH_QUESTIONS, XP_MATCH } from '../data/matchQuiz'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Guest } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { LocalModeBanner } from '../components/ui/LocalModeBanner'

type Props = { guest: Guest; onXpGained: () => void }
type Answer = 'S' | 'M'

export function MatchPage({ guest, onXpGained }: Props) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [result, setResult] = useState<{ samuel: number; margerie: number } | null>(null)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [existingResult, setExistingResult] = useState<{ samuel: number; margerie: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function check() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      const { data } = await supabase
        .from('match_results')
        .select('samuel_pct, margerie_pct')
        .eq('guest_id', guest.id)
        .single()
      if (data) {
        setAlreadyDone(true)
        setExistingResult({ samuel: data.samuel_pct, margerie: data.margerie_pct })
        setStep('result')
        setResult({ samuel: data.samuel_pct, margerie: data.margerie_pct })
      }
      setLoading(false)
    }
    check()
  }, [guest.id])

  function selectAnswer(team: Answer) {
    const newAnswers = [...answers, team]
    setAnswers(newAnswers)

    if (currentQ < MATCH_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1)
    } else {
      finishQuiz(newAnswers)
    }
  }

  async function finishQuiz(finalAnswers: Answer[]) {
    const samuelCount = finalAnswers.filter((a) => a === 'S').length
    const total = finalAnswers.length
    const samuelPct = Math.round((samuelCount / total) * 100)
    const margeriePct = 100 - samuelPct

    setResult({ samuel: samuelPct, margerie: margeriePct })

    if (isSupabaseConfigured) {
      setSubmitting(true)
      try {
        await supabase.from('match_results').upsert({
          guest_id: guest.id,
          samuel_pct: samuelPct,
          margerie_pct: margeriePct,
        }, { onConflict: 'guest_id' })
        if (!alreadyDone) {
          toast.success(`+${XP_MATCH} XP! Quiz concluído! 💞`, { icon: '🎉' })
          onXpGained()
        }
      } finally {
        setSubmitting(false)
      }
    } else {
      toast.success(`Quiz concluído! 💞 (modo local — sem XP salvo)`, { icon: '🎉' })
    }

    setStep('result')
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 120, origin: { y: 0.4 }, colors: ['#E8C0CB', '#9A9862', '#C9A468', '#F2D9E0'] })
    }, 300)
  }

  function restart() {
    setStep('intro')
    setCurrentQ(0)
    setAnswers([])
    setResult(null)
    setAlreadyDone(false)
    setExistingResult(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const question = MATCH_QUESTIONS[currentQ]
  const isMoreSamuel = result ? result.samuel >= result.margerie : false

  return (
    <div className="max-w-lg mx-auto px-4 pt-20 pb-28 min-h-screen">
      {!isSupabaseConfigured && <LocalModeBanner />}
      <AnimatePresence mode="wait">
        {/* Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="text-6xl mb-4 mt-8">💞</div>
            <h2 className="font-heading text-brand-dark text-3xl font-bold italic mb-2">
              Com quem você se parece?
            </h2>
            <p className="font-body text-brand-brown text-sm mb-6 max-w-xs">
              Responda {MATCH_QUESTIONS.length} perguntas de preferência e descubra se você é mais Samuel ou Margerie!
            </p>

            <div className="bg-white rounded-3xl p-5 shadow-card w-full mb-6">
              <p className="font-body text-brand-brown text-sm mb-3">
                ⚠️ Você <strong>não saberá</strong> qual opção pertence a qual até o final!
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-brand-rose-light rounded-2xl p-3 text-center">
                  <div className="text-2xl mb-1">👤</div>
                  <p className="font-body font-semibold text-brand-dark text-sm">Samuel</p>
                </div>
                <div className="text-brand-brown font-heading text-xl italic">ou</div>
                <div className="flex-1 bg-brand-sage/20 rounded-2xl p-3 text-center">
                  <div className="text-2xl mb-1">👤</div>
                  <p className="font-body font-semibold text-brand-dark text-sm">Margerie</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-sage/10 rounded-2xl p-3 w-full mb-6">
              <p className="font-body text-brand-sage font-semibold text-sm text-center">
                🎯 Complete o quiz e ganhe {XP_MATCH} XP!
              </p>
            </div>

            <Button size="lg" fullWidth onClick={() => setStep('quiz')}>
              Começar o Quiz! 💞
            </Button>
          </motion.div>
        )}

        {/* Quiz */}
        {step === 'quiz' && question && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-brand-brown text-sm">
                  Pergunta {currentQ + 1} de {MATCH_QUESTIONS.length}
                </span>
                <span className="font-body text-brand-sage font-semibold text-sm">
                  {XP_MATCH} XP ao final
                </span>
              </div>
              <div className="h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((currentQ) / MATCH_QUESTIONS.length) * 100}%` }}
                  className="h-full bg-brand-rose rounded-full"
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
              <h3 className="font-heading text-brand-dark text-xl font-semibold italic text-center">
                {question.question}
              </h3>
            </div>

            {/* Answers */}
            <div className="flex flex-col gap-3">
              {question.answers.map((answer, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectAnswer(answer.team)}
                  className="w-full p-5 bg-white rounded-2xl shadow-card border-2 border-transparent
                    hover:border-brand-rose hover:bg-brand-rose-light/30
                    font-body text-brand-dark text-base font-medium text-left
                    transition-all duration-150 active:bg-brand-rose-light"
                >
                  {answer.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="text-6xl mb-4 mt-8">
              {isMoreSamuel ? '🤵' : '👰'}
            </div>
            <h2 className="font-heading text-brand-dark text-2xl font-bold italic mb-1">
              Resultado:
            </h2>
            <p className="font-body text-brand-brown text-sm mb-6">
              {alreadyDone && existingResult ? 'Seu resultado anterior:' : 'Você é mais parecido(a) com...'}
            </p>

            {/* Result bars */}
            <div className="bg-white rounded-3xl p-6 shadow-card w-full mb-6">
              {/* Samuel */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-body font-semibold text-brand-dark text-sm">🤵 Samuel</span>
                  <span className="font-heading font-bold text-brand-rose text-lg">{result.samuel}%</span>
                </div>
                <div className="h-3 bg-brand-cream-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.samuel}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="h-full bg-brand-rose rounded-full"
                  />
                </div>
              </div>

              {/* Margerie */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-body font-semibold text-brand-dark text-sm">👰 Margerie</span>
                  <span className="font-heading font-bold text-brand-sage text-lg">{result.margerie}%</span>
                </div>
                <div className="h-3 bg-brand-cream-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.margerie}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    className="h-full bg-brand-sage rounded-full"
                  />
                </div>
              </div>

              {/* Verdict */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-5 p-3 rounded-2xl bg-brand-cream"
              >
                <p className="font-heading italic text-brand-dark text-base font-semibold">
                  {isMoreSamuel
                    ? `Você tem ${result.samuel}% de Samuel! 🤵✨`
                    : `Você tem ${result.margerie}% de Margerie! 👰✨`}
                </p>
                {result.samuel === 50 ? (
                  <p className="font-body text-brand-brown text-sm mt-1">
                    Equilibradíssimo(a)! Você está no meio-termo! ⚖️
                  </p>
                ) : null}
              </motion.div>
            </div>

            {!alreadyDone && (
              <div className="bg-brand-sage/10 rounded-2xl p-3 w-full mb-5">
                <p className="font-body text-brand-sage font-semibold text-sm">
                  🎉 +{XP_MATCH} XP adicionados ao seu ranking!
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={restart}
              size="md"
            >
              Refazer o quiz
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {submitting && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
