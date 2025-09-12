import { NextResponse } from 'next/server';
import { listReasons, upsertReason, addReason, updateReason } from '../../../../lib/db';

export async function GET() {
  return NextResponse.json(listReasons());
}

export async function POST(request) {
  const body = await request.json();
  if (!body || !body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const created = addReason(String(body.name));
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request) {
  const body = await request.json();
  if (!body || !body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const delta = typeof body.delta === 'number' ? body.delta : 1;
  const updated = updateReason(String(body.name), delta);
  return NextResponse.json(updated);
}


