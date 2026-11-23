export const CHALLENGE_LABELS: Record<string, string> = {
  primeira_danca: '💃 Primeira dança',
  melhor_dancerino: '🕺 Melhor dançarino',
  pior_dancerino: '😂 Pior dançarino',
  foto_grupo: '👯 Foto com a galera',
  foto_mesa: '🍷 Foto da mesa',
  foto_sorrindo: '😊 Alguém sorrindo',
  foto_voce: '🤳 Foto sua',
  algo_fofo: '🥹 Algo fofo',
  saida_noivos: '🎊 Saída dos noivos',
  momento_votos: '💌 Momento de votos',
  selfie_noivos: '🤳 Selfie com os noivos',
  foto_polaroid: '📸 Foto da polaroid',
  foto_espelho: '🪞 Foto no espelho',
  mesa_doces: '🍬 Mesa de doces',
  caca_palavras: '🔍 Caça palavras',
  video_festa: '🎉 Vídeo na festa',
  foto_comendo: '😋 Foto comendo',
}

export type DesafioItem = {
  key: string
  label: string
  emoji: string
  tip: string
  xp: number
}

export const DESAFIO_ITEMS: DesafioItem[] = [
  // Antes da cerimônia
  {
    key: 'caca_palavras',
    label: 'Achando seu nome no caça palavras',
    emoji: '🔍',
    tip: 'Encontrou seu nome? Registra esse momento!',
    xp: 25,
  },
  // Cerimônia
  {
    key: 'momento_votos',
    label: 'Momento de votos',
    emoji: '💌',
    tip: 'O momento mais emocionante da noite!',
    xp: 25,
  },
  {
    key: 'saida_noivos',
    label: 'Saída dos noivos',
    emoji: '🎊',
    tip: 'Registre esse momento inesquecível!',
    xp: 25,
  },
  // Coquetel / Serviço
  {
    key: 'foto_comendo',
    label: 'Uma foto comendo',
    emoji: '😋',
    tip: 'O que você escolheu no bufê?',
    xp: 25,
  },
  {
    key: 'mesa_doces',
    label: 'Foto da mesa de doces',
    emoji: '🍬',
    tip: 'Essa mesa merece um registro antes de acabar!',
    xp: 25,
  },
  {
    key: 'foto_polaroid',
    label: 'Uma foto da sua polaroid',
    emoji: '📸',
    tip: 'Registre a sua memória instantânea da festa!',
    xp: 25,
  },
  {
    key: 'selfie_noivos',
    label: 'Selfie com os noivos',
    emoji: '🤳',
    tip: 'Hora de aparecer ao lado dos noivos!',
    xp: 25,
  },
  // Cerimonial
  {
    key: 'primeira_danca',
    label: 'A primeira dança / valsa do casal',
    emoji: '💃',
    tip: 'Registre esse momento mágico! (Die With Smile 🎵)',
    xp: 25,
  },
  // Festa / Jantar
  {
    key: 'foto_mesa',
    label: 'Uma foto da sua mesa',
    emoji: '🍷',
    tip: 'Registre a mesa decorada (e quem está com você)!',
    xp: 25,
  },
  {
    key: 'foto_grupo',
    label: 'Uma foto com sua galera',
    emoji: '👯',
    tip: 'Reúna a galera para uma foto épica!',
    xp: 25,
  },
  {
    key: 'foto_espelho',
    label: 'Uma foto no espelho',
    emoji: '🪞',
    tip: 'Look do dia registrado!',
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
    key: 'video_festa',
    label: 'Um vídeo curtindo a festa',
    emoji: '🎉',
    tip: 'Mostre como você está aproveitando a noite!',
    xp: 25,
  },
  // Qualquer momento
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
