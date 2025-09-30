import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json([
      {
        id: 1,
        name: "Geladeira",
        type: "kitchen",
        energy_consumption: 150,
        priority: 5,
        is_on: 1,
        created_at: "2025-09-24T03:47:19.824Z"
      },
      {
        id: 2,
        name: "Lâmpada",
        type: "lighting",
        energy_consumption: 12,
        priority: 2,
        is_on: 0,
        created_at: "2025-09-24T03:47:19.824Z"
      }
    ]);
  } catch (error) {
    console.error('Erro ao buscar aparelhos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, type, energyConsumption, priority } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
    }

    const newAparelho = {
      id: Date.now(),
      name,
      type,
      energy_consumption: energyConsumption ? parseFloat(energyConsumption) : null,
      priority: priority || 1,
      is_on: false,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(newAparelho);
  } catch (error) {
    console.error('Erro ao criar aparelho:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
