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
    question: 'Fim de semana perfeito:',
    answers: [
      { label: '🏖️ Praia, sol e agitação', team: 'S' },
      { label: '🏡 Em casa, filmes e quentinha', team: 'M' },
    ],
  },
  {
    id: 'q2',
    question: 'Na hora de escolher o almoço:',
    answers: [
      { label: '🍕 Vai de pizza sem pensar dois vezes', team: 'S' },
      { label: '🥗 Pesquisa o cardápio antes de decidir', team: 'M' },
    ],
  },
  {
    id: 'q3',
    question: 'Em uma festa você é:',
    answers: [
      { label: '🎉 O primeiro na pista de dança', team: 'S' },
      { label: '🛋️ O que fica no cantinho conversando', team: 'M' },
    ],
  },
  {
    id: 'q4',
    question: 'Sua relação com o horário:',
    answers: [
      { label: '⏰ Sempre 10 minutos adiantado', team: 'M' },
      { label: '😅 "Já to chegando" (ainda em casa)', team: 'S' },
    ],
  },
  {
    id: 'q5',
    question: 'Quando algo dá errado:',
    answers: [
      { label: '🧊 Mantém a calma e resolve', team: 'M' },
      { label: '😤 Reclama primeiro, resolve depois', team: 'S' },
    ],
  },
  {
    id: 'q6',
    question: 'Sua playlist favorita:',
    answers: [
      { label: '🎵 Pagode, sertanejo e forró', team: 'S' },
      { label: '🎶 Pop internacional e K-pop', team: 'M' },
    ],
  },
  {
    id: 'q7',
    question: 'Quando assiste uma série:',
    answers: [
      { label: '📺 Maratona até terminar tudo', team: 'S' },
      { label: '🌙 Um episódio por dia com calma', team: 'M' },
    ],
  },
  {
    id: 'q8',
    question: 'Sua forma de demonstrar amor:',
    answers: [
      { label: '🤗 Abraços, beijos e palavras', team: 'S' },
      { label: '🎁 Presentes surpresa e atos gentis', team: 'M' },
    ],
  },
]

export const XP_MATCH = 150
