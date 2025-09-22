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
    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${id}/resume`, {
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
          message: errorData.error || 'Failed to download resume'
        },
        { status: backendResponse.status }
      );
    }

    // If the backend returns a file, stream it
    if (backendResponse.headers.get('content-type')?.includes('application/pdf') || 
        backendResponse.headers.get('content-type')?.includes('application/octet-stream')) {
      
      const fileBuffer = await backendResponse.arrayBuffer();
      const fileName = backendResponse.headers.get('content-disposition')?.split('filename=')[1] || 'resume.pdf';
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': backendResponse.headers.get('content-type') || 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // If it's a JSON response (error or redirect)
    const backendData = await backendResponse.json();
    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error downloading resume:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to download resume'
      },
      { status: 500 }
    );
  }
}
