import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, userType, institution, reason } = await request.json()

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    formData.append("first_name", firstName)
    formData.append("last_name", lastName)
    formData.append("user_type", userType)
    formData.append("institution", institution || "")
    formData.append("reason", reason)

    // URL de votre backend PHP
    const phpBackendUrl = process.env.PHP_BACKEND_URL || "http://localhost/wert/Backend/api/auth/register.php"

    const response = await fetch(`${phpBackendUrl}/auth/register.php`, {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Inscription réussie. Votre demande sera examinée par un administrateur.",
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json({ success: false, error: "Erreur lors de l'inscription" }, { status: 400 })
    }
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
