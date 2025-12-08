"use client"

import { createContext, useContext, ReactNode } from 'react'
import { authApi } from './auth'

interface ApiContextType {
  auth: typeof authApi
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

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
  const value: ApiContextType = {
    auth: authApi,
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}
