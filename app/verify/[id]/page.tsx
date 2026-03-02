'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Certificate {
    id: string;
    studentName: string;
    courseTitle: string;
    status: string;
    approvedAt: string;
    validUntil: string;
}

export default function VerifyCertificatePage() {
    const { id } = useParams();
    const [cert, setCert] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCertificate();
        }
    }, [id]);

    async function fetchCertificate() {
        try {
            const res = await fetch(`/api/certificates/${id}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error('Certificado não encontrado ou inválido.');
                throw new Error('Erro ao verificar certificado.');
            }
            const data = await res.json();
            setCert(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const isExpired = (date: string) => new Date(date) < new Date();

    return (
        <div className="verify-container">
            <div className="verify-card shadow-premium">
                <div className="verify-header">
                    <div className="maritime-logo">⚓</div>
                    <h1>Verificação de Certificado</h1>
                    <p className="subtitle">Marítimo Training Center - Sistema de Autenticidade</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>A validar autenticidade...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h2>Documento Não Validado</h2>
                        <p>{error}</p>
                        <Link href="/" className="back-link">Voltar ao Início</Link>
                    </div>
                ) : cert ? (
                    <div className="success-state">
                        <div className="status-banner authentic">
                            <span className="check-icon">✓</span>
                            <span>CERTIFICADO AUTÊNTICO</span>
                        </div>

                        <div className="cert-details">
                            <div className="detail-row">
                                <span className="label">Aluno(a):</span>
                                <span className="value">{cert.studentName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Curso:</span>
                                <span className="value">{cert.courseTitle}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Data de Emissão:</span>
                                <span className="value">{new Date(cert.approvedAt || '').toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Válido Até:</span>
                                <span className={`value ${isExpired(cert.validUntil) ? 'expired' : ''}`}>
                                    {new Date(cert.validUntil).toLocaleDateString('pt-BR')}
                                    {isExpired(cert.validUntil) && ' (EXPIRADO)'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Código de Verificação:</span>
                                <span className="value mono">{cert.id}</span>
                            </div>
                        </div>

                        <div className="footer-notice">
                            <p>Este documento foi emitido eletronicamente e sua autenticidade pode ser confirmada através deste portal oficial.</p>
                        </div>
                    </div>
                ) : null}
            </div>

            <style jsx>{`
                .verify-container {
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, #001f3f, #000);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .verify-card {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 3rem;
                    text-align: center;
                    overflow: hidden;
                }
                .verify-header { margin-bottom: 2.5rem; }
                .maritime-logo { font-size: 3.5rem; margin-bottom: 1rem; }
                h1 { font-size: 1.5rem; color: #001f3f; font-weight: 800; margin-bottom: 0.5rem; }
                .subtitle { color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

                .status-banner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                }
                .status-banner.authentic { background: #ecfdf5; color: #059669; border: 1.5px solid #10b981; }
                .check-icon { font-size: 1.2rem; }

                .cert-details { text-align: left; background: #f8fafc; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; }
                .detail-row { margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
                .detail-row:last-child { border-bottom: none; margin-bottom: 0; }
                .label { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; }
                .value { font-size: 1rem; color: #1e293b; font-weight: 700; }
                .value.mono { font-family: monospace; color: #64748b; }
                .value.expired { color: #dc2626; }

                .footer-notice { color: #94a3b8; font-size: 0.75rem; line-height: 1.5; font-style: italic; }

                .loading-state { padding: 3rem 0; }
                .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #001f3f; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                .error-state { color: #dc2626; }
                .error-icon { font-size: 4rem; margin-bottom: 1rem; }
                .back-link { display: inline-block; margin-top: 1.5rem; color: #001f3f; text-decoration: underline; font-weight: 700; }
            `}</style>
        </div>
    );
}
