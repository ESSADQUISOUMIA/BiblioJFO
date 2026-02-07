"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null })

    try {
      const result = await apiCall()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [])

  return {
    ...state,
    execute,
  }
}

// Hooks spécialisés pour l'authentification
export function useAuthApi() {
  const api = useApi<any>()

  const login = useCallback(
    (email: string, password: string, remember = false) =>
      api.execute(() => apiClient.post("/api/auth/login", { email, password, remember })),
    [api],
  )

  const register = useCallback(
    (userData: {
      email: string
      password: string
      firstName: string
      lastName: string
      userType: string
      institution?: string
      reason: string
    }) => api.execute(() => apiClient.post("/api/auth/register", userData)),
    [api],
  )

  const logout = useCallback(() => api.execute(() => apiClient.post("/api/auth/logout")), [api])

  const getMe = useCallback(() => api.execute(() => apiClient.get("/api/auth/me")), [api])

  return {
    ...api,
    login,
    register,
    logout,
    getMe,
  }
}
