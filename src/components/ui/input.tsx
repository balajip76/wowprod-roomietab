'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'prefix' | 'suffix'> {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  error?: string
  helper?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  type?: 'text' | 'email' | 'number' | 'currency' | 'password' | 'search' | 'date'
  disabled?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      helper,
      prefix,
      suffix,
      type = 'text',
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const isCurrency = type === 'currency'
    const inputType = isCurrency ? 'text' : type

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {(prefix || isCurrency) && (
            <span className="absolute left-3.5 text-gray-400 font-medium select-none">
              {isCurrency ? '$' : prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            inputMode={isCurrency ? 'decimal' : undefined}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] border bg-gray-50 text-gray-900 text-[15px]',
              'focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow',
              error
                ? 'border-red-400 focus:border-red-400'
                : 'border-blue-200 focus:border-indigo-400',
              (prefix || isCurrency) && 'pl-8',
              suffix && 'pr-10',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-100'
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-gray-400">{suffix}</span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="mt-1 text-xs text-gray-500">{helper}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
