'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'satirical' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-cartoon font-bold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      satirical: 'btn-satirical',
      outline: 'border-2 border-black bg-transparent text-black hover:bg-black hover:text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-1',
      ghost: 'bg-transparent text-black hover:bg-gray-100 border-none shadow-none hover:shadow-none hover:translate-y-0'
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          loading && 'cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

