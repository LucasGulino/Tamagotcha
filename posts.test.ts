import { describe, it, expect, beforeEach } from '@jest/globals'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/posts/route'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              range: jest.fn()
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn()
      }))
    }
  }
}))

describe('/api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/posts', () => {
    it('should fetch posts successfully', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          region: 'global',
          page: '1',
          limit: '10'
        }
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('posts')
      expect(data.data).toHaveProperty('hasMore')
      expect(Array.isArray(data.data.posts)).toBe(true)
    })

    it('should handle boosted posts filter', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          region: 'global',
          boosted: 'true'
        }
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should validate pagination parameters', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          page: '-1',
          limit: '100'
        }
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/posts', () => {
    it('should create post successfully', async () => {
      const mockPost = {
        content: 'Test satirical post 🎭',
        region: 'global'
      }

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'authorization': 'Bearer test-token'
        },
        body: mockPost
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data.content).toBe(mockPost.content)
    })

    it('should validate post content length', async () => {
      const longContent = 'a'.repeat(281) // Exceeds 280 character limit

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'authorization': 'Bearer test-token'
        },
        body: {
          content: longContent,
          region: 'global'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('280')
    })

    it('should require authentication', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          content: 'Test post',
          region: 'global'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Authentication')
    })

    it('should validate required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'authorization': 'Bearer test-token'
        },
        body: {
          region: 'global'
          // Missing content
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Content')
    })
  })
})

