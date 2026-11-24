export type MatchAnswer = {
  label: string
  team: 'S' | 'M' // S = Samuel, M = Margerie
}

export type MatchQuestion = {
  id: string
  question: string
  answers: [MatchAnswer, MatchAnswer]
}

export const MATCH_QUESTIONS: MatchQuestion[] = [
  {
    id: 'q1',
    question: 'Você é daqueles que prefere...',
    answers: [
      { label: '🏠 Ficar em casa', team: 'S' },
      { label: '🎉 Sair e agitar', team: 'M' },
    ],
  },
  {
    id: 'q2',
    question: 'Na hora de escolher algo, você...',
    answers: [
      { label: '⚡ Decide rápido', team: 'S' },
      { label: '🤔 É muito indeciso(a)', team: 'M' },
    ],
  },
  {
    id: 'q3',
    question: 'Em uma festa você é...',
    answers: [
      { label: '🕺 O primeiro na pista de dança', team: 'M' },
      { label: '🛋️ O que fica no cantinho conversando', team: 'S' },
    ],
  },
  {
    id: 'q4',
    question: 'Sua relação com o horário...',
    answers: [
      { label: '⏰ Sempre 10 minutos adiantado', team: 'S' },
      { label: '😅 "Já to chegando" (ainda em casa)', team: 'M' },
    ],
  },
  {
    id: 'q5',
    question: 'Quando algo dá errado, você...',
    answers: [
      { label: '🧊 Resolve com calma', team: 'S' },
      { label: '😤 Reclama primeiro, resolve depois', team: 'M' },
    ],
  },
  {
    id: 'q6',
    question: 'Você é do time que...',
    answers: [
      { label: '🍽️ Come muito', team: 'M' },
      { label: '🥗 Come pouco', team: 'S' },
    ],
  },
  {
    id: 'q7',
    question: 'Quando o tempo muda, você...',
    answers: [
      { label: '🤧 Já tá de cama gripado(a)', team: 'S' },
      { label: '💪 Nem sente, imunidade de aço', team: 'M' },
    ],
  },
  {
    id: 'q8',
    question: 'Com qual linguagem do amor você se identifica mais?',
    answers: [
      { label: '💬 Palavra de afirmação', team: 'M' },
      { label: '⏳ Tempo de qualidade', team: 'S' },
    ],
  },
]

export const XP_MATCH = 150
