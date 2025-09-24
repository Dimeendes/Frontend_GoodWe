import { NextResponse } from 'next/server';

// Simulação de estado da conexão (em produção, seria gerenciado pela biblioteca serialport)
let isConnected = false;
let simulatedPort = 'COM3'; // Porta simulada

export async function GET() {
  try {
    // Simular detecção de porta Arduino
    const ports = [
      { path: 'COM3', manufacturer: 'Arduino LLC' },
      { path: 'COM4', manufacturer: 'Arduino LLC' },
      { path: 'COM5', manufacturer: 'Arduino LLC' }
    ];

    // Encontrar primeira porta disponível
    const availablePort = ports.find(port => 
      port.path.match(/COM[3-9]/)
    );

    if (availablePort) {
      simulatedPort = availablePort.path;
      isConnected = true;
    }

    return NextResponse.json({
      success: isConnected,
      message: isConnected 
        ? `Arduino detectado na porta ${simulatedPort}` 
        : 'Arduino não encontrado. Conecte via USB.',
      connected: isConnected,
      port: isConnected ? simulatedPort : null,
      config: {
        baudRate: 115200,
        note: 'Biblioteca serialport não carregada. Modo simulação ativo.'
      }
    });
  } catch (error) {
    console.error('Erro na API serial:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        connected: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json(
        { success: false, message: 'Comando não especificado' },
        { status: 400 }
      );
    }

    // Simular envio de comando para Arduino
    console.log(`Comando simulado enviado para Arduino: ${command}`);

    return NextResponse.json({
      success: true,
      message: `Comando '${command}' enviado para Arduino (simulado)`,
      note: 'Em produção, este comando seria enviado via porta serial real'
    });

  } catch (error) {
    console.error('Erro ao enviar comando:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Erro ao enviar comando: ${error.message}` 
      },
      { status: 500 }
    );
  }
}

// Função para processar comandos do Arduino (simulada)
export async function processArduinoCommand(turnOn) {
  try {
    // Simular controle da lâmpada
    console.log(`Lâmpada ${turnOn ? 'ligada' : 'desligada'} via Arduino (simulado)`);
    
    // Em produção, aqui você faria a chamada real para a API de aparelhos
    // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aparelhos`);
    // const aparelhos = await response.json();
    // const lampada = aparelhos.find(aparelho => 
    //   aparelho.name.toLowerCase().includes('lâmpada') || 
    //   aparelho.name.toLowerCase().includes('lampada')
    // );
    // if (lampada) {
    //   await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aparelhos/${lampada.id}`, {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ is_on: turnOn })
    //   });
    // }
    
    return true;
  } catch (error) {
    console.error('Erro ao processar comando do Arduino:', error);
    return false;
  }
}