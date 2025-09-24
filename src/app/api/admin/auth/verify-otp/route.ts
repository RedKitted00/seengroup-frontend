import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://workflow-backend-eek9.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otpId, code } = body || {};

    if (!otpId || !code) {
      return NextResponse.json(
        { success: false, message: 'otpId and code are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otpId, code })
    });

    let data: { success?: boolean; data?: { token?: string; refreshToken?: string; user?: unknown }; error?: string; message?: string } | null = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !data?.success) {
      const message = data?.error || data?.message || 'Invalid or expired code';
      return NextResponse.json({ success: false, message }, { status: response.status || 401 });
    }

    const token = data?.data?.token;
    const refreshToken = data?.data?.refreshToken;
    const user = data?.data?.user;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token missing in backend response' }, { status: 502 });
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    // Default to 7 days when OTP is used; backend decided rememberMe when issuing token
    const sevenDays = 60 * 60 * 24 * 7;

    cookieStore.set('adminToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: sevenDays,
      path: '/',
    });

    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: sevenDays,
        path: '/',
      });
    }

    return NextResponse.json({ success: true, message: 'Authenticated', user });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


