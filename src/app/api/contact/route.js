// seengroup-frontend/src/app/api/contact/route.js
import { NextResponse } from 'next/server';


const resolveBackendUrl = () => {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const url = raw.trim().replace(/\/+$/, '');
  return url;
};

/**
 * Cloudflare Turnstile server-side verification
 * @param {string} captchaToken - Token received from frontend
 * @param {string} remoteIp - Optional client IP (for some verification policies)
 * Requires: TURNSTILE_SECRET_KEY environment variable (must be set in production)
 */
async function verifyTurnstile(captchaToken, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY; // IMPORTANT: Must be set in production
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is missing on server');
    return { ok: false, reason: 'server-missing-secret' };
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', captchaToken || '');
  if (remoteIp) body.set('remoteip', remoteIp);

  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });

  let data = {};
  try { data = await resp.json(); } catch {}

  if (!data?.success) {
    console.error('Turnstile verify failed:', data);
    return { ok: false, reason: 'verify-failed', data };
  }
  return { ok: true };
}

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
    const body = await request.json();
    const { captchaToken, ...rest } = body || {};

    // Require captcha token for managed Turnstile
    if (!captchaToken || typeof captchaToken !== 'string' || !captchaToken.trim()) {
      return NextResponse.json(
        { success: false, error: 'Captcha token missing' },
        { status: 400 }
      );
    }

    // Optionally get client IP for verification policies
    const ip = (request.headers.get('x-forwarded-for') || '')
      .split(',')[0]
      ?.trim();

    // 1) Perform Turnstile verification (server-side)
    const vt = await verifyTurnstile(captchaToken, ip);
    if (!vt.ok) {
      return NextResponse.json(
        { success: false, error: 'Captcha verification misconfigured', detail: vt },
        { status: 400 }
      );
    }

    // 2) If verification succeeded, forward request to backend
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let forwardResp;
    try {
      forwardResp = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Forward captchaToken to backend if required
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

    // Expect JSON from backend; if parsing fails, wrap as text
    let data;
    const text = await forwardResp.text();
    try { data = JSON.parse(text); } catch { data = { success: forwardResp.ok, message: text }; }
    if (!forwardResp.ok) {
      console.error('[contact api] Upstream responded with error', {
        status: forwardResp.status,
        statusText: forwardResp.statusText,
        body: text?.slice(0, 500),
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


