import { useId } from 'react'
import type { GarmentKind } from '../../data/boutique'
import { cn } from '../../lib/cn'

/** Siluetas simples (viewBox 120×120) que hacen de foto de producto. */
const shapes: Record<GarmentKind, { fill: string[]; stroke?: string[]; detail?: string[] }> = {
  top: {
    fill: ['M42 22 L52 18 Q60 27 68 18 L78 22 L98 40 L88 52 L80 45 L80 100 Q60 104 40 100 L40 45 L32 52 L22 40 Z'],
    detail: ['M52 18 Q60 30 68 18'],
  },
  pants: {
    fill: ['M38 16 H82 L88 104 H66 L60 46 L54 104 H32 Z'],
    detail: ['M38 24 H82', 'M60 24 V44', 'M44 30 Q48 36 54 32'],
  },
  shorts: {
    fill: ['M34 32 H86 L92 80 H67 L60 56 L53 80 H28 Z'],
    detail: ['M34 40 H86', 'M60 40 V54'],
  },
  dress: {
    fill: ['M47 14 H51 Q60 24 69 14 H73 V30 Q80 36 78 48 L96 104 Q60 112 24 104 L42 48 Q40 36 47 30 Z'],
    detail: ['M42 50 Q60 56 78 50'],
  },
  skirt: {
    fill: ['M40 30 H80 L98 98 Q60 106 22 98 Z', 'M40 22 H80 V30 H40 Z'],
    detail: ['M52 30 L46 100', 'M68 30 L74 100', 'M60 30 V102'],
  },
  bag: {
    fill: ['M28 48 H92 L86 100 Q60 104 34 100 Z'],
    stroke: ['M44 50 Q44 22 60 22 Q76 22 76 50'],
    detail: ['M28 60 H92'],
  },
  necklace: {
    fill: ['M60 66 a9 9 0 1 1 -0.01 0 Z'],
    stroke: ['M28 18 Q60 86 92 18'],
  },
  earrings: {
    fill: ['M42 44 a4 4 0 1 1 -0.01 0 Z', 'M78 44 a4 4 0 1 1 -0.01 0 Z'],
    stroke: ['M42 50 a16 16 0 1 0 0.01 0', 'M78 50 a16 16 0 1 0 0.01 0'],
  },
}

interface ProductArtProps {
  kind: GarmentKind
  hex: string
  className?: string
  /** Fondo teñido con el color; desactivar para miniaturas sobre otro fondo. */
  tinted?: boolean
}

export function ProductArt({ kind, hex, className, tinted = true }: ProductArtProps) {
  const id = useId()
  const shape = shapes[kind]
  return (
    <div
      className={cn('relative grid place-items-center overflow-hidden', className)}
      style={tinted ? { backgroundColor: `color-mix(in oklab, ${hex} 16%, #fafaf9)` } : undefined}
    >
      <svg viewBox="0 0 120 120" className="h-[78%] w-[78%] transition-colors duration-300" aria-hidden>
        <defs>
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="110" rx="34" ry="4" fill="rgba(28,25,23,0.08)" />
        {shape.stroke?.map((d) => (
          <path key={d} d={d} fill="none" stroke={hex} strokeWidth="5" strokeLinecap="round" />
        ))}
        {shape.fill.map((d) => (
          <g key={d}>
            <path d={d} fill={hex} stroke="rgba(28,25,23,0.18)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d={d} fill={`url(#${id}-shine)`} />
          </g>
        ))}
        {shape.detail?.map((d) => (
          <path key={d} d={d} fill="none" stroke="rgba(28,25,23,0.16)" strokeWidth="1.4" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  )
}

export function ColorSwatch({ hex, selected, className }: { hex: string; selected?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-4 shrink-0 rounded-full ring-1 ring-black/10 ring-inset',
        selected && 'outline-2 outline-offset-2 outline-accent',
        className,
      )}
      style={{ backgroundColor: hex }}
    />
  )
}
