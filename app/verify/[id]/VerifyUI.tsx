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
          .error-body { text-align: left; }
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
          .help-box h3 { font-size: 0.95rem; color: #F59E0B; margin: 0 0 0.75rem; }
          .help-box ul { margin: 0; padding-left: 1.25rem; color: #9CA3AF; font-size: 0.875rem; line-height: 1.6; }
          .actions { display: flex; flex-direction: column; gap: 0.75rem; }
          .btn-primary {
            display: block; text-align: center; background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%);
            color: white; padding: 0.875rem; border-radius: 12px; font-weight: 700; text-decoration: none; transition: all 0.2s;
          }
          .btn-secondary {
            display: block; text-align: center; background: rgba(255, 255, 255, 0.05); color: #D1D5DB;
            padding: 0.875rem; border-radius: 12px; font-weight: 600; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.2s;
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

  // 1. Nome completo do formando
  const studentName = certificate.studentName || student?.name || 'Formando Registado';
  const studentDoc = student?.bi || student?.idDocument || '';

  // 2. Foto do formando
  const studentPhoto = student?.photo || student?.image || null;

  // 4. Certificação Marítima (Bahamas ou Vanuatu)
  const rawCertType = certificate.certification || certificate.certificationType || certificate.flagState || 'Bahamas';
  const maritimeCertification = rawCertType.toLowerCase().includes('vanuatu') ? 'Vanuatu' : 'Bahamas';
  const flagEmoji = maritimeCertification === 'Vanuatu' ? '🇻🇺' : '🇧🇸';
  const flagAuthority = maritimeCertification === 'Vanuatu' ? 'Vanuatu Maritime Services (VMSL)' : 'Bahamas Maritime Authority (BMA)';

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

        {/* CARTÃO DE COMPROVAÇÃO DE DADOS SOLICITADOS */}
        <div className="proof-card">
          {/* 1. Nome Completo e 2. Foto do Formando */}
          <div className="student-profile-header">
            <div className="avatar-wrapper">
              {studentPhoto ? (
                <img src={studentPhoto} alt={studentName} className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <span>{studentName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="avatar-seal-badge">⚓</div>
            </div>

            <div className="student-meta">
              <span className="section-badge">👤 FORMANDO DIPLOMADO</span>
              <h1 className="student-full-name">{studentName}</h1>
              {studentDoc && <span className="student-doc-tag">Documento ID / BI: {studentDoc}</span>}
            </div>
          </div>

          <div className="proof-divider"></div>

          {/* Grid de Comprovação: Curso, Certificação Marítima (Bahamas/Vanuatu) e Validade */}
          <div className="proof-grid">
            {/* 3. Curso Que Ele Fez */}
            <div className="proof-box full-width">
              <span className="box-label">🎓 CURSO / FORMAÇÃO REALIZADA</span>
              <div className="box-value course-title">{certificate.courseTitle}</div>
            </div>

            {/* 4. Certificação Marítima (Bahamas ou Vanuatu) */}
            <div className="proof-box flag-box">
              <span className="box-label">⚓ CERTIFICAÇÃO MARÍTIMA</span>
              <div className={`flag-badge-large ${maritimeCertification.toLowerCase()}`}>
                <span className="flag-emoji">{flagEmoji}</span>
                <div className="flag-text">
                  <span className="flag-country">{maritimeCertification}</span>
                  <span className="flag-authority">{flagAuthority}</span>
                </div>
              </div>
            </div>

            {/* 5. Data de Validade do Certificado */}
            <div className="proof-box validity-box">
              <span className="box-label">📅 DATA DE VALIDADE</span>
              <div className={`box-value validity-date ${isExpired ? 'expired-text' : 'valid-text'}`}>
                {validUntilFormatted}
              </div>
              <span className="validity-badge">
                {isExpired ? '⚠️ Expirado' : '✅ Válido no Sistema'}
              </span>
            </div>

            {/* ID do Certificado e Data de Emissão */}
            <div className="proof-box">
              <span className="box-label">🆔 ID DO CERTIFICADO</span>
              <div className="box-value code-value">{certificate.id}</div>
            </div>

            <div className="proof-box">
              <span className="box-label">🗓️ DATA DE EMISSÃO</span>
              <div className="box-value">{issueDateFormatted}</div>
            </div>
          </div>
        </div>

        {/* Digital Verification Stamp */}
        <div className="stamp-box">
          <div className="stamp-seal">
            <span className="seal-icon">🛡️</span>
            <div className="seal-info">
              <strong>Homologação Digital Marítima Confirmada</strong>
              <p>Os dados apresentados acima foram verificados em tempo real na base de dados do Marítimo Training Center.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="actions no-print">
          <button onClick={() => window.print()} className="btn-primary">
            🖨️ Imprimir / Guardar Comprovativo PDF
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
          max-width: 680px;
          width: 100%;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(16px);
        }

        .brand-header {
          text-align: center;
          margin-bottom: 1.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1.25rem;
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
        .status-icon { font-size: 2.25rem; }
        .status-title {
          font-size: 1.05rem;
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

        /* CARTÃO DE COMPROVAÇÃO DE DADOS */
        .proof-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(234, 88, 12, 0.2);
          border-radius: 20px;
          padding: 1.75rem;
          margin-bottom: 2rem;
        }

        .student-profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .avatar-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #EA580C;
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        }
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #EA580C 0%, #D97706 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          border: 3px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        }
        .avatar-seal-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #EA580C;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          border: 2px solid #1C0F0A;
        }

        .student-meta {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .section-badge {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #EA580C;
          font-weight: 800;
        }
        .student-full-name {
          font-size: 1.6rem;
          font-weight: 900;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.2;
        }
        .student-doc-tag {
          font-size: 0.85rem;
          color: #9CA3AF;
        }

        .proof-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 1.5rem 0;
        }

        .proof-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .proof-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .proof-box.full-width {
          grid-column: 1 / -1;
        }
        .box-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.75px;
          color: #9CA3AF;
          font-weight: 700;
        }
        .box-value {
          font-size: 1.05rem;
          color: #F3F4F6;
          font-weight: 700;
        }
        .box-value.course-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #F59E0B;
          line-height: 1.3;
        }
        .box-value.code-value {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          color: #F97316;
          width: fit-content;
        }

        /* Flag Badge for Bahamas / Vanuatu */
        .flag-box {
          background: linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%);
          border: 1px solid rgba(234, 88, 12, 0.3);
        }
        .flag-badge-large {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-top: 0.2rem;
        }
        .flag-emoji {
          font-size: 2.2rem;
          line-height: 1;
        }
        .flag-text {
          display: flex;
          flex-direction: column;
        }
        .flag-country {
          font-size: 1.2rem;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: 0.5px;
        }
        .flag-authority {
          font-size: 0.75rem;
          color: #F59E0B;
          font-weight: 600;
        }

        /* Validity Date */
        .validity-box {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .validity-date {
          font-size: 1.25rem;
          font-weight: 900;
        }
        .valid-text { color: #34D399; }
        .expired-text { color: #FBBF24; }
        .validity-badge {
          font-size: 0.75rem;
          color: #34D399;
          font-weight: 700;
        }

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
        .seal-icon { font-size: 2rem; }
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
          .proof-card { background: white !important; border: 1px solid #ccc !important; }
          .proof-box { background: #f8fafc !important; border: 1px solid #eee !important; }
          .student-full-name { color: #000 !important; }
          .flag-country { color: #000 !important; }
          .brand-name { color: #000 !important; }
          .box-value { color: #000 !important; }
          .box-value.course-title { color: #d97706 !important; }
        }

        /* ── MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
          .verify-container {
            padding: 1rem 0.75rem;
            align-items: flex-start;
          }
          .verify-card {
            padding: 1.25rem 1rem;
            border-radius: 16px;
          }

          /* Brand */
          .logo-badge { font-size: 1.75rem; padding: 0.5rem; }
          .brand-name { font-size: 1.1rem; letter-spacing: 0.5px; }
          .brand-tag { font-size: 0.7rem; }

          /* Status Banner */
          .status-banner {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
            padding: 1rem;
          }
          .status-icon { font-size: 1.75rem; }
          .status-title { font-size: 0.9rem; }
          .status-sub { font-size: 0.78rem; }

          /* Proof card */
          .proof-card { padding: 1.1rem 0.9rem; border-radius: 14px; }

          /* Student profile: stack vertically */
          .student-profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.9rem;
          }
          .avatar-wrapper { width: 72px; height: 72px; }
          .avatar-placeholder { font-size: 1.75rem; }
          .student-full-name {
            font-size: 1.2rem;
            word-break: break-word;
          }
          .section-badge { font-size: 0.68rem; }
          .student-doc-tag { font-size: 0.78rem; }

          /* Proof grid: 1 column */
          .proof-grid { grid-template-columns: 1fr; gap: 0.75rem; }
          .proof-box { padding: 0.9rem; border-radius: 12px; }
          .box-label { font-size: 0.68rem; }
          .box-value { font-size: 0.95rem; }
          .box-value.course-title { font-size: 1.05rem; }
          .box-value.code-value {
            font-size: 0.72rem;
            word-break: break-all;
            white-space: normal;
            width: 100%;
          }

          /* Flag badge */
          .flag-badge-large { gap: 0.5rem; }
          .flag-emoji { font-size: 1.75rem; }
          .flag-country { font-size: 1rem; }
          .flag-authority { font-size: 0.68rem; }

          /* Validity */
          .validity-date { font-size: 1rem; }

          /* Stamp */
          .stamp-box { padding: 0.85rem; }
          .stamp-seal {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .seal-icon { font-size: 1.5rem; }
          .seal-info strong { font-size: 0.82rem; }
          .seal-info p { font-size: 0.75rem; }

          /* Buttons */
          .actions { grid-template-columns: 1fr; gap: 0.65rem; }
          .btn-primary, .btn-secondary {
            padding: 0.8rem 0.75rem;
            font-size: 0.85rem;
          }
        }

        /* ── SMALL TABLETS (481–640px) ── */
        @media (min-width: 481px) and (max-width: 640px) {
          .verify-container { padding: 1.5rem 1rem; }
          .verify-card { padding: 1.5rem 1.25rem; border-radius: 18px; }

          .status-banner { gap: 0.75rem; padding: 1rem 1.25rem; }
          .status-title { font-size: 0.95rem; }

          .student-profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
          }
          .student-full-name { font-size: 1.35rem; }

          .proof-grid { grid-template-columns: 1fr; gap: 0.85rem; }
          .box-value.code-value { font-size: 0.78rem; word-break: break-all; white-space: normal; }

          .actions { grid-template-columns: 1fr; }
          .btn-primary, .btn-secondary { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}
