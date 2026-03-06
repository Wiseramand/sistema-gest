'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { QRCodeSVG } from 'qrcode.react';

interface Certificate {
    id: string; studentId: string; studentName: string;
    courseTitle: string; matriculationId: string; status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
    generatedAt: string; approvedAt: string | null; approvedBy: string | null;
    rejectedAt: string | null; rejectionReason: string | null;
}

interface Matriculation { id: string; studentName: string; course: string; }
interface Course { id: string; title: string; status: string; }

export default function CertificatesPage() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [origin, setOrigin] = useState('');
    const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

    useEffect(() => {
        setMounted(true);
        setOrigin(window.location.origin);
    }, []);

    const [certs, setCerts] = useState<Certificate[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [matriculations, setMatriculations] = useState<Matriculation[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('ALL');
    const [genCourseId, setGenCourseId] = useState('');
    const [generating, setGenerating] = useState(false);
    const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
    const [viewingCert, setViewingCert] = useState<Certificate | null>(null);


    const fetchAll = async () => {
        setLoading(true);
        try {
            const [c, co, m] = await Promise.all([
                fetch('/api/certificates').then(r => r.json()),
                fetch('/api/courses').then(r => r.json()),
                fetch('/api/matriculations').then(r => r.json()),
            ]);
            setCerts(Array.isArray(c) ? c : []);
            setCourses(Array.isArray(co) ? co : []);
            setMatriculations(Array.isArray(m) ? m : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const generateForCourse = async () => {
        if (!genCourseId) return;
        setGenerating(true);
        const course = courses.find(c => c.id === genCourseId);
        if (!course) { setGenerating(false); return; }
        const relatedMatriculations = matriculations.filter(m => m.course === course.title);
        if (relatedMatriculations.length === 0) {
            alert('Nenhum aluno matriculado neste curso.');
            setGenerating(false);
            return;
        }
        await fetch('/api/certificates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseTitle: course.title, matriculationIds: relatedMatriculations.map(m => m.id) })
        });
        fetchAll();
        setGenCourseId('');
        setGenerating(false);
    };

    const handleApprove = async (id: string) => {
        await fetch(`/api/certificates/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', approvedBy: session?.user?.name || 'Super Admin' })
        });
        fetchAll();
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        await fetch(`/api/certificates/${rejectModal.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject', reason: rejectModal.reason })
        });
        setRejectModal(null);
        fetchAll();
    };
    const [editValidity, setEditValidity] = useState<{ id: string; date: string } | null>(null);

    const handleUpdateValidity = async () => {
        if (!editValidity) return;
        await fetch(`/api/certificates/${editValidity.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-validity', validUntil: editValidity.date })
        });
        setEditValidity(null);
        fetchAll();
    };

    const isExpiringSoon = (dateStr: string) => {
        if (!dateStr) return false;
        const expiryDate = new Date(dateStr);
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);
        return expiryDate <= sixMonthsFromNow && expiryDate > today;
    };

    const isExpired = (dateStr: string) => {
        if (!dateStr) return false;
        return new Date(dateStr) <= new Date();
    };

    const filtered = statusFilter === 'ALL' ? certs : certs.filter(c => c.status === statusFilter);

    const statusCount = {
        pending: certs.filter(c => c.status === 'PENDENTE').length,
        approved: certs.filter(c => c.status === 'APROVADO').length,
        rejected: certs.filter(c => c.status === 'REJEITADO').length,
    };

    return (
        <div className="page-wrapper">
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Certificados</h1>
                    <p>Geração e aprovação de certificados de conclusão.</p>
                </div>
            </div>

            {/* Generation Panel */}
            <div className="gen-panel">
                <div className="gen-info">
                    <h3>🎓 Gerar Certificados para Curso</h3>
                    <p>Selecione um curso finalizado para gerar os certificados de todos os alunos matriculados.</p>
                </div>
                <div className="gen-controls">
                    <select value={genCourseId} onChange={e => setGenCourseId(e.target.value)}>
                        <option value="">Selecionar curso...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <button className="gen-btn" onClick={generateForCourse} disabled={!genCourseId || generating}>
                        {generating ? 'A gerar...' : '⚡ Gerar Certificados'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                {[
                    { label: 'Pendentes', value: statusCount.pending, color: '#f59e0b', f: 'PENDENTE' },
                    { label: 'Aprovados', value: statusCount.approved, color: '#10b981', f: 'APROVADO' },
                    { label: 'Rejeitados', value: statusCount.rejected, color: '#ef4444', f: 'REJEITADO' },
                ].map((s, i) => (
                    <div key={i} className={`stat-card ${statusFilter === s.f ? 'selected' : ''}`}
                        style={{ borderTopColor: s.color, cursor: 'pointer' }}
                        onClick={() => setStatusFilter(statusFilter === s.f ? 'ALL' : s.f as any)}>
                        <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? <div className="loader">A carregar...</div> : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Curso</th>
                                <th>Gerado em</th>
                                <th>Validade</th>
                                <th>Status</th>
                                {isSuperAdmin && <th className="align-right">Ações (Super Admin)</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(cert => (
                                <tr key={cert.id}>
                                    <td className="bold">{cert.studentName}</td>
                                    <td>{cert.courseTitle}</td>
                                    <td>{new Date((cert as any).generatedAt).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <div className="validity-cell">
                                            <span className={`validity-date ${isExpired((cert as any).validUntil) ? 'expired' : isExpiringSoon((cert as any).validUntil) ? 'warning' : ''}`}>
                                                {new Date((cert as any).validUntil).toLocaleDateString('pt-BR')}
                                            </span>
                                            {isSuperAdmin && (
                                                <button className="edit-mini" onClick={() => setEditValidity({ id: cert.id, date: (cert as any).validUntil.split('T')[0] })}>
                                                    ✏️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`cert-badge ${cert.status.toLowerCase()}`}>{cert.status}</span>
                                        {cert.status === 'APROVADO' && <div className="cert-sub">por {cert.approvedBy}</div>}
                                        {cert.status === 'REJEITADO' && cert.rejectionReason && <div className="cert-sub red">{cert.rejectionReason}</div>}
                                    </td>
                                    <td className="align-right">
                                        <div className="row-actions">
                                            <button className="row-btn view" onClick={() => setViewingCert(cert)}>👁️ Visualizar</button>
                                            {cert.status === 'PENDENTE' && (
                                                <>
                                                    <button className="row-btn approve" onClick={() => handleApprove(cert.id)}>✓ Aprovar</button>
                                                    <button className="row-btn reject" onClick={() => setRejectModal({ id: cert.id, reason: '' })}>✗ Rejeitar</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={isSuperAdmin ? 6 : 5} className="empty">
                                    {certs.length === 0 ? 'Nenhum certificado gerado ainda. Use o painel acima para gerar.' : 'Nenhum certificado com este filtro.'}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Validity Edit Modal */}
            {editValidity && (
                <div className="overlay">
                    <div className="small-modal">
                        <h3>Editar Validade do Certificado</h3>
                        <p>Ajuste a data de expiração para este estudante.</p>
                        <input
                            type="date"
                            className="form-date"
                            value={editValidity.date}
                            onChange={e => setEditValidity({ ...editValidity, date: e.target.value })}
                        />
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setEditValidity(null)}>Cancelar</button>
                            <button className="btn-save" onClick={handleUpdateValidity}>Salvar Alteração</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificate Viewing Modal (Mockup) */}
            {viewingCert && (
                <div className="overlay" onClick={() => setViewingCert(null)}>
                    <div className="certificate-modal" onClick={e => e.stopPropagation()}>
                        <div className="cert-mockup">
                            <div className="cert-border">
                                <div className="cert-inner-border">
                                    <div className="cert-content">
                                        <div className="cert-header">
                                            <div className="cert-logo">⚓</div>
                                            <div className="cert-institution">MARÍTIMO TRAINING CENTER</div>
                                            <div className="cert-subtitle">CENTRO DE FORMAÇÃO PROFISSIONAL NÁUTICA</div>
                                        </div>

                                        <div className="cert-body">
                                            <div className="cert-title">CERTIFICADO DE CONCLUSÃO</div>
                                            <div className="cert-text">
                                                Certificamos para os devidos fins que o(a) aluno(a)
                                            </div>
                                            <div className="cert-student-name">{viewingCert.studentName}</div>
                                            <div className="cert-text">
                                                concluiu com aproveitamento o curso de
                                            </div>
                                            <div className="cert-course-name">{viewingCert.courseTitle}</div>
                                            <div className="cert-text">
                                                realizado em {new Date(viewingCert.generatedAt).toLocaleDateString('pt-BR')},
                                                cumprindo integralmente a carga horária e os requisitos exigidos.
                                            </div>
                                        </div>

                                        <div className="cert-footer">
                                            <div className="cert-date">
                                                Funchal, {new Date().toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="cert-signatures">
                                                <div className="signature">
                                                    <div className="sig-line"></div>
                                                    <div className="sig-name">Direção Pedagógica</div>
                                                </div>
                                                <div className="cert-seal">
                                                    <div className="seal-outer">
                                                        <div className="seal-inner">OFFICIAL SEAL</div>
                                                    </div>
                                                </div>
                                                <div className="signature">
                                                    <div className="sig-line"></div>
                                                    <div className="sig-name">O Formador</div>
                                                </div>
                                            </div>
                                            <div className="cert-bottom-info">
                                                <div className="cert-id-print">ID: {viewingCert.id}</div>
                                                <div className="cert-qr-container">
                                                    {mounted && (
                                                        <QRCodeSVG
                                                            value={`${origin || (typeof window !== 'undefined' ? window.location.origin : '')}/verify/${viewingCert.id}`}
                                                            size={100}
                                                            level="H"
                                                            includeMargin={true}
                                                        />
                                                    )}
                                                    <div className="qr-text">VERIFICAÇÃO OFICIAL</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Watermark Element */}
                                    <div className="cert-watermark">⚓</div>
                                </div>
                            </div>
                        </div>
                        <div className="cert-modal-actions">
                            <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
                            <button className="btn-close-cert" onClick={() => setViewingCert(null)}>Fechar Visualização</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="overlay">
                    <div className="small-modal">
                        <h3>Motivo de Rejeição</h3>
                        <p>Descreva o motivo pelo qual este certificado está sendo rejeitado.</p>
                        <textarea value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })} placeholder="Ex: Aluno não completou todas as horas lectivas..." rows={4}></textarea>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setRejectModal(null)}>Cancelar</button>
                            <button className="btn-reject" onClick={handleReject}>Confirmar Rejeição</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; }

                .gen-panel { background: linear-gradient(135deg, var(--navy-deep) 0%, #1e40af 100%); border-radius: 16px; padding: 2rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; margin-bottom: 2rem; color: white; flex-wrap: wrap; }
                .gen-info h3 { margin: 0 0 0.35rem; font-size: 1.1rem; }
                .gen-info p { margin: 0; font-size: 0.88rem; opacity: 0.8; }
                .gen-controls { display: flex; gap: 1rem; align-items: center; }
                .gen-controls select { padding: 0.75rem 1rem; border-radius: 10px; border: none; font-size: 0.9rem; min-width: 220px; }
                .gen-btn { background: var(--sand-gold); color: var(--navy-deep); border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.2s; white-space: nowrap; }
                .gen-btn:hover:not(:disabled) { brightness: 1.1; transform: translateY(-1px); }
                .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
                .stat-card { background: white; border: 1px solid #e2e8f0; border-top: 4px solid; border-radius: 12px; padding: 1.5rem; transition: 0.2s; }
                .stat-card.selected { box-shadow: 0 0 0 2px var(--ocean-blue); }
                .stat-val { font-size: 2.5rem; font-weight: 900; }
                .stat-label { font-size: 0.85rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; }

                .loader { padding: 3rem; text-align: center; color: #94a3b8; }
                .table-wrap { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; vertical-align: middle; }
                .data-table tr:last-child td { border-bottom: none; }
                .bold { font-weight: 700; color: var(--navy-deep); }
                .empty { text-align: center; color: #94a3b8; padding: 3rem !important; }

                .cert-badge { padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
                .cert-badge.pendente { background: #fffbeb; color: #d97706; }
                .cert-badge.aprovado { background: #ecfdf5; color: #059669; }
                .cert-badge.rejeitado { background: #fef2f2; color: #dc2626; }
                .cert-sub { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }
                .cert-sub.red { color: #dc2626; }

                .align-right { text-align: right; }
                .row-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
                .row-btn { border: none; cursor: pointer; font-weight: 700; font-size: 0.82rem; padding: 0.45rem 0.85rem; border-radius: 8px; transition: 0.2s; }
                .row-btn.approve { background: #ecfdf5; color: #059669; }
                .row-btn.approve:hover { background: #d1fae5; }
                .row-btn.reject { background: #fef2f2; color: #dc2626; }
                .row-btn.reject:hover { background: #fee2e2; }
                .row-btn.view { background: #f0f9ff; color: var(--ocean-blue); }
                .row-btn.view:hover { background: #e0f2fe; }

                /* Certificate Mockup Styles */
                .certificate-modal { background: white; width: 95%; max-width: 900px; border-radius: 20px; padding: 2rem; position: relative; max-height: 95vh; overflow-y: auto; }
                .cert-mockup { background: #fdfdfd; padding: 2rem; box-shadow: 0 0 20px rgba(0,0,0,0.1); border: 1px solid #ddd; position: relative; aspect-ratio: 1.414 / 1; }
                .cert-border { border: 15px double var(--navy-deep); height: 100%; padding: 10px; box-sizing: border-box; }
                .cert-inner-border { border: 2px solid var(--sand-gold); height: 100%; padding: 3rem; box-sizing: border-box; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; overflow: hidden; }
                
                .cert-watermark { position: absolute; font-size: 25rem; color: rgba(0,0,0,0.03); z-index: 0; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); pointer-events: none; }
                .cert-content { position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }

                .cert-header { margin-bottom: 1.5rem; }
                .cert-logo { font-size: 3rem; margin-bottom: 0.5rem; }
                .cert-institution { font-family: 'Georgia', serif; font-size: 2rem; font-weight: 900; color: var(--navy-deep); letter-spacing: 2px; }
                .cert-subtitle { font-size: 0.8rem; font-weight: 700; color: var(--sand-gold); margin-top: 0.5rem; letter-spacing: 3px; }

                .cert-body { margin: 2rem 0; }
                .cert-title { font-family: 'Georgia', serif; font-size: 2.5rem; color: var(--navy-deep); font-weight: 800; margin-bottom: 2rem; position: relative; display: inline-block; }
                .cert-title::after { content: ''; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 60%; height: 2px; background: var(--sand-gold); }
                .cert-text { font-size: 1.1rem; color: #444; margin: 1rem 0; font-style: italic; }
                .cert-student-name { font-family: 'Times New Roman', serif; font-size: 3rem; font-weight: 900; color: #000; margin: 1rem 0; text-decoration: underline; text-decoration-color: var(--sand-gold); text-underline-offset: 8px; }
                .cert-course-name { font-size: 1.8rem; font-weight: 800; color: var(--navy-deep); margin: 0.5rem 0; }

                .cert-footer { width: 100%; margin-top: 2rem; }
                .cert-date { font-size: 1rem; font-weight: 600; color: #666; margin-bottom: 2rem; }
                .cert-signatures { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-bottom: 1.5rem; }
                .signature { width: 220px; }
                .sig-line { border-top: 1px solid #000; margin-bottom: 0.5rem; width: 100%; }
                .sig-name { font-size: 0.8rem; font-weight: 700; color: #333; }
                
                .cert-seal { width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; position: relative; }
                .seal-outer { width: 80px; height: 80px; border: 4px solid var(--sand-gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(234, 179, 8, 0.1); transform: rotate(-10deg); }
                .seal-inner { font-size: 0.6rem; font-weight: 900; color: var(--sand-gold); text-align: center; }

                .cert-bottom-info { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; border-top: 2px solid var(--navy-deep); padding-top: 1.5rem; margin-top: 1.5rem; }
                .cert-id-print { font-size: 0.75rem; color: #444; font-weight: 800; font-family: monospace; }
                .cert-qr-container { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 10px; background: white; border: 2px solid var(--navy-deep); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .qr-text { font-size: 0.5rem; color: var(--navy-deep); font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; }

                .cert-modal-actions { display: flex; justify-content: center; gap: 1.5rem; margin-top: 2rem; }
                .btn-print { background: var(--ocean-blue); color: white; border: none; padding: 0.85rem 2rem; border-radius: 50px; font-weight: 700; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(0, 116, 217, 0.2); }
                .btn-print:hover { background: var(--navy-deep); transform: translateY(-2px); }
                .btn-close-cert { background: #f1f5f9; color: #64748b; border: none; padding: 0.85rem 2rem; border-radius: 50px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-close-cert:hover { background: #e2e8f0; }

                @media print {
                    :global(body) { background: white !important; }
                    :global(.sidebar), :global(.admin-header), .page-top, .gen-panel, .stats-row, .table-wrap, .cert-modal-actions { display: none !important; }
                    .overlay { background: white !important; backdrop-filter: none !important; position: static !important; padding: 0 !important; }
                    .certificate-modal { box-shadow: none !important; width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important; }
                    .cert-mockup { border: none !important; box-shadow: none !important; width: 100% !important; padding: 0 !important; }
+                    .cert-qrcode { display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; width: auto !important; }
+                    .cert-qrcode svg { display: block !important; visibility: visible !important; }
                 }

                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .small-modal { background: white; width: 100%; max-width: 480px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.25); }
                .small-modal h3 { margin: 0 0 0.5rem; color: var(--navy-deep); font-weight: 800; }
                .small-modal p { margin: 0 0 1.25rem; color: #64748b; font-size: 0.9rem; }
                .small-modal textarea { width: 100%; padding: 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 10px; resize: vertical; font-family: inherit; font-size: 0.9rem; background: #f8fafc; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.25rem; }
                .btn-cancel { padding: 0.75rem 1.5rem; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; }
                .btn-reject { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; background: #dc2626; color: white; font-weight: 700; cursor: pointer; }
                .btn-save { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; background: var(--navy-deep); color: white; font-weight: 700; cursor: pointer; }

                .validity-cell { display: flex; align-items: center; gap: 0.5rem; }
                .validity-date { font-weight: 600; font-size: 0.85rem; }
                .validity-date.warning { color: #d97706; padding: 2px 6px; background: #fffbeb; border-radius: 4px; }
                .validity-date.expired { color: #dc2626; padding: 2px 6px; background: #fef2f2; border-radius: 4px; }
                .edit-mini { background: none; border: none; cursor: pointer; font-size: 0.8rem; padding: 2px; opacity: 0.5; transition: 0.2s; }
                .edit-mini:hover { opacity: 1; transform: scale(1.2); }
                .form-date { width: 100%; padding: 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-family: inherit; margin-bottom: 1rem; }

            `}</style>
        </div>
    );
}
