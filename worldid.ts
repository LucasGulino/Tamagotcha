import { WorldIDVerification } from '@/types'

const WORLD_APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID!
const WORLD_APP_SECRET = process.env.WORLD_APP_SECRET!

if (!WORLD_APP_ID) {
  throw new Error('NEXT_PUBLIC_WORLD_APP_ID is required')
}

// Verify World ID proof
export async function verifyWorldID(
  proof: WorldIDVerification,
  action: string = 'login'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORLD_APP_SECRET}`
      },
      body: JSON.stringify({
        nullifier_hash: proof.nullifier_hash,
        merkle_root: proof.merkle_root,
        proof: proof.proof,
        verification_level: proof.verification_level,
        action: action,
        signal: '',
        app_id: WORLD_APP_ID
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('World ID verification failed:', result)
      return {
        success: false,
        error: result.detail || 'Verification failed'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error verifying World ID:', error)
    return {
      success: false,
      error: 'Network error during verification'
    }
  }
}

// Generate unique user ID from nullifier hash
export function generateUserIdFromNullifier(nullifierHash: string): string {
  // Use the nullifier hash as a unique identifier
  // In production, you might want to hash this further for privacy
  return `user_${nullifierHash.substring(0, 16)}`
}

// Validate World ID verification data
export function validateWorldIDVerification(data: any): data is WorldIDVerification {
  return (
    typeof data === 'object' &&
    typeof data.merkle_root === 'string' &&
    typeof data.nullifier_hash === 'string' &&
    typeof data.proof === 'string' &&
    (data.verification_level === 'orb' || data.verification_level === 'device') &&
    (data.credential_type === 'orb' || data.credential_type === 'device')
  )
}

// MiniKit integration helpers
export const miniKitConfig = {
  app_id: WORLD_APP_ID,
  action: 'login',
  signal: '',
  credential_types: ['orb', 'device'] as const,
  verification_level: 'device' as const
}

// Generate action for specific operations
export function generateAction(operation: 'login' | 'post' | 'react' | 'boost'): string {
  return `tamagotchi_${operation}_${Date.now()}`
}

// Validate user permissions based on verification level
export function getUserPermissions(verificationLevel: 'orb' | 'device') {
  const basePermissions = {
    canPost: true,
    canReact: true,
    canViewLeaderboard: true
  }

  if (verificationLevel === 'orb') {
    return {
      ...basePermissions,
      canBoost: true,
      maxPostsPerDay: 50,
      maxReactionsPerDay: 200
    }
  }

  return {
    ...basePermissions,
    canBoost: true, // Allow device verification for MVP
    maxPostsPerDay: 20,
    maxReactionsPerDay: 100
  }
}

// Rate limiting helpers
const userActionCounts = new Map<string, { posts: number; reactions: number; lastReset: number }>()

export function checkRateLimit(
  userId: string,
  action: 'post' | 'reaction',
  verificationLevel: 'orb' | 'device'
): boolean {
  const now = Date.now()
  const dayStart = new Date().setHours(0, 0, 0, 0)
  
  let userCounts = userActionCounts.get(userId)
  
  // Reset counts if it's a new day
  if (!userCounts || userCounts.lastReset < dayStart) {
    userCounts = { posts: 0, reactions: 0, lastReset: now }
    userActionCounts.set(userId, userCounts)
  }

  const permissions = getUserPermissions(verificationLevel)
  
  if (action === 'post') {
    return userCounts.posts < permissions.maxPostsPerDay
  } else {
    return userCounts.reactions < permissions.maxReactionsPerDay
  }
}

export function incrementActionCount(userId: string, action: 'post' | 'reaction'): void {
  const userCounts = userActionCounts.get(userId)
  if (userCounts) {
    if (action === 'post') {
      userCounts.posts++
    } else {
      userCounts.reactions++
    }
  }
}

