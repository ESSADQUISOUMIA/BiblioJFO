import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const status = body?.status as string
    if (!status || !["draft", "published", "archived"].includes(status)) {
      return NextResponse.json({ success: false, error: "Statut invalide" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Report status PUT error:", err)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}


