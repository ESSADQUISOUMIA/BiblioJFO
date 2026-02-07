"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, BookOpen, Download, Search, Filter, LogOut, User, Calendar, Tag, Eye, Loader2, AlertCircle } from "lucide-react"

export interface User {
  id: string
  email: string
  password?: string
  first_name: string
  last_name: string
  user_type: "admin" | "student"
  status: "APPROVED" | "PENDING" | "REJECTED"
  institution?: string | null
  reason?: string | null
  google_id?: string | null
  profile_picture?: string | null
  created?: string
  fullName?: string
}

interface Resource {
  id: string
  title: string
  description?: string
  category: "debut-stage" | "fin-stage" | "autres"
  type: "document" | "video" | "audio" | "image"
  uploadDate: string
  size: string
  downloads: number
  author?: string
  fileUrl?: string
}

interface StageReport {
  id: string
  title: string
  description?: string
  type: "initiation" | "pfa" | "pfe"
  date: string
  status: "draft" | "published" | "archived"
  author?: string
  tags?: string[]
  fileUrl?: string
}

interface DashboardProps {
  user: User
  onLogout: () => void
  phpApiUrl?: string
}

const PublicReportsInterface = ({ 
  user, 
  onLogout,
  phpApiUrl = "http://localhost/wert/Backend/api"
}: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<"reports" | "resources">("reports")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [reports, setReports] = useState<StageReport[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const callPhpApi = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${phpApiUrl}/${endpoint}`
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success === false) {
        throw new Error(data.message || 'Erreur API')
      }

      return data
    } catch (err) {
      console.error(`Erreur API ${endpoint}:`, err)
      throw err
    }
  }

  const fetchReports = async () => {
    try {
      const data = await callPhpApi(`http://localhost/wert/Backend/api/reports/reports.php?status=published&userId=${user.id}`)
      const allReports = data.reports || data.data || []
      // Filtrer uniquement les rapports avec le statut "published"
      const publishedReports = allReports.filter((report: StageReport) => report.status === 'published')
      setReports(publishedReports)
    } catch (err) {
      console.error('Erreur fetchReports:', err)
      throw new Error('Impossible de charger les rapports')
    }
  }

  interface RawResource {
    id: number
    userId: number
    title: string
    description?: string
    file_path?: string
    file_name?: string
    original_name?: string
    file_size?: number
    category: "debut-stage" | "fin-stage" | "autres"
    type: "document" | "video" | "audio" | "image"
    downloads: number
    author?: string
    is_active: number
    created_at: string
    updated_at: string
    uploadDate?: string
  }

  const fetchResources = async () => {
    try {
      const data = await callPhpApi(`resources/resources.php?userId=${user.id}`)

      setResources(
        (data.resources || data.data || []).map((r: RawResource) => ({
          id: r.id.toString(),
          title: r.title,
          description: r.description,
          category: r.category,
          type: r.type,
          uploadDate: r.uploadDate || r.created_at,
          size: r.file_size ? `${(r.file_size / 1024 / 1024).toFixed(2)} MB` : "N/A",
          downloads: r.downloads,
          author: r.author,
          fileUrl: r.file_path ? `http://localhost${r.file_path}` : undefined
        }))
      )
    } catch (err) {
      console.error('Erreur fetchResources:', err)
      setError('Impossible de charger les ressources')
    }
  }

  const checkAuthorization = async () => {
    try {
      const data = await callPhpApi('auth/check-authorization.php', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      })
      return data.authorized === true || data.status === 'APPROVED'
    } catch (err) {
      console.error('Erreur checkAuthorization:', err)
      return user.status === 'APPROVED'
    }
  }

  const recordDownload = async (itemId: string, itemType: 'report' | 'resource') => {
    try {
      await callPhpApi('record-download.php', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          itemId: itemId,
          itemType: itemType,
          timestamp: new Date().toISOString()
        })
      })
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du téléchargement:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.id) {
        setError('Utilisateur non valide')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const isAuthorized = await checkAuthorization()
        
        if (!isAuthorized) {
          setError('unauthorized')
          setLoading(false)
          return
        }

        await Promise.all([
          fetchReports(),
          fetchResources()
        ])
      } catch (err: any) {
        console.error('Erreur loadData:', err)
        setError(err.message || 'Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'reports') {
        await fetchReports()
      } else {
        await fetchResources()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || report.type === filterType

    return matchesSearch && matchesType
  })

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || resource.category === filterType

    return matchesSearch && matchesType
  })

  const handleDownload = async (item: StageReport | Resource) => {
    try {
      const itemType = 'downloads' in item ? 'resource' : 'report'
      
      await recordDownload(item.id, itemType)

      if ('downloads' in item) {
        setResources(prev => prev.map((r) => 
          r.id === item.id ? { ...r, downloads: r.downloads + 1 } : r
        ))
      }

      const fileUrl = item.fileUrl || `${phpApiUrl}/download.php?id=${item.id}&type=${itemType}`
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = `${item.title}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      alert(`Erreur lors du téléchargement de "${item.title}"`)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "debut-stage": "Début de stage",
      "fin-stage": "Fin de stage",
      autres: "Autres"
    }
    return labels[category] || category
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      initiation: "Stage d'Initiation",
      pfa: "Projet de Fin d'Année",
      pfe: "Projet de Fin d'Études"
    }
    return labels[type] || type.toUpperCase()
  }

  const getTypeColor = (key: string) => {
    const colors: Record<string, string> = {
      initiation: "bg-blue-100 text-blue-700 border-blue-200",
      pfa: "bg-green-100 text-green-700 border-green-200",
      pfe: "bg-black text-white border-black",
      "debut-stage": "bg-blue-100 text-blue-700 border-blue-200",
      "fin-stage": "bg-green-100 text-green-700 border-green-200",
      autres: "bg-gray-200 text-gray-700 border-gray-300"
    }
    return `border rounded-md px-2 py-1 text-xs font-medium ${colors[key] || "bg-gray-100 text-gray-600"}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/logo.png" 
                alt="Logo"
                className="h-10 w-auto"
              />
              
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 animate-pulse">
                Approuvé
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {user.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                />
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.fullName || `${user.first_name} ${user.last_name}`}</span>
              </div>
              <Button 
                size="sm" 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("reports")}
            className={`flex items-center space-x-2 ${
              activeTab === "reports" 
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Rapports de stage</span>
          </Button>

          <Button
            variant={activeTab === "resources" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("resources")}
            className={`flex items-center space-x-2 ${
              activeTab === "resources" 
                ? "bg-green-600 text-white shadow-md hover:bg-green-700" 
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Ressources</span>
          </Button>
        </div>

        {/* Barre de recherche + Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={`Rechercher ${activeTab === "reports" ? "un rapport" : "une ressource"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tous les types</option>
                {activeTab === "reports" ? (
                  <>
                    <option value="initiation">Stage d'Initiation</option>
                    <option value="pfa">Projet de Fin d'Année</option>
                    <option value="pfe">Projet de Fin d'Études</option>
                  </>
                ) : (
                  <>
                    <option value="debut-stage">Début de stage</option>
                    <option value="fin-stage">Fin de stage</option>
                    <option value="autres">Autres</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
              <Badge variant="outline" className="bg-gray-50">
                {activeTab === "reports" ? filteredReports.length : filteredResources.length} résultat(s)
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes (Rapports / Ressources) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : error === 'unauthorized' ? (
          <Alert className="border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Votre compte est en attente d'approbation. Vous pourrez accéder aux rapports et ressources une fois approuvé.
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert className="border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        ) : activeTab === "reports" ? (
          filteredReports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md border border-gray-200 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                      <span className={getTypeColor(report.type)}>{getTypeLabel(report.type)}</span>
                    </div>
                    {report.description && (
                      <CardDescription className="line-clamp-2">{report.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(report.date).toLocaleDateString("fr-FR")}
                      </div>
                      {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {report.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rapport trouvé</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Essayez de modifier votre recherche</p>
              )}
            </div>
          )
        ) : (
          filteredResources.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md border border-gray-200 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                      <span className={getTypeColor(resource.category)}>{getCategoryLabel(resource.category)}</span>
                    </div>
                    {resource.description && (
                      <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(resource.uploadDate).toLocaleDateString("fr-FR")}
                        </div>
                        <span className="text-xs text-gray-400">{resource.size}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Download className="h-3 w-3 mr-1" />
                        {resource.downloads} téléchargement(s)
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleDownload(resource)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune ressource trouvée</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Essayez de modifier votre recherche</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export { PublicReportsInterface }
export default PublicReportsInterface