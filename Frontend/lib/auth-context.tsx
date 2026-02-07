"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  fullName: string
  userType: string
  status: string
  profilePicture?: string
  role: "ADMIN" | "USER"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔧 Fonction helper pour déterminer le rôle
  const determineRole = (userData: any): "ADMIN" | "USER" => {
    // Vérifier plusieurs variations possibles
    const userType = userData.userType?.toUpperCase() || userData.user_type?.toUpperCase() || ""
    
    console.log("🔍 Determining role for userType:", userType, "from data:", userData)
    
    return userType === "ADMIN" ? "ADMIN" : "USER"
  }

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Auth check response:", data)
        
        if (data.success) {
          const u = data.user
          const role = determineRole(u)
          
          console.log("👤 User authenticated:", {
            email: u.email,
            userType: u.userType,
            role: role
          })
          
          setUser({
            ...u,
            role: role,
          })
        } else {
          console.log("❌ Auth check failed:", data.error)
          setUser(null)
        }
      } else {
        console.log("❌ Auth check HTTP error:", response.status)
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, remember = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember,
        }),
        credentials: "include",
      })

      const data = await response.json()
      console.log("🔐 Login response:", data)

      if (data.success) {
        const u = data.user
        const role = determineRole(u)
        
        console.log("✅ Login successful:", {
          email: u.email,
          userType: u.userType,
          role: role
        })
        
        setUser({
          ...u,
          role: role,
        })
        return { success: true }
      } else {
        console.log("❌ Login failed:", data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      return { success: false, error: "Erreur de connexion" }
    }
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out...")
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      console.log("✅ Logout successful")
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}