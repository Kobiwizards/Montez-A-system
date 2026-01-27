"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { authApi } from './auth'

interface ApiContextValue {
  auth: {
    login: (credentials: { email: string; password: string }) => Promise<any>
    logout: () => Promise<any>
    register: (userData: any) => Promise<any>
    forgotPassword: (email: string) => Promise<any>
    resetPassword: (token: string, password: string) => Promise<any>
    verifyEmail: (token: string) => Promise<any>
    refreshToken: (refreshToken: string) => Promise<any>
    getProfile: () => Promise<any>
    updateProfile: (userData: any) => Promise<any>
    changePassword: (data: any) => Promise<any>
    verifyToken: () => Promise<any>
  }
}

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
      login: authApi.login,
      logout: authApi.logout,
      register: authApi.register,
      forgotPassword: authApi.forgotPassword,
      resetPassword: authApi.resetPassword,
      verifyEmail: authApi.verifyEmail,
      refreshToken: authApi.refreshToken,
      getProfile: authApi.getProfile,
      updateProfile: authApi.updateProfile,
      changePassword: authApi.changePassword,
      verifyToken: authApi.verifyToken
    }
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}