import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PostData, CreatePostData, ReactionType, UsePostsReturn } from '@/types'
import { POSTS_PER_PAGE } from '@/lib/utils'
import { toast } from 'sonner'

export function usePosts(region: string = 'global', boostedOnly: boolean = false): UsePostsReturn {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const fetchPosts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true)
      if (reset) setError(null)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: POSTS_PER_PAGE.toString(),
        region,
        ...(boostedOnly && { boosted: 'true' })
      })

      const response = await fetch(`/api/posts?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch posts')
      }

      const newPosts = result.data || []
      
      if (reset || pageNum === 1) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }

      setHasMore(result.pagination?.hasNext || false)
      setPage(pageNum)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts'
      setError(errorMessage)
      if (reset) toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [region, boostedOnly])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, false)
    }
  }, [fetchPosts, loading, hasMore, page])

  const refresh = useCallback(() => {
    fetchPosts(1, true)
  }, [fetchPosts])

  const createPost = useCallback(async (data: CreatePostData) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Authentication required')
      }

      const formData = new FormData()
      formData.append('content', data.content)
      formData.append('region', data.region || 'global')
      
      if (data.imageFile) {
        formData.append('image', data.imageFile)
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create post')
      }

      // Add new post to the beginning of the list
      setPosts(prev => [result.data, ...prev])
      toast.success('Post créé avec succès!')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const reactToPost = useCallback(async (postId: string, type: ReactionType) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ postId, type }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to react to post')
      }

      // Update post reactions in local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedReactions = post.reactions.map(reaction => ({
            ...reaction,
            count: result.data.reactionCounts[reaction.type as keyof typeof result.data.reactionCounts] || 0,
            userReacted: reaction.type === type ? result.data.action !== 'removed' : false
          }))

          return {
            ...post,
            reactions: updatedReactions,
            totalReactions: result.data.totalReactions
          }
        }
        return post
      }))

      // Show feedback based on action
      if (result.data.action === 'created') {
        toast.success('Réaction ajoutée!')
      } else if (result.data.action === 'updated') {
        toast.success('Réaction modifiée!')
      } else if (result.data.action === 'removed') {
        toast.success('Réaction supprimée!')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to react to post'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const boostPost = useCallback(async (postId: string) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Authentication required')
      }

      // This will be implemented in the next phase with MiniKit payment
      const response = await fetch('/api/boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ postId }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to initiate boost')
      }

      return {
        status: 'success' as const,
        transaction_id: result.data.paymentId
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to boost post'
      toast.error(errorMessage)
      return {
        status: 'error' as const,
        error_message: errorMessage
      }
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPosts(1, true)
  }, [fetchPosts])

  // Real-time updates for reactions (optional)
  useEffect(() => {
    const channels = posts.map(post => {
      return supabase
        .channel(`post-reactions-${post.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reactions',
            filter: `post_id=eq.${post.id}`
          },
          () => {
            // Refresh reaction counts for this post
            fetchPostReactions(post.id)
          }
        )
        .subscribe()
    })

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [posts])

  const fetchPostReactions = async (postId: string) => {
    try {
      const response = await fetch(`/api/reactions?postId=${postId}`)
      const result = await response.json()

      if (result.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const updatedReactions = post.reactions.map(reaction => ({
              ...reaction,
              count: result.data.reactionCounts[reaction.type as keyof typeof result.data.reactionCounts] || 0
            }))

            return {
              ...post,
              reactions: updatedReactions,
              totalReactions: result.data.totalReactions
            }
          }
          return post
        }))
      }
    } catch (err) {
      console.error('Error fetching post reactions:', err)
    }
  }

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    createPost,
    reactToPost,
    boostPost,
  }
}

