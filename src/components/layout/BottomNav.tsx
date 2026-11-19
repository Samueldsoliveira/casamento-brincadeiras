import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Feed' },
  { to: '/checklist', icon: '✅', label: 'Checklist' },
  { to: '/desafio', icon: '📸', label: 'Desafio' },
  { to: '/ranking', icon: '🏆', label: 'Ranking' },
  { to: '/match', icon: '💞', label: 'Match' },
]

export function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-brand-cream-dark safe-area-pb"
    >
      <div className="max-w-lg mx-auto px-2 py-1 flex items-center justify-around">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-rose-light text-brand-dark'
                  : 'text-brand-brown'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-body text-[10px] font-semibold leading-none">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  )
}
