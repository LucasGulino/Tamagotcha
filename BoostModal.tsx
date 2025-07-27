'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { BOOST_PRICE } from '@/lib/utils'
import { truncateText } from '@/lib/utils'
import { initiateBoostPayment } from '@/lib/minikit'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface BoostModalProps {
  isOpen: boolean
  postId: string
  postContent: string
  authorUsername?: string
  onSuccess: () => void
  onCancel: () => void
}

const BoostModal: React.FC<BoostModalProps> = ({
  isOpen,
  postId,
  postContent,
  authorUsername,
  onSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBoost = async () => {
    try {
      setIsProcessing(true)

      // Initialize boost payment with our backend
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Authentication required')
      }

      const initResponse = await fetch('/api/boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ postId })
      })

      const initResult = await initResponse.json()
      if (!initResult.success) {
        throw new Error(initResult.error || 'Failed to initialize boost')
      }

      // Process payment via MiniKit
      const paymentResult = await initiateBoostPayment(postId)
      
      if (paymentResult.status === 'success') {
        toast.success('Post boosté avec succès!')
        onSuccess()
      } else {
        throw new Error(paymentResult.error_message || 'Payment failed')
      }

    } catch (error) {
      console.error('Error boosting post:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du boost du post'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Booster votre post"
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Post preview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-satirical-yellow rounded-full mt-2" />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-600 mb-1">
                  Post de {authorUsername || 'vous'}
                </p>
                <p className="text-gray-800">
                  {truncateText(postContent, 120)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boost benefits */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-cartoon">
            Avantages du Boost
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-satirical-yellow rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-black" />
              </div>
              <div>
                <p className="font-medium">Visibilité accrue</p>
                <p className="text-sm text-gray-600">
                  Votre post apparaîtra en haut du feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-satirical-green rounded-full flex items-center justify-center">
                <Clock size={20} className="text-black" />
              </div>
              <div>
                <p className="font-medium">Durée de 24 heures</p>
                <p className="text-sm text-gray-600">
                  Mise en avant pendant une journée complète
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-satirical-purple rounded-full flex items-center justify-center">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <div>
                <p className="font-medium">Effet visuel spécial</p>
                <p className="text-sm text-gray-600">
                  Bordure dorée et animation pour attirer l'attention
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <Card className="bg-gradient-to-r from-satirical-yellow to-yellow-300">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={24} className="text-black fill-current" />
              <span className="text-2xl font-bold text-black">
                {BOOST_PRICE} WLD
              </span>
            </div>
            <p className="text-sm text-black opacity-80">
              Prix fixe pour booster votre post
            </p>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-cartoon border-2 border-orange-200">
          <AlertCircle size={20} className="text-orange-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800 mb-1">
              Important à savoir
            </p>
            <ul className="text-orange-700 space-y-1">
              <li>• Le paiement est non remboursable</li>
              <li>• Un seul boost par post</li>
              <li>• Effet immédiat après paiement</li>
            </ul>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            variant="satirical"
            onClick={handleBoost}
            className="flex-1 flex items-center gap-2"
            loading={isProcessing}
            disabled={isProcessing}
          >
            <Zap size={16} />
            {isProcessing ? 'Traitement...' : `Booster pour ${BOOST_PRICE} WLD`}
          </Button>
        </div>

        {/* Payment info */}
        <div className="text-center text-xs text-gray-500">
          Paiement sécurisé via World App
        </div>
      </div>
    </Modal>
  )
}

export { BoostModal }

