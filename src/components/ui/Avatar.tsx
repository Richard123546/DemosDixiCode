import { cn } from '../../lib/cn'
import { initials } from '../../lib/text'

const tones = [
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-700',
  'bg-fuchsia-100 text-fuchsia-700',
]

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const tone = tones[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % tones.length]
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        tone,
        size === 'sm' && 'size-7 text-[11px]',
        size === 'md' && 'size-10 text-sm',
        size === 'lg' && 'size-14 text-lg',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
