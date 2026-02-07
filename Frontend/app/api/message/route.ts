import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'http://localhost/wert/Backend/api'

export async function GET(request: NextRequest) {
  try {
    // Récupérer les cookies de la requête
    const cookies = request.headers.get('cookie') || ''
    
    const response = await fetch(`${API_BASE_URL}/messages.php`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
      },
      credentials: 'include',
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
    
  } catch (error) {
    console.error('Erreur API messages:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}