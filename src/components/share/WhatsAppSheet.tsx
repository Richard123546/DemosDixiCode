import { CheckCheck, LoaderCircle, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { formatClock } from '../../lib/format'
import { initials } from '../../lib/text'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/toastContext'

export interface WhatsAppDraft {
  /** A quién le llega: "María Fernanda Solís", "Denim Express". */
  to: string
  phone?: string
  message: string
  /** Texto del botón: "Enviar recordatorio". */
  sendLabel: string
  /** Aviso al terminar: "Recordatorio enviado ✓". */
  sentToast: string
}

interface WhatsAppSheetProps {
  draft: WhatsAppDraft | null
  onClose: () => void
  onSent?: () => void
}

/** Vista previa simulada del mensaje tal como se vería en WhatsApp, con envío de mentira. */
export function WhatsAppSheet({ draft, ...props }: WhatsAppSheetProps) {
  if (!draft) return null
  return <WhatsAppPreview key={draft.message} draft={draft} {...props} />
}

function WhatsAppPreview({ draft, onClose, onSent }: Omit<WhatsAppSheetProps, 'draft'> & { draft: WhatsAppDraft }) {
  const toast = useToast()
  const [status, setStatus] = useState<'draft' | 'sending' | 'sent'>('draft')
  const [time] = useState(() => formatClock(Date.now()))
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  // Simula el envío: "enviando…", doble check azul y se cierra solo.
  const send = () => {
    setStatus('sending')
    timers.current.push(
      window.setTimeout(() => {
        setStatus('sent')
        toast(draft.sentToast, `A ${draft.to}${draft.phone ? ` · ${draft.phone}` : ''}`)
        onSent?.()
        timers.current.push(window.setTimeout(onClose, 800))
      }, 900),
    )
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Vista previa del mensaje"
      description={`Así le llega a ${draft.to} por WhatsApp.`}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={onClose} disabled={status !== 'draft'}>
            Cancelar
          </Button>
          <Button
            variant="whatsapp"
            size="lg"
            className="flex-1"
            disabled={status !== 'draft'}
            onClick={send}
          >
            {status === 'draft' ? (
              <>
                <Send className="size-5" />
                {draft.sendLabel}
              </>
            ) : status === 'sending' ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <CheckCheck className="size-5" />
                Enviado
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <div className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white dark:bg-[#1f2c34]">
          <span className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-semibold">
            {initials(draft.to)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{draft.to}</p>
            <p className="text-xs text-white/75">{draft.phone ?? 'WhatsApp'}</p>
          </div>
        </div>
        <div className="min-h-48 bg-[#efeae2] bg-[radial-gradient(rgb(0_0_0/0.05)_1px,transparent_1px)] bg-[length:14px_14px] px-3 py-4 dark:bg-[#0b141a] dark:bg-[radial-gradient(rgb(255_255_255/0.04)_1px,transparent_1px)]">
          <p className="mx-auto mb-3 w-fit rounded-md bg-white/80 px-2 py-0.5 text-[11px] text-slate-600 shadow-card dark:bg-[#1f2c34] dark:text-slate-400">
            Hoy
          </p>
          <div className="ml-auto max-w-[88%] animate-pop-in rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 pt-2 pb-1.5 text-[14px] leading-snug text-[#111b21] shadow-card dark:bg-[#005c4b] dark:text-[#e9edef]">
            <p className="whitespace-pre-line">{formatWhatsApp(draft.message)}</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-black/45 dark:text-white/60">
              {time}
              <CheckCheck
                className={cn('size-4 transition-colors duration-300', status === 'sent' ? 'text-[#53bdeb]' : 'opacity-70')}
                aria-label={status === 'sent' ? 'Leído' : 'Sin enviar'}
              />
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        En el sistema real sale desde el WhatsApp del negocio, sin copiar ni pegar.
      </p>
    </Sheet>
  )
}

/** WhatsApp muestra en negrita lo que va entre *asteriscos*. */
function formatWhatsApp(text: string) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <b key={i}>{part.slice(1, -1)}</b> : part,
  )
}
