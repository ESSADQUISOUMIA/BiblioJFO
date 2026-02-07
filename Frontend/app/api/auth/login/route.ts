import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, remember } = await request.json();

    const phpBackendUrl =
      process.env.PHP_BACKEND_URL || "http://localhost/wert/Backend/api/auth/login.php";

    const response = await fetch(`${phpBackendUrl}/auth/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: headers().get("cookie") || "",
      },
      body: JSON.stringify({ email, password, remember }),
      credentials: "include",
    });

    // Propager les cookies de session PHP vers le client
    const setCookie = response.headers.get("set-cookie");
    
    let data: any = null
    const contentType = response.headers.get("content-type") || ""
    try {
      data = contentType.includes("application/json") ? await response.json() : { error: await response.text() }
    } catch {
      data = { error: "Réponse invalide du serveur PHP" }
    }

    if (response.ok && data?.success) {
      const res = NextResponse.json({
        success: true,
        user: data.user,
      });
      if (setCookie) {
        res.headers.set("set-cookie", setCookie);
      }
      return res;
    }

    const errorMessage = data?.error || `Erreur de connexion (status ${response.status})`
    const errorRes = NextResponse.json({ success: false, error: errorMessage }, { status: response.status || 500 });
    if (setCookie) {
      errorRes.headers.set("set-cookie", setCookie);
    }
    return errorRes;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de connexion" },
      { status: 500 }
    );
  }
}
