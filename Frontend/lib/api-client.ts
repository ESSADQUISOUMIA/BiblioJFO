class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "http://localhost/wert/Backend/api") {
    this.baseUrl = baseUrl
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log("🌐 Requesting:", url)
      console.log("📤 Method:", config.method || 'GET')
      console.log("📦 Body:", config.body)
      console.log("📋 Headers:", config.headers)
      
      const response = await fetch(url, config)
      
      console.log("📡 Status:", response.status)
      console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()))
      
      const text = await response.text()
      console.log("📄 Raw response (first 1000 chars):", text.substring(0, 1000))

      let data
      try {
        // Vérifier si la réponse est du HTML (erreur serveur)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error("❌ Server returned HTML instead of JSON")
          if (!response.ok) {
            throw new Error(`Erreur serveur (${response.status}): L'endpoint n'existe pas ou a retourné une erreur`)
          }
          throw new Error("Le serveur a retourné du HTML au lieu de JSON")
        }
        
        data = text ? JSON.parse(text) : {}
        console.log("✅ Parsed data:", data)
        if (data.users) {
          console.log("📊 Users count:", data.users.length)
        }
      } catch (parseError) {
        console.error("❌ Parse error:", parseError)
        // Si c'est une erreur qu'on a déjà lancée, la relancer
        if (parseError instanceof Error && parseError.message.includes('serveur')) {
          throw parseError
        }
        throw new Error(`Réponse invalide du serveur: ${parseError instanceof Error ? parseError.message : 'Erreur de parsing'}`)
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error("❌ Request failed:", error)
      throw error
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" })
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" })
  }

  async upload(endpoint: string, formData: FormData) {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const text = await response.text()
      
      // Vérifier si la réponse est du HTML
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error("❌ Upload: Server returned HTML instead of JSON")
        throw new Error(`Erreur serveur (${response.status}): L'endpoint n'existe pas ou a retourné une erreur`)
      }
      
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(data.message || `Erreur lors de l'upload (${response.status})`)
      }

      return data
    } catch (error) {
      console.error("Upload Error:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()