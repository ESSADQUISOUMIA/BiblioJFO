"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  User,
  MessageSquare,
  ChevronDown,
  Bell,
  Menu,
  UserPlus,
  Home,
  Upload,
  Download,
  Trash2,
  Eye,
  Edit,
  Plus,
  Save,
  X,
  Camera,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"

// Interfaces... (votre code d'interfaces ici)
interface PendingUser {
  id: number
  email: string
  fullName: string
  firstName: string
  lastName: string
  userType: "student" | "teacher" | "researcher" | "other"
  institution: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approved: boolean
  createdAt: string
  updatedAt?: string
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
  filePath?: string
  url: string  
}

interface StageReport {
  id: number
  title: string
  description?: string
  type: "initiation" | "pfa" | "pfe"
  date: string
  status: "draft" | "published" | "archived"
  author?: string
  tags?: string[]
  file?: File
  filePath?: string
}
interface Message {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied'
  adminReply?: string
  read: boolean
  createdAt: string
  source: 'contact_form' | 'user'
}

interface Notification {
  id: number
  type: "NEW_REGISTRATION" | "ACCOUNT_APPROVED" | "ACCOUNT_REJECTED" | "USER_DELETED"
  message: string
  userId?: number
  read: boolean
  createdAt: string
}

interface AdminProfile {
  firstName: string
  lastName: string
  role: string
  email: string
  phone: string
  location: string
}

export function AdminPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [approvedUsers, setApprovedUsers] = useState<PendingUser[]>([])
  const [contactMessages, setContactMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
const [loading, setLoading] = useState(true)

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showNotifications, setShowNotifications] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)


  // Profile State
 const [adminProfile, setAdminProfile] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  role: "Administrateur"
});
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [resources, setResources] = useState<Resource[]>([])
  const [reports, setReports] = useState<StageReport[]>([])
  const [resourceQuery, setResourceQuery] = useState("")
  const [reportQuery, setReportQuery] = useState("")

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "debut-stage" as "debut-stage" | "fin-stage" | "autres",
    type: "document" as "document" | "video" | "audio" | "image",
  })
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    type: "initiation" as "initiation" | "pfa" | "pfe",
    tags: "",
    file: null as File | null,
  })
  const [uploadingResource, setUploadingResource] = useState(false)
  const [uploadingReport, setUploadingReport] = useState(false)
  const [creatingReport, setCreatingReport] = useState(false)
  const [showAddResource, setShowAddResource] = useState(false)
  const [showAddReport, setShowAddReport] = useState(false)
  const resourceFileInputRef = useRef<HTMLInputElement>(null)

  // API functions for all sections
   const loadResources = async () => {
    try {
      const response = await fetch("http://localhost/wert/Backend/api/resources/list.php")
      const data = await response.json()
      
      if (data.success && data.resources) {
        // Mapper les données pour correspondre à l'interface Resource
        const mappedResources = data.resources.map((r: any) => ({
          id: r.id?.toString() || '',
          title: r.title || 'Sans titre',
          description: r.description || '',
          category: r.category || 'autres',
          type: r.type || 'document',
          uploadDate: r.created_at || new Date().toISOString(),
          size: r.file_size ? formatFileSize(r.file_size) : '0 KB',
          downloads: 0,
          author: r.author || 'Administration',
          filePath: r.file_path || '',
          url: r.url || '' 
        }))
        
        setResources(mappedResources)
        console.log('Ressources chargées:', mappedResources)
      } else {
        console.error('Erreur lors du chargement des ressources:', data.error)
        setResources([])
      }
    } catch (error) {
      console.error("Error loading resources:", error)
      setResources([])
    }
  }

  // Fonction utilitaire pour formater la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

 const loadReports = async () => {
  try {
    const response = await fetch("http://localhost/wert/Backend/api/Reports/list.php");
    const data = await response.json();
    
    if (data.success) {
      // Convertir les tags JSON en tableau si nécessaire
      const formattedReports = data.reports.map((report: any) => ({
        ...report,
        tags: typeof report.tags === 'string' 
          ? JSON.parse(report.tags) 
          : report.tags || []
      }));
      
      setReports(formattedReports);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des rapports:", error);
  }
};
 
const addResource = async () => {
  try {
    // Validation
    if (!newResource.title.trim()) {
      alert("Veuillez saisir un titre")
      return
    }

    const fileInput = resourceFileInputRef.current
    const file = fileInput?.files?.[0]

    if (!file) {
      alert("Veuillez sélectionner un fichier")
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert("Le fichier est trop volumineux (max 10MB)")
      return
    }

    setUploadingResource(true)

    const formData = new FormData()
    formData.append("title", newResource.title)
    formData.append("description", newResource.description)
    formData.append("category", newResource.category)
    formData.append("type", newResource.type)
    formData.append("file", file)

    const res = await fetch("http://localhost/wert/Backend/api/resources/add.php", {
      method: "POST",
      body: formData,
    })

    const text = await res.text()
    console.log("Réponse brute du serveur:", text)
    console.log("Status HTTP:", res.status)

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error("Réponse non-JSON:", text)
      throw new Error("Le serveur n'a pas retourné de JSON valide")
    }

    // IMPORTANT : Afficher l'erreur même si status 400
    if (!data.success) {
      console.error("Erreur du serveur:", data.error)
      alert(`Erreur du serveur: ${data.error}`)
      return
    }

    if (data.resource) {
      setResources(prev => [...prev, data.resource])

      setNewResource({
        title: "",
        description: "",
        category: "autres",
        type: "document",
      })

      if (fileInput) fileInput.value = ""
      setShowAddResource(false)

      alert("Ressource ajoutée avec succès !")
    } else {
      alert("La ressource n'a pas été retournée par le serveur")
    }
  } catch (err: unknown) {
    console.error("Erreur lors de l'ajout de la ressource:", err)
    
    const errorMessage = err instanceof Error 
      ? err.message 
      : "Une erreur inconnue est survenue"
    
    alert(`Une erreur est survenue: ${errorMessage}`)
  } finally {
    setUploadingResource(false)
  }
}

