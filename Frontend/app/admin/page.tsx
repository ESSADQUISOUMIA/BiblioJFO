"use client"

import AdminPage from "@/components/admin-page"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminRoute() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminPage />
    </AuthGuard>
  )
}
