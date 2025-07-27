'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PostData, ReactionType, REACTION_EMOJIS } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Zap, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface PostCardProps {
  post: PostData
  onReact: (postId: string, type: ReactionType) => Promise<void>
  onBoost: (postId: string) => void
  className?: string
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onReact,
  onBoost,
  className
}) => {
  const { user } = useAuth()
  const [reacting, setReacting] = useState<ReactionType | null>(null)

  const handleReaction = async (type: ReactionType) => {
    if (!user || reacting) return

    try {
      setReacting(type)
      await onReact(post.id, type)
    } catch (error) {
      console.error('Error reacting to post:', error)
    } finally {
      setReacting(null)
    }
  }

  const handleBoost = () => {
    if (!user || post.author.id !== user.id) return
    onBoost(post.id)
  }

  const isOwnPost = user?.id === post.author.id
  const isBoosted = post.isBoosted && post.boostedUntil && new Date(post.boostedUntil) > new Date()

  return (
    <Card
      className={cn(
        'w-full animate-slide-up',
        isBoosted && 'boost-glow',
        className
      )}
      glow={isBoosted}
    >
      {/* Boost indicator */}
      {isBoosted && (
        <div className="flex items-center gap-2 mb-3 text-satirical-yellow">
          <Zap size={16} className="fill-current" />
          <span className="text-sm font-bold">Post Boosté!</span>
        </div>
      )}

      {/* Author info */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          src={post.author.avatar}
          alt={post.author.username || 'Utilisateur'}
          size="md"
          fallback={post.author.username}
        />
        <div className="flex-1">
          <h3 className="font-bold text-cartoon">
            {post.author.username || 'Utilisateur Anonyme'}
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(post.createdAt)}
          </p>
        </div>
        {isOwnPost && (
          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal size={16} />
          </Button>
        )}
      </div>

      <CardContent>
        {/* Post content */}
        <div className="mb-4">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-cartoon overflow-hidden border-2 border-black">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {/* Reactions */}
        <div className="flex items-center gap-2">
          {post.reactions.map((reaction) => (
            <Button
              key={reaction.type}
              variant="ghost"
              size="sm"
              className={cn(
                'reaction-btn flex items-center gap-1 px-3 py-2',
                reaction.userReacted && 'bg-satirical-yellow',
                reacting === reaction.type && 'animate-pulse'
              )}
              onClick={() => handleReaction(reaction.type)}
              disabled={reacting !== null}
            >
              <span className="text-lg">
                {REACTION_EMOJIS[reaction.type]}
              </span>
              <span className="text-sm font-bold">
                {reaction.count}
              </span>
            </Button>
          ))}
        </div>

        {/* Boost button (only for own posts) */}
        {isOwnPost && !isBoosted && (
          <Button
            variant="satirical"
            size="sm"
            onClick={handleBoost}
            className="flex items-center gap-2"
          >
            <Zap size={16} />
            <span>Boost 0.2 WLD</span>
          </Button>
        )}

        {/* Total reactions count */}
        {post.totalReactions > 0 && (
          <div className="text-sm text-gray-600 font-medium">
            {post.totalReactions} réaction{post.totalReactions > 1 ? 's' : ''}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export { PostCard }

