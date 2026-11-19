import imageCompression from 'browser-image-compression'

const IMAGE_OPTIONS = {
  maxSizeMB: 0.8,        // máximo 800KB por foto
  maxWidthOrHeight: 1920, // suficiente para qualquer tela, indistinguível do original
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.85,
}

export const MAX_VIDEO_MB = 15
export const MAX_IMAGE_MB = 10 // antes de comprimir

export async function prepareFile(file: File): Promise<{ file: File; type: 'image' | 'video'; error?: string }> {
  const isVideo = file.type.startsWith('video')
  const isImage = file.type.startsWith('image')

  if (!isVideo && !isImage) {
    return { file, type: 'image', error: 'Formato não suportado. Use foto ou vídeo.' }
  }

  if (isVideo) {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      return {
        file,
        type: 'video',
        error: `Vídeo muito grande! Máximo ${MAX_VIDEO_MB}MB (~20 segundos em boa qualidade). Tente gravar um vídeo mais curto.`,
      }
    }
    return { file, type: 'video' }
  }

  // Imagem: comprimir automaticamente
  try {
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return { file, type: 'image', error: `Foto muito grande! Máximo ${MAX_IMAGE_MB}MB antes da compressão.` }
    }
    const compressed = await imageCompression(file, IMAGE_OPTIONS)
    // Renomear para .jpg para manter consistência
    const named = new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
    return { file: named, type: 'image' }
  } catch {
    // Se a compressão falhar, usa o original
    return { file, type: 'image' }
  }
}
