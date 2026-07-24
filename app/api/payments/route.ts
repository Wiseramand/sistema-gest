import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentName = searchParams.get('studentName');

    let whereClause = {};
    if (studentId) {
      whereClause = { studentId };
    } else if (studentName) {
      whereClause = { studentName };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao obter pagamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Auto-generate receipt number based on current count
    const count = await prisma.payment.count();
    const receiptNumber = `MTC-REC-${1000 + count + 1}`;

    const newPayment = await prisma.payment.create({
      data: {
        studentId: data.studentId || null,
        studentName: data.studentName,
        courseTitle: data.courseTitle || data.course,
        amount: parseFloat(data.amount),
        method: data.method,
        date: data.date,
        status: data.status || 'Processado',
        receiptNumber: receiptNumber
      }
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }
}
