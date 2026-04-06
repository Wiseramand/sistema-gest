import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendMTCEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { matriculationId } = await req.json();

    if (!matriculationId) {
      return NextResponse.json({ error: 'Matriculation ID is required' }, { status: 400 });
    }

    const matriculation = await (prisma as any).matriculation.findUnique({
      where: { id: matriculationId },
    });

    if (!matriculation) {
      return NextResponse.json({ error: 'Matriculation not found' }, { status: 404 });
    }

    const student = await (prisma as any).student.findUnique({
      where: { id: matriculation.studentId },
    });

    if (!student || !student.email) {
      return NextResponse.json({ error: 'Student email not found' }, { status: 400 });
    }

    const result = await sendMTCEmail({
      to: student.email,
      subject: `Fatura / Link de Pagamento: ${matriculation.courseTitle}`,
      title: 'Referência de Pagamento para Curso Marítimo',
      body: `Olá ${student.name},\n\nPara completar a sua inscrição no curso de ${matriculation.courseTitle}, por favor proceda ao pagamento do valor de €${matriculation.amountDue}.00.\n\nEste pagamento é essencial para a emissão do seu certificado STCW definitivo.`,
      buttonText: 'Visualizar Fatura e Pagar',
      buttonUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/student/dashboard`,
    });

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Invoice Email API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
