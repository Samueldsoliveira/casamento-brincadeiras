import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import type { Guest } from '../lib/supabase'

type Props = {
  onLogin: (name: string) => Promise<Guest>
  loading: boolean
}

export function LoginPage({ onLogin, loading }: Props) {
  const login = onLogin
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Digite seu nome para entrar!')
      return
    }
    if (name.trim().length < 2) {
      setError('Nome muito curto. Digite seu nome completo.')
      return
    }
    setError('')
    try {
      await login(name)
    } catch {
      setError('Ops! Algo deu errado. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-6">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-rose opacity-10" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-brand-sage opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl mb-4"
          >
            💍
          </motion.div>
          <h1 className="font-heading text-brand-dark text-3xl font-bold italic leading-tight">
            Samuel & Margerie
          </h1>
          <p className="font-script text-brand-rose-dark text-xl mt-1">
            Bem-vindo ao nosso casamento!
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-brand-rose" />
            <span className="text-brand-rose text-sm">💐</span>
            <div className="h-px flex-1 bg-brand-rose" />
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl p-6 shadow-card"
        >
          <p className="font-body text-brand-brown text-sm text-center mb-5">
            Digite seu nome para participar das brincadeiras e ganhar pontos! 🎉
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="Seu nome completo"
                maxLength={60}
                className="w-full px-4 py-3 rounded-2xl border-2 border-brand-cream-dark bg-brand-cream
                  font-body text-brand-dark placeholder:text-brand-brown/50
                  focus:outline-none focus:border-brand-rose transition-colors duration-200"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 font-body text-xs text-red-500 px-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Entrar na festa! 🎊
            </Button>
          </form>
        </motion.div>

        <p className="text-center font-body text-brand-brown/60 text-xs mt-6">
          Colete XP, suba no ranking e divirta-se!
        </p>
      </motion.div>
    </div>
  )
}
