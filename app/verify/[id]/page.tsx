import { PrismaClient } from '@prisma/client';
import VerifyUI from './VerifyUI';

const prisma = new PrismaClient();

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const { id } = params;

  let certificate;
  try {
    certificate = await (prisma as any).certificate.findUnique({
      where: { id },
    });
    
    // Serializar dados para o Client Component (evitar erros de objetos Date)
    if (certificate) {
      certificate = JSON.parse(JSON.stringify(certificate));
    }
  } catch (error) {
    console.error('Error fetching certificate:', error);
  }

  return <VerifyUI certificate={certificate} id={id} />;
}
