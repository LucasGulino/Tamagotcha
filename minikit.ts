import { MiniKit, VerifyCommandInput, PayCommandInput, ResponseEvent } from '@worldcoin/minikit-js'
import { WorldIDVerification, MiniKitPayment, PaymentResult } from '@/types'
import { BOOST_PRICE } from '@/lib/utils'

// Initialize MiniKit
export const initializeMiniKit = () => {
  if (typeof window === 'undefined') return

  try {
    MiniKit.install()
    console.log('MiniKit installed successfully')
  } catch (error) {
    console.error('Failed to install MiniKit:', error)
  }
}

// World ID Authentication
export const authenticateWithWorldID = async (): Promise<WorldIDVerification> => {
  return new Promise((resolve, reject) => {
    if (!MiniKit.isInstalled()) {
      reject(new Error('MiniKit is not installed'))
      return
    }

    const verifyPayload: VerifyCommandInput = {
      action: 'tamagotchi-login',
      signal: '',
      verification_level: 'device' // or 'orb' for higher security
    }

    MiniKit.commands.verify(verifyPayload)

    // Listen for verification response
    MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, async (response) => {
      if (response.status === 'error') {
        reject(new Error(response.errorMessage || 'World ID verification failed'))
        return
      }

      if (response.status === 'success') {
        const verification: WorldIDVerification = {
          merkle_root: response.merkle_root,
          nullifier_hash: response.nullifier_hash,
          proof: response.proof,
          verification_level: response.verification_level,
          credential_type: response.credential_type
        }
        resolve(verification)
      }
    })
  })
}

// Payment for post boost
export const initiateBoostPayment = async (postId: string): Promise<PaymentResult> => {
  return new Promise((resolve, reject) => {
    if (!MiniKit.isInstalled()) {
      reject(new Error('MiniKit is not installed'))
      return
    }

    const paymentPayload: PayCommandInput = {
      reference: `boost-${postId}-${Date.now()}`,
      to: process.env.NEXT_PUBLIC_BOOST_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
      tokens: [
        {
          symbol: 'WLD',
          token_amount: BOOST_PRICE.toString()
        }
      ],
      description: `Boost post ${postId.substring(0, 8)}...`
    }

    MiniKit.commands.pay(paymentPayload)

    // Listen for payment response
    MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (response) => {
      if (response.status === 'error') {
        resolve({
          status: 'error',
          error_message: response.errorMessage || 'Payment failed'
        })
        return
      }

      if (response.status === 'success') {
        try {
          // Confirm payment with our backend
          const confirmResponse = await fetch('/api/boost/confirm', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: paymentPayload.reference,
              transactionHash: response.transaction_id,
              status: 'COMPLETED'
            })
          })

          const confirmResult = await confirmResponse.json()

          if (confirmResult.success) {
            resolve({
              status: 'success',
              transaction_id: response.transaction_id
            })
          } else {
            resolve({
              status: 'error',
              error_message: 'Failed to confirm payment'
            })
          }
        } catch (error) {
          resolve({
            status: 'error',
            error_message: 'Failed to process payment confirmation'
          })
        }
      }
    })
  })
}

// Check if MiniKit is available
export const isMiniKitAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  return MiniKit.isInstalled()
}

// Get user wallet address (if available)
export const getUserWalletAddress = async (): Promise<string | null> => {
  if (!MiniKit.isInstalled()) return null

  try {
    // This would be implemented based on MiniKit's wallet integration
    // For now, return null as this feature might not be available in current MiniKit version
    return null
  } catch (error) {
    console.error('Failed to get wallet address:', error)
    return null
  }
}

// Share post functionality
export const sharePost = async (postContent: string, postUrl: string): Promise<boolean> => {
  if (!MiniKit.isInstalled()) return false

  try {
    // This would use MiniKit's sharing functionality if available
    // For now, fallback to Web Share API
    if (navigator.share) {
      await navigator.share({
        title: 'Tamagotchi Satirique',
        text: postContent,
        url: postUrl
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to share post:', error)
    return false
  }
}

// Open external link in World App
export const openExternalLink = (url: string): void => {
  if (MiniKit.isInstalled()) {
    // Use MiniKit's navigation if available
    window.open(url, '_blank')
  } else {
    window.open(url, '_blank')
  }
}

// Get app metadata
export const getAppMetadata = () => {
  return {
    name: 'Tamagotchi Satirique',
    description: 'Une mini-app satirique pour World App',
    version: '1.0.0',
    minikit_version: MiniKit.isInstalled() ? 'installed' : 'not_installed'
  }
}

// Error handling for MiniKit operations
export class MiniKitError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'MiniKitError'
  }
}

// Utility to handle MiniKit responses
export const handleMiniKitResponse = <T>(
  response: any,
  onSuccess: (data: T) => void,
  onError: (error: string) => void
) => {
  if (response.status === 'error') {
    onError(response.errorMessage || 'MiniKit operation failed')
  } else if (response.status === 'success') {
    onSuccess(response as T)
  }
}

// Subscribe to MiniKit events
export const subscribeMiniKitEvents = () => {
  if (!MiniKit.isInstalled()) return

  // Subscribe to app lifecycle events
  MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, (response) => {
    console.log('World ID verification response:', response)
  })

  MiniKit.subscribe(ResponseEvent.MiniAppPayment, (response) => {
    console.log('Payment response:', response)
  })

  // Add more event subscriptions as needed
}

// Cleanup MiniKit subscriptions
export const cleanupMiniKit = () => {
  if (!MiniKit.isInstalled()) return

  try {
    // Unsubscribe from events
    MiniKit.unsubscribe(ResponseEvent.MiniAppVerifyAction)
    MiniKit.unsubscribe(ResponseEvent.MiniAppPayment)
  } catch (error) {
    console.error('Error cleaning up MiniKit:', error)
  }
}

