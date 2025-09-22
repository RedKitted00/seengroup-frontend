import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/products/store';

export async function GET() {
  return NextResponse.json({ data: db.listCategories() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = (body?.name ?? '').toString().trim();
  if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  const created = db.createCategory(name);
  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = (body?.id ?? '').toString();
  const name = (body?.name ?? '').toString().trim();
  if (!id || !name) return NextResponse.json({ message: 'id and name are required' }, { status: 400 });
  const updated = db.renameCategory(id, name);
  if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });
  const ok = db.deleteCategory(id);
  if (!ok) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}



