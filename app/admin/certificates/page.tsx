'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { QRCodeSVG } from 'qrcode.react';

interface Certificate {
    id: string;
    studentId: string;
    studentName: string;
    courseTitle: string;
    matriculationId: string | null;
    status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
    certification?: string | null;
    generatedAt: string;
    validUntil: string;
    approvedAt: string | null;
    approvedBy: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
}

interface Matriculation {
    id: string;
    studentId?: string;
    studentName?: string;
    student?: string;
    course?: string;
    courseTitle?: string;
}

interface Course {
    id: string;
    title: string;
    status: string;
}

interface Student {
    id: string;
    name: string;
    course?: string;
}

export default function CertificatesPage() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setMounted(true);
        setOrigin(window.location.origin);
    }, []);

    const [certs, setCerts] = useState<Certificate[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [matriculations, setMatriculations] = useState<Matriculation[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('ALL');

    // Controls
    const [genCourseId, setGenCourseId] = useState('');
    const [genStudentId, setGenStudentId] = useState('');
    const [selectedCertType, setSelectedCertType] = useState<'Bahamas' | 'Vanuatu'>('Bahamas');
    const [generating, setGenerating] = useState(false);

    // Modals
    const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
    const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
    const [editValidity, setEditValidity] = useState<{ id: string; date: string } | null>(null);
    const [manualModalOpen, setManualModalOpen] = useState(false);

    const [manualForm, setManualForm] = useState({
        studentName: '',
        courseTitle: '',
        certification: 'Bahamas',
        validUntilYears: '5',
        status: 'APROVADO'
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [c, co, m, s] = await Promise.all([
                fetch('/api/certificates', { cache: 'no-store' }).then(r => r.json()),
                fetch('/api/courses', { cache: 'no-store' }).then(r => r.json()),
                fetch('/api/matriculations', { cache: 'no-store' }).then(r => r.json()),
                fetch('/api/students', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
            ]);
            setCerts(Array.isArray(c) ? c : []);
            setCourses(Array.isArray(co) ? co : []);
            setMatriculations(Array.isArray(m) ? m : []);
            setStudents(Array.isArray(s) ? s : []);
        } catch (e) {
            console.error('Error fetching certificates data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const generateForCourse = async () => {
        if (!genCourseId) return;
        setGenerating(true);
        try {
            const course = courses.find(c => c.id === genCourseId);
            if (!course) { setGenerating(false); return; }

            const relatedMatriculations = matriculations.filter(m =>
                m.course === course.title ||
                m.courseTitle === course.title ||
                (m as any).courseId === course.id
            );

            if (relatedMatriculations.length === 0) {
                alert(`Nenhum aluno matriculado no curso "${course.title}". Utilize a opção "Emitir Manualmente" para criar diretamente para qualquer formando.`);
                setGenerating(false);
                return;
            }

            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseTitle: course.title,
                    matriculationIds: relatedMatriculations.map(m => m.id),
                    certification: selectedCertType
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Sucesso! ${data.created || relatedMatriculations.length} certificado(s) gerado(s) com sucesso.`);
                fetchAll();
                setGenCourseId('');
            } else {
                alert(`Erro: ${data.error || 'Não foi possível gerar os certificados.'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao gerar certificados.');
        } finally {
            setGenerating(false);
        }
    };

    const generateForStudent = async () => {
        if (!genStudentId) return;
        setGenerating(true);
        try {
            const m = matriculations.find(m => m.id === genStudentId);
            let studentName = m?.studentName || (m as any)?.student || '';
            let courseTitle = m?.course || m?.courseTitle || '';

            if (!m) {
                const s = students.find(s => s.id === genStudentId);
                if (s) {
                    studentName = s.name;
                    courseTitle = s.course || 'Formação Marítima STCW';
                }
            }

            if (!studentName) {
                alert('Aluno não encontrado.');
                setGenerating(false);
                return;
            }

            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName,
                    courseTitle: courseTitle || 'Formação Marítima STCW',
                    matriculationIds: m ? [m.id] : [],
                    certification: selectedCertType,
                    status: 'PENDENTE'
                })
            });

            if (res.ok) {
                alert(`Certificado gerado com sucesso para ${studentName}!`);
                fetchAll();
                setGenStudentId('');
            } else {
                const data = await res.json();
                alert(`Erro: ${data.error || 'Falha ao gerar certificado'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de comunicação com o servidor.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCreateManualCert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualForm.studentName || !manualForm.courseTitle) {
            alert('Por favor preencha o Nome do Formando e o Título do Curso.');
            return;
        }

        setGenerating(true);
        try {
            const years = parseInt(manualForm.validUntilYears || '5');
            const validUntil = new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000).toISOString();

            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: manualForm.studentName,
                    courseTitle: manualForm.courseTitle,
                    certification: manualForm.certification,
                    validUntil,
                    status: manualForm.status,
                    approvedBy: session?.user?.name || 'Administrador'
                })
            });

            if (res.ok) {
                alert('Certificado emitido e homologado com sucesso!');
                setManualModalOpen(false);
                setManualForm({ studentName: '', courseTitle: '', certification: 'Bahamas', validUntilYears: '5', status: 'APROVADO' });
                fetchAll();
            } else {
                const data = await res.json();
                alert(`Erro ao criar certificado: ${data.error || 'Falha no registo.'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao ligar ao servidor.');
        } finally {
            setGenerating(false);
        }
    };

    const handleApprove = async (id: string) => {
        const adminName = session?.user?.name || 'Administrador MTC';

        // Optimistic UI Update so status changes immediately
        setCerts(prev => prev.map(c => c.id === id ? {
            ...c,
            status: 'APROVADO',
            approvedAt: new Date().toISOString(),
            approvedBy: adminName
        } : c));

        try {
            const res = await fetch(`/api/certificates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', approvedBy: adminName })
            });

            if (!res.ok) {
                alert('Ocorreu um erro ao registar a aprovação no servidor.');
                fetchAll();
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao comunicar com o servidor.');
            fetchAll();
        }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        const certId = rejectModal.id;
        const reason = rejectModal.reason || 'Não cumpre requisitos';

        setCerts(prev => prev.map(c => c.id === certId ? {
            ...c,
            status: 'REJEITADO',
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
        } : c));

        try {
            await fetch(`/api/certificates/${certId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', reason })
            });
            setRejectModal(null);
        } catch (e) {
            console.error(e);
            fetchAll();
        }
    };

    const handleUpdateValidity = async () => {
        if (!editValidity) return;
        try {
            await fetch(`/api/certificates/${editValidity.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update-validity', validUntil: editValidity.date })
            });
            setEditValidity(null);
            fetchAll();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tens a certeza que desejas eliminar este certificado? Esta ação não pode ser desfeita.')) return;
        setCerts(prev => prev.filter(c => c.id !== id));
        try {
            await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error(e);
            fetchAll();
        }
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
            {/* Header with Manual Creation Button */}
            <div className="page-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Certificados Marítimos</h1>
                    <p>Geração, homologação e controlo de certificação STCW (Bahamas & Vanuatu).</p>
                </div>
                <button
                    className="btn-create-manual"
                    onClick={() => setManualModalOpen(true)}
                >
                    ➕ Emitir Certificado Manual
                </button>
            </div>

            {/* Certificao Flag Selector Banner */}
            <div className="cert-type-selector">
                <span className="selector-title">⚓ Autoridade Emissora Padrão:</span>
                <div className="selector-options">
                    <button
                        className={`cert-type-btn ${selectedCertType === 'Bahamas' ? 'active' : ''}`}
                        onClick={() => setSelectedCertType('Bahamas')}
                    >
                        🇧🇸 Bahamas (Bahamas Maritime Authority)
                    </button>
                    <button
                        className={`cert-type-btn ${selectedCertType === 'Vanuatu' ? 'active' : ''}`}
                        onClick={() => setSelectedCertType('Vanuatu')}
                    >
                        🇻🇺 Vanuatu (Vanuatu Maritime Services)
                    </button>
                </div>
            </div>

            {/* Generation Panels */}
            <div className="gen-grid">
                <div className="gen-panel">
                    <div className="gen-info">
                        <h3>🎓 Gerar Por Curso</h3>
                        <p>Emitir para todos os formandos com matrícula concluída.</p>
                    </div>
                    <div className="gen-controls">
                        <select value={genCourseId} onChange={e => setGenCourseId(e.target.value)}>
                            <option value="">Selecionar curso...</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <button className="gen-btn" onClick={generateForCourse} disabled={!genCourseId || generating}>
                            {generating ? 'A gerar...' : `Gerar (${selectedCertType})`}
                        </button>
                    </div>
                </div>

                <div className="gen-panel student-panel">
                    <div className="gen-info">
                        <h3>👤 Gerar Por Aluno</h3>
                        <p>Selecionar um formando específico da lista.</p>
                    </div>
                    <div className="gen-controls">
                        <select value={genStudentId} onChange={e => setGenStudentId(e.target.value)}>
                            <option value="">Selecionar formando...</option>
                            {matriculations.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.studentName || (m as any).student} — {m.course || (m as any).courseTitle}
                                </option>
                            ))}
                            {students.map(s => (
                                <option key={`std-${s.id}`} value={s.id}>
                                    [Aluno Directo] {s.name}
                                </option>
                            ))}
                        </select>
                        <button className="gen-btn" onClick={generateForStudent} disabled={!genStudentId || generating}>
                            {generating ? 'A gerar...' : `Gerar (${selectedCertType})`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Filters */}
            <div className="stats-row">
                {[
                    { label: 'Todos os Certificados', value: certs.length, color: '#EA580C', f: 'ALL' },
                    { label: 'Pendentes de Aprovação', value: statusCount.pending, color: '#EA580C', f: 'PENDENTE' },
                    { label: 'Aprovados & Homologados', value: statusCount.approved, color: '#10b981', f: 'APROVADO' },
                    { label: 'Rejeitados', value: statusCount.rejected, color: '#ef4444', f: 'REJEITADO' },
                ].map((s, i) => (
                    <div key={i} className={`stat-card ${statusFilter === s.f ? 'selected' : ''}`}
                        style={{ borderTopColor: s.color, cursor: 'pointer' }}
                        onClick={() => setStatusFilter(s.f as any)}>
                        <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Certificates Table */}
            {loading ? <div className="loader">A carregar registos de certificados...</div> : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Formando</th>
                                <th>Curso / Formação</th>
                                <th>Certificação</th>
                                <th>Data de Emissão</th>
                                <th>Validade</th>
                                <th>Status / Estado</th>
                                <th className="align-right">Ações de Gestão</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(cert => {
                                const certFlag = (cert.certification || 'Bahamas').toLowerCase().includes('vanuatu') ? '🇻🇺 Vanuatu' : '🇧🇸 Bahamas';
                                return (
                                    <tr key={cert.id}>
                                        <td className="bold">{cert.studentName}</td>
                                        <td>{cert.courseTitle}</td>
                                        <td><span className="flag-tag">{certFlag}</span></td>
                                        <td>{new Date(cert.generatedAt).toLocaleDateString('pt-PT')}</td>
                                        <td>
                                            <div className="validity-cell">
                                                <span className={`validity-date ${isExpired(cert.validUntil) ? 'expired' : isExpiringSoon(cert.validUntil) ? 'warning' : ''}`}>
                                                    {cert.validUntil ? new Date(cert.validUntil).toLocaleDateString('pt-PT') : 'N/A'}
                                                </span>
                                                <button className="edit-mini" title="Alterar validade" onClick={() => setEditValidity({ id: cert.id, date: cert.validUntil ? cert.validUntil.split('T')[0] : '' })}>
                                                    ✏️
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`cert-badge ${cert.status?.toLowerCase() || 'pendente'}`}>
                                                {cert.status === 'APROVADO' ? '✅ Aprovado' : cert.status === 'REJEITADO' ? '❌ Rejeitado' : '⏳ Pendente'}
                                            </span>
                                            {cert.status === 'APROVADO' && cert.approvedBy && <div className="cert-sub">por {cert.approvedBy}</div>}
                                            {cert.status === 'REJEITADO' && cert.rejectionReason && <div className="cert-sub red">{cert.rejectionReason}</div>}
                                        </td>
                                        <td className="align-right">
                                            <div className="row-actions">
                                                <button className="row-btn view" onClick={() => setViewingCert(cert)}>👁️ Ver</button>
                                                {cert.status === 'PENDENTE' && (
                                                    <button className="row-btn approve" onClick={() => handleApprove(cert.id)}>✓ Aprovar</button>
                                                )}
                                                {cert.status === 'PENDENTE' && (
                                                    <button className="row-btn reject" onClick={() => setRejectModal({ id: cert.id, reason: '' })}>✗ Rejeitar</button>
                                                )}
                                                <button className="row-btn delete" onClick={() => handleDelete(cert.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="empty-state">Nenhum certificado encontrado para o filtro selecionado.</div>
                    )}
                </div>
            )}

            {/* Modal: Emitir Certificado Manual */}
            {manualModalOpen && (
                <div className="modal-overlay" onClick={() => setManualModalOpen(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h2>➕ Emitir Certificado Manual</h2>
                        <p className="modal-sub">Registe e homologue um certificado diretamente para qualquer formando.</p>

                        <form onSubmit={handleCreateManualCert} className="manual-form">
                            <div className="form-group">
                                <label>Nome Completo do Formando *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Carlos António Silva"
                                    value={manualForm.studentName}
                                    onChange={e => setManualForm({ ...manualForm, studentName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Curso / Treinamento Marítimo *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Segurança Básica STCW / GMDSS"
                                    value={manualForm.courseTitle}
                                    onChange={e => setManualForm({ ...manualForm, courseTitle: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Certificação Marítima</label>
                                    <select
                                        value={manualForm.certification}
                                        onChange={e => setManualForm({ ...manualForm, certification: e.target.value })}
                                    >
                                        <option value="Bahamas">🇧🇸 Bahamas (BMA)</option>
                                        <option value="Vanuatu">🇻🇺 Vanuatu (VMSL)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Período de Validade</label>
                                    <select
                                        value={manualForm.validUntilYears}
                                        onChange={e => setManualForm({ ...manualForm, validUntilYears: e.target.value })}
                                    >
                                        <option value="5">5 Anos (STCW Padrão)</option>
                                        <option value="2">2 Anos</option>
                                        <option value="1">1 Ano</option>
                                        <option value="10">10 Anos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Estado Inicial do Certificado</label>
                                <select
                                    value={manualForm.status}
                                    onChange={e => setManualForm({ ...manualForm, status: e.target.value })}
                                >
                                    <option value="APROVADO">✅ Aprovado & Homologado</option>
                                    <option value="PENDENTE">⏳ Pendente de Validação</option>
                                </select>
                            </div>

                            <div className="modal-actions-bar">
                                <button type="button" className="btn-cancel" onClick={() => setManualModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit" disabled={generating}>
                                    {generating ? 'A processar...' : 'Emitir Certificado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Alterar Validade */}
            {editValidity && (
                <div className="modal-overlay" onClick={() => setEditValidity(null)}>
                    <div className="modal-card small" onClick={e => e.stopPropagation()}>
                        <h2>📅 Alterar Data de Validade</h2>
                        <input
                            type="date"
                            value={editValidity.date}
                            onChange={e => setEditValidity({ ...editValidity, date: e.target.value })}
                            className="date-input-full"
                        />
                        <div className="modal-actions-bar">
                            <button className="btn-cancel" onClick={() => setEditValidity(null)}>Cancelar</button>
                            <button className="btn-submit" onClick={handleUpdateValidity}>Guardar Validade</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Rejeitar Certificado */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal-card small" onClick={e => e.stopPropagation()}>
                        <h2>❌ Motivo da Rejeição</h2>
                        <textarea
                            placeholder="Descreva o motivo da rejeição..."
                            value={rejectModal.reason}
                            onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                            rows={3}
                            className="textarea-full"
                        ></textarea>
                        <div className="modal-actions-bar">
                            <button className="btn-cancel" onClick={() => setRejectModal(null)}>Cancelar</button>
                            <button className="btn-reject-confirm" onClick={handleReject}>Confirmar Rejeição</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Visualizar Certificado */}
            {viewingCert && (
                <div className="modal-overlay" onClick={() => setViewingCert(null)}>
                    <div className="cert-preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="cert-sheet">
                            <div className="cert-top-branding">
                                <div className="anchor-logo">⚓</div>
                                <h2>MARÍTIMO TRAINING CENTER</h2>
                                <p>REPÚBLICA DE ANGOLA — CENTRO OFICIAL DE FORMAÇÃO MARÍTIMA</p>
                            </div>

                            <div className="cert-main-body">
                                <h3>CERTIFICADO DE COMPROVAÇÃO DE FORMAÇÃO</h3>
                                <p>Certifica-se para os devidos efeitos legais e de conformidade STCW que</p>
                                <h1 className="cert-student-name">{viewingCert.studentName}</h1>
                                <p>concluiu com aproveitamento o curso de formação marítima de</p>
                                <h2 className="cert-course-name">{viewingCert.courseTitle}</h2>
                                <div className="cert-flag-note">
                                    Certificação Marítima de Acordo com a Autoridade de {(viewingCert.certification || 'Bahamas').includes('Vanuatu') ? 'Vanuatu (VMSL)' : 'Bahamas (BMA)'}
                                </div>
                            </div>

                            <div className="cert-sheet-footer">
                                <div className="cert-meta-item">
                                    <span>VÁLIDO ATÉ:</span>
                                    <strong>{viewingCert.validUntil ? new Date(viewingCert.validUntil).toLocaleDateString('pt-PT') : 'Vitalício'}</strong>
                                </div>

                                <div className="qr-box">
                                    {mounted && (
                                        <QRCodeSVG
                                            value={`${origin || (typeof window !== 'undefined' ? window.location.origin : '')}/verify/${viewingCert.id}`}
                                            size={90}
                                            level="H"
                                        />
                                    )}
                                    <span className="qr-caption">QR CODE DE VALIDAÇÃO</span>
                                </div>

                                <div className="cert-meta-item">
                                    <span>ID DO CERTIFICADO:</span>
                                    <strong className="code-text">{viewingCert.id}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="preview-actions">
                            <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir Certificado</button>
                            <button className="btn-close" onClick={() => setViewingCert(null)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrapper { display: flex; flex-direction: column; gap: 1.5rem; color: #1e293b; }
                .page-top h1 { font-size: 1.85rem; color: #2D180F; font-weight: 800; margin: 0; }
                .page-top p { color: #64748b; margin-top: 0.2rem; }

                .btn-create-manual {
                    background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
                    color: white;
                    border: none;
                    padding: 0.85rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
                    transition: all 0.2s;
                }
                .btn-create-manual:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(234, 88, 12, 0.4); }

                .cert-type-selector {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 1rem 1.5rem;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .selector-title { font-weight: 700; color: #2D180F; font-size: 0.9rem; }
                .selector-options { display: flex; gap: 0.75rem; }
                .cert-type-btn {
                    padding: 0.6rem 1.25rem;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cert-type-btn.active {
                    background: #2D180F;
                    color: white;
                    border-color: #2D180F;
                    box-shadow: 0 4px 10px rgba(10, 42, 94, 0.2);
                }

                .gen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                .gen-panel {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .gen-info h3 { margin: 0; font-size: 1.1rem; color: #2D180F; }
                .gen-info p { margin: 0.2rem 0 0; font-size: 0.85rem; color: #64748b; }
                .gen-controls { display: flex; gap: 0.75rem; }
                .gen-controls select {
                    flex: 1;
                    padding: 0.75rem;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    font-size: 0.9rem;
                }
                .gen-btn {
                    background: #EA580C;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
                .stat-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    border-top-width: 4px;
                    transition: all 0.2s;
                }
                .stat-card.selected { background: #FDF2E9; }
                .stat-val { font-size: 1.75rem; font-weight: 900; }
                .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-top: 0.2rem; }

                .table-wrap { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; text-align: left; }
                .data-table th { background: #f8fafc; padding: 1rem 1.25rem; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #e2e8f0; }
                .data-table td { padding: 1.1rem 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
                .bold { font-weight: 800; color: #2D180F; }
                .flag-tag { background: #f1f5f9; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; color: #334155; }
                .validity-cell { display: flex; align-items: center; gap: 0.5rem; }
                .validity-date.expired { color: #ef4444; font-weight: 800; }
                .validity-date.warning { color: #EA580C; font-weight: 800; }
                .edit-mini { background: none; border: none; cursor: pointer; font-size: 0.85rem; }

                .cert-badge { display: inline-block; padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
                .cert-badge.aprovado { background: #d1fae5; color: #059669; }
                .cert-badge.pendente { background: #F7ECE1; color: #9A3412; }
                .cert-badge.rejeitado { background: #fee2e2; color: #dc2626; }
                .cert-sub { font-size: 0.75rem; color: #64748b; margin-top: 0.2rem; }
                .cert-sub.red { color: #dc2626; }

                .align-right { text-align: right; }
                .row-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
                .row-btn { border: none; padding: 0.4rem 0.75rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; }
                .row-btn.view { background: #f1f5f9; color: #2D180F; }
                .row-btn.approve { background: #10b981; color: white; }
                .row-btn.reject { background: #ef4444; color: white; }
                .row-btn.delete { background: #fee2e2; color: #dc2626; }

                /* Modals */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
                .modal-card { background: white; padding: 2rem; border-radius: 20px; width: 90%; max-width: 550px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
                .modal-card.small { max-width: 400px; }
                .modal-card h2 { margin: 0 0 0.25rem; color: #2D180F; font-size: 1.4rem; }
                .modal-sub { color: #64748b; font-size: 0.85rem; margin: 0 0 1.5rem; }

                .manual-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
                .form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; }
                .form-group input, .form-group select { padding: 0.75rem; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.95rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .modal-actions-bar { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
                .btn-cancel { background: #f1f5f9; color: #475569; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .btn-submit { background: #ea580c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 800; cursor: pointer; }
                .btn-reject-confirm { background: #ef4444; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 800; cursor: pointer; }
                .date-input-full, .textarea-full { width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.95rem; margin-top: 1rem; }

                /* Cert Preview Modal */
                .cert-preview-modal { background: white; padding: 2rem; border-radius: 20px; max-width: 700px; width: 90%; }
                .cert-sheet { background: #fffdf5; border: 10px double #2D180F; padding: 2.5rem; text-align: center; color: #2D180F; }
                .anchor-logo { font-size: 2.5rem; color: #ea580c; margin-bottom: 0.5rem; }
                .cert-top-branding h2 { font-size: 1.5rem; margin: 0; font-weight: 900; }
                .cert-top-branding p { font-size: 0.75rem; color: #64748b; font-weight: 800; letter-spacing: 1px; margin-top: 0.2rem; }
                .cert-main-body { margin: 2rem 0; }
                .cert-main-body h3 { color: #9A3412; font-size: 1.1rem; font-weight: 900; text-decoration: underline; margin-bottom: 1rem; }
                .cert-student-name { font-size: 2rem; font-weight: 900; color: #2D180F; margin: 1rem 0; }
                .cert-course-name { font-size: 1.3rem; color: #ea580c; font-weight: 800; margin: 0.5rem 0 1rem; }
                .cert-flag-note { font-size: 0.85rem; font-weight: 700; color: #EA580C; background: #FDF2E9; padding: 0.4rem 1rem; border-radius: 50px; display: inline-block; }
                .cert-sheet-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; border-top: 1px solid #cbd5e1; padding-top: 1rem; font-size: 0.8rem; }
                .qr-box { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
                .qr-caption { font-size: 0.65rem; font-weight: 800; color: #64748b; }
                .preview-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
                .btn-print { background: #2D180F; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .btn-close { background: #f1f5f9; color: #475569; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

                .loader, .empty-state { padding: 3rem; text-align: center; color: #94a3b8; font-weight: 600; background: white; border-radius: 16px; }
            `}</style>
        </div>
    );
}
