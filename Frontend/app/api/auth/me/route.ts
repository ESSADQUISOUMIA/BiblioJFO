import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const phpBackendUrl =
      process.env.PHP_BACKEND_URL || "http://localhost/wert/Backend/api/auth/me.php";

    const response = await fetch(`${phpBackendUrl}/auth/me.php`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: headers().get("cookie") || "",
      },
    });

    const data = await response.json();

    if (data.success) {
      const setCookie = response.headers.get("set-cookie");
      const res = NextResponse.json({
        success: true,
        user: data.user,
      });
      if (setCookie) {
        res.headers.set("set-cookie", setCookie);
      }
      return res;
    } else {
      return NextResponse.json(
        { success: false, error: data.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Fetch /me error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
