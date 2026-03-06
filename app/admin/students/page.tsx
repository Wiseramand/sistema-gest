'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    idDocument: string;
    validity: string;
    nationality: string;
    photo: string;
    clientType: 'Particular' | 'Empresa';
    companyId?: string;
    createdAt: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [accessModal, setAccessModal] = useState<{ name: string; username: string; password: string; loading?: boolean } | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', status: 'Ativo',
        idDocument: '', validity: '', nationality: '', photo: '',
        clientType: 'Particular' as 'Particular' | 'Empresa',
        companyId: ''
    });
    const [companies, setCompanies] = useState<any[]>([]);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stdRes, compRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/companies')
            ]);
            const stdData = await stdRes.json();
            const compData = await compRes.json();
            setStudents(Array.isArray(stdData) ? stdData : []);
            setCompanies(Array.isArray(compData) ? compData : []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (student?: Student) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                name: student.name, email: student.email, phone: student.phone || '',
                status: student.status, idDocument: student.idDocument || '',
                validity: student.validity || '', nationality: student.nationality || '',
                photo: student.photo || '',
                clientType: student.clientType || 'Particular',
                companyId: student.companyId || ''
            });
        } else {
            setEditingStudent(null);
            setFormData({
                name: '', email: '', phone: '', status: 'Ativo',
                idDocument: '', validity: '', nationality: '', photo: '',
                clientType: 'Particular', companyId: ''
            });
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
        const method = editingStudent ? 'PATCH' : 'POST';

        let photoUrl = formData.photo;
        if (selectedFile) {
            setUploading(true);
            try {
                const upData = new FormData();
                upData.set('file', selectedFile);
                const resUp = await fetch('/api/upload', { method: 'POST', body: upData });
                if (resUp.ok) { const d = await resUp.json(); photoUrl = d.url; }
            } catch (err) {
                console.error('Upload Error:', err);
            } finally {
                setUploading(false);
            }
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, photo: photoUrl })
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); setSelectedFile(null); }
        } catch (error) {
            console.error('Error saving student:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover este aluno?')) return;
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleGenerateAccess = async (student: any) => {
        setGeneratingId(student.id);
        setAccessModal({ name: student.name, username: '', password: '', loading: true });
        try {
            console.log("Generating access for student:", student.id);
            const res = await fetch('/api/generate-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'student', id: student.id })
            });

            if (res.ok) {
                const data = await res.json();
                setAccessModal({ name: student.name, username: data.username, password: data.password, loading: false });
            } else {
                const err = await res.json();
                alert(`Erro do Servidor: ${err.error || 'Erro desconhecido'}`);
                setAccessModal(null);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert('Erro de rede ou conexão ao tentar gerar acesso.');
            setAccessModal(null);
        } finally {
            setGeneratingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
    };

    const shareWhatsApp = (name: string, user: string, pass: string) => {
        const link = `${window.location.origin}/login`;
        const message = `⚓ *Credenciais de Acesso - Marítimo Training Center*\n\nOlá *${name}*,\n\nAqui estão as suas credenciais de acesso ao portal do aluno:\n\n👤 *Utilizador:* ${user}\n🔑 *Senha:* ${pass}\n🔗 *Link:* ${link}\n\nSeja bem-vindo(a)!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const shareEmail = (email: string, name: string, user: string, pass: string) => {
        const link = `${window.location.origin}/login`;
        const subject = encodeURIComponent('Suas Credenciais de Acesso - Marítimo Training Center');
        const body = encodeURIComponent(`Olá ${name},\n\nAqui estão as suas credenciais de acesso ao portal do aluno:\n\nUtilizador: ${user}\nSenha: ${pass}\nLink: ${link}\n\nAtenciosamente,\nEquipa Marítimo.`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    const totalPages = Math.ceil(students.length / itemsPerPage);
    const paginatedStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Gestão de Alunos</h1>
                    <p>Registe, consulte e gerencie todos os formandos.</p>
                </div>
                <div className="header-actions">
                    <button className="print-btn" onClick={() => window.print()}>🖨️ Imprimir Lista</button>
                    <button className="new-btn" onClick={() => handleOpenModal()}>+ Novo Aluno</button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loader">A carregar alunos...</div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Contacto</th>
                                <th>Documento</th>
                                <th>Nationalidade</th>
                                <th>Status</th>
                                <th className="align-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStudents.map((s) => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="student-cell">
                                            {s.photo
                                                ? <img src={s.photo} className="avatar" alt={s.name} />
                                                : <div className="avatar-placeholder">{s.name?.[0] || '?'}</div>
                                            }
                                            <div>
                                                <Link href={`/admin/students/${s.id}`} className="student-name-link">
                                                    <span className="student-name">{s.name}</span>
                                                </Link>
                                                <span className="student-date">Desde {s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span>{s.email}</span>
                                            <span className="sub">{s.phone || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span>{s.idDocument || '—'}</span>
                                            <span className="sub">Val: {s.validity || '—'}</span>
                                        </div>
                                    </td>
                                    <td>{s.nationality || '—'}</td>
                                    <td>
                                        <span className={`status-pill ${s.status === 'Ativo' ? 'active' : 'inactive'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="align-right">
                                        <div className="row-actions">
                                            <button
                                                className={`row-btn key ${generatingId === s.id ? 'loading' : ''}`}
                                                disabled={generatingId !== null}
                                                onClick={() => handleGenerateAccess(s)}
                                            >
                                                {generatingId === s.id ? '⌛' : '🔑'}
                                            </button>
                                            <button className="row-btn edit" onClick={() => handleOpenModal(s)}>Editar</button>
                                            <button className="row-btn delete" onClick={() => handleDelete(s.id)}>Remover</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && <div className="empty-state">Nenhum aluno registado ainda.</div>}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>
                            <span className="page-info">Página {currentPage} de {totalPages}</span>
                            <button
                                className="page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="overlay">
                    <div className="modal-box">
                        <div className="modal-top">
                            <div>
                                <h2>{editingStudent ? '✎ Editar Aluno' : '+ Novo Aluno'}</h2>
                                <p>{editingStudent ? 'Atualize os dados do formando' : 'Registe um novo formando no sistema'}</p>
                            </div>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSave} className="modal-form">
                            {/* Column 1 */}
                            <div className="form-col">
                                <div className="section-label">Perfil e Identificação</div>

                                <div className="field">
                                    <label>Nome Completo *</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo do formando" required />
                                </div>
                                <div className="field">
                                    <label>Fotografia de Perfil</label>
                                    <div className="upload-box">
                                        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                        {uploading && <span className="upload-status">⏳ A enviar...</span>}
                                        {formData.photo && !selectedFile && <span className="photo-ok">✓ Foto atual mantida</span>}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Nacionalidade</label>
                                    <input type="text" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} placeholder="Ex: Angolana" />
                                </div>
                                <div className="field">
                                    <label>Tipo de Cliente</label>
                                    <select value={formData.clientType} onChange={(e) => setFormData({ ...formData, clientType: e.target.value as any, companyId: e.target.value === 'Particular' ? '' : formData.companyId })}>
                                        <option value="Particular">Particular</option>
                                        <option value="Empresa">Empresa / Corporativo</option>
                                    </select>
                                </div>
                                {formData.clientType === 'Empresa' && (
                                    <div className="field animate-fade">
                                        <label>Empresa Vinculada</label>
                                        <select value={formData.companyId} onChange={(e) => setFormData({ ...formData, companyId: e.target.value })} required>
                                            <option value="">Selecione a empresa...</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.nif})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="field">
                                    <label>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                        <option value="Suspenso">Suspenso</option>
                                    </select>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="form-col">
                                <div className="section-label">Documento e Contacto</div>

                                <div className="field">
                                    <label>Documento de Identificação</label>
                                    <input type="text" value={formData.idDocument} onChange={(e) => setFormData({ ...formData, idDocument: e.target.value })} placeholder="BI / NIF / Passaporte" />
                                </div>
                                <div className="field">
                                    <label>Validade do Documento</label>
                                    <input type="date" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} />
                                </div>
                                <div className="field">
                                    <label>E-mail *</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="aluno@email.com" required />
                                </div>
                                <div className="field">
                                    <label>Telefone</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+244 9xx xxx xxx" />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-save">{editingStudent ? '✓ Guardar' : '+ Registar Aluno'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Access Credentials Modal */}
            {accessModal && (
                <div className="overlay">
                    <div className="modal-box credentials">
                        <div className="creds-icon">{accessModal.loading ? '⏳' : '✅'}</div>
                        <h2>{accessModal.loading ? 'A preparar acessos...' : 'Acesso Ativado!'}</h2>
                        <p>{accessModal.loading ? 'A processar credenciais seguras para o aluno.' : 'Partilhe estas credenciais com o aluno. A senha é única e segura.'}</p>

                        <div className="cred-field">
                            <label>Username</label>
                            <div className={`cred-value ${accessModal.loading ? 'skeleton' : ''}`}>
                                {accessModal.loading ? 'a carregar...' : accessModal.username}
                            </div>
                        </div>
                        <div className="cred-field">
                            <label>Senha (copie agora!)</label>
                            <div className={`cred-value password ${accessModal.loading ? 'skeleton' : ''}`}>
                                {accessModal.loading ? '••••••••' : accessModal.password}
                            </div>
                        </div>
                        <div className="cred-info">🔗 Link de acesso: <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/login</strong></div>

                        <div className={`sharing-actions ${accessModal.loading ? 'disabled' : ''}`}>
                            <button className="share-btn copy" disabled={accessModal.loading} onClick={() => copyToClipboard(`Utilizador: ${accessModal.username}\nSenha: ${accessModal.password}\nLink: ${window.location.origin}/login`)}>
                                📋 Copiar Tudo
                            </button>
                            <button className="share-btn whatsapp" disabled={accessModal.loading} onClick={() => shareWhatsApp(accessModal.name, accessModal.username, accessModal.password)}>
                                🟢 WhatsApp
                            </button>
                            <button className="share-btn email" disabled={accessModal.loading} onClick={() => {
                                const student = students.find(s => s.name === accessModal.name);
                                shareEmail(student?.email || '', accessModal.name, accessModal.username, accessModal.password);
                            }}>
                                📧 E-mail
                            </button>
                        </div>

                        <div className="warning-note">
                            ⚠️ *Atenção:* A senha é gerada aleatoriamente e não pode ser recuperada. Certifique-se de que o aluno a guarde em local seguro.
                        </div>
                        <button className="btn-save" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setAccessModal(null)}>✓ Concluído</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; font-size: 0.95rem; }

                .new-btn { background: var(--navy-deep); color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
                .new-btn:hover { background: var(--ocean-blue); transform: translateY(-2px); }

                .loader { text-align: center; padding: 4rem 2rem; color: #94a3b8; font-weight: 500; }
                .empty-state { text-align: center; padding: 3rem; color: #94a3b8; font-weight: 500; }

                /* Table */
                .table-wrap { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; }
                .data-table tr:last-child td { border-bottom: none; }
                .data-table tr:hover td { background: #fafbfc; }

                .student-cell { display: flex; align-items: center; gap: 0.85rem; }
                .avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--sand-gold); flex-shrink: 0; }
                .avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--navy-deep), var(--ocean-blue)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
                .student-name { color: var(--navy-deep); font-weight: 800; display: block; }
                .student-name-link { text-decoration: none; display: block; transition: 0.2s; }
                .student-name-link:hover .student-name { color: var(--ocean-blue); }
                .student-date { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }

                .info-cell { display: flex; flex-direction: column; gap: 0.1rem; }
                .sub { font-size: 0.78rem; color: #94a3b8; }

                .status-pill { padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
                .status-pill.active { background: #ecfdf5; color: #059669; }
                .status-pill.inactive { background: #fef2f2; color: #dc2626; }

                .align-right { text-align: right; }
                .row-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
                .row-btn { background: none; border: none; cursor: pointer; font-weight: 700; font-size: 0.82rem; padding: 0.35rem 0.65rem; border-radius: 6px; transition: 0.2s; }
                .row-btn.key { font-size: 1rem; color: #d97706; }
                .row-btn.key:hover { background: #fffbeb; }
                .row-btn.key.loading { opacity: 0.5; cursor: wait; filter: grayscale(1); }
                .row-btn.edit { color: var(--ocean-blue); }
                .row-btn.edit:hover { background: #eff6ff; }
                .row-btn.delete { color: #dc2626; }
                .row-btn.delete:hover { background: #fef2f2; }

                /* Pagination */
                .pagination { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; }
                .page-btn { padding: 0.5rem 1rem; border: 1px solid #cbd5e1; background: white; border-radius: 8px; font-weight: 600; font-size: 0.85rem; color: #475569; cursor: pointer; transition: 0.2s; }
                .page-btn:hover:not(:disabled) { background: #f1f5f9; color: var(--navy-deep); }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-info { font-size: 0.85rem; color: #64748b; font-weight: 500; }

                /* Modal */
                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-box { background: white; width: 100%; max-width: 820px; max-height: 90vh; overflow-y: auto; border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.3); }
                .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 2rem; }
                .modal-top h2 { margin: 0; font-size: 1.4rem; color: var(--navy-deep); font-weight: 800; }
                .modal-top p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #64748b; }
                .close-x { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s; }
                .close-x:hover { background: #e2e8f0; color: var(--navy-deep); }

                .modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .form-col { display: flex; flex-direction: column; }
                .section-label { font-size: 0.8rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; }
                .field { margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
                .field input, .field select { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; background: #f8fafc; color: var(--navy-deep); font-family: inherit; transition: all 0.2s; }
                .field input:focus, .field select:focus { outline: none; background: white; border-color: var(--ocean-blue); box-shadow: 0 0 0 3px rgba(0,116,217,0.12); }

                .upload-box { background: #f8fafc; border: 1.5px dashed #cbd5e0; border-radius: 10px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .upload-box input { border: none; padding: 0; background: transparent; font-size: 0.85rem; }
                .upload-status { font-size: 0.8rem; color: var(--ocean-blue); font-weight: 600; }
                .photo-ok { font-size: 0.8rem; color: #059669; font-weight: 600; }

                .modal-footer { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #f1f5f9; }
                .btn-cancel { padding: 0.85rem 1.75rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
                .btn-cancel:hover { background: #f8fafc; }
                .btn-save { padding: 0.85rem 2rem; border-radius: 12px; border: none; background: var(--navy-deep); color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
                .btn-save:hover { background: var(--ocean-blue); transform: translateY(-2px); }

                /* Credentials Modal */
                .modal-box.credentials { background: white; width: 100%; max-width: 440px; border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.25); text-align: center; }
                .creds-icon { font-size: 3rem; margin-bottom: 0.75rem; }
                .modal-box.credentials h2 { margin: 0 0 0.5rem; color: var(--navy-deep); font-weight: 800; }
                .modal-box.credentials p { margin: 0 0 1.75rem; color: #64748b; font-size: 0.9rem; }
                .cred-field { text-align: left; margin-bottom: 1.25rem; }
                .cred-field label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 0.4rem; }
                .cred-value { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.85rem 1rem; font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; color: var(--navy-deep); }
                .cred-value.password { color: var(--ocean-blue); letter-spacing: 1.5px; }
                .cred-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1rem; font-size: 0.9rem; color: #0369a1; text-align: left; margin-bottom: 2rem; }
                
                .sharing-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
                .share-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
                .share-btn.copy { background: #f1f5f9; color: #475569; }
                .share-btn.whatsapp { background: #dcfce7; color: #166534; }
                .share-btn.email { background: #e0f2fe; color: #0369a1; }
                .share-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
                .sharing-actions.disabled { opacity: 0.5; pointer-events: none; }

                .cred-value.skeleton { color: #cbd5e0 !important; font-style: italic; background: #f1f5f9; position: relative; overflow: hidden; }
                .cred-value.skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimer 1.5s infinite; }
                @keyframes shimer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

                .warning-note { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 1rem; border-radius: 12px; font-size: 0.82rem; line-height: 1.5; text-align: left; margin-bottom: 1rem; }

                @media (max-width: 768px) { .modal-form { grid-template-columns: 1fr; } .modal-footer { grid-column: span 1; } }

                .header-actions { display: flex; gap: 1rem; }
                .print-btn { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.5rem; }
                .print-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

                @media print {
                    :global(.sidebar), :global(.admin-header), .header-actions, .row-actions, .maritime-accent {
                        display: none !important;
                    }
                    :global(.admin-content) {
                        padding: 0 !important;
                        background: white !important;
                        margin: 0 !important;
                    }
                    .page-wrapper { padding: 0; }
                    .table-wrap { border: none; }
                    .data-table th { background: #eee !important; -webkit-print-color-adjust: exact; }
                }

                .animate-fade { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
