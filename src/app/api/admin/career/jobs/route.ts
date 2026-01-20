import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Next.js route handler that proxies Admin Career Jobs requests to the backend.
 *
 * - Keeps the admin JWT in an HttpOnly cookie (adminToken) and reads it server-side.
 * - Forwards requests to the backend with an Authorization: Bearer <token> header.
 * - Normalizes error responses so the frontend can handle them consistently.
 *
 * Supported methods:
 * - GET  : List jobs with filtering/sorting (requests up to 100 for frontend pagination).
 * - POST : Create a new job.
 * - PUT  : Update an existing job (e.g., edit job fields or toggle isActive for archive/restore).
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Standard 401 response used when the admin session cookie is missing.
 */
function authRequired() {
  return NextResponse.json(
    { success: false, message: 'Authentication required' },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Read supported query params from the incoming request
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const department = searchParams.get('department') || '';
    const location = searchParams.get('location') || '';
    const status = searchParams.get('status') || 'active';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Read admin token from HttpOnly cookie set during login
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) return authRequired();

    // Build backend query params (we fetch up to 100 records for frontend pagination)
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (type) queryParams.append('type', type);
    if (department) queryParams.append('department', department);
    if (location) queryParams.append('location', location);
    if (status) queryParams.append('status', status);

    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    // Backend validation caps limit at 100; we request a single page for client-side pagination.
    queryParams.append('page', '1');
    queryParams.append('limit', '100');

    // Forward the request to the backend Admin API with Authorization header
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/career/jobs?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const backendJson = await backendResponse.json().catch(() => ({}));

    // Pass through backend error details with a consistent shape
    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            backendJson?.error ||
            backendJson?.message ||
            'Failed to fetch jobs from backend',
          details: backendJson?.details,
        },
        { status: backendResponse.status }
      );
    }

    // Backend typically returns: { success, data, pagination }
    return NextResponse.json({
      success: true,
      data: backendJson.data,
      pagination: backendJson.pagination,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Read JSON payload from the client
    const body = await request.json();

    // Read admin token from HttpOnly cookie set during login
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) return authRequired();

    // Forward create request to backend Admin API
    const backendResponse = await fetch(`${BACKEND_URL}/api/admin/career/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const backendJson = await backendResponse.json().catch(() => ({}));

    // Pass through backend validation errors/details
    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            backendJson?.error || backendJson?.message || 'Failed to create job',
          details: backendJson?.details,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: backendJson?.message || 'Job created successfully',
      data: backendJson.data,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create job' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Read JSON payload from the client (e.g., { id, ...fields } or { id, isActive })
    const body = await request.json();

    // Read admin token from HttpOnly cookie set during login
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) return authRequired();

    // Forward update request to backend Admin API
    const backendResponse = await fetch(`${BACKEND_URL}/api/admin/career/jobs`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const backendJson = await backendResponse.json().catch(() => ({}));

    // Pass through backend validation errors/details
    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            backendJson?.error || backendJson?.message || 'Failed to update job',
          details: backendJson?.details,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: backendJson?.message || 'Job updated successfully',
      data: backendJson.data,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update job' },
      { status: 500 }
    );
  }
}
