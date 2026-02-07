import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'http://localhost/wert/Backend/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookies = request.headers.get('cookie') || ''
    
    const response = await fetch(`${API_BASE_URL}/contact-submit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
    
  } catch (error) {
    console.error('Erreur API submit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}