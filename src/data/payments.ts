export type PaymentMethod = 'sinpe' | 'efectivo' | 'tarjeta'

export const paymentMethods: Record<PaymentMethod, string> = {
  sinpe: 'SINPE Móvil',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
}
