'use client'

import React, { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import { Button } from './ui/Button'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { ReactionType, BoostModalData } from '@/types'
import { RefreshCw, Loader2, Zap } from 'lucide-react'
import { BoostModal } from './BoostModal'

interface FeedProps {
  region?: string
  boostedOnly?: boolean
  className?: string
}

const Feed: React.FC<FeedProps> = ({
  region = 'global',
  boostedOnly = false,
  className
}) => {
  const { user } = useAuth()
  const { posts, loading, error, hasMore, loadMore, refresh, reactToPost, boostPost } = usePosts(region, boostedOnly)
  const [boostModal, setBoostModal] = useState<BoostModalData | null>(null)

  const handleReact = async (postId: string, type: ReactionType) => {
    if (!user) return
    await reactToPost(postId, type)
  }

  const handleBoost = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post || !user) return

    setBoostModal({
      postId,
      postContent: post.content,
      authorUsername: post.author.username,
      onSuccess: () => {
        setBoostModal(null)
        refresh() // Refresh to show boosted post
      },
      onCancel: () => setBoostModal(null)
    })
  }

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !loading) {
          loadMore()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading, loadMore])

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
        <p className="text-gray-600">Chargement des posts...</p>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">
            Erreur lors du chargement des posts
          </p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-bold text-cartoon mb-2">
            {boostedOnly ? 'Aucun post boosté' : 'Aucun post pour le moment'}
          </h3>
          <p className="text-gray-600 mb-4">
            {boostedOnly 
              ? 'Aucun post n\'est actuellement boosté dans cette région.'
              : 'Soyez le premier à partager du contenu satirique!'
            }
          </p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-cartoon text-shadow-cartoon">
            {boostedOnly ? 'Posts Boostés' : 'Feed Satirique'}
          </h2>
          {boostedOnly && (
            <Zap className="h-6 w-6 text-satirical-yellow fill-current" />
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          loading={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Posts list */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReact={handleReact}
            onBoost={handleBoost}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={loadMore}
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger plus'
            )}
          </Button>
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            🎉 Vous avez vu tous les posts satiriques!
          </p>
        </div>
      )}

      {/* Boost Modal */}
      {boostModal && (
        <BoostModal
          isOpen={true}
          postId={boostModal.postId}
          postContent={boostModal.postContent}
          authorUsername={boostModal.authorUsername}
          onSuccess={boostModal.onSuccess}
          onCancel={boostModal.onCancel}
        />
      )}
    </div>
  )
}

export { Feed }

