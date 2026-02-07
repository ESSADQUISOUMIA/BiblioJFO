"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image" // Import Image component
import { useSearchParams } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [userType, setUserType] = useState("")
  const [institution, setInstitution] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
    }
    if (!userType) {
      setError("Veuillez sélectionner un type d'utilisateur")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          userType,
          institution,
          reason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || "Erreur lors de l'inscription")
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/cc.png')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <header className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
            {/* Logo - image */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/images/lOgo.png" alt="BIBLIOJFO Logo" width={150} height={40} className="object-contain" />
              </Link>
            </div>
          </div>
        </header>
        <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="text-green-400 text-3xl font-bold mb-6 drop-shadow-lg">Compte créé !</h1>
            <Alert className="bg-blue-600/20 border-blue-600/50 text-blue-200 mb-6 backdrop-blur-sm">
              <AlertDescription>
                <strong>Statut : PENDING</strong>
                <br />
                Votre demande a été soumise avec succès. Un administrateur examinera votre demande et vous recevrez une
                notification par email une fois qu'elle sera traitée.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <Link href="/auth/login">
                <Button className="w-full h-12 bg-[#18a404] hover:bg-[#148203] text-white font-semibold rounded-md">
                  Aller à la connexion
                </Button>
              </Link>
              <Link href="/" className="block text-gray-400 hover:text-white text-sm">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-6">
          <div className="w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/PHOTOS JORF/05.png')",
        }}
      >
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <header className="relative z-10 p-6 flex justify-between items-center">
        <Link href="/">
          <Image src="/images/lOgo.png" alt="BIBLIO Logo" width={120} height={40} />
        </Link>
      </header>
      <div className="relative z-10 flex items-center justify-center min-h-[85vh] px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">Créer un compte</h1>
            <p className="text-gray-300 drop-shadow-lg">Votre demande sera examinée par un administrateur</p>
          </div>
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-600/20 border-red-600/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Prénom</label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nom</label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Mot de passe</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Confirmer le mot de passe</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Votre statut</label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="h-12 w-full bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white">
                    <SelectValue placeholder="Sélectionnez votre profil" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-white text-gray-900">
                    <SelectItem value="student">Tuteur</SelectItem>
                    <SelectItem value="researcher">stagiaire</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Institution/Organisation</label>
                <Input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Université, entreprise, etc."
                  className="h-12 bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Motif de la demande</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez brièvement pourquoi vous souhaitez accéder à la bibliothèque..."
                  className="min-h-[100px] bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 rounded-md resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#18a404] hover:bg-[#148203] text-white font-semibold rounded-md text-base"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Soumettre la demande"}
              </Button>
              <div className="text-center text-gray-400 text-sm">
                Vous avez déjà un compte ?{" "}
                <Link href="/auth/login" className="text-white hover:underline">
                  Connectez-vous
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-6">
        <div className="w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">N</span>
        </div>
      </div>
    </div>
  )
}
