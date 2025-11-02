import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authUrl = process.env.AUTH_SERVICE_URL;
    
    console.log('AUTH_SERVICE_URL:', authUrl);
    console.log('Request body:', body);

    if (!authUrl) {
      console.error('AUTH_SERVICE_URL is not set');
      return NextResponse.json(
        { message: 'Auth service URL not configured' },
        { status: 500 },
      );
    }

    const fullUrl = `${authUrl}/sign-in`;
    console.log('Making request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Sign in failed' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
