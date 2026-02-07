import { NextResponse } from "next/server"

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    // No persistence in this stub; pretend deletion succeeded
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Resource DELETE error:", err)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}


