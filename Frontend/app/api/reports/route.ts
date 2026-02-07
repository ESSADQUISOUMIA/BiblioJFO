import { NextResponse } from "next/server"

export async function GET() {
  // Return empty list; front-end handles 0 reports gracefully
  return NextResponse.json({ success: true, reports: [] })
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const title = (form.get("title") as string) || ""
    const description = (form.get("description") as string) || ""
    const type = (form.get("type") as string) || "initiation"
    const tags = (form.get("tags") as string) || ""
    // const file = form.get("file") as File | null

    if (!title) {
      return NextResponse.json({ success: false, error: "Titre requis" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      report: {
        id: String(Date.now()),
        title,
        description,
        type,
        date: new Date().toISOString(),
        status: "draft",
        author: "Administration",
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    })
  } catch (err) {
    console.error("Reports POST error:", err)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}


