"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setFormData({ name: "", email: "", subject: "", message: "" })
        alert("Message envoyé avec succès")
      } else {
        alert(data.error || "Erreur lors de l'envoi du message")
      }
    } catch (err) {
      alert("Erreur serveur")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          N'hésitez pas à nous contacter pour toute question ou demande d'information.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Sujet de votre message"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Votre message..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#18a404] hover:bg-[#6fd32b]">
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

{/* Map & Contact Info */}
<div className="space-y-6">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.991627666799!2d2.29229261567407!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddb8076a4ce2b02!2sEiffel%20Tower!5e0!3m2!1sen!2sfr!4v1678912345678!5m2!1sen!2sfr"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Notre localisation"
                className="rounded-xl"
              ></iframe>
            </div>
            
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transition hover:shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes coordonnées</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-gray-700">
                  <Mail className="h-5 w-5 text-[#18a404] mt-0.5 flex-shrink-0" />
                  <span>i.mouquerassou@ocpgroup.ma</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-700">
                  <Phone className="h-5 w-5 text-[#18a404] mt-0.5 flex-shrink-0" />
                  <span>+212 666-045110</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-[#18a404] mt-0.5 flex-shrink-0" />
                  <span>Jorf Lasfar, El Jadida, Maroc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

}
