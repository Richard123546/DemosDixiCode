import { createContext, useContext } from 'react'

export type ShowToast = (title: string, description?: string) => void

export const ToastContext = createContext<ShowToast>(() => {})

export function useToast(): ShowToast {
  return useContext(ToastContext)
}
