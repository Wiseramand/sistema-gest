import { db } from '../../../../lib/db';
import { notFound } from 'next/navigation';
import CertificateView from './CertificateView';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function CertificateValidationPage(props: Props) {
    const params = await props.params;
    const certId = params.id;

    // We fetch directly from DB here because this is a server component
    const certificate = await db.certificate.findUnique({ where: { id: certId } });

    if (!certificate) {
        notFound();
    }

    // Try to get user photo if available
    const user = await db.user.findUnique({ where: { id: certificate.studentId } });

    // Fallback logic for validity if not initially set by the new code
    const validUntil = certificate.validUntil
        ? new Date(certificate.validUntil).toLocaleDateString('pt-BR')
        : new Date(new Date(certificate.generatedAt).getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

    return <CertificateView certificate={certificate} user={user} validUntil={validUntil} />;
}
