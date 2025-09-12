import { NextResponse } from 'next/server';
import { removeReason } from '../../../../../lib/db';

export async function DELETE(_request, { params }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  try {
    removeReason(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