// Fonction pour supprimer une ressource
const deleteResource = async (resourceId: string) => {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
    return
  }

  try {
    const res = await fetch(`http://localhost/wert/Backend/api/resources/delete.php?id=${resourceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const text = await res.text()
    console.log("Réponse brute:", text)

    if (!text) {
      throw new Error("Le serveur n'a retourné aucune réponse")
    }

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error("Erreur de parsing JSON:", e)
      throw new Error(`Réponse invalide du serveur: ${text.substring(0, 100)}`)
    }

    if (data.success) {
      await loadResources()
      alert("Ressource supprimée avec succès")
    } else {
      alert(data.error || "Erreur lors de la suppression de la ressource")
    }
  } catch (err: unknown) {
    console.error("Erreur lors de la suppression de la ressource:", err)
    
    const errorMessage = err instanceof Error 
      ? err.message 
      : "Une erreur inconnue est survenue"
    
    alert(`Une erreur est survenue: ${errorMessage}`)
  }
}
  const downloadResource = (resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank')
    } else {
      alert("URL de téléchargement non disponible")
    }
  }

  const addReport = async () => {
  try {
    // Validation
    if (!newReport.title.trim()) {
      alert("Veuillez saisir un titre")
      return
    }

    if (!newReport.file) {
      alert("Veuillez sélectionner un fichier")
      return
    }

    const file = newReport.file
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert("Le fichier est trop volumineux (max 10MB)")
      return
    }

    setUploadingReport(true)

    const formData = new FormData()
    formData.append("title", newReport.title)
    formData.append("description", newReport.description)
    formData.append("tags", newReport.tags)
    formData.append("type", newReport.type)
    formData.append("file", file)

    const res = await fetch("http://localhost/wert/Backend/api/Reports/add.php", {
      method: "POST",
      body: formData,
    })

    const text = await res.text()
    console.log("Réponse brute du serveur:", text)
    console.log("Status HTTP:", res.status)

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error("Réponse non-JSON:", text)
      throw new Error("Le serveur n'a pas retourné de JSON valide")
    }

    if (!data.success) {
      console.error("Erreur du serveur:", data.error)
      alert(`Erreur du serveur: ${data.error}`)
      return
    }

    if (data.Report) {
      // IMPORTANT : Recharger la liste depuis le serveur
      await loadReports()

      setNewReport({
        title: "",
        description: "",
        type: "initiation",
        tags: "",
        file: null,
      })

      // Réinitialiser l'input file
      const fileInput = document.getElementById('reportFile') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      setShowAddReport(false)
      alert("Rapport ajouté avec succès !")
    } else {
      alert("Le rapport n'a pas été retourné par le serveur")
    }
  } catch (err: unknown) {
    console.error("Erreur lors de l'ajout du rapport:", err)

    const errorMessage = err instanceof Error 
      ? err.message 
      : "Une erreur inconnue est survenue"

    alert(`Une erreur est survenue: ${errorMessage}`)
  } finally {
    setUploadingReport(false)
  }
}
 const deleteReport = async (reportId: number) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
    try {
      const response = await fetch('http://localhost/wert/Backend/api/reports/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId })
      });

      const data = await response.json();

      if (data.success) {
        await loadReports();
        alert(data.message || "Rapport supprimé avec succès");
      } else {
        alert(data.error || "Erreur lors de la suppression du rapport");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Erreur lors de la suppression du rapport");
    }
  }
};

  const updateReportStatus = async (reportId: number, status: "draft" | "published" | "archived") => {
  try {

    const response = await fetch('http://localhost/wert/Backend/api/reports/updatereportstatus.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, status })
    });

    const data = await response.json();

    if (data.success) {
      await loadReports();
      alert(data.message || "Statut mis à jour avec succès");
    } else {
      alert(data.error || "Erreur lors de la mise à jour du statut");
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    alert("Erreur lors de la mise à jour du statut");
  }
};
 // Fonction pour charger le profil admin
// Dans votre fonction fetchAdminProfile
const fetchAdminProfile = async () => {
  try {
    const response = await apiClient.get("/admin/profile.php");
    console.log("Profile response:", response.data);
    
    if (response.success && response.data) {
      setAdminProfile({
        firstName: response.data.first_name || "",
        lastName: response.data.last_name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        location: response.data.institution || "",
        role: "Administrateur"
      });
      
      // L'URL est déjà complète depuis le backend
      if (response.data.profile_picture) {
        console.log("Profile picture URL:", response.data.profile_picture);
        setProfilePicture(response.data.profile_picture);
      } else {
        setProfilePicture("");
      }
    }
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    alert("Erreur lors du chargement du profil");
  }
};

const saveProfile = async () => {
  try {
    const response = await apiClient.put("/admin/update-profile.php", {
      first_name: adminProfile.firstName,
      last_name: adminProfile.lastName,
      email: adminProfile.email,
      phone: adminProfile.phone,
      institution: adminProfile.location
    });
    
    if (response.success) {
      setIsEditingProfile(false);
      alert("Profil mis à jour avec succès");
      fetchAdminProfile();
    } else {
      alert(response.error || "Erreur lors de la mise à jour du profil");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Erreur lors de la mise à jour du profil");
  }
};

const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      alert("La taille du fichier ne doit pas dépasser 5MB");
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert("Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await apiClient.upload("/admin/profile-picture.php", formData);
      
      if (response.success && response.imageUrl) {
        console.log("New profile picture URL:", response.imageUrl);
        setProfilePicture(response.imageUrl);
        alert("Photo de profil mise à jour avec succès");
      } else {
        alert(response.error || "Erreur lors de la mise à jour de la photo");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Erreur lors de la mise à jour de la photo de profil");
    }
  }
};



 useEffect(() => {
  if (activeSection === "messages") {
    fetchMessages()
  }
}, [activeSection])

// Fonction pour récupérer les messages
const fetchMessages = async () => {
  setLoading(true)
  try {
    const response = await fetch("http://localhost/wert/Backend/api/messages/messages.php", {
      method: 'GET',
      credentials: 'include' // Important pour envoyer les cookies de session
    })
    
    // Vérifier d'abord le statut de la réponse
    if (response.status === 401) {
      console.error('Erreur: Non autorisé')
      alert('Session expirée. Veuillez vous reconnecter.')
      // Rediriger vers la page de connexion
      window.location.href = '/login' // ou votre route de connexion
      return
    }
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      setContactMessages(data.messages)
    } else {
      console.error('Erreur:', data.error)
      alert('Erreur lors du chargement des messages')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur de connexion au serveur')
  } finally {
    setLoading(false)
  }
}

// Fonction pour marquer un message comme lu
const markMessageAsRead = async (messageId: number) => {
  try {
    const response = await fetch('http://localhost/wert/Backend/api/messages/message-mark-read.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: messageId })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Mettre à jour l'état local
      setContactMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, read: true, status: 'read' } 
            : msg
        )
      )
    } else {
      alert(data.error || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur de connexion au serveur')
  }
}

// Fonction pour marquer tous les messages comme lus
const markAllMessagesAsRead = async () => {
  const unreadMessages = contactMessages.filter(msg => !msg.read)
  
  for (const msg of unreadMessages) {
    await markMessageAsRead(msg.id)
  }
}

// Fonction pour répondre à un message
const replyToMessage = async (messageId: number, replyText: string) => {
  if (!replyText || replyText.trim().length < 5) {
    alert('La réponse doit contenir au moins 5 caractères')
    return
  }
  
  try {
    const response = await fetch('http://localhost/wert/Backend/api/messages/message-reply.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        id: messageId, 
        reply: replyText 
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      alert('Réponse envoyée avec succès')
      // Mettre à jour l'état local
      setContactMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'replied', adminReply: replyText } 
            : msg
        )
      )
    } else {
      alert(data.error || 'Erreur lors de l\'envoi de la réponse')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur de connexion au serveur')
  }
}

// Fonction pour supprimer un message
const deleteMessage = async (messageId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
    return
  }
  
  try {
    const response = await fetch('http://localhost/wert/Backend/api/messages/message-delete.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: messageId })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Retirer le message de l'état local
      setContactMessages(prev => prev.filter(msg => msg.id !== messageId))
      alert('Message supprimé avec succès')
    } else {
      alert(data.error || 'Erreur lors de la suppression')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur de connexion au serveur')
  }
}
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/auth/login")
      return
    }

    loadUsers()
    loadResources()
    loadReports()

    // Charger le profil admin et la photo via API PHP
  // Charger le profil admin et la photo via API PHP
apiClient.get("/admin/profile.php").then((response) => {
  if (response.success && response.data) {
    // Mapper les champs snake_case de l'API vers camelCase du frontend
    setAdminProfile({
      firstName: response.data.first_name || "",
      lastName: response.data.last_name || "",
      email: response.data.email || "",
      phone: response.data.phone || "",
      location: response.data.institution || "",
      role: "Administrateur"
    });
    
    // Charger la photo de profil si elle existe
    if (response.data.profile_picture) {
      setProfilePicture(response.data.profile_picture);
    }
  }
}).catch((error) => {
  console.error("Error loading admin profile:", error);
});
}, [router, user])

  const loadUsers = async () => {
  try {
    setLoading(true)
    const response = await apiClient.get('/users/pending.php') // ← Vérifiez ce chemin
    
    if (response.success && response.users) {
      const pending = response.users.filter((u: any) => u.status === 'PENDING')
      const approved = response.users.filter((u: any) => u.status === 'APPROVED')
      
      setPendingUsers(pending)
      setApprovedUsers(approved)
    }
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    setLoading(false)
  }
}
const approveUser = async (userId: number) => {
  try {
    console.log(" Approving user:", userId)
    
    const response = await apiClient.post('/users/update-status.php', { 
      user_id: userId,
      status: "APPROVED" 
    })
    
    console.log("Approve response:", response)
    
    if (response.success) {
      await loadUsers()
      alert("Utilisateur approuvé avec succès")
    } else {
      alert("Erreur: " + (response.error || "Échec de l'approbation"))
    }
  } catch (error: any) {
    console.error(" Error approving user:", error)
    alert("Erreur lors de l'approbation: " + (error.message || "Erreur inconnue"))
  }
}

const rejectUser = async (userId: number, reason = "Demande non conforme aux critères d'accès") => {
  try {
    console.log("Rejecting user:", userId)
    
    const response = await apiClient.post('/users/update-status.php', { 
      user_id: userId,
      status: "SUSPENDED", // ✅ Changé de REJECTED à SUSPENDED
      reason: reason
    })
    
    console.log("✅ Reject response:", response)
    
    if (response.success) {
      await loadUsers()
      alert("Utilisateur rejeté")
    } else {
      alert("Erreur: " + (response.error || "Échec du rejet"))
    }
  } catch (error: any) {
    console.error("❌ Error rejecting user:", error)
    alert("Erreur lors du rejet: " + (error.message || "Erreur inconnue"))
  }
}
  const unreadMessagesCount = contactMessages.filter(msg => !msg.read).length


  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "mon-profil", name: "Mon Profil", icon: User },
    { id: "users", name: "Stagiaires", icon: Users },
    { id: "resources", name: "Ressources", icon: BookOpen },
    { id: "reports", name: "Rapports de stage", icon: FileText },
    {
      id: "messages",
      name: "Messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount.toString() : undefined,
    },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 relative ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && <span className="text-xl font-bold">AdminPortail</span>}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-800 focus:outline-none"
              aria-label={sidebarOpen ? "Réduire le menu" : "Développer le menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-2 py-2">
          {sidebarOpen && <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 px-2">MENU</p>}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } ${!sidebarOpen ? "justify-center" : ""}`}
                    aria-label={item.name}
                  >
                    <Icon className={`h-5 w-5 ${!sidebarOpen ? "mx-auto" : ""}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left font-medium">{item.name}</span>
                        {"badge" in item && item.badge && (
                          <Badge className="bg-green-600 text-white text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </button>

                  {!sidebarOpen && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-gray-700">
                      {item.name}
                      {"badge" in item && item.badge && (
                        <span className="ml-2 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {!sidebarOpen && (
          <button
            className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-8 bg-green-600 rounded-r-lg flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir la sidebar"
          >
            <ChevronDown className="h-3 w-3 text-white rotate-90" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Top Bar */}
        <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                aria-label={sidebarOpen ? "Réduire le menu" : "Développer le menu"}
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Tableau de bord</h2>
            </div>

            <div className="flex items-center space-x-4">
              

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{adminProfile.firstName} {adminProfile.lastName}</p>
                  <p className="text-xs text-gray-500">{adminProfile.role}</p>
                </div>
              </div>

              <Button variant="outline" onClick={() => setLoggingOut(true)}>
                Se déconnecter
              </Button>
            </div>
          </div>

          {showNotifications && (
            <div className="mt-3 border-t pt-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune notification</p>
              ) : (
                <div className="max-h-60 overflow-auto space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start justify-between bg-gray-50 border rounded-md p-2">
                      <p className="text-sm text-gray-800 mr-3">{n.message}</p>
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${n.read ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-700"}`}>
                        {n.read ? "lu" : "nouveau"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {loggingOut && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">Confirmer la déconnexion</h3>
              <p className="text-sm text-gray-600 mb-4">Voulez-vous vraiment vous déconnecter ?</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setLoggingOut(false)}>Annuler</Button>
                <Button
                  onClick={async () => {
                    try {
                      await logout()
                    } finally {
                      setLoggingOut(false)
                    }
                  }}
                >
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        )}
        {activeSection === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard Administrateur</h1>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approuvés</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedUsers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{unreadMessagesCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ressources</p>
                    <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setActiveSection("users")} className="flex items-center space-x-2 h-12">
                  <Users className="h-5 w-5" />
                  <span>Gérer les stagiaires</span>
                </Button>
                <Button
                  onClick={() => setActiveSection("messages")}
                  variant="outline"
                  className="flex items-center space-x-2 h-12"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Voir les messages</span>
                </Button>
                <Button
                  onClick={() => setActiveSection("resources")}
                  variant="outline"
                  className="flex items-center space-x-2 h-12"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Gérer les ressources</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mon Profil section */}
        {activeSection === "mon-profil" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Mon Profil</h1>
              <Button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant={isEditingProfile ? "outline" : "default"}
              >
                {isEditingProfile ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </>
                )}
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-6">
                {/* Photo de profil */}
                {/* Photo de profil */}
