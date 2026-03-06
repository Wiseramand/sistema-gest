'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student { id: string; name: string; idDocument: string; }
interface Material { name: string; url: string; }
interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    status: string;
    materials: Material[];
}
interface Trainer { id: string; name: string; }
interface Classroom { id: string; name: string; }
interface Matriculation {
    id: string;
    studentId: string;
    studentName: string;
    course: string;
    classroom: string;
    trainer: string;
    schedule: string;
    duration: string;
    paymentStatus: string;
    amountDue: number;
    startDate: string;
}

export default function MatriculationPage() {
    const [data, setData] = useState({
        students: [] as Student[],
        courses: [] as Course[],
        trainers: [] as Trainer[],
        classrooms: [] as Classroom[],
        matriculations: [] as Matriculation[]
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({
        course: '', classroom: '', trainer: '', schedule: '',
        duration: '', startDate: '', paymentStatus: 'Pendente' as string, amountDue: 0
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter state
    const [filters, setFilters] = useState({
        trainer: '', student: '', schedule: '', course: '', payment: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resS, resC, resT, resCl, resM] = await Promise.all([
                fetch('/api/students'), fetch('/api/courses'), fetch('/api/trainers'),
                fetch('/api/classrooms'), fetch('/api/matriculations')
            ]);
            const [sData, cData, tData, clData, mData] = await Promise.all([
                resS.json(), resC.json(), resT.json(), resCl.json(), resM.json()
            ]);
            setData({
                students: Array.isArray(sData) ? sData : [],
                courses: Array.isArray(cData) ? cData : [],
                trainers: Array.isArray(tData) ? tData : [],
                classrooms: Array.isArray(clData) ? clData : [],
                matriculations: Array.isArray(mData) ? mData : []
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredStudents = data.students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.idDocument || '').includes(searchQuery)
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        try {
            const tObj = data.trainers.find(t => t.name === formData.trainer);
            const cObj = data.courses.find(c => c.title === formData.course);
            const clObj = data.classrooms.find(cl => cl.name === formData.classroom);

            const res = await fetch('/api/matriculations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    trainerId: tObj?.id || '',
                    courseId: cObj?.id || '',
                    classroomId: clObj?.id || '',
                    ...formData
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setSelectedStudent(null);
                setSearchQuery('');
                setFormData({ course: '', classroom: '', trainer: '', schedule: '', duration: '', startDate: '', paymentStatus: 'Pendente', amountDue: 0 });
                fetchData();
            } else {
                const errorData = await res.json();
                alert(`Erro ao criar matrícula: ${errorData.error || 'Verifique a ligação à API.'}\n${errorData.details || ''}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Erro na submissão: ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover esta matrícula?')) return;
        await fetch(`/api/matriculations/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handlePrintReceipt = (m: Matriculation) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Por favor permita popups para imprimir o comprovativo.');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprovativo de Matrícula - ${m.studentName}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #005A9C; margin-bottom: 30px; padding-bottom: 20px; }
                    .header h1 { color: #005A9C; margin: 0; font-size: 24px; text-transform: uppercase; }
                    .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
                    .content-box { border: 1px solid #ddd; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
                    .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                    .label { font-weight: bold; color: #555; width: 35%; flex-shrink: 0; }
                    .value { color: #111; width: 65%; font-weight: 500; text-align: right; }
                    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
                    .signature-line { width: 250px; border-top: 1px solid #333; margin: 60px auto 10px; text-align: center; font-weight: bold; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Centro de Treinamento Marítimo</h1>
                    <p>Comprovativo Oficial de Matrícula</p>
                </div>
                
                <h3 style="text-align: center; margin-bottom: 25px; color: #444;">Detalhes da Inscrição</h3>
                
                <div class="content-box">
                    <div class="row">
                        <span class="label">ID da Matrícula:</span>
                        <span class="value">${m.id}</span>
                    </div>
                    <div class="row">
                        <span class="label">Nome do Aluno:</span>
                        <span class="value">${m.studentName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Curso / Formação:</span>
                        <span class="value">${m.course}</span>
                    </div>
                    <div class="row">
                        <span class="label">Sala / Turma:</span>
                        <span class="value">${m.classroom || 'A designar'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Formador Associado:</span>
                        <span class="value">${m.trainer || 'A designar'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Horário das Aulas:</span>
                        <span class="value">${m.schedule || 'A designar'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Data de Início:</span>
                        <span class="value">${m.startDate ? new Date(m.startDate).toLocaleDateString('pt-BR') : 'A designar'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Duração Prevista:</span>
                        <span class="value">${m.duration || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Status do Pagamento:</span>
                        <span class="value">${m.paymentStatus} ${m.amountDue > 0 ? ` (Dívida: ${m.amountDue} KZ)` : ''}</span>
                    </div>
                </div>

                <div class="signature-line">
                    Assinatura do Aluno / Responsável
                </div>

                <div class="footer">
                    Documento gerado pelo Sistema de Gestão Académica a ${new Date().toLocaleString('pt-BR')}.<br>
                    Não dispensa a validação da Instituição em caso de discrepâncias ou litígios.
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const getPaymentClass = (status: string) => {
        if (!status) return 'pay-pending';
        const s = status.toLowerCase();
        if (s.includes('total')) return 'pay-paid';
        if (s.includes('metade')) return 'pay-half';
        return 'pay-pending';
    };

    const filteredMatriculations = data.matriculations.filter(m => {
        const matchTrainer = filters.trainer ? m.trainer.includes(filters.trainer) : true;
        const matchStudent = filters.student ? m.studentName.toLowerCase().includes(filters.student.toLowerCase()) : true;
        const matchSchedule = filters.schedule ? (m.schedule || '').includes(filters.schedule) : true;
        const matchCourse = filters.course ? m.course.includes(filters.course) : true;
        const matchPayment = filters.payment ? (m.paymentStatus || '').includes(filters.payment) : true;

        return matchTrainer && matchStudent && matchSchedule && matchCourse && matchPayment;
    });

    const totalPages = Math.ceil(filteredMatriculations.length / itemsPerPage);
    const paginatedMatriculations = filteredMatriculations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Gestão de Matrículas</h1>
                    <p>Inscreva alunos em turmas, defina horários e controle pagamentos.</p>
                </div>
                <button className="new-btn" onClick={() => { setIsModalOpen(true); setSelectedStudent(null); setSearchQuery(''); }}>
                    + Nova Matrícula
                </button>
            </div>

            {/* Filters Section */}
            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Filtrar por aluno..."
                    value={filters.student}
                    onChange={e => { setFilters({ ...filters, student: e.target.value }); setCurrentPage(1); }}
                    className="filter-input"
                />
                <select value={filters.course} onChange={e => { setFilters({ ...filters, course: e.target.value }); setCurrentPage(1); }} className="filter-select">
                    <option value="">Todos os Cursos</option>
                    {[...new Set(data.matriculations.map(m => m.course))].filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.trainer} onChange={e => { setFilters({ ...filters, trainer: e.target.value }); setCurrentPage(1); }} className="filter-select">
                    <option value="">Todos os Formadores</option>
                    {[...new Set(data.matriculations.map(m => m.trainer))].filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Horário (ex: 08:00)"
                    value={filters.schedule}
                    onChange={e => { setFilters({ ...filters, schedule: e.target.value }); setCurrentPage(1); }}
                    className="filter-input"
                />
                <select value={filters.payment} onChange={e => { setFilters({ ...filters, payment: e.target.value }); setCurrentPage(1); }} className="filter-select">
                    <option value="">Pagamentos (Todos)</option>
                    <option value="Pago Total">Pago Total</option>
                    <option value="Metade">Metade</option>
                    <option value="Pendente">Pendente</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loader">A carregar matrículas...</div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Curso / Sala</th>
                                <th>Formador</th>
                                <th>Início & Horário</th>
                                <th>Pagamento</th>
                                <th className="align-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMatriculations.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="info-cell">
                                            <Link href={`/admin/students/${m.studentId}`} className="name-link">
                                                <span className="bold highlight">{m.studentName || '—'}</span>
                                            </Link>
                                            <span className="sub">ID: {(m.studentId || '').substring(0, 8) || '—'}...</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span className="bold course-link" onClick={() => {
                                                const c = data.courses.find(course => course.title === m.course);
                                                if (c) setSelectedCourse(c);
                                            }}>{m.course || '—'}</span>
                                            <span className="sub">{m.classroom || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {(() => {
                                            const t = data.trainers.find(trainer => trainer.name === m.trainer);
                                            return t ? (
                                                <Link href={`/admin/trainers/${t.id}`} className="name-link">
                                                    <span className="highlight">{m.trainer}</span>
                                                </Link>
                                            ) : (
                                                m.trainer || '—'
                                            );
                                        })()}
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span>{m.startDate || '—'}</span>
                                            <span className="sub">{m.schedule || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span className={`pay-badge ${getPaymentClass(m.paymentStatus)}`}>
                                                {m.paymentStatus || 'Pendente'}
                                            </span>
                                            {m.amountDue > 0 && <span className="debt-label">Falta: {m.amountDue} KZ</span>}
                                        </div>
                                    </td>
                                    <td className="align-right actions-cell">
                                        <button className="row-btn action-print" onClick={() => handlePrintReceipt(m)} title="Imprimir Comprovativo">📄</button>
                                        <button className="row-btn delete" onClick={() => handleDelete(m.id)} title="Remover">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.matriculations.length === 0 && (
                        <div className="empty-state">Nenhuma matrícula registada. Clique em "Nova Matrícula" para começar.</div>
                    )}
                    {totalPages > 1 && !loading && data.matriculations.length > 0 && (
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

            {/* Course Detail Modal */}
            {selectedCourse && (
                <div className="overlay">
                    <div className="modal-box drill-down">
                        <div className="modal-top">
                            <div>
                                <span className="badge-mini">⚓ Detalhes do Curso</span>
                                <h2>{selectedCourse.title}</h2>
                            </div>
                            <button className="close-x" onClick={() => setSelectedCourse(null)}>×</button>
                        </div>

                        <div className="drill-content">
                            <div className="drill-main">
                                <div className="section-label">Descrição e Ementa</div>
                                <p className="drill-desc">{selectedCourse.description || 'Nenhuma descrição disponível para este curso.'}</p>

                                <div className="section-label">Materiais Didáticos</div>
                                <div className="drill-materials">
                                    {(selectedCourse.materials || []).length === 0 ? (
                                        <div className="empty-mini">Nenhum material anexado.</div>
                                    ) : (
                                        selectedCourse.materials.map((mat, i) => (
                                            <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer" className="mat-item">
                                                <span className="mat-icon">📄</span>
                                                <span className="mat-name">{mat.name}</span>
                                                <span className="mat-dl">⬇</span>
                                            </a>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="drill-side">
                                <div className="section-label">Informação Rápida</div>
                                <div className="side-stat">
                                    <span className="ss-label">Status</span>
                                    <span className={`status-pill ${selectedCourse.status === 'Inscrições Abertas' ? 'active' : 'inactive'}`}>
                                        {selectedCourse.status}
                                    </span>
                                </div>
                                <div className="side-stat">
                                    <span className="ss-label">Duração</span>
                                    <span className="ss-val">{selectedCourse.duration}</span>
                                </div>
                                <div className="side-stat">
                                    <span className="ss-label">ID do Curso</span>
                                    <span className="ss-val mono">{selectedCourse.id.substring(0, 8)}...</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-save" onClick={() => setSelectedCourse(null)}>Fechar Visualização</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="overlay">
                    <div className="modal-box">
                        <div className="modal-top">
                            <div>
                                <h2>⚓ Efetivar Matrícula</h2>
                                <p>Vincule um aluno a um curso, sala e formador</p>
                            </div>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        {!selectedStudent ? (
                            <div className="search-panel">
                                <div className="section-label">1. Selecionar Aluno</div>
                                <div className="field">
                                    <label>Pesquisar por nome ou documento</label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Digite o nome ou número de documento..."
                                        autoFocus
                                    />
                                </div>
                                {searchQuery.length > 0 && (
                                    <div className="search-results">
                                        {filteredStudents.slice(0, 6).map(s => (
                                            <div key={s.id} className="search-item" onClick={() => setSelectedStudent(s)}>
                                                <div className="si-avatar">{s.name?.[0] || '?'}</div>
                                                <div>
                                                    <strong>{s.name}</strong>
                                                    <small>{s.idDocument || 'Sem documento'}</small>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredStudents.length === 0 && (
                                            <div className="no-results">Nenhum aluno encontrado para "{searchQuery}"</div>
                                        )}
                                    </div>
                                )}
                                {searchQuery.length === 0 && (
                                    <div className="search-hint">
                                        <span>👆</span>
                                        <span>Digite acima para pesquisar entre {data.students.length} alunos registados</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleCreate} className="modal-form">
                                <div className="selected-banner">
                                    <div className="sb-avatar">{selectedStudent.name?.[0] || '?'}</div>
                                    <div style={{ flex: 1 }}>
                                        <strong>{selectedStudent.name}</strong>
                                        <small>Doc: {selectedStudent.idDocument || 'N/A'}</small>
                                    </div>
                                    <button type="button" className="swap-btn" onClick={() => setSelectedStudent(null)}>
                                        Trocar Aluno
                                    </button>
                                </div>

                                <div className="form-col">
                                    <div className="section-label">2. Dados Académicos</div>
                                    <div className="field">
                                        <label>Formação / Curso *</label>
                                        <select required value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}>
                                            <option value="">Selecionar curso...</option>
                                            {data.courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>Sala / Convés *</label>
                                        <select required value={formData.classroom} onChange={e => setFormData({ ...formData, classroom: e.target.value })}>
                                            <option value="">Selecionar sala...</option>
                                            {data.classrooms.map(cl => <option key={cl.id} value={cl.name}>{cl.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>Formador *</label>
                                        <select required value={formData.trainer} onChange={e => setFormData({ ...formData, trainer: e.target.value })}>
                                            <option value="">Selecionar formador...</option>
                                            {data.trainers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-col">
                                    <div className="section-label">3. Logística e Pagamento</div>
                                    <div className="field">
                                        <label>Data de Início *</label>
                                        <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Horário</label>
                                        <input type="text" placeholder="Ex: 08:00 - 12:00" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Duração</label>
                                        <input type="text" placeholder="Ex: 3 meses" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Status de Pagamento</label>
                                        <select value={formData.paymentStatus} onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}>
                                            <option value="Pendente">🔴 Pendente</option>
                                            <option value="Metade">🟠 Metade (50%)</option>
                                            <option value="Pago Total">🟢 Pago Total</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>Valor em Dívida (KZ)</label>
                                        <input type="number" min="0" value={formData.amountDue} onChange={e => setFormData({ ...formData, amountDue: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-save">⚓ Efetivar Matrícula</button>
                                </div>
                            </form>
                        )}
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

                .loader { text-align: center; padding: 4rem; color: #94a3b8; font-weight: 500; }
                .empty-state { text-align: center; padding: 3rem; color: #94a3b8; font-weight: 500; }

                .name-link { text-decoration: none; color: inherit; transition: 0.2s; }
                .name-link:hover { color: var(--ocean-blue); }
                .highlight { text-decoration: underline; text-decoration-color: var(--sand-gold); text-underline-offset: 4px; }

                .course-link { cursor: pointer; text-decoration: underline; text-decoration-color: transparent; transition: 0.2s; }
                .course-link:hover { color: var(--ocean-blue); text-decoration-color: var(--ocean-blue); }

                /* Filter Bar */
                .filter-bar { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; }
                .filter-input, .filter-select { padding: 0.6rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; background: #f8fafc; color: var(--navy-deep); outline: none; transition: 0.2s; flex: 1; min-width: 150px; }
                .filter-input:focus, .filter-select:focus { background: white; border-color: var(--ocean-blue); box-shadow: 0 0 0 3px rgba(0,116,217,0.12); }

                /* Table */
                .table-wrap { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; }
                .data-table tr:last-child td { border-bottom: none; }
                .data-table tr:hover td { background: #fafbfc; }

                .info-cell { display: flex; flex-direction: column; gap: 0.15rem; }
                .bold { font-weight: 700; color: var(--navy-deep); }
                .sub { font-size: 0.78rem; color: #94a3b8; }

                .pay-badge { padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; display: inline-block; }
                .pay-paid { background: #ecfdf5; color: #059669; }
                .pay-half { background: #fffbeb; color: #d97706; }
                .pay-pending { background: #fef2f2; color: #dc2626; }
                .debt-label { font-size: 0.75rem; color: #dc2626; font-weight: 700; }

                .align-right { text-align: right; }
                .actions-cell { display: flex; justify-content: flex-end; gap: 0.5rem; }
                .row-btn {background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.35rem; border-radius: 6px; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; opacity: 0.8; }
                .row-btn:hover { opacity: 1; }
                .action-print { color: var(--ocean-blue); background: #f0f9ff; }
                .action-print:hover { background: #e0f2fe; }
                .row-btn.delete { color: #dc2626; background: #fef2f2; }
                .row-btn.delete:hover { background: #fee2e2; }

                /* Pagination */
                .pagination { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
                .page-btn { padding: 0.6rem 1.25rem; border: 1px solid #cbd5e1; background: white; border-radius: 8px; font-weight: 600; font-size: 0.85rem; color: #475569; cursor: pointer; transition: 0.2s; }
                .page-btn:hover:not(:disabled) { background: #f1f5f9; color: var(--navy-deep); }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-info { font-size: 0.85rem; color: #64748b; font-weight: 500; }

                /* Modal */
                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-box { background: white; width: 100%; max-width: 860px; max-height: 92vh; overflow-y: auto; border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.3); }
                .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 2rem; }
                .modal-top h2 { margin: 0; font-size: 1.4rem; color: var(--navy-deep); font-weight: 800; }
                .modal-top p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #64748b; }
                .close-x { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s; }
                .close-x:hover { background: #e2e8f0; }

                /* Student Search */
                .search-panel { display: flex; flex-direction: column; gap: 1rem; }
                .search-results { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 0.5rem; }
                .search-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
                .search-item:last-child { border-bottom: none; }
                .search-item:hover { background: #f8fafc; }
                .search-item strong { display: block; color: var(--navy-deep); font-weight: 700; }
                .search-item small { display: block; color: #94a3b8; font-size: 0.78rem; }
                .si-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--navy-deep), var(--ocean-blue)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
                .no-results { padding: 1.5rem; text-align: center; color: #94a3b8; }
                .search-hint { display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; color: #64748b; font-size: 0.9rem; border: 1px dashed #e2e8f0; }

                /* Selected Student Banner */
                .selected-banner { display: flex; align-items: center; gap: 1rem; background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 2rem; }
                .sb-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--ocean-blue), var(--navy-deep)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
                .selected-banner strong { display: block; color: var(--navy-deep); font-weight: 800; }
                .selected-banner small { display: block; color: #64748b; font-size: 0.78rem; }
                .swap-btn { background: white; border: 1px solid #bae6fd; color: var(--ocean-blue); padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; margin-left: auto; }
                .swap-btn:hover { background: #e0f2fe; }

                /* Form */
                .modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .form-col { display: flex; flex-direction: column; }
                .section-label { font-size: 0.8rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; }
                .field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.2rem; }
                .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
                .field input, .field select { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; background: #f8fafc; color: var(--navy-deep); font-family: inherit; transition: all 0.2s; }
                .field input:focus, .field select:focus { outline: none; background: white; border-color: var(--ocean-blue); box-shadow: 0 0 0 3px rgba(0,116,217,0.12); }

                .modal-footer { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #f1f5f9; }
                .btn-cancel { padding: 0.85rem 1.75rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
                .btn-cancel:hover { background: #f8fafc; }
                .btn-save { padding: 0.85rem 2rem; border-radius: 12px; border: none; background: var(--navy-deep); color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
                .btn-save:hover { background: var(--ocean-blue); transform: translateY(-2px); }

                /* Drill Down Specific */
                .modal-box.drill-down { max-width: 720px; }
                .badge-mini { font-size: 0.65rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; display: block; }
                .drill-content { display: grid; grid-template-columns: 1fr 240px; gap: 2.5rem; margin-bottom: 2rem; }
                .drill-desc { font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0; }
                .drill-materials { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
                .mat-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: var(--navy-deep); font-weight: 600; font-size: 0.88rem; transition: 0.2s; }
                .mat-item:hover { border-color: var(--ocean-blue); background: #f0f9ff; }
                .mat-icon { font-size: 1.1rem; }
                .mat-dl { margin-left: auto; opacity: 0.4; }
                .empty-mini { color: #94a3b8; font-size: 0.88rem; font-style: italic; }

                .drill-side { background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1.25rem; height: fit-content; }
                .side-stat { display: flex; flex-direction: column; gap: 0.25rem; }
                .ss-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                .ss-val { font-size: 0.95rem; font-weight: 700; color: var(--navy-deep); }
                .ss-val.mono { font-family: monospace; font-size: 0.85rem; }

                @media (max-width: 768px) { 
                    .modal-form { grid-template-columns: 1fr; } 
                    .modal-footer { grid-column: span 1; } 
                    .drill-content { grid-template-columns: 1fr; gap: 1.5rem; } 
                }
            `}</style>
        </div>
    );
}
