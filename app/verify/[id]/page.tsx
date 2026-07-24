import { db } from '../../../lib/db';
import VerifyUI from './VerifyUI';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function VerifyPage(props: Props) {
  const params = await props.params;
  const rawId = params?.id || '';
  const id = rawId ? decodeURIComponent(rawId).trim() : '';

  let certificate: any = null;
  let student: any = null;

  if (id) {
    try {
      // Find certificate by exact ID
      certificate = await db.certificate.findUnique({
        where: { id },
      });

      // Fallback search case-insensitive if exact match is not found
      if (!certificate) {
        certificate = await db.certificate.findFirst({
          where: {
            id: { equals: id, mode: 'insensitive' }
          }
        });
      }

      if (certificate && certificate.studentId) {
        student = await db.student.findUnique({
          where: { id: certificate.studentId }
        });
      }

      if (certificate) {
        certificate = JSON.parse(JSON.stringify(certificate));
      }
      if (student) {
        student = JSON.parse(JSON.stringify(student));
      }
    } catch (error) {
      console.error('Error fetching certificate for verification:', error);
    }
  }

  return <VerifyUI certificate={certificate} student={student} id={id} />;
}
