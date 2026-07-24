'use client';

import Link from 'next/link';

interface VerifyUIProps {
  certificate: any;
  student?: any;
  id: string;
}

export default function VerifyUI({ certificate, student, id }: VerifyUIProps) {
  if (!certificate) {
    return (
      <div className="verify-container">
        <div className="verify-card invalid">
          <div className="status-header">
            <div className="icon-badge error">❌</div>
            <h1 className="title">Certificado Não Encontrado</h1>
            <p className="subtitle">Validação de Documento Marítimo</p>
          </div>

          <div className="error-body">
            <p className="error-msg">
              O identificador <code className="id-highlight">{id || 'desconhecido'}</code> não corresponde a nenhum certificado válido emitido na nossa base de dados oficial.
            </p>

            <div className="help-box">
              <h3>💡 O que pode ter acontecido?</h3>
              <ul>
                <li>O código QR ou URL pode ter sido lido incorretamente.</li>
                <li>O certificado ainda não foi emitido ou homologado no sistema.</li>
                <li>O código de verificação foi introduzido com erro de digitação.</li>
              </ul>
            </div>

            <div className="actions">
              <Link href="/" className="btn-primary">
                ⚓ Ir para a Página Inicial
              </Link>
              <Link href="/contacto" className="btn-secondary">
                📞 Contactar Suporte
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .verify-container {
            min-height: 100vh;
            background: radial-gradient(circle at top, #2D180F 0%, #1C0F0A 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            font-family: system-ui, -apple-system, sans-serif;
            color: #F3F4F6;
          }
          .verify-card {
            background: rgba(28, 15, 10, 0.95);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 24px;
            max-width: 540px;
            width: 100%;
            padding: 2.5rem 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(12px);
            text-align: center;
          }
          .icon-badge.error {
            font-size: 3.5rem;
            margin-bottom: 1rem;
          }
          .title {
            font-size: 1.75rem;
            font-weight: 800;
            color: #EF4444;
            margin: 0 0 0.25rem;
          }
          .subtitle {
            font-size: 0.9rem;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 1.5rem;
          }
          .error-body {
            text-align: left;
          }
          .error-msg {
            color: #D1D5DB;
            font-size: 1rem;
            line-height: 1.6;
            background: rgba(239, 68, 68, 0.1);
            padding: 1rem;
            border-radius: 12px;
            border-left: 4px solid #EF4444;
            margin-bottom: 1.5rem;
          }
          .id-highlight {
            font-family: monospace;
            background: rgba(0, 0, 0, 0.4);
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
            color: #FCA5A5;
          }
          .help-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 2rem;
          }
          .help-box h3 {
            font-size: 0.95rem;
            color: #F59E0B;
            margin: 0 0 0.75rem;
          }
          .help-box ul {
            margin: 0;
            padding-left: 1.25rem;
            color: #9CA3AF;
            font-size: 0.875rem;
            line-height: 1.6;
          }
          .actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .btn-primary {
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%);
            color: white;
            padding: 0.875rem;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4);
          }
          .btn-secondary {
            display: block;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            color: #D1D5DB;
            padding: 0.875rem;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
        `}</style>
      </div>
    );
  }

  const isExpired = certificate.validUntil && new Date(certificate.validUntil) < new Date();
  const isApproved = certificate.status === 'APROVADO';

  const issueDateFormatted = certificate.generatedAt
    ? new Date(certificate.generatedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';

  const validUntilFormatted = certificate.validUntil
    ? new Date(certificate.validUntil).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Vitalício / Sem Validade';

  const studentName = certificate.studentName || student?.name || 'Formando Registado';
  const studentDoc = student?.bi || student?.idDocument || 'Documento Autenticado';

  return (
    <div className="verify-container">
      <div className="verify-card print-area">
        {/* Header Branding */}
        <div className="brand-header">
          <div className="logo-badge">⚓</div>
          <h2 className="brand-name">MARÍTIMO TRAINING CENTER</h2>
          <p className="brand-tag">Portal Oficial de Verificação e Homologação Digital</p>
        </div>

        {/* Status Banner */}
        <div className={`status-banner ${isApproved && !isExpired ? 'valid' : isExpired ? 'expired' : 'pending'}`}>
          <div className="status-icon">
            {isApproved && !isExpired ? '✅' : isExpired ? '⚠️' : '⏳'}
          </div>
          <div className="status-text">
            <div className="status-title">
              {isApproved && !isExpired
                ? 'CERTIFICADO AUTÊNTICO E VÁLIDO'
                : isExpired
                ? 'CERTIFICADO EXPIRADO'
                : 'PENDENTE DE HOMOLOGAÇÃO'}
            </div>
            <div className="status-sub">
              {isApproved && !isExpired
                ? 'Registado na Base de Dados Oficial do MTC'
                : isExpired
                ? 'Este certificado ultrapassou a data de validade'
                : 'Aguardando validação final da administração'}
            </div>
          </div>
        </div>

        {/* Formando Profile */}
        <div className="student-box">
          <div className="avatar-circle">
            {student?.photo ? (
              <img src={student.photo} alt={studentName} className="avatar-img" />
            ) : (
              <span>{studentName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="student-info">
            <span className="info-label">FORMANDO CERTIFICADO</span>
            <h3 className="student-name">{studentName}</h3>
            {studentDoc && <span className="student-doc">Doc. ID: {studentDoc}</span>}
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          <div className="detail-item full">
            <span className="label">Curso / Formação Marítima</span>
            <span className="val highlight">{certificate.courseTitle}</span>
          </div>

          <div className="detail-item">
            <span className="label">ID de Autenticação</span>
            <span className="val code">{certificate.id}</span>
          </div>

          <div className="detail-item">
            <span className="label">Estado no Sistema</span>
            <span className={`val status-tag ${certificate.status?.toLowerCase()}`}>
              {certificate.status || 'APROVADO'}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">Data de Emissão</span>
            <span className="val">{issueDateFormatted}</span>
          </div>

          <div className="detail-item">
            <span className="label">Válido Até</span>
            <span className={`val ${isExpired ? 'text-expired' : 'text-valid'}`}>
              {validUntilFormatted}
            </span>
          </div>

          <div className="detail-item full">
            <span className="label">Entidade Emissora</span>
            <span className="val">Marítimo Training Center — Centro de Formação Marítima</span>
          </div>
        </div>

        {/* Digital Verification Stamp */}
        <div className="stamp-box">
          <div className="stamp-seal">
            <span className="seal-icon">🛡️</span>
            <div className="seal-info">
              <strong>Homologação Digital Garantida</strong>
              <p>Esta consulta confirma diretamente os dados em tempo real na base de dados oficial.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="actions no-print">
          <button onClick={() => window.print()} className="btn-primary">
            🖨️ Imprimir / Guardar PDF
          </button>
          <Link href="/" className="btn-secondary">
            ⚓ Voltar ao Início
          </Link>
        </div>
      </div>

      <style jsx>{`
        .verify-container {
          min-height: 100vh;
          background: radial-gradient(circle at top, #2D180F 0%, #1C0F0A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
          color: #F3F4F6;
        }
        .verify-card {
          background: rgba(28, 15, 10, 0.95);
          border: 1px solid rgba(234, 88, 12, 0.25);
          border-radius: 24px;
          max-width: 620px;
          width: 100%;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(16px);
        }

        .brand-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1.5rem;
        }
        .logo-badge {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          display: inline-block;
          background: linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%);
          padding: 0.75rem;
          border-radius: 50%;
          border: 1px solid rgba(234, 88, 12, 0.4);
        }
        .brand-name {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: #FFFFFF;
          margin: 0 0 0.25rem;
        }
        .brand-tag {
          font-size: 0.8rem;
          color: #F59E0B;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
          font-weight: 700;
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }
        .status-banner.valid {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .status-banner.expired {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .status-banner.pending {
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.4);
        }
        .status-icon {
          font-size: 2.25rem;
        }
        .status-title {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .status-banner.valid .status-title { color: #34D399; }
        .status-banner.expired .status-title { color: #FBBF24; }
        .status-banner.pending .status-title { color: #38BDF8; }
        .status-sub {
          font-size: 0.85rem;
          color: #9CA3AF;
          margin-top: 0.2rem;
        }

        .student-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.75rem;
        }
        .avatar-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EA580C 0%, #D97706 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .info-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #EA580C;
          font-weight: 800;
        }
        .student-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0.1rem 0 0.25rem;
        }
        .student-doc {
          font-size: 0.85rem;
          color: #9CA3AF;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 1.75rem;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .detail-item.full {
          grid-column: 1 / -1;
        }
        .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9CA3AF;
          font-weight: 600;
        }
        .val {
          font-size: 0.95rem;
          color: #E5E7EB;
          font-weight: 600;
        }
        .val.highlight {
          color: #F59E0B;
          font-size: 1.1rem;
          font-weight: 800;
        }
        .val.code {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          color: #F97316;
          width: fit-content;
        }
        .status-tag {
          display: inline-block;
          width: fit-content;
          padding: 0.15rem 0.6rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .status-tag.aprovado { background: rgba(16, 185, 129, 0.2); color: #34D399; }
        .status-tag.pendente { background: rgba(245, 158, 11, 0.2); color: #FBBF24; }
        .status-tag.rejeitado { background: rgba(239, 68, 68, 0.2); color: #FCA5A5; }

        .text-valid { color: #34D399; font-weight: 700; }
        .text-expired { color: #FBBF24; font-weight: 700; }

        .stamp-box {
          background: rgba(234, 88, 12, 0.06);
          border: 1px dashed rgba(234, 88, 12, 0.3);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
        }
        .stamp-seal {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .seal-icon {
          font-size: 2rem;
        }
        .seal-info strong {
          display: block;
          font-size: 0.9rem;
          color: #F59E0B;
        }
        .seal-info p {
          margin: 0.2rem 0 0;
          font-size: 0.8rem;
          color: #9CA3AF;
          line-height: 1.4;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%);
          color: white;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4);
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          color: #D1D5DB;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        @media print {
          .no-print { display: none !important; }
          .verify-container { background: white !important; padding: 0 !important; color: black !important; }
          .verify-card {
            background: white !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            color: black !important;
            max-width: 100% !important;
          }
          .brand-name { color: #000 !important; }
          .student-name { color: #000 !important; }
          .val { color: #000 !important; }
          .val.highlight { color: #d97706 !important; }
          .status-sub { color: #555 !important; }
          .student-doc { color: #555 !important; }
          .label { color: #666 !important; }
          .details-grid { background: #f8fafc !important; border: 1px solid #ddd !important; }
          .student-box { background: #f8fafc !important; border: 1px solid #ddd !important; }
        }

        @media (max-width: 640px) {
          .verify-card { padding: 1.5rem 1.25rem; }
          .details-grid { grid-template-columns: 1fr; }
          .actions { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
