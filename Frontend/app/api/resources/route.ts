// app/api/resources/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const title = (form.get("title") as string) || ""
    const description = (form.get("description") as string) || ""
    const category = (form.get("category") as string) || "autres"
    const type = (form.get("type") as string) || "document"
    const file = form.get("file") as File | null

    // Validation
    if (!title.trim()) {
      return NextResponse.json(
        { success: false, error: "Le titre est requis" }, 
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Veuillez sélectionner un fichier" }, 
        { status: 400 }
      )
    }

    // Calculer la taille du fichier
    const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`

    // TODO: Sauvegarder le fichier (implémenter plus tard)
    // Pour l'instant, on simule juste la création
    
    return NextResponse.json({
      success: true,
      resource: {
        id: String(Date.now()),
        title,
        description,
        category,
        type,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        size: fileSize,
        downloads: 0,
        author: "Administration",
      },
    })
  } catch (err) {
    console.error("Resources POST error:", err)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  // Retourner une liste vide pour commencer
  return NextResponse.json({ success: true, resources: [] })
}