import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://workflow-backend-eek9.onrender.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

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

    // Build query parameters for backend API
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (status && status !== 'all') queryParams.append('status', status);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications?${queryParams.toString()}`, {
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
          message: errorData.error || 'Failed to fetch applications from backend'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    // Transform backend data to align with admin UI Application interface
    const transformedApplications = backendData.data.map((app: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      status: string;
      createdAt: string;
      updatedAt?: string;
      resumeUrl?: string;
      coverLetter?: string;
      jobs?: {
        id: string;
        title: string;
        type: string;
        location: string;
      };
    }) => ({
      id: app.id,
      name: app.name,
      email: app.email,
      phone: app.phone || '',
      // Fields the admin table expects
      resumeUrl: app.resumeUrl || '',
      coverLetter: app.coverLetter || '',
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt || app.createdAt,
      job: app.jobs
        ? {
            id: app.jobs.id,
            title: app.jobs.title,
            type: app.jobs.type,
            location: app.jobs.location,
            isActive: true,
            description: '',
            requirements: '',
            benefits: [],
            skills: [],
            department: undefined,
            salary: undefined,
            postedDate: undefined,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt || app.createdAt,
          }
        : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: backendData.pagination
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch applications'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application ID and status are required'
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
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: status.toUpperCase() })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || 'Failed to update application status'
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      data: backendData.data
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update application'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
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
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${applicationId}`, {
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

