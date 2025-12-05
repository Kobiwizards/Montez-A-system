import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
  showClose?: boolean
}

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  duration?: number
  showClose?: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type: options.type || 'info',
      duration: options.duration || 5000,
      showClose: options.showClose !== false,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove if duration is set
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((title: string, description?: string) => {
    return addToast({ title, description, type: 'success' })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    return addToast({ title, description, type: 'error' })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ title, description, type: 'warning' })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    return addToast({ title, description, type: 'info' })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}