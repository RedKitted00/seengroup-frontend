import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://workflow-backend-eek9.onrender.com';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { subject, message, replyTo, cc, bcc } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ success: false, message: 'Subject and message are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications/${id}/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, message, replyTo, cc, bcc })
    });

    const data = await backendResponse.json().catch(() => ({}));
    if (!backendResponse.ok) {
      return NextResponse.json({ success: false, message: data.error || 'Failed to send email' }, { status: backendResponse.status });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending application email:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}


