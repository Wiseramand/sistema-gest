'use client';

import Image from 'next/image';

interface CertificateViewProps {
    certificate: any;
    user: any;
    validUntil: string;
}

export default function CertificateView({ certificate, user, validUntil }: CertificateViewProps) {
    return (
        <div className="validation-container">
            <div className="validation-card">
                <div className="card-header">
                    <div className="logo-icon">⚓</div>
                    <h1>Validação de Certificado</h1>
                    <p>MARÍTIMO TRAINING CENTER</p>
                </div>

                <div className="status-badge">
                    {certificate.status === 'APROVADO' ? (
                        <div className="badge approved">✅ Certificado Válido</div>
                    ) : certificate.status === 'PENDENTE' ? (
                        <div className="badge pending">⏳ Certificado Pendente de Aprovação</div>
                    ) : (
                        <div className="badge rejected">❌ Certificado Inválido / Rejeitado</div>
                    )}
                </div>

                <div className="card-body">
                    <div className="student-profile">
                        <div className="avatar-wrapper">
                            {user?.image ? (
                                <Image src={user.image} alt={certificate.studentName} width={120} height={120} className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {certificate.studentName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h2>{certificate.studentName}</h2>
                    </div>

                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="label">Curso</span>
                            <span className="value course">{certificate.courseTitle}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Data de Emissão</span>
                            <span className="value">{new Date(certificate.generatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Válido até</span>
                            <span className="value highlight">{validUntil}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">ID do Certificado</span>
                            <span className="value mono">{certificate.id}</span>
                        </div>
                        <div className="detail-item full-width">
                            <span className="label">Instituição</span>
                            <span className="value">MARÍTIMO TRAINING CENTER</span>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <p>Este é um documento oficial gerado digitalmente.</p>
                </div>
            </div>

            <style jsx>{`
                .validation-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    font-family: 'Inter', sans-serif;
                }
                .validation-card {
                    background: white;
                    width: 100%;
                    max-width: 600px;
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    overflow: hidden;
                }
                .card-header {
                    background: var(--navy-deep, #0a192f);
                    color: white;
                    padding: 2.5rem 2rem;
                    text-align: center;
                    position: relative;
                }
                .logo-icon {
                    font-size: 3rem;
                    margin-bottom: 0.5rem;
                }
                .card-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .card-header p {
                    margin: 0.5rem 0 0;
                    color: var(--sand-gold, #eab308);
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                .status-badge {
                    display: flex;
                    justify-content: center;
                    margin-top: -1.2rem;
                    position: relative;
                    z-index: 10;
                }
                .badge {
                    padding: 0.6rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .badge.approved { background: #10b981; color: white; }
                .badge.pending { background: #f59e0b; color: white; }
                .badge.rejected { background: #ef4444; color: white; }
                
                .card-body {
                    padding: 2.5rem 2rem;
                }
                .student-profile {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .avatar-wrapper {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 1.5rem;
                    border-radius: 50%;
                    padding: 4px;
                    background: linear-gradient(135deg, var(--ocean-blue, #0ea5e9), var(--navy-deep, #0a192f));
                }
                .avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid white;
                }
                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--navy-deep, #0a192f);
                    border: 3px solid white;
                }
                .student-profile h2 {
                    margin: 0;
                    color: var(--navy-deep, #0a192f);
                    font-size: 1.8rem;
                    font-weight: 800;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .label {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .value {
                    font-size: 1rem;
                    color: #0f172a;
                    font-weight: 600;
                }
                .value.course {
                    color: var(--ocean-blue, #0ea5e9);
                    font-weight: 800;
                    font-size: 1.1rem;
                }
                .value.highlight {
                    color: #10b981;
                    font-weight: 800;
                }
                .value.mono {
                    font-family: monospace;
                    color: #64748b;
                    font-size: 0.9rem;
                    background: #e2e8f0;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    display: inline-block;
                    width: fit-content;
                }

                .card-footer {
                    text-align: center;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
