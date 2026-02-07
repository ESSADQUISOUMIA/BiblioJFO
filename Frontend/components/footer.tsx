"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Section principale du footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/lOgo.png"
                alt="BIBLIOJFO Logo"
                width={120}
                height={32}
                className="object-contain"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              BIBLIOJFO est votre bibliothèque numérique de référence, offrant un accès 
              à des milliers de ressources éducatives et culturelles de qualité.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Liens Rapides</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-300 hover:text-white transition-colors text-sm">
                  S'inscrire
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/ressources" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Ressources
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Nos Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Consultation de livres
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Téléchargement de ressources
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Recherche avancée
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Évaluation et commentaires
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Notifications personnalisées
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  Jorf Lasfar, El Jadida, Maroc
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  +212 666-045110
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  i.mouquerassou@ocpgroup.ma
                </span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 text-white"></h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
                <Button className="bg-[#18a404] hover:bg-[#6fd32b] text-white px-4 py-2 rounded-r-md text-sm">
                  S'abonner
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section inférieure */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © 2024 BIBLIOJFO. Tous droits réservés.
              </p>
              <div className="flex space-x-4 text-sm">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </div>
            </div>
            
            {/* Bouton retour en haut */}
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="ml-2 text-sm">Retour en haut</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
} 