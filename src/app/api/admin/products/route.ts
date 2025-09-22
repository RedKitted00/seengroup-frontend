import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/products/store';
import { Product } from '@/lib/products/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId') ?? undefined;
  return NextResponse.json({ data: db.listProducts(categoryId) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Product>;
  const required = ['categoryId', 'name', 'manufacturerName', 'manufacturerNumber', 'weight', 'packageDimension'] as const;
  for (const k of required) {
    const v = (body as Record<string, unknown>)[k];
    if (!v || `${v}`.trim() === '') {
      return NextResponse.json({ message: `${k} is required` }, { status: 400 });
    }
  }
  const created = db.createProduct({
    categoryId: body.categoryId!,
    name: body.name!,
    manufacturerName: body.manufacturerName!,
    manufacturerNumber: body.manufacturerNumber!,
    weight: body.weight!,
    packageDimension: body.packageDimension!,
    imageUrl: body.imageUrl || '',
    createdAt: '', // ignored by store
    updatedAt: '', // ignored by store
    id: '', // ignored by store
  } as unknown as Product);
  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Product> & { id?: string };
  if (!body.id) return NextResponse.json({ message: 'id is required' }, { status: 400 });
  const { id, ...updates } = body;
  const updated = db.updateProduct(id!, updates);
  if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });
  const ok = db.deleteProduct(id);
  if (!ok) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}



