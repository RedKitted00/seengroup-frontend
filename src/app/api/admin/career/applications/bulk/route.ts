import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationIds, action } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application IDs array is required'
        },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject', 'review', 'delete'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid action is required (approve, reject, review, delete)'
        },
        { status: 400 }
      );
    }

    // Get admin token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/bulk`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationIds, action })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || 'Failed to perform bulk operations'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: backendData.message || 'Bulk operations completed successfully',
      data: backendData.data
    });

  } catch (error) {
    console.error('Error performing bulk operations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to perform bulk operations'
      },
      { status: 500 }
    );
  }
}
