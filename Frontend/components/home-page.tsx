"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react" // Import for mobile menu icon
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [activeLink, setActiveLink] = useState("Accueil")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State for mobile menu
  const [showScrollIcon, setShowScrollIcon] = useState(true) // State for scroll icon visibility

  const navigationItems = [
    { name: "Accueil", href: "/" },
    { name: "À propos", href: "about-section.tsx" },
    { name: "Contact", href: "/contact" },
  ]

  // Effet pour gérer la visibilité de l'icône de scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      if (scrollTop > 100) {
        setShowScrollIcon(false)
      } else {
        setShowScrollIcon(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/PHOTOS JORF/10.png')",
        }}
      >
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/15" />
        {/* </div> */}

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header - Transparent avec ligne en bas */}
          <header className="relative z-20 h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Image
                    src="/images/lOgo.png"
                    alt="BIBLIOJFO Logo"
                    width={150} // Ajustez la largeur selon l'image originale
                    height={40} // Ajustez la hauteur selon l'image originale
                    className="object-contain"
                  />
                </Link>
              </div>

              {/* Navigation - Centré comme dans l'image */}
              <nav className="hidden md:flex items-center space-x-12">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-medium transition-colors duration-200 hover:text-gray-900 ${
                      activeLink === item.name ? "text-gray-900 font-semibold" : "text-gray-600"
                    }`}
                    onClick={() => setActiveLink(item.name)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Login Button - Style identique à l'image */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="border-[#18a404] text-[#18a404] hover:bg-[#18a404] hover:text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 bg-transparent"
                  >
                    S'inscrire
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="bg-[#18a404] hover:bg-[#6fd32b] text-white px-8 py-2.5 rounded-full font-medium text-sm transition-all duration-200 shadow-sm">
                    S'identifier
                  </Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle mobile menu</span>
                </Button>
              </div>
            </div>
            {/* La ligne noire en bas du header */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-black w-[calc(100%-4rem)] max-w-7xl" />
          </header>

          {/* Mobile Navigation (conditionally rendered) */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-2">
              <div className="px-4 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 hover:text-gray-900 hover:bg-gray-50 rounded-md ${
                      activeLink === item.name ? "text-gray-900 bg-gray-50 font-semibold" : "text-gray-600"
                    }`}
                    onClick={() => {
                      setActiveLink(item.name)
                      setIsMobileMenuOpen(false) // Close menu on item click
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="w-full border-[#18a404] text-[#18a404] hover:bg-[#18a404] hover:text-white px-8 py-2.5 rounded-full font-medium text-sm transition-all duration-200 mt-2 bg-transparent"
                  >
                    S'inscrire
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="w-full bg-[#18a404] hover:bg-[#6fd32b] text-white px-8 py-2.5 rounded-full font-medium text-sm transition-all duration-200 shadow-sm mt-2">
                    S'identifier
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Texte d'accueil juste sous le menu */}
          <div className="flex flex-col items-center text-center px-4 mt-8 z-30 w-full">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-2 bg-gradient-to-r from-lime-300 via-white to-cyan-400 bg-clip-text text-transparent drop-shadow-lg animate-gradient-move">
              Bibliothèque numérique limitée
            </h1>
            <p className="text-base sm:text-xl text-white/90 font-medium drop-shadow-md animate-fade-in-up delay-200">
              Accédez à des milliers de livres, articles et ressources.
            </p>
          </div>

          {/* Icône souris + texte SCROLL en bas de page - visible seulement sur l'accueil */}
          {showScrollIcon && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 group cursor-pointer transition-opacity duration-500">
              {/* Icône souris SVG avec animation */}
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="34" rx="11" stroke="white" strokeWidth="2" />
                <rect className="animate-scroll-mouse" x="11" y="8" width="2" height="8" rx="1" fill="white" />
              </svg>
              {/* Texte SCROLL avec effet de survol */}
              <span className="mt-1 text-white font-bold tracking-widest text-base transition-colors duration-300 group-hover:text-gray-300">
                SCROLL
              </span>
            </div>
          )}
        </div>
        {/* About Section */}
        <AboutSection />
        {/* Contact Section */}
        <ContactSection />
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
