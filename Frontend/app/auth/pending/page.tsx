"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Clock, Mail, User } from "lucide-react"
import Image from "next/image"

export default function PendingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        if (!res.ok) {
          router.push("/auth/login")
          return
        }
        const data = await res.json()
        if (!data.success || !data.user) {
          router.push("/auth/login")
          return
        }

        const u = data.user
        const status = typeof u.status === "string" ? u.status.toUpperCase() : ""
        // If user is no longer pending, redirect accordingly
        if (status === "APPROVED") {
          router.push("/dashboard")
          return
        }
        if (status === "SUSPENDED") {
          router.push("/auth/suspended")
          return
        }
        setUser(u)
      } catch (e) {
        router.push("/auth/login")
        return
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [router])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } finally {
      router.push("/auth/login")
    }
  }

  if (loading || !user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/PHOTOS JORF/02.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <header className="relative z-10 p-6 flex justify-between items-center">
        <Link href="/">
          <Image src="/images/lOgo.png" alt="BIBLIO Logo" width={120} height={40} />
        </Link>
        <Button
          onClick={logout}
          variant="outline"
          className="text-white border-white hover:bg-white hover:text-black bg-transparent"
        >
          Déconnexion
        </Button>
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-white text-3xl font-bold mb-2">Compte en attente</h1>
            <p className="text-gray-400">Statut : PENDING</p>
          </div>

          <Alert className="bg-yellow-600/20 border-yellow-600/50 text-yellow-200 mb-6">
            <AlertDescription>
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium mb-2">Bonjour {user.fullName || user.email},</p>
                  <p className="text-sm">
                    Votre demande d'accès à la bibliothèque numérique BIBLIO est actuellement en cours d'examen par
                    notre équipe d'administration.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Prochaines étapes
            </h3>
            <ul className="text-gray-300 text-sm space-y-2 text-left">
              <li>• Un administrateur examine votre demande</li>
              <li>• Vous recevrez un email de notification</li>
              <li>• L'examen prend généralement 24-48h</li>
              <li>• Vérifiez vos spams si nécessaire</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link href="/" className="block text-gray-400 hover:text-white text-sm">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
