import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://workflow-backend-eek9.onrender.com';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application ID is required'
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
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || 'Failed to fetch application'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      data: backendData.data
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch application'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application ID is required'
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
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || 'Failed to delete application'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
      data: backendData.data
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete application'
      },
      { status: 500 }
    );
  }
}
