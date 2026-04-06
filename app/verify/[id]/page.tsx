import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const { id } = params;

  let certificate;
  try {
    certificate = await (prisma as any).certificate.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
  }

  if (!certificate) {
    return (
      <div className="verify-wrap">
        <div className="card invalid">
          <div className="icon">❌</div>
          <h1>Certificado Não Encontrado</h1>
          <p>O identificador {id} não corresponde a nenhum certificado válido emitido pelo Marítimo Training Center.</p>
        </div>
        <style jsx>{`
          .verify-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f4f7fb; font-family: 'DM Sans', sans-serif; padding: 2rem; }
          .card { background: white; padding: 3rem; border-radius: 16px; text-align: center; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-top: 5px solid #ef4444; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #0f1e35; font-family: 'Outfit', sans-serif; font-size: 1.5rem; }
          p { color: #64748b; margin-top: 1rem; line-height: 1.5; }
        `}</style>
      </div>
    );
  }

  const isExpired = certificate.validUntil && new Date(certificate.validUntil) < new Date();
  const isApproved = certificate.status === 'APROVADO';

  return (
    <div className="verify-wrap">
      <div className={`card ${isApproved && !isExpired ? 'valid' : 'warning'}`}>
        <div className="mtc-logo">⚓ MARÍTIMO TRAINING CENTER</div>
        
        <div className="status-badge">
          {isApproved && !isExpired ? '✅ CERTIFICADO AUTÊNTICO' : isExpired ? '⚠️ CERTIFICADO EXPIRADO' : '⏳ PENDENTE DE VALIDAÇÃO'}
        </div>

        <div className="cert-details">
          <div className="detail-row">
            <span className="label">Formando:</span>
            <span className="value">{certificate.studentName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Treinamento/Curso:</span>
            <span className="value">{certificate.courseTitle}</span>
          </div>
          <div className="detail-row">
            <span className="label">Data de Emissão:</span>
            <span className="value">{new Date(certificate.generatedAt).toLocaleDateString('pt-PT')}</span>
          </div>
          <div className="detail-row">
            <span className="label">Válido Até:</span>
            <span className="value">{certificate.validUntil ? new Date(certificate.validUntil).toLocaleDateString('pt-PT') : 'Vitalício'}</span>
          </div>
          <div className="detail-row">
            <span className="label">ID Autenticador:</span>
            <span className="value mono">{certificate.id}</span>
          </div>
        </div>

        <p className="footer-note">
          A leitura deste QR Code digital garante a proveniência dos registos da nossa base de dados oficial. Em caso de dúvidas, contacte a entidade formadora.
        </p>

        <Link href="/" className="home-link">Voltar ao Início</Link>
      </div>

      <style jsx>{`
        .verify-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a2a5e; font-family: 'DM Sans', sans-serif; padding: 2rem; }
        .card { background: white; padding: 3rem; border-radius: 16px; text-align: center; max-width: 500px; width: 100%; box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        .card.valid { border-top: 5px solid #10b981; }
        .card.warning { border-top: 5px solid #F5C518; }
        
        .mtc-logo { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800; color: #0a2a5e; margin-bottom: 2rem; letter-spacing: 0.05em; }
        
        .status-badge { background: #f8fafc; padding: 0.75rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.9rem; margin-bottom: 2rem; color: #0f1e35; border: 1px solid #e2e8f0; display: inline-block;}
        .card.valid .status-badge { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .card.warning .status-badge { background: #fffbeb; color: #d97706; border-color: #fde68a; }

        .cert-details { text-align: left; background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; }
        .detail-row { display: flex; flex-direction: column; margin-bottom: 1rem; }
        .detail-row:last-child { margin-bottom: 0; }
        .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; }
        .value { font-size: 1.1rem; color: #0f1e35; font-weight: 600; margin-top: 0.25rem; }
        .value.mono { font-family: 'Courier New', monospace; font-size: 0.95rem; }

        .footer-note { font-size: 0.8rem; color: #94a3b8; line-height: 1.5; margin-bottom: 2rem; }
        .home-link { display: inline-block; padding: 0.75rem 1.5rem; background: #f1f5f9; color: #0a2a5e; font-weight: 600; border-radius: 8px; text-decoration: none; transition: 0.2s; }
        .home-link:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}
