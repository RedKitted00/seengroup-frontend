// seengroup-frontend/src/app/api/contact/route.js
import { NextResponse } from 'next/server';


const resolveBackendUrl = () => {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const url = raw.trim().replace(/\/+$/, '');
  return url;
};


export async function POST(request) {
  try {
    const backendUrl = resolveBackendUrl();
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: 'Backend URL is not configured' },
        { status: 500 }
      );
    }
    // Guard against forwarding to the same Next.js origin (would recurse)
    const reqOrigin = new URL(request.url).origin;
    if (backendUrl && backendUrl.startsWith(reqOrigin)) {
      console.error('[contact api] Misconfiguration: NEXT_PUBLIC_BACKEND_URL points to this frontend origin', { backendUrl, reqOrigin });
      return NextResponse.json(
        { success: false, error: 'Misconfigured NEXT_PUBLIC_BACKEND_URL. It must point to your upstream API, not this frontend.' },
        { status: 500 }
      );
    }
    const clientIP = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || undefined;
    const body = await request.json();
    const { captchaToken, ...rest } = body || {};

    // Require captcha token for managed Turnstile
    if (!captchaToken || typeof captchaToken !== 'string' || !captchaToken.trim()) {
      return NextResponse.json(
        { success: false, error: 'Captcha token missing' },
        { status: 400 }
      );
    }

    // (No server-side Turnstile verification: just forward token upstream)

    // 2) If verification succeeded, forward request to backend
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let forwardResp;
    try {
      forwardResp = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': reqOrigin,
          'Referer': `${reqOrigin}/contact`,
          ...(clientIP ? { 'X-Forwarded-For': clientIP } : {})
        },
        body: JSON.stringify({ captchaToken, ...rest }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error('[contact api] Upstream fetch failed', { err, backendUrl });
      return NextResponse.json(
        { success: false, error: 'Upstream service unreachable' },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeout);
    }

    // Prefer JSON; if not JSON, return a safe JSON envelope with sliced text/HTML
    const contentType = forwardResp.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      try {
        data = await forwardResp.json();
      } catch {
        const txt = await forwardResp.text();
        data = { success: forwardResp.ok, message: txt.slice(0, 500) };
      }
    } else {
      const txt = await forwardResp.text();
      data = { success: forwardResp.ok, message: txt.slice(0, 500) };
    }
    if (!forwardResp.ok) {
      console.error('[contact api] Upstream responded with error', {
        status: forwardResp.status,
        statusText: forwardResp.statusText,
        body: typeof data === 'string' ? String(data).slice(0, 500) : data,
        backendUrl
      });
    }
    return NextResponse.json(data, { status: forwardResp.status });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to backend service. Please try again later.' },
      { status: 500 }
    );
  }
}


