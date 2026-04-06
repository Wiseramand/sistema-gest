import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendMTCEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // 6 meses a partir de agora
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const today = new Date();

    const certificateId = (await req.json()).certificateId;

    if (certificateId) {
      // Alerta Manual para um certificado específico
      const cert = await (prisma as any).certificate.findUnique({
        where: { id: certificateId },
      });

      if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

      const student = await (prisma as any).student.findUnique({
        where: { id: cert.studentId },
      });

      if (!student || !student.email) return NextResponse.json({ error: 'Student email not found' }, { status: 400 });

      const res = await sendMTCEmail({
        to: student.email,
        subject: `Alerta de Renovação: ${cert.courseTitle} (STCW)`,
        title: 'A Sua Certificação Marítima Expira em Breve',
        body: `Olá ${student.name},\n\nO seu certificado de ${cert.courseTitle} irá expirar em ${new Date(cert.validUntil).toLocaleDateString('pt-PT')}.\n\nPara garantir a sua validade de embarque, recomendamos o agendamento de uma sessão de renovação no Marítimo Training Center o mais brevemente possível.`,
        buttonText: 'Ver Agenda de Cursos',
        buttonUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/student/courses`,
      });

      return NextResponse.json({ message: 'Manual alert sent successfully' });
    }

    // Alerta em Massa (Cron-like trigger)
    const expiringCerts = await (prisma as any).certificate.findMany({
      where: {
        validUntil: {
          gt: today,
          lte: sixMonthsFromNow,
        },
        status: 'APROVADO',
      },
    });

    let count = 0;
    for (const cert of expiringCerts) {
      const student = await (prisma as any).student.findUnique({
        where: { id: cert.studentId },
      });

      if (student && student.email) {
        await sendMTCEmail({
          to: student.email,
          subject: `Aviso Prévio de CADUCIDADE: ${cert.courseTitle}`,
          title: 'Importante: Renovação STCW Necessária',
          body: `Informamos o formando ${student.name} que o certificado ID ${cert.id} está no período de renovação obrigatória.\n\nData de Expiração: ${new Date(cert.validUntil as any).toLocaleDateString('pt-PT')}.`,
          buttonText: 'Agendar Renovação',
          buttonUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/`,
        });
        count++;
      }
    }

    return NextResponse.json({ message: `Sent ${count} automated expiry alerts.` });

  } catch (error) {
    console.error('Expiry Alert API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