<div className="flex flex-col items-center space-y-4">
  <div className="relative">
    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
      {profilePicture ? (
        <img
          src={profilePicture}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Image load failed:", profilePicture);
            e.currentTarget.style.display = 'none';
            // Afficher l'icône par défaut en cas d'erreur
          }}
          onLoad={() => console.log("Image loaded successfully:", profilePicture)}
        />
      ) : (
        <User className="h-16 w-16 text-gray-400" />
      )}
      {/* Afficher l'icône si l'image n'est pas chargée */}
      {!profilePicture && <User className="h-16 w-16 text-gray-400" />}
    </div>
    {isEditingProfile && (
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
      >
        <Camera className="h-4 w-4" />
      </button>
    )}
  </div>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleProfilePictureChange}
    className="hidden"
  />
</div>

                {/* Informations du profil */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      {isEditingProfile ? (
                        <Input
                          id="firstName"
                          value={adminProfile.firstName}
                          onChange={(e) => setAdminProfile({ ...adminProfile, firstName: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg font-medium">{adminProfile.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      {isEditingProfile ? (
                        <Input
                          id="lastName"
                          value={adminProfile.lastName}
                          onChange={(e) => setAdminProfile({ ...adminProfile, lastName: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg font-medium">{adminProfile.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <p className="text-lg font-medium text-green-600">{adminProfile.role}</p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditingProfile ? (
                      <Input
                        id="email"
                        type="email"
                        value={adminProfile.email}
                        onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{adminProfile.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    {isEditingProfile ? (
                      <Input
                        id="phone"
                        value={adminProfile.phone}
                        onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{adminProfile.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    {isEditingProfile ? (
                      <Input
                        id="location"
                        value={adminProfile.location}
                        onChange={(e) => setAdminProfile({ ...adminProfile, location: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{adminProfile.location}</p>
                    )}
                  </div>

                  {isEditingProfile && (
                    <div className="flex space-x-4 pt-4">
                      <Button onClick={saveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Users section */}
        {activeSection === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gestion des Stagiaires</h1>
              <div className="flex space-x-4">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {pendingUsers.length} En attente
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {approvedUsers.length} Approuvés
                </Badge>
              </div>
            </div>

            {/* Utilisateurs en attente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Demandes en attente</h2>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune demande en attente</p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            Type: {user.userType} | Institution: {user.institution}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{user.reason}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => approveUser(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectUser(user.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Utilisateurs approuvés */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Utilisateurs approuvés</h2>
              {approvedUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun utilisateur approuvé</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {approvedUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Type: {user.userType} | Institution: {user.institution}
                      </p>
                      <Badge className="mt-2 bg-green-100 text-green-800">Approuvé</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Resources section */}
        {activeSection === "resources" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gestion des Ressources</h1>
              <div className="flex space-x-4">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {resources.length} Ressources
                </Badge>
                <Button onClick={() => setShowAddResource(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ressource
                </Button>
              </div>
            </div>

            {/* Recherche ressources */}
            <div className="flex items-center">
              <Input
                placeholder="Rechercher une ressource (titre, description)..."
                value={resourceQuery}
                onChange={(e) => setResourceQuery(e.target.value)}
              />
            </div>

            {/* Formulaire d'ajout de ressource */}
            {showAddResource && (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Ajouter une nouvelle ressource</h2>
                  <Button variant="outline" onClick={() => setShowAddResource(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resourceTitle">Titre <span className="text-red-600">*</span></Label>
                      <Input
                        id="resourceTitle"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Titre de la ressource"
                      />
                      <p className="mt-1 text-xs text-gray-500">Saisissez un titre court et descriptif.</p>
                    </div>
                    <div>
                      <Label htmlFor="resourceCategory">Catégorie</Label>
                      <Select
                        value={newResource.category}
                        onValueChange={(value: "debut-stage" | "fin-stage" | "autres") =>
                          setNewResource({ ...newResource, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debut-stage">Début de stage</SelectItem>
                          <SelectItem value="fin-stage">Fin de stage</SelectItem>
                          <SelectItem value="autres">Autres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="resourceDescription">Description</Label>
                    <Textarea
                      id="resourceDescription"
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      placeholder="Description de la ressource"
                    />
                    <p className="mt-1 text-xs text-gray-500">Optionnel, 1-2 phrases maximum.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resourceType">Type</Label>
                      <Select
                        value={newResource.type}
                        onValueChange={(value: "document" | "video" | "audio" | "image") =>
                          setNewResource({ ...newResource, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="video">Vidéo</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resourceFile">Fichier <span className="text-red-600">*</span></Label>
                      <input
  ref={resourceFileInputRef}
  id="resourceFile"
  type="file"
  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png"
/>
                      <p className="mt-1 text-xs text-gray-500">Formats: PDF, Office, images, audio/vidéo.</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button onClick={addResource} disabled={uploadingResource}>
                      {uploadingResource ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Ajouter la ressource
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddResource(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des ressources */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Ressources disponibles</h2>
              {resources.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune ressource disponible</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {resources
                    .filter((r) => {
                      const q = resourceQuery.toLowerCase().trim()
                      if (!q) return true
                      return (
                        r.title.toLowerCase().includes(q) ||
                        (r.description || "").toLowerCase().includes(q)
                      )
                    })
                    .map((resource) => (
                    <div key={resource.id} className="border rounded-lg p-4 bg-gray-50">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{resource.title}</h3>
                        <div className="flex space-x-1 ml-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (resource.url) {
                                window.open(resource.url, '_blank')
                              } else {
                                alert("URL de prévisualisation non disponible")
                              }
                            }}
                            title="Prévisualiser"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteResource(resource.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{resource.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Taille: {resource.size}</span>
                        <span>{resource.downloads} téléchargements</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          <Badge className="text-xs">
                            {resource.category === "debut-stage"
                              ? "Début"
                              : resource.category === "fin-stage"
                                ? "Fin"
                                : "Autres"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        </div>
                        <Button 
  size="sm" 
  variant="outline"
  onClick={() => downloadResource(resource)}
  title="Télécharger"
>
  <Download className="h-4 w-4" />
</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports section */}
        {activeSection === "reports" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gestion des Rapports de Stage</h1>
              <div className="flex space-x-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {reports.length} Rapports
                </Badge>
                <Button onClick={() => setShowAddReport(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un rapport
                </Button>
              </div>
            </div>

            {/* Recherche rapports */}
            <div className="flex items-center">
              <Input
                placeholder="Rechercher un rapport (titre, description, tags)..."
                value={reportQuery}
                onChange={(e) => setReportQuery(e.target.value)}
              />
            </div>

            {/* Formulaire d'ajout de rapport */}
{showAddReport && (
  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Ajouter un nouveau rapport</h2>
      <Button variant="outline" onClick={() => setShowAddReport(false)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reportTitle">
            Titre <span className="text-red-600">*</span>
          </Label>
          <Input
            id="reportTitle"
            value={newReport.title}
            onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
            placeholder="Titre du rapport"
          />
          <p className="mt-1 text-xs text-gray-500">Titre court, clair et précis.</p>
        </div>
        <div>
          <Label htmlFor="reportType">Type de stage</Label>
          <Select
            value={newReport.type}
            onValueChange={(value: "initiation" | "pfa" | "pfe") =>
              setNewReport({ ...newReport, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initiation">Stage d'initiation</SelectItem>
              <SelectItem value="pfa">PFA</SelectItem>
              <SelectItem value="pfe">PFE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="reportDescription">Description</Label>
        <Textarea
          id="reportDescription"
          value={newReport.description}
          onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
          placeholder="Description du rapport"
        />
        <p className="mt-1 text-xs text-gray-500">Optionnel, 1-2 phrases maximum.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reportTags">Tags (séparés par des virgules)</Label>
          <Input
            id="reportTags"
            value={newReport.tags}
            onChange={(e) => setNewReport({ ...newReport, tags: e.target.value })}
            placeholder="informatique, développement, web"
          />
          <p className="mt-1 text-xs text-gray-500">Appuyez sur Entrée après chaque tag.</p>
        </div>
        <div>
          <Label htmlFor="reportFile">
            Fichier PDF <span className="text-red-600">*</span>
          </Label>
          <input
            id="reportFile"
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              console.log("Fichier sélectionné:", selectedFile); // Debug
              setNewReport({ ...newReport, file: selectedFile });
            }}
            className="block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-md file:border-0 
              file:text-sm file:font-semibold 
              file:bg-blue-50 file:text-blue-700 
              hover:file:bg-blue-100
              border border-gray-300 rounded-md p-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Uniquement PDF, taille max 10MB.
            {newReport.file && (
              <span className="text-green-600 ml-2">
                ✓ {newReport.file.name}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex space-x-4">
        <Button onClick={addReport} disabled={uploadingReport}>
          {uploadingReport ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le rapport
            </>
          )}
        </Button>
        <Button variant="outline" onClick={() => setShowAddReport(false)}>
          Annuler
        </Button>
      </div>
    </div>
  </div>
)}

            {/* Liste des rapports */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Rapports de stage</h2>
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun rapport disponible</p>
              ) : (
                <div className="space-y-4">
                  {reports
                    .filter((r) => {
                      const q = reportQuery.toLowerCase().trim()
                      if (!q) return true
                      const tags = (r.tags || []).join(",").toLowerCase()
                      return (
                        r.title.toLowerCase().includes(q) ||
                        (r.description || "").toLowerCase().includes(q) ||
                        tags.includes(q)
                      )
                    })
                    .map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          {report.description && <p className="text-sm text-gray-600 mt-1">{report.description}</p>}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className="text-xs">
                              {report.type === "initiation" ? "Initiation" : report.type === "pfa" ? "PFA" : "PFE"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                report.status === "published"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : report.status === "draft"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {report.status === "published"
                                ? "Publié"
                                : report.status === "draft"
                                  ? "Brouillon"
                                  : "Archivé"}
                            </Badge>
                            {report.tags &&
                              report.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Date: {new Date(report.date).toLocaleDateString()} | Auteur: {report.author}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Select
                            value={report.status}
                            onValueChange={(value: "draft" | "published" | "archived") =>
                              updateReportStatus(report.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Brouillon</SelectItem>
                              <SelectItem value="published">Publié</SelectItem>
                              <SelectItem value="archived">Archivé</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReport(report.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages section */}
        {activeSection === "messages" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gestion des Messages</h1>
              <div className="flex space-x-4">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {unreadMessagesCount} Non lus
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {contactMessages.length} Total
                </Badge>
                {unreadMessagesCount > 0 && (
                  <Button variant="outline" onClick={markAllMessagesAsRead}>
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Messages de contact</h2>
              {contactMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun message reçu</p>
              ) : (
                <div className="space-y-4">
                  {contactMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 ${!message.read ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{message.name}</h3>
                            <Badge
                              className={`text-xs ${
                                message.status === "unread"
                                  ? "bg-red-100 text-red-800"
                                  : message.status === "read"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {message.status === "unread" ? "Nouveau" : message.status === "read" ? "Lu" : "Répondu"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                          <p className="text-sm font-medium text-gray-800 mb-2">{message.subject}</p>
                          <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                          <p className="text-xs text-gray-500">
                            Reçu le {new Date(message.createdAt).toLocaleDateString()} à{" "}
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          {!message.read && (
                            <Button
                              size="sm"
                              onClick={() => markMessageAsRead(message.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marquer lu
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMessage(message.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
