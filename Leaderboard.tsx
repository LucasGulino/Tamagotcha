'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { REGIONS } from '@/types'
import { Trophy, Medal, Award, Crown, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardProps {
  className?: string
}

const Leaderboard: React.FC<LeaderboardProps> = ({ className }) => {
  const { user } = useAuth()
  const [selectedRegion, setSelectedRegion] = useState(user?.region || 'global')
  const { leaderboard, loading, error, currentWeek, refresh } = useLeaderboard(selectedRegion)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-satirical-yellow fill-current" />
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400 fill-current" />
      case 3:
        return <Medal className="h-6 w-6 text-orange-400 fill-current" />
      default:
        return <Award className="h-6 w-6 text-gray-300" />
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-satirical-yellow to-yellow-300 text-black shadow-cartoon-hover'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-black shadow-cartoon'
      case 3:
        return 'bg-gradient-to-r from-orange-300 to-orange-400 text-black shadow-cartoon'
      default:
        return 'bg-surface border-2 border-black'
    }
  }

  if (loading && leaderboard.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
          <p className="text-gray-600">Chargement du leaderboard...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">
              Erreur lors du chargement du leaderboard
            </p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-satirical-yellow" />
            Leaderboard Satirique
          </CardTitle>
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
        
        {/* Week and region info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Semaine {currentWeek}</span>
          <div className="flex items-center gap-2">
            <label htmlFor="region-select" className="font-medium">
              Région:
            </label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input-cartoon text-sm py-1 px-2"
            >
              {REGIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-cartoon mb-2">
              Aucun classement pour cette semaine
            </h3>
            <p className="text-gray-600">
              Soyez le premier à marquer des points avec vos posts satiriques!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.id === entry.user.id
              
              return (
                <div
                  key={entry.user.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-cartoon transition-all duration-200',
                    getRankStyle(entry.rank),
                    isCurrentUser && 'ring-2 ring-primary-500 ring-opacity-50',
                    entry.rank <= 3 && 'animate-bounce-in'
                  )}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 h-12">
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-2xl font-bold text-cartoon">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar
                      src={entry.user.avatar}
                      alt={entry.user.username || 'Utilisateur'}
                      size="md"
                      fallback={entry.user.username}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-cartoon">
                        {entry.user.username || 'Utilisateur Anonyme'}
                        {isCurrentUser && (
                          <span className="ml-2 text-sm bg-primary-500 text-white px-2 py-1 rounded-full">
                            Vous
                          </span>
                        )}
                      </h4>
                      <p className="text-sm opacity-75">
                        {entry.score} point{entry.score > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className={cn(
                    'px-4 py-2 rounded-cartoon font-bold text-lg',
                    entry.rank === 1 && 'bg-satirical-yellow text-black animate-pulse-fast',
                    entry.rank === 2 && 'bg-gray-200 text-black',
                    entry.rank === 3 && 'bg-orange-200 text-black',
                    entry.rank > 3 && 'bg-gray-100 text-gray-700'
                  )}>
                    {entry.score}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Scoring explanation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-cartoon border-2 border-gray-200">
          <h4 className="font-bold text-sm mb-2">Comment marquer des points:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <span>👍</span>
              <span>Like = 1 point</span>
            </div>
            <div className="flex items-center gap-2">
              <span>😂</span>
              <span>LOL = 2 points</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🤦</span>
              <span>Facepalm = 3 points</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { Leaderboard }

