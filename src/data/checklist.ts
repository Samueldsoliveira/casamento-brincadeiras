export type ChecklistItem = {
  key: string
  label: string
  emoji: string
  xp: number
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'crepe_frances', label: 'Crepe francês', emoji: '🥐', xp: 10 },
  { key: 'gelato_tailandes', label: 'Gelato tailandês', emoji: '🍦', xp: 10 },
  { key: 'brownie', label: 'Brownie', emoji: '🍫', xp: 10 },
  { key: 'pipoca_gourmet', label: 'Pipoca Gourmet', emoji: '🍿', xp: 10 },
  { key: 'jantar', label: 'Jantar', emoji: '🍽️', xp: 10 },
  { key: 'coquetel', label: 'Coquetel', emoji: '🍹', xp: 10 },
  { key: 'just_dance', label: 'Just Dance', emoji: '💃', xp: 10 },
  { key: 'caca_palavras', label: 'Caça palavras', emoji: '📝', xp: 10 },
  { key: 'cabine_polaroid', label: 'Cabine Polaroid', emoji: '📷', xp: 10 },
  { key: 'foto_noivos', label: 'Foto com os noivos', emoji: '💑', xp: 10 },
  { key: 'docinhos', label: 'Docinhos', emoji: '🍬', xp: 10 },
]

export const TOTAL_CHECKLIST_XP = CHECKLIST_ITEMS.reduce((sum, i) => sum + i.xp, 0)
