import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use the same fallback as other API routes for consistency
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://seengroup-backend-tjer.onrender.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const department = searchParams.get('department') || '';
    const location = searchParams.get('location') || '';
    const status = searchParams.get('status') || 'active';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
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

    // Build query parameters for backend API (fetch all jobs for frontend pagination)
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (type) queryParams.append('type', type);
    if (department) queryParams.append('department', department);
    if (location) queryParams.append('location', location);
    if (status) queryParams.append('status', status);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    // Request a larger page size within backend validation limits (max 100)
    queryParams.append('page', '1');
    queryParams.append('limit', '100');

    // Forward request to backend Admin API
    const backendResponse = await fetch(`${BACKEND_URL}/api/admin/career/jobs?${queryParams.toString()}`, {
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
          message: errorData.error || 'Failed to fetch jobs from backend'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      data: backendData.data // Return all jobs for frontend pagination
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch jobs'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    // Forward request to backend Admin API
    const backendResponse = await fetch(`${BACKEND_URL}/api/admin/career/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || 'Failed to create job'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: backendData.data
    });

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create job'
      },
      { status: 500 }
    );
  }
}