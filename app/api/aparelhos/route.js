import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function lerStatusMovimento() {
  try {
    const filePath = path.join(process.cwd(), 'movimento_dados.json');
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return 'OFF'; // Padrão se o arquivo não existir
    }
    
    // Lê o conteúdo do arquivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Tenta fazer parse do JSON
    try {
      const data = JSON.parse(fileContent);
      
      // Se for um array, pega o último item
      if (Array.isArray(data) && data.length > 0) {
        const ultimoItem = data[data.length - 1];
        return ultimoItem.estado || 'OFF';
      }
      
      // Se for um objeto com propriedade 'estado' (novo formato)
      if (typeof data === 'object' && data !== null && 'estado' in data) {
        return data.estado === 'ON' ? 'ON' : 'OFF';
      }
      
      // Se for uma string
      if (typeof data === 'string') {
        const limpo = data.trim().toUpperCase().replace(/\r?\n/g, '');
        return limpo === 'ON' ? 'ON' : 'OFF';
      }
      
    } catch (parseError) {
      // Se não for JSON válido, trata como string
      // Remove aspas extras e quebras de linha
      const limpo = fileContent
        .replace(/^"/, '')
        .replace(/"$/, '')
        .replace(/\\r\\n/g, '')
        .replace(/\r?\n/g, '')
        .trim()
        .toUpperCase();
      
      if (limpo === 'ON') return 'ON';
      if (limpo === 'OFF') return 'OFF';
      
      // Se contém "OFF" ou "ON" em qualquer lugar
      if (limpo.includes('ON')) return 'ON';
      if (limpo.includes('OFF')) return 'OFF';
      
      return 'OFF';
    }
    
    return 'OFF';
  } catch (error) {
    console.error('Erro ao ler movimento_dados.json:', error);
    return 'OFF';
  }
}

export async function GET() {
  try {
    // Lê o status do movimento
    const statusMovimento = lerStatusMovimento();
    const lampadaLigada = statusMovimento === 'ON';
    
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
        is_on: lampadaLigada ? 1 : 0,
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
