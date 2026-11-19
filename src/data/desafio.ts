export type DesafioItem = {
  key: string
  label: string
  emoji: string
  tip: string
  xp: number
}

export const DESAFIO_ITEMS: DesafioItem[] = [
  {
    key: 'primeira_danca',
    label: 'A primeira dança / valsa do casal',
    emoji: '💃',
    tip: 'Registre esse momento mágico!',
    xp: 25,
  },
  {
    key: 'melhor_dancerino',
    label: 'Um vídeo do melhor dançarino da festa',
    emoji: '🕺',
    tip: 'Quem tá arrasando na pista?',
    xp: 25,
  },
  {
    key: 'pior_dancerino',
    label: 'Um vídeo do pior dançarino da festa',
    emoji: '😂',
    tip: 'Todo casamento tem um! Captura esse momento!',
    xp: 25,
  },
  {
    key: 'foto_grupo',
    label: 'Uma foto em grupo',
    emoji: '👯',
    tip: 'Reúna a galera para uma foto épica!',
    xp: 25,
  },
  {
    key: 'foto_mesa',
    label: 'Uma foto da sua mesa',
    emoji: '🍷',
    tip: 'Registre a mesa decorada (e quem está com você)!',
    xp: 25,
  },
  {
    key: 'foto_sorrindo',
    label: 'Uma foto de alguém sorrindo',
    emoji: '😊',
    tip: 'Sorrisos genuínos são os mais bonitos!',
    xp: 25,
  },
  {
    key: 'foto_voce',
    label: 'Um vídeo ou foto seu',
    emoji: '🤳',
    tip: 'Selfie ou clique! Você também faz parte da história.',
    xp: 25,
  },
  {
    key: 'algo_fofo',
    label: 'Algo que achou muito fofo',
    emoji: '🥹',
    tip: 'O que te tocou no coração hoje?',
    xp: 25,
  },
]
