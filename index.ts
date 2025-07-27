import { ReactionType, PaymentStatus } from './database'

// MiniKit types
export interface WorldIDVerification {
  merkle_root: string
  nullifier_hash: string
  proof: string
  verification_level: 'orb' | 'device'
  credential_type: 'orb' | 'device'
}

export interface MiniKitPayment {
  reference: string
  to: string
  tokens: Array<{
    symbol: string
    token_amount: string
  }>
  description?: string
}

export interface PaymentResult {
  status: 'success' | 'error'
  transaction_id?: string
  error_message?: string
}

// App-specific types
export interface CreatePostData {
  content: string
  imageFile?: File
  region?: string
}

export interface PostReaction {
  id: string
  type: ReactionType
  count: number
  userReacted: boolean
}

export interface PostData {
  id: string
  content: string
  imageUrl?: string
  region: string
  isBoosted: boolean
  boostedUntil?: string
  author: {
    id: string
    username?: string
    avatar?: string
    worldId: string
  }
  reactions: PostReaction[]
  totalReactions: number
  createdAt: string
}

export interface UserProfile {
  id: string
  worldId: string
  username?: string
  avatar?: string
  region: string
  createdAt: string
}

export interface LeaderboardData {
  rank: number
  user: {
    id: string
    username?: string
    avatar?: string
  }
  score: number
  week: string
}

export interface BoostModalData {
  postId: string
  postContent: string
  authorUsername?: string
  onSuccess: () => void
  onCancel: () => void
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export interface CreatePostForm {
  content: string
  image?: FileList
  region: string
}

export interface UserSettingsForm {
  username: string
  region: string
}

// Hook return types
export interface UsePostsReturn {
  posts: PostData[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  createPost: (data: CreatePostData) => Promise<void>
  reactToPost: (postId: string, type: ReactionType) => Promise<void>
  boostPost: (postId: string) => Promise<PaymentResult>
}

export interface UseLeaderboardReturn {
  leaderboard: LeaderboardData[]
  loading: boolean
  error: string | null
  currentWeek: string
  refresh: () => void
}

export interface UseUserReturn {
  user: UserProfile | null
  loading: boolean
  error: string | null
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  signOut: () => void
}

// Constants
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: '👍',
  LOL: '😂',
  FACEPALM: '🤦'
}

export const REACTION_LABELS: Record<ReactionType, string> = {
  LIKE: 'Like',
  LOL: 'LOL',
  FACEPALM: 'Facepalm'
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Terminé',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé'
}

export const REGIONS = [
  { value: 'global', label: 'Global' },
  { value: 'fr', label: 'France' },
  { value: 'us', label: 'États-Unis' },
  { value: 'uk', label: 'Royaume-Uni' },
  { value: 'de', label: 'Allemagne' },
  { value: 'es', label: 'Espagne' },
  { value: 'it', label: 'Italie' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australie' },
  { value: 'jp', label: 'Japon' },
] as const

export type Region = typeof REGIONS[number]['value']

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Erreur réseau') {
    super(message, 'NETWORK_ERROR', 500)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Données invalides') {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Erreur d\'authentification') {
    super(message, 'AUTH_ERROR', 401)
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Erreur de paiement') {
    super(message, 'PAYMENT_ERROR', 402)
  }
}

