import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST() {
  try {
    // Get the admin token before clearing it
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (backendError) {
        console.warn('Backend logout failed, but continuing with frontend logout:', backendError);
        // Continue with frontend logout even if backend fails
      }
    }

    // Clear auth and CSRF cookies
    cookieStore.delete('adminToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('csrfToken');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

