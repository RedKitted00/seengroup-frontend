import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://seengroup-backend.onrender.com';

// GET /api/career/jobs/:id  ->  Backend /api/career/jobs/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/career/jobs/${params.id}`, { method: 'GET' });
    const raw = await res.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { success: false, error: raw }; }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.error || 'Failed to fetch job' },
        { status: res.status },
      );
    }
    return NextResponse.json({ success: true, data: data.data });
  } catch (err) {
    console.error('Career job by-id proxy error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 },
    );
  }
}
