// seengroup-frontend/src/app/api/contact/route.js
import { NextResponse } from 'next/server';

/**
 * Backend URL'i tek yerden çöz.
 * NEXT_PUBLIC_BACKEND_URL varsa onu, yoksa BACKEND_URL'i kullanır.
 */
const resolveBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  return url && url.trim().length > 0 ? url.trim() : '';
};

/**
 * Cloudflare Turnstile server-side doğrulama
 * - captchaToken: front-end'den gelen token
 * - remoteIp: (ops.) X-Forwarded-For ilk IP
 * ENV: TURNSTILE_SECRET_KEY (Vercel'de Production’da tanımlı olmalı)
 */
async function verifyTurnstile(captchaToken, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY; // <-- BUNA DİKKAT
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

    // İstek gövdesi
    const body = await request.json();
    const { captchaToken, ...rest } = body || {};

    // (Opsiyonel) IP (bazı doğrulama politikaları için faydalı)
    const ip = (request.headers.get('x-forwarded-for') || '')
      .split(',')[0]
      ?.trim();

    // 1) Turnstile doğrulaması (server-side, burada)
    const vt = await verifyTurnstile(captchaToken, ip);
    if (!vt.ok) {
      return NextResponse.json(
        { success: false, error: 'Captcha verification misconfigured', detail: vt },
        { status: 400 }
      );
    }

    // 2) Doğrulama geçti → isteği backend'e ilet
    const forwardResp = await fetch(`${backendUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Backend istiyorsa captchaToken'ı da iletmeye devam ediyoruz
      body: JSON.stringify({ captchaToken, ...rest })
    });

    // Backend'ten JSON bekliyoruz; parse edilemezse metni sarmalarız
    let data;
    const text = await forwardResp.text();
    try { data = JSON.parse(text); } catch { data = { success: forwardResp.ok, message: text }; }

    return NextResponse.json(data, { status: forwardResp.status });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to backend service. Please try again later.' },
      { status: 500 }
    );
  }
}


