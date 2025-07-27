'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Feed } from '@/components/Feed'
import { CreatePost } from '@/components/CreatePost'
import { Leaderboard } from '@/components/Leaderboard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { 
  Home, 
  Trophy, 
  Zap, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreatePostData } from '@/types'
import { usePosts } from '@/hooks/usePosts'

type TabType = 'feed' | 'create' | 'boosted' | 'leaderboard'

export default function HomePage() {
  const { user, loading, miniKitAvailable, signIn, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('feed')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { createPost } = usePosts()

  const handleCreatePost = async (data: CreatePostData) => {
    await createPost(data)
    setActiveTab('feed') // Switch back to feed after creating post
  }

  const handleSignIn = async () => {
    try {
      await signIn()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const tabs = [
    { id: 'feed' as TabType, label: 'Feed', icon: Home },
    { id: 'create' as TabType, label: 'Créer', icon: Sparkles },
    { id: 'boosted' as TabType, label: 'Boostés', icon: Zap },
    { id: 'leaderboard' as TabType, label: 'Classement', icon: Trophy },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🎭</div>
          <h1 className="text-2xl font-bold text-cartoon mb-2">
            Tamagotchi Satirique
          </h1>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="text-8xl mb-6 animate-wiggle">🎭</div>
            <h1 className="text-3xl font-bold text-cartoon mb-4 text-shadow-cartoon">
              Tamagotchi Satirique
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Bienvenue dans l'univers satirique! Créez du contenu humoristique, 
              gagnez des points et boostez vos posts avec WLD.
            </p>
            
            <div className="space-y-4">
              {miniKitAvailable ? (
                <Button
                  variant="satirical"
                  size="lg"
                  className="w-full"
                  onClick={handleSignIn}
                >
                  <User className="mr-2 h-5 w-5" />
                  Se connecter avec World ID
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-cartoon border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-bold text-orange-800">
                        World App requis
                      </span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Cette application doit être ouverte dans World App pour fonctionner.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => window.open('https://worldcoin.org/download', '_blank')}
                  >
                    Télécharger World App
                  </Button>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Authentification sécurisée via World ID
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface border-b-2 border-black shadow-cartoon">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-wiggle">🎭</div>
              <div>
                <h1 className="text-xl font-bold text-cartoon text-shadow-cartoon">
                  Tamagotchi Satirique
                </h1>
                <p className="text-xs text-gray-600">
                  Powered by World App
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'satirical' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {tab.label}
                  </Button>
                )
              })}
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <Avatar
                  src={user.avatar}
                  alt={user.username || 'Vous'}
                  size="sm"
                  fallback={user.username}
                />
                <div className="text-sm">
                  <p className="font-bold">{user.username}</p>
                  <p className="text-gray-600 text-xs">{user.region}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="p-2"
              >
                <LogOut size={16} />
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t-2 border-black">
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'satirical' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 justify-center"
                    >
                      <Icon size={16} />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <Feed region={user.region} />
            )}
            
            {activeTab === 'create' && (
              <CreatePost onPostCreated={handleCreatePost} />
            )}
            
            {activeTab === 'boosted' && (
              <Feed region={user.region} boostedOnly={true} />
            )}
            
            {activeTab === 'leaderboard' && (
              <div className="lg:hidden">
                <Leaderboard />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* User profile card */}
            <Card>
              <CardContent className="p-4 text-center">
                <Avatar
                  src={user.avatar}
                  alt={user.username || 'Vous'}
                  size="lg"
                  fallback={user.username}
                  className="mx-auto mb-3"
                />
                <h3 className="font-bold text-cartoon mb-1">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Région: {user.region}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Profile settings will be implemented later
                    console.log('Profile settings placeholder')
                  }}
                >
                  <User size={16} className="mr-2" />
                  Profil
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {activeTab !== 'leaderboard' && (
              <Leaderboard />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

