import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://workflow-backend-eek9.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const { otpId } = await request.json();
    if (!otpId) {
      return NextResponse.json({ success: false, message: 'otpId is required' }, { status: 400 });
    }
    const res = await fetch(`${BACKEND_URL}/api/auth/2fa/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otpId })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ success: false, message: data?.error || data?.message || 'Failed to resend' }, { status: res.status });
    }
    return NextResponse.json({ success: true, message: 'New code sent' });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


