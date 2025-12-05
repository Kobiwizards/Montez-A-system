import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Toast, ModalState, Notification } from '@/types/ui.types'

interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  toasts: Toast[]
  modal: ModalState
  notifications: Notification[]
  unreadNotifications: number
  
  // Actions
  setTheme: (theme: UIState['theme']) => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  openModal: (type: string, data?: any, onConfirm?: () => void, onCancel?: () => void) => void
  closeModal: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: true,
      mobileMenuOpen: false,
      toasts: [],
      modal: {
        isOpen: false,
      },
      notifications: [],
      unreadNotifications: 0,

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen,
      })),

      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      toggleMobileMenu: () => set((state) => ({
        mobileMenuOpen: !state.mobileMenuOpen,
      })),

      addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast = { ...toast, id }
        
        set((state) => ({
          toasts: [...state.toasts, newToast],
        }))

        // Auto remove toast after duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, toast.duration || 5000)
        }
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      })),

      clearToasts: () => set({ toasts: [] }),

      openModal: (type, data, onConfirm, onCancel) => set({
        modal: {
          isOpen: true,
          type,
          data,
          onConfirm,
          onCancel,
        },
      }),

      closeModal: () => set({
        modal: {
          isOpen: false,
        },
      }),

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newNotification = {
          ...notification,
          id,
          createdAt: new Date().toISOString(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1,
        }))
      },

      markNotificationAsRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        if (notification && !notification.read) {
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadNotifications: state.unreadNotifications - 1,
          }
        }
        return state
      }),

      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadNotifications: 0,
      })),

      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadNotifications: notification && !notification.read
            ? state.unreadNotifications - 1
            : state.unreadNotifications,
        }
      }),

      clearNotifications: () => set({
        notifications: [],
        unreadNotifications: 0,
      }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)