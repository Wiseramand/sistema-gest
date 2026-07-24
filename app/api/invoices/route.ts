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

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao obter faturas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const count = await prisma.invoice.count();
    const invoiceNumber = `MTC-FT-${new Date().getFullYear()}/${100 + count + 1}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        studentId: data.studentId || null,
        studentName: data.studentName,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
        status: data.status || 'Pendente',
        invoiceNumber: invoiceNumber
      }
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar fatura' }, { status: 500 });
  }
}
