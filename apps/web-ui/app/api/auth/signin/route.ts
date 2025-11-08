import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authUrl = process.env.AUTH_SERVICE_URL;

    if (!authUrl) {
      console.error('AUTH_SERVICE_URL is not set');
      return NextResponse.json(
        { message: 'Auth service URL not configured' },
        { status: 500 },
      );
    }

    const response = await fetch(`${authUrl}/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

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
