'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className,
  fallback
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  }

  return (
    <div
      className={cn(
        'relative rounded-full border-2 border-black bg-satirical-yellow overflow-hidden shadow-cartoon',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${iconSizes[size]}px`}
        />
      ) : fallback ? (
        <div className="w-full h-full flex items-center justify-center bg-satirical-yellow text-black font-bold text-cartoon">
          {fallback.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-satirical-yellow text-black">
          <User size={iconSizes[size] * 0.6} />
        </div>
      )}
    </div>
  )
}

export { Avatar }

