import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const phpBackendUrl = process.env.PHP_BACKEND_URL || "http://localhost/wert/Backend/api/auth/logout.php"

    const response = await fetch(`${phpBackendUrl}/auth/logout.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    const setCookie = response.headers.get("set-cookie")
    const res = NextResponse.json({ success: true })
    if (setCookie) {
      res.headers.set("set-cookie", setCookie)
    }
    return res
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "Erreur de déconnexion" }, { status: 500 })
  }
}
