import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${id}/cover-letter`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { success: false, message: errorData.error || 'Failed to download cover letter' },
        { status: backendResponse.status }
      );
    }

    // If backend serves/redirects the file, we return a JSON with redirect
    // But since backend redirects directly, bubble up JSON
    const contentType = backendResponse.headers.get('content-type') || '';
    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      const fileBuffer = await backendResponse.arrayBuffer();
      const fileName = backendResponse.headers.get('content-disposition')?.split('filename=')[1] || 'cover_letter.pdf';
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    const backendData = await backendResponse.json();
    return NextResponse.json(backendData);
  } catch (error) {
    console.error('Error downloading cover letter:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to download cover letter' },
      { status: 500 }
    );
  }
}


