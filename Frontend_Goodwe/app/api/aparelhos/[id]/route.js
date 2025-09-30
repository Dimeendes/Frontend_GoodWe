import { NextResponse } from 'next/server';
import { removeAparelho, updateAparelho } from '../../../../lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await removeAparelho(id);
    return NextResponse.json({ message: 'Aparelho excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir aparelho:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, type, energyConsumption, priority, isOn } = await request.json();

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const aparelhoData = {
      name,
      type,
      energyConsumption,
      priority,
      isOn
    };

    const updatedAparelho = await updateAparelho(id, aparelhoData);
    return NextResponse.json(updatedAparelho);
  } catch (error) {
    console.error('Erro ao atualizar aparelho:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
