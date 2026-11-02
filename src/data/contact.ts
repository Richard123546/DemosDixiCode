const WHATSAPP_NUMBER = '50686754009'
const WHATSAPP_MESSAGE = 'Hola, vi el demo de DixiCode y me interesa'

/** Abre WhatsApp (app o web) con el mensaje ya escrito. */
export const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
