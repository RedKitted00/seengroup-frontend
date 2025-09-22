import { NextResponse } from 'next/server';

type Settings = {
  siteTitle: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  darkMode: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
  allowRegistrations: boolean;
};

let settingsStore: Settings = {
  siteTitle: 'Seen Group - We Supply Your Growth',
  siteTagline: 'We Supply Your Growth',
  contactEmail: 'info@seengrp.com',
  contactPhone: '+1 (555) 123-4567',
  description:
    'Seen Group provides comprehensive solutions to supply your business growth with innovative products and services.',
  logoUrl: '/imgs/site-logo.png',
  faviconUrl: '/imgs/favicon.png',
  primaryColor: '#228be6',
  darkMode: true,
  colorScheme: 'dark',
  allowRegistrations: false,
};

export async function GET() {
  return NextResponse.json({ success: true, data: settingsStore });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<Settings>;

    // Basic validation/sanitization (keep it simple for now)
    const next: Settings = {
      ...settingsStore,
      ...body,
    } as Settings;

    if (!next.siteTitle || !next.logoUrl || !next.faviconUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: siteTitle, logoUrl, faviconUrl' },
        { status: 400 }
      );
    }

    settingsStore = next;
    return NextResponse.json({ success: true, data: settingsStore });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid payload' },
      { status: 400 }
    );
  }
}



