import { ComponentPropsWithoutRef, ElementRef } from 'react'

// Button component props
export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

// Input component props
export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  error?: boolean
}

// Textarea component props
export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  error?: boolean
}

// Avatar component props
export interface AvatarProps extends ComponentPropsWithoutRef<'span'> {
  src?: string
  alt?: string
  fallback?: string
}

// Toast props
export interface ToastProps {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
  duration?: number
} 