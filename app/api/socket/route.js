import { NextResponse } from 'next/server';

// Esta rota é usada apenas para inicializar o Socket.io
// O servidor real é configurado em lib/socketServer.js

export async function GET() {
  return NextResponse.json({
    message: 'Socket.io server está rodando',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Socket.io server está ativo',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
