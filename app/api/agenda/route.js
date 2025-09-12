import { NextResponse } from 'next/server';
import { listAgenda, addAgenda } from '../../../lib/db';

export async function GET() {
  const items = listAgenda();
  return NextResponse.json(items);
}

export async function POST(request) {
  const body = await request.json();
  const item = { id: body.id || crypto.randomUUID(), text: body.text, date: body.date || null };
  addAgenda(item);
  return NextResponse.json(item, { status: 201 });
}

