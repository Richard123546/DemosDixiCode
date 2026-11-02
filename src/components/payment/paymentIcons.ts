import { Banknote, CreditCard, Smartphone, type LucideIcon } from 'lucide-react'
import type { PaymentMethod } from '../../data/payments'

export const paymentIcons: Record<PaymentMethod, LucideIcon> = {
  sinpe: Smartphone,
  efectivo: Banknote,
  tarjeta: CreditCard,
}
