import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/auth/verify/route'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      admin: {
        createUser: jest.fn(),
        generateAccessToken: jest.fn()
      }
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    }))
  }
}))

// Mock World ID verification
jest.mock('@/lib/worldid', () => ({
  verifyWorldID: jest.fn()
}))

describe('/api/auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should verify World ID and create user session', async () => {
    const mockVerification = {
      merkle_root: 'test_merkle_root',
      nullifier_hash: 'test_nullifier_hash',
      proof: 'test_proof',
      verification_level: 'device',
      credential_type: 'device'
    }

    const { req } = createMocks({
      method: 'POST',
      body: mockVerification
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('user')
    expect(data.data).toHaveProperty('session')
  })

  it('should return error for invalid World ID verification', async () => {
    const invalidVerification = {
      merkle_root: '',
      nullifier_hash: '',
      proof: '',
      verification_level: 'device',
      credential_type: 'device'
    }

    const { req } = createMocks({
      method: 'POST',
      body: invalidVerification
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('should handle missing verification data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {}
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('required')
  })
})

