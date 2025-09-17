import { NextResponse } from 'next/server';
import { listReasons, upsertReason, addReason, updateReason } from '../../../../lib/db';

export async function GET() {
  const reasons = await listReasons();
  
  // Se não há dados, retorna dados mock para o gráfico
  if (reasons.length === 0) {
    const mockData = [
      { id: 'mock-1', name: 'Falha na Rede Elétrica', count: 45 },
      { id: 'mock-2', name: 'Condições Climáticas', count: 32 },
      { id: 'mock-3', name: 'Falha no Inversor', count: 18 },
      { id: 'mock-4', name: 'Manutenção Programada', count: 15 },
      { id: 'mock-5', name: 'Sobrecarga do Sistema', count: 12 },
      { id: 'mock-6', name: 'Falha nos Cabos', count: 8 },
      { id: 'mock-7', name: 'Problemas na Bateria', count: 6 },
      { id: 'mock-8', name: 'Outros', count: 4 }
    ];
    return NextResponse.json(mockData);
  }
  
  return NextResponse.json(reasons);
}

export async function POST(request) {
  const body = await request.json();
  if (!body || !body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const created = await addReason(String(body.name));
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request) {
  const body = await request.json();
  if (!body || !body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const delta = typeof body.delta === 'number' ? body.delta : 1;
  const updated = await updateReason(String(body.name), delta);
  return NextResponse.json(updated);
}


