import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exemplo: Webhook MOCK que seria chamado pela SIBS/Stripe
// Rota de teste POST /api/webhooks/payments
export async function POST(req: Request) {
  try {
    // 1. Receber os dados encriptados do Gateway de Pagamento
    const body = await req.json();
    
    // Parâmetros normais de um Webhook:
    // { paymentId: "tx_123", referenceUserId: "cuid123", amount: "500.00", status: "SUCCESS" }
    const { referenceUserId, status } = body;

    if (!referenceUserId || status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Payload invalido ou pagamente pendente.' }, { status: 400 });
    }

    // 2. Pesquisar matrícula pendente do aluno (Simulação)
    const pendingMatriculation = await (prisma as any).matriculation.findFirst({
      where: {
        studentId: referenceUserId,
        paymentStatus: 'Pendente',
      },
    });

    if (!pendingMatriculation) {
      return NextResponse.json({ message: 'Nenhuma pendente encontrada para este identificador.' }, { status: 404 });
    }

    // 3. Atualizar Status para Pago (Conciliação automática sem intervenção humana)
    await (prisma as any).matriculation.update({
      where: { id: pendingMatriculation.id },
      data: {
        paymentStatus: 'Pago',
      },
    });

    // Opcional: Adicionar "Notification" para o aluno saber que o MBWay passou!
    // await prisma.notification.create({...});

    return NextResponse.json({ success: true, message: 'Conciliação validada com sucesso, aluno desbloqueado.' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
