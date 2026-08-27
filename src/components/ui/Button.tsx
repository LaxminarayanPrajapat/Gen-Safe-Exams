import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'danger-outline' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  children?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', block = false, className = '', ...rest }: ButtonProps) {
  const sizeClass = size === 'md' ? '' : `btn-${size}`
  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${block ? 'btn-block' : ''} ${className}`.trim()}
      {...rest}
    />
  )
}
