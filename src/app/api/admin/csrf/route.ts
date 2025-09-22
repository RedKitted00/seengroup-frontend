import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get('csrfToken')?.value;
  const token = existing || crypto.randomUUID();

  // Refresh cookie if missing
  if (!existing) {
    const isProd = process.env.NODE_ENV === 'production';
    const sevenDays = 60 * 60 * 24 * 7;
    cookieStore.set('csrfToken', token, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: sevenDays,
      path: '/',
    });
  }

  return NextResponse.json({ csrfToken: token });
}


