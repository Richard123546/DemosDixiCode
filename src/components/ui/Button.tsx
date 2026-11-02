import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'accent' | 'dark' | 'secondary' | 'ghost' | 'whatsapp'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white shadow-card hover:-translate-y-px hover:bg-indigo-700 hover:shadow-raised',
  accent: 'bg-accent text-white shadow-card hover:-translate-y-px hover:bg-accent-strong hover:shadow-raised',
  dark: 'bg-slate-900 text-slate-50 shadow-card hover:-translate-y-px hover:bg-slate-800 hover:shadow-raised',
  secondary: 'border border-slate-200 bg-surface text-slate-700 shadow-card hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  whatsapp: 'bg-[#1da851] text-white shadow-card hover:-translate-y-px hover:bg-[#178c43] hover:shadow-raised',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[color,background-color,border-color,box-shadow,translate,scale] duration-150 select-none active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
