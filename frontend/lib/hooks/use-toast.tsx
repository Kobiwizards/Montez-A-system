import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

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
  variant?: 'default' | 'destructive'
  duration?: number
  showClose?: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    // Map variant to type if provided
    let type: ToastType = options.type || 'info'
    if (options.variant === 'destructive') {
      type = 'error'
    }
    
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type,
      duration: options.duration || 5000,
      showClose: options.showClose !== false,
    }

    setToasts(prev => [...prev, newToast])

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

  // Add generic toast method
  const toast = useCallback((options: ToastOptions) => {
    return addToast(options)
  }, [addToast])

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
    toast, // Add the generic toast method
    success,
    error,
    warning,
    info,
  }
}
