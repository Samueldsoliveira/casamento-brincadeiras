import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'sage'
type Size = 'sm' | 'md' | 'lg'

type Props = {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  className?: string
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-rose text-brand-dark border border-brand-rose hover:bg-brand-rose-dark hover:border-brand-rose-dark',
  secondary: 'bg-brand-dark text-brand-cream border border-brand-dark hover:bg-brand-brown',
  ghost: 'bg-transparent text-brand-dark border border-brand-rose hover:bg-brand-rose-light',
  sage: 'bg-brand-sage text-white border border-brand-sage hover:bg-brand-sage-dark',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  type = 'button',
  className = '',
  fullWidth,
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-body font-semibold
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-rose focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}
