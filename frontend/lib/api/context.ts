"use client"

import React, { createContext, useContext, ReactNode } from 'react'

interface ApiContextValue {
  auth: {
    login: (credentials: any) => Promise<any>
    logout: () => Promise<any>
    register: (userData: any) => Promise<any>
    forgotPassword: (email: string) => Promise<any>
    resetPassword: (token: string, password: string) => Promise<any>
    verifyEmail: (token: string) => Promise<any>
    refreshToken: (refreshToken: string) => Promise<any>
  }
}

// Create context
const ApiContext = createContext<ApiContextValue | undefined>(undefined)

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

interface ApiProviderProps {
  children: ReactNode
}

export function ApiProvider({ children }: ApiProviderProps) {
  const value: ApiContextValue = {
    auth: {
      login: async () => ({ success: true, data: null }),
      logout: async () => ({ success: true }),
      register: async () => ({ success: true, data: null }),
      forgotPassword: async () => ({ success: true }),
      resetPassword: async () => ({ success: true }),
      verifyEmail: async () => ({ success: true }),
      refreshToken: async () => ({ success: true, data: null }),
    }
  }

  return React.createElement(
    ApiContext.Provider,
    { value },
    children
  )
}
