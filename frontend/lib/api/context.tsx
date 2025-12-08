"use client"

import React, { createContext, useContext, ReactNode } from "react"

const ApiContext = createContext<any>(undefined)

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider")
  }
  return context
}

interface ApiProviderProps {
  children: ReactNode
  useMock?: boolean
}

export function ApiProvider({ children, useMock = false }: ApiProviderProps) {
  const value = {
    useMock,
  }

  return React.createElement(
    ApiContext.Provider,
    { value: value },
    children
  )
}
