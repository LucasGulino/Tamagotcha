'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPostSchema, validateImageFile, compressImage, MAX_POST_LENGTH } from '@/lib/utils'
import { CreatePostForm, CreatePostData, REGIONS } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { Image as ImageIcon, X, Sparkles, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface CreatePostProps {
  onPostCreated: (data: CreatePostData) => Promise<void>
  className?: string
}

const CreatePost: React.FC<CreatePostProps> = ({
  onPostCreated,
  className
}) => {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      region: user?.region || 'global'
    }
  })

  const content = watch('content')
  const remainingChars = MAX_POST_LENGTH - (content?.length || 0)

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate image
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      // Compress image
      const compressedFile = await compressImage(file)
      setSelectedImage(compressedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Erreur lors du traitement de l\'image')
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateSatiricalContent = () => {
    const satiricalPrompts = [
      "Quand tu réalises que ton Tamagotchi a plus de vie sociale que toi... 🎭",
      "Plot twist: Les vrais monstres, c'était nous depuis le début! 👹",
      "Mon Tamagotchi satirique vient de me juger... et il a raison. 😅",
      "Attention: Ce post contient des traces d'ironie et de second degré! ⚠️",
      "Breaking: Un Tamagotchi découvre l'art de la procrastination! 📰"
    ]
    
    const randomPrompt = satiricalPrompts[Math.floor(Math.random() * satiricalPrompts.length)]
    setValue('content', randomPrompt)
    toast.success('Inspiration satirique générée!')
  }

  const onSubmit = async (data: CreatePostForm) => {
    if (!user) {
      toast.error('Vous devez être connecté pour poster')
      return
    }

    try {
      setIsSubmitting(true)

      const postData: CreatePostData = {
        content: data.content,
        region: data.region,
        imageFile: selectedImage || undefined
      }

      await onPostCreated(postData)

      // Reset form
      reset()
      removeImage()
      toast.success('Post créé avec succès!')

    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Erreur lors de la création du post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-gray-600">
            Connectez-vous pour partager votre contenu satirique!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar
            src={user.avatar}
            alt={user.username || 'Vous'}
            size="md"
            fallback={user.username}
          />
          <div>
            <h3 className="text-lg">Créer un post satirique</h3>
            <p className="text-sm text-gray-600 font-normal">
              Partagez votre humour avec la communauté!
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Content textarea */}
          <div>
            <Textarea
              {...register('content')}
              placeholder="Quoi de satirique aujourd'hui? 🎭"
              className="min-h-[120px]"
              error={errors.content?.message}
              maxLength={MAX_POST_LENGTH}
            />
            <div className="flex items-center justify-between mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateSatiricalContent}
                className="flex items-center gap-2 text-satirical-purple"
              >
                <Wand2 size={16} />
                Inspiration satirique
              </Button>
              <span className={`text-sm ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars} caractères restants
              </span>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="relative rounded-cartoon overflow-hidden border-2 border-black">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 py-8 border-dashed"
              >
                <ImageIcon size={20} />
                Ajouter une image satirique
              </Button>
            )}
          </div>

          {/* Region selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Région
            </label>
            <select
              {...register('region')}
              className="input-cartoon w-full"
            >
              {REGIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="satirical"
            className="w-full flex items-center gap-2"
            loading={isSubmitting}
            disabled={!content?.trim() || remainingChars < 0}
          >
            <Sparkles size={16} />
            {isSubmitting ? 'Publication...' : 'Publier le post satirique'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export { CreatePost }

