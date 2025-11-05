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

    // Upstream timeout/retries can be tuned via env: CONTACT_UPSTREAM_TIMEOUT_MS, CONTACT_UPSTREAM_RETRIES
    const TIMEOUT_MS = Number(process.env.CONTACT_UPSTREAM_TIMEOUT_MS || 45000);
    const RETRIES = Number(process.env.CONTACT_UPSTREAM_RETRIES || 2);

    // 2) If verification succeeded, forward request to backend with retry/timeout
    let forwardResp;
    let lastErr;
    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
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
        clearTimeout(timeout);
        break; // success
      } catch (err) {
        clearTimeout(timeout);
        lastErr = err;
        const isAbort = err && (err.name === 'AbortError' || err.code === 20);
        console.error('[contact api] Upstream fetch attempt failed', { attempt, isAbort, err });
        if (attempt === RETRIES) {
          const status = isAbort ? 504 : 503;
          const msg = isAbort ? 'Upstream timed out' : 'Upstream service unreachable';
          return NextResponse.json(
            { success: false, error: msg },
            { status }
          );
        }
        // exponential backoff before next attempt
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(res => setTimeout(res, delay));
      }
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


