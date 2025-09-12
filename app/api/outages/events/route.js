import { NextResponse } from 'next/server';
import { listOutageEvents, addOutageEvent } from '../../../../lib/db';

export async function GET() {
  return NextResponse.json(listOutageEvents());
}

export async function POST(request) {
  const body = await request.json();
  if (!body || !body.at) return NextResponse.json({ error: 'at required' }, { status: 400 });
  const created = addOutageEvent(String(body.at));
  return NextResponse.json(created, { status: 201 });
}


