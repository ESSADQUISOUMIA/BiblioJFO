"use client"

import type React from "react"
import Image from "next/image"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { AuthFooter } from "@/components/auth-footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost/wert/Backend/api/auth/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember: rememberMe,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        const user = data.user
        const role = user.role || user.userType

        if (role === "ADMIN") {
          window.location.href = "/admin"
          return
        }

        switch ((user.status || "").toUpperCase()) {
          case "APPROVED":
            window.location.href = "/dashboard"
            break
          case "PENDING":
            window.location.href = "/auth/pending"
            break
          case "SUSPENDED":
            window.location.href = "/auth/suspended"
            break
          default:
            window.location.href = "/auth/pending"
        }
      } else {
        setError(data.error || "Email ou mot de passe incorrect")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/PHOTOS JORF/05.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/14" />
      </div>

      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          {/* Logo - image comme sur la page d'accueil */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/lOgo.png" // Chemin du logo utilisé sur l'accueil
                alt="BIBLIOJFO Logo"
                width={150}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex items-center justify-center flex-1 px-4">
        <div className="w-full max-w-md bg-black/80 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-2xl">
          <h1 className="text-white text-3xl font-bold mb-8">Se connecter</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-600/20 border-red-600/50 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ou numéro de téléphone"
                className="h-14 bg-gray-700/70 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md focus:bg-gray-600/70 focus:border-white"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="h-14 bg-gray-700/70 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md focus:bg-gray-600/70 focus:border-white"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#18a404] hover:bg-[#6fd32b] text-white font-semibold rounded-md text-base transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            
            
            <div className="text-gray-400 text-sm">
              Nouveau sur BIBLIO ?{" "}
              <Link href="/auth/register" className="text-white hover:underline">
                Inscrivez-vous maintenant.
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer d'authentification */}
      <AuthFooter />
    </div>
  )
}
