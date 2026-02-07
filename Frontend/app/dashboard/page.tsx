"use client"

import { PublicReportsInterface } from "@/components/public-reports-interface"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TraineeUser } from "@/components/public-reports-interface"
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    window.location.href = "/auth/login"
  }

  // Fallback redirect in case guard is bypassed or status changes after mount
  useEffect(() => {
    if (!user) return
    const status = typeof user.status === "string" ? user.status.toUpperCase() : ""
    if (status === "PENDING") {
      router.push("/auth/pending")
      return
    }
    if (status === "SUSPENDED") {
      router.push("/auth/suspended")
      return
    }
  }, [user, router])

  return (
<AuthGuard requireAuth={true}>
  {user && <PublicReportsInterface user={user as TraineeUser} onLogout={handleLogout} />}
</AuthGuard>
  )
}
