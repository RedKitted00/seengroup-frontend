import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://workflow-backend-eek9.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    let data: { 
      success?: boolean; 
      token?: string; 
      message?: string; 
      data?: { token?: string; user?: { id: string; email: string; name: string } }; 
      user?: { id: string; email: string; name: string };
      error?: string;
    } | null = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok) {
      // Normalize backend payload (supports {data:{token,user}} or {token,user})
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user;

      if (token) {
        // Set HTTP-only cookie for security (when token is in JSON)
        const cookieStore = await cookies();
        const sevenDays = 60 * 60 * 24 * 7;
        const thirtyDays = 60 * 60 * 24 * 30;
        const isProd = process.env.NODE_ENV === 'production';
        cookieStore.set('adminToken', token, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          maxAge: rememberMe ? thirtyDays : sevenDays,
          path: '/',
        });

        // Issue CSRF token (double-submit cookie) for browser to echo in x-csrf-token header
        // Make it non-HTTP-only so client JS can read and send it in headers
        const csrfToken = crypto.randomUUID();
        cookieStore.set('csrfToken', csrfToken, {
          httpOnly: false,
          secure: isProd,
          sameSite: 'lax',
          maxAge: rememberMe ? thirtyDays : sevenDays,
          path: '/',
        });

        return NextResponse.json({
          success: true,
          message: data?.message || 'Authentication successful',
          user,
          token
        });
      }

      // If backend sets cookie via Set-Cookie header instead of JSON token, forward it
      const backendSetCookie = response.headers.get('set-cookie');
      if (backendSetCookie) {
        const res = NextResponse.json({
          success: true,
          message: data?.message || 'Authentication successful',
          user
        });
        res.headers.set('Set-Cookie', backendSetCookie);
        return res;
      }

      // Neither token nor Set-Cookie present
      return NextResponse.json(
        { message: 'Token missing in backend response' },
        { status: 502 }
      );
    } else {
      const message = data?.error || data?.message || 'Authentication failed';
      return NextResponse.json(
        { message },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Failed to connect to authentication service' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    let data: { success?: boolean; data?: { user?: unknown }; user?: unknown; error?: string; message?: string } | null = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok && data?.success) {
      const user = data?.data?.user ?? data?.user;
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { success: false, message: data?.error || data?.message || 'Unauthorized' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

