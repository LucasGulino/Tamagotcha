import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'À l\'instant'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Il y a ${minutes} min`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Il y a ${hours}h`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `Il y a ${days}j`
  } else {
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

// Get current week string (ISO format)
export function getCurrentWeek(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const week = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7)
  return `${year}-W${week.toString().padStart(2, '0')}`
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// Generate random satirical username
export function generateSatiricalUsername(): string {
  const adjectives = [
    'Satirique', 'Ironique', 'Cynique', 'Mordant', 'Piquant',
    'Caustique', 'Acerbe', 'Grinçant', 'Espiègle', 'Facétieux'
  ]
  const nouns = [
    'Tamagotchi', 'Pixel', 'Gremlin', 'Sprite', 'Avatar',
    'Créature', 'Monstre', 'Démon', 'Ange', 'Fantôme'
  ]
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999) + 1
  
  return `${adjective}${noun}${number}`
}

// Validation schemas
export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu ne peut pas être vide')
    .max(280, 'Le contenu ne peut pas dépasser 280 caractères'),
  region: z.string().optional().default('global'),
  imageFile: z.instanceof(File).optional()
})

export const updateUserSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores')
    .optional(),
  region: z.string().optional(),
  avatar: z.string().url().optional()
})

export const reactionSchema = z.object({
  postId: z.string().min(1, 'ID du post requis'),
  type: z.enum(['LIKE', 'LOL', 'FACEPALM'])
})

// File validation
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: 'L\'image ne peut pas dépasser 5MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format d\'image non supporté (JPEG, PNG, GIF, WebP uniquement)' }
  }

  return { valid: true }
}

// Image compression utility
export async function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Une erreur inattendue s\'est produite'
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('NetworkError')
  )
}

// Local storage utilities
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate satirical prompts
export function generateSatiricalPrompt(topic: string): string {
  const templates = [
    `Écris une punchline satirique sur ${topic}, irrévérencieuse et drôle, maximum 280 caractères.`,
    `Crée une blague cynique sur ${topic}, style South Park, courte et percutante.`,
    `Imagine une critique mordante de ${topic}, avec de l'ironie, en moins de 280 caractères.`,
    `Fais une observation satirique sur ${topic}, drôle mais pas méchante, format tweet.`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

export function generateImagePrompt(description: string): string {
  return `Cartoon 2D plat, contours épais noirs, couleurs saturées style South Park/Simpsons, ${description}, 512x512px, pas de symboles de haine, style satirique amusant`
}

// Animation utilities
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  bounceIn: 'animate-bounce-in',
  wiggle: 'animate-wiggle',
  shake: 'animate-shake',
  pulse: 'animate-pulse-fast'
} as const

// Constants
export const BOOST_PRICE = 0.2 // WLD
export const BOOST_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
export const MAX_POST_LENGTH = 280
export const MAX_USERNAME_LENGTH = 20
export const POSTS_PER_PAGE = 20
export const LEADERBOARD_SIZE = 10

