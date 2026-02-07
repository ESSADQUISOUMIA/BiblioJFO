"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function AboutSection() {
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: "Notre Mission",
      content:
        "Notre bibliothèque numérique est une initiative dédiée à la démocratisation de l'accès au savoir. Nous croyons que l'éducation et l'information devraient être accessibles à tous, partout dans le monde.",
      image: "/images/PHOTO JFO/PHOTO JFO/PAP/PAP.JPG",
      imageAlt: "People reading in a modern library",
    },
    {
      title: "Notre Engagement",
      content:
        "Nous nous engageons à fournir une expérience utilisateur exceptionnelle, avec des outils de recherche avancés, des recommandations personnalisées et un support continu.",
      image: "/images/cc.JPG",
      imageAlt: "Person reading an e-book on a tablet",
    },
    {
      title: "Pour Qui ?",
      content:
        "Que vous soyez étudiant, chercheur, professionnel ou simplement un passionné de lecture, vous trouverez chez nous de quoi enrichir vos connaissances et stimuler votre curiosité.",
      image: "/images/PHOTO JFO/PHOTO JFO/DAP/DAP 02.JPG",
      imageAlt: "Students studying together",
    },
  ]

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length)
  }

  return (
    <section id="about-section" className="py-16 md:py-24 bg-white text-gray-800 relative overflow-hidden">
      {/* Traits inclinés décoratifs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Trait incliné en haut à gauche */}
        <div className="absolute top-10 left-10 w-32 h-1 bg-gradient-to-r from-[#18a404] to-[#6fd32b] transform -rotate-12 opacity-60 animate-pulse"></div>
        <div className="absolute top-16 left-16 w-24 h-1 bg-gradient-to-r from-[#6fd32b] to-[#18a404] transform -rotate-12 opacity-40 animate-pulse delay-1000"></div>
        
        {/* Trait incliné en haut à droite */}
        <div className="absolute top-20 right-20 w-28 h-1 bg-gradient-to-l from-[#18a404] to-[#6fd32b] transform rotate-12 opacity-50 animate-pulse delay-500"></div>
        <div className="absolute top-28 right-28 w-20 h-1 bg-gradient-to-l from-[#6fd32b] to-[#18a404] transform rotate-12 opacity-30 animate-pulse delay-1500"></div>
        
        {/* Trait incliné au milieu gauche */}
        <div className="absolute top-1/2 left-0 w-40 h-1 bg-gradient-to-r from-[#18a404] to-transparent transform -rotate-6 opacity-30 animate-pulse delay-2000"></div>
        
        {/* Trait incliné au milieu droite */}
        <div className="absolute top-1/2 right-0 w-40 h-1 bg-gradient-to-l from-[#18a404] to-transparent transform rotate-6 opacity-30 animate-pulse delay-2500"></div>
        
        {/* Trait incliné en bas à gauche */}
        <div className="absolute bottom-20 left-16 w-36 h-1 bg-gradient-to-r from-[#6fd32b] to-[#18a404] transform -rotate-12 opacity-40 animate-pulse delay-3000"></div>
        
        {/* Trait incliné en bas à droite */}
        <div className="absolute bottom-16 right-16 w-32 h-1 bg-gradient-to-l from-[#18a404] to-[#6fd32b] transform rotate-12 opacity-50 animate-pulse delay-3500"></div>
        
        {/* Traits supplémentaires pour plus de dynamisme */}
        <div className="absolute top-1/4 left-1/4 w-20 h-0.5 bg-gradient-to-r from-[#18a404] to-transparent transform rotate-45 opacity-20 animate-pulse delay-4000"></div>
        <div className="absolute top-3/4 right-1/4 w-20 h-0.5 bg-gradient-to-l from-[#6fd32b] to-transparent transform -rotate-45 opacity-20 animate-pulse delay-4500"></div>
        
   
        
        {/* Traits verticaux décoratifs */}
        <div className="absolute top-1/4 left-8 w-0.5 h-16 bg-gradient-to-b from-[#18a404] to-transparent opacity-40 animate-pulse delay-5000"></div>
        <div className="absolute top-1/2 right-8 w-0.5 h-20 bg-gradient-to-b from-[#6fd32b] to-transparent opacity-30 animate-pulse delay-5500"></div>
        <div className="absolute bottom-1/4 left-12 w-0.5 h-12 bg-gradient-to-t from-[#18a404] to-transparent opacity-35 animate-pulse delay-6000"></div>
        
        {/* Traits horizontaux supplémentaires */}
        <div className="absolute top-1/6 left-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-[#18a404] to-transparent opacity-25 animate-pulse delay-6500"></div>
        <div className="absolute bottom-1/6 right-1/2 w-20 h-0.5 bg-gradient-to-l from-transparent via-[#6fd32b] to-transparent opacity-30 animate-pulse delay-7000"></div>
        
        {/* Formes géométriques */}
        <div className="absolute top-1/5 right-1/5 w-3 h-3 border border-[#18a404] transform rotate-45 opacity-20 animate-spin delay-8000" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-1/5 left-1/5 w-2 h-2 bg-[#6fd32b] transform rotate-45 opacity-25 animate-bounce delay-9000"></div>
        
        {/* Traits en zigzag */}
        <div className="absolute top-2/3 left-1/4 w-16 h-0.5 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-[#18a404] to-[#6fd32b] transform skew-x-12 animate-pulse delay-10000"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 w-12 h-0.5 opacity-25">
          <div className="w-full h-full bg-gradient-to-l from-[#6fd32b] to-[#18a404] transform -skew-x-12 animate-pulse delay-10500"></div>
        </div>
        
        {/* Points décoratifs */}
        <div className="absolute top-1/6 left-1/6 w-1 h-1 bg-[#18a404] rounded-full opacity-40 animate-ping delay-11000"></div>
        <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-[#6fd32b] rounded-full opacity-35 animate-ping delay-11500"></div>
        <div className="absolute bottom-1/6 left-2/3 w-1 h-1 bg-[#18a404] rounded-full opacity-30 animate-ping delay-12000"></div>
        
        {/* Traits courbes simulés avec des segments */}
        <div className="absolute top-1/2 left-1/6 w-8 h-0.5 bg-gradient-to-r from-[#18a404] to-transparent transform rotate-12 opacity-20 animate-pulse delay-12500"></div>
        <div className="absolute top-1/2 left-1/6 w-6 h-0.5 bg-gradient-to-r from-transparent to-[#6fd32b] transform rotate-24 opacity-15 animate-pulse delay-13000"></div>
        
        <div className="absolute bottom-1/2 right-1/6 w-8 h-0.5 bg-gradient-to-l from-[#6fd32b] to-transparent transform -rotate-12 opacity-20 animate-pulse delay-13500"></div>
        <div className="absolute bottom-1/2 right-1/6 w-6 h-0.5 bg-gradient-to-l from-transparent to-[#18a404] transform -rotate-24 opacity-15 animate-pulse delay-14000"></div>
        
        {/* Traits en éventail */}
        <div className="absolute top-1/4 left-1/2 w-12 h-0.5 bg-gradient-to-r from-[#18a404] to-transparent transform rotate-30 opacity-20 animate-pulse delay-14500"></div>
        <div className="absolute top-1/4 left-1/2 w-12 h-0.5 bg-gradient-to-r from-[#18a404] to-transparent transform rotate-60 opacity-15 animate-pulse delay-15000"></div>
        <div className="absolute top-1/4 left-1/2 w-12 h-0.5 bg-gradient-to-r from-[#18a404] to-transparent transform rotate-90 opacity-10 animate-pulse delay-15500"></div>
        
        {/* Traits en éventail inversé */}
        <div className="absolute bottom-1/4 right-1/2 w-12 h-0.5 bg-gradient-to-l from-[#6fd32b] to-transparent transform -rotate-30 opacity-20 animate-pulse delay-16000"></div>
        <div className="absolute bottom-1/4 right-1/2 w-12 h-0.5 bg-gradient-to-l from-[#6fd32b] to-transparent transform -rotate-60 opacity-15 animate-pulse delay-16500"></div>
        <div className="absolute bottom-1/4 right-1/2 w-12 h-0.5 bg-gradient-to-l from-[#6fd32b] to-transparent transform -rotate-90 opacity-10 animate-pulse delay-17000"></div>
        
        {/* Lignes de connexion */}
        <div className="absolute top-1/3 left-1/3 w-8 h-0.5 bg-gradient-to-r from-[#18a404] to-[#6fd32b] transform rotate-45 opacity-25 animate-pulse delay-17500"></div>
        <div className="absolute top-2/3 right-1/3 w-8 h-0.5 bg-gradient-to-l from-[#6fd32b] to-[#18a404] transform -rotate-45 opacity-25 animate-pulse delay-18000"></div>
        
        {/* Traits en spirale simulée */}
        <div className="absolute top-1/2 left-1/4 w-6 h-0.5 bg-gradient-to-r from-[#18a404] to-transparent transform rotate-15 opacity-20 animate-pulse delay-18500"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-0.5 bg-gradient-to-r from-transparent to-[#6fd32b] transform rotate-45 opacity-15 animate-pulse delay-19000"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-0.5 bg-gradient-to-r from-[#6fd32b] to-transparent transform rotate-75 opacity-10 animate-pulse delay-19500"></div>
        
        {/* Éléments flottants */}
        <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-[#18a404] rounded-full opacity-30 animate-bounce delay-20000" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-3/5 right-1/5 w-1.5 h-1.5 bg-[#6fd32b] rounded-full opacity-25 animate-bounce delay-21000" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-1/5 left-3/5 w-1 h-1 bg-[#18a404] rounded-full opacity-35 animate-bounce delay-22000" style={{animationDuration: '2.5s'}}></div>
        
        {/* Traits en vague */}
        <div className="absolute top-1/6 left-1/3 w-16 h-0.5 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-[#18a404] via-[#6fd32b] to-[#18a404] transform skew-x-6 animate-pulse delay-23000"></div>
        </div>
        <div className="absolute bottom-1/6 right-1/3 w-14 h-0.5 opacity-25">
          <div className="w-full h-full bg-gradient-to-l from-[#6fd32b] via-[#18a404] to-[#6fd32b] transform -skew-x-6 animate-pulse delay-24000"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            À propos de notre Bibliothèque Numérique
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez notre mission, nos valeurs et ce qui rend notre plateforme unique.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[400px]">
          <div className="space-y-6 animate-slide-in-left">
            <h3 className="text-2xl font-bold text-gray-900 transition-all duration-300">{pages[currentPage].title}</h3>
            <p className="text-gray-700 leading-relaxed text-lg transition-all duration-300">
              {pages[currentPage].content}
            </p>

            <div className="flex items-center justify-between mt-8">
              <div className="flex space-x-2">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentPage ? "bg-[#18a404]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  className="p-2 hover:bg-gray-100 transition-all duration-300 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  className="p-2 hover:bg-gray-100 transition-all duration-300 bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Link href="/auth/register">
              <Button className="bg-[#18a404] hover:bg-[#6fd32b] text-white px-8 py-3 rounded-full font-medium text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 mt-6">
                Rejoignez-nous dès aujourd'hui
              </Button>
            </Link>
          </div>

          <div className="animate-slide-in-right">
            <Image
              src={pages[currentPage].image || "/public/images/PHOTO JFO/PHOTO JFO/DAP 02.JPG"}
              alt={pages[currentPage].imageAlt}
              width={500}
              height={350}
              className="rounded-lg shadow-lg object-cover w-full h-full transition-all duration-500 hover:scale-105 hover:shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
