"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { AlertTriangle, Mail } from "lucide-react"

export default function SuspendedPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    if (!userData.email) {
      window.location.href = "/auth/login"
      return
    }
    setUser(userData)
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/netflix-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <header className="relative z-10 p-6 flex justify-between items-center">
        <Link href="/" className="text-red-500 text-3xl font-bold">
          BIBLIO
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
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-white text-3xl font-bold mb-2">Compte suspendu</h1>
            <p className="text-gray-400">Statut : SUSPENDED</p>
          </div>

          <Alert variant="destructive" className="bg-red-600/20 border-red-600/50 text-red-200 mb-6">
            <AlertDescription>
              <div className="text-left">
                <p className="font-medium mb-2">Accès temporairement suspendu</p>
                <p className="text-sm">
                  Votre compte a été temporairement suspendu. Veuillez contacter l'administration pour plus
                  d'informations.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact
            </h3>
            <div className="text-gray-300 text-sm space-y-2 text-left">
              <p>Email: support@biblio.com</p>
              <p>Téléphone: +33 1 23 45 67 89</p>
              <p>Horaires: Lun-Ven 9h-17h</p>
            </div>
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
