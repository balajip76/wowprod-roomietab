'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses = {
  primary:
    'bg-indigo-500 text-white shadow-[3px_3px_0_#4338CA] hover:bg-indigo-600 active:shadow-[1px_1px_0_#4338CA] active:translate-x-0.5 active:translate-y-0.5',
  secondary:
    'bg-white text-indigo-600 border-2 border-indigo-200 shadow-[3px_3px_0_#C7D2FE] hover:bg-indigo-50 active:shadow-[1px_1px_0_#C7D2FE]',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  destructive:
    'bg-red-500 text-white shadow-[3px_3px_0_#991B1B] hover:bg-red-600 active:shadow-[1px_1px_0_#991B1B]',
  success:
    'bg-emerald-600 text-white shadow-[3px_3px_0_#065F46] hover:bg-emerald-700 active:shadow-[1px_1px_0_#065F46]',
}

const sizeClasses = {
  sm: 'min-h-[36px] px-3 py-1.5 text-sm',
  md: 'min-h-[44px] px-5 py-2.5 text-base',
  lg: 'min-h-[52px] px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
