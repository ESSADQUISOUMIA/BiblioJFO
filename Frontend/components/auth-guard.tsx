"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, requireAdmin = false, redirectTo }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo || "/auth/login")
        return
      }

      if (requireAdmin && user?.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }

      if (user && typeof user.status === "string" && user.status.toUpperCase() === "PENDING") {
        router.push("/auth/pending")
        return
      }

      if (user && typeof user.status === "string" && user.status.toUpperCase() === "SUSPENDED") {
        router.push("/auth/suspended")
        return
      }
    }
  }, [user, loading, requireAuth, requireAdmin, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (requireAdmin && user?.role !== "ADMIN") {
    return null
  }

  return <>{children}</>
}
