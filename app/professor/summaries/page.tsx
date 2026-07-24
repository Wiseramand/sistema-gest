'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Course {
    id: string;
    title: string;
}

interface Summary {
    id: string;
    courseId: string;
    date: string;
    content: string;
}

export default function SummariesPage() {
    const { data: session, status } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSummary, setNewSummary] = useState({ date: new Date().toISOString().split('T')[0], content: '' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const userId = (session?.user as any)?.id;
            if (!userId) return;
            const [resC, resM] = await Promise.all([
                fetch('/api/courses'),
                fetch('/api/matriculations')
            ]);
            const allCourses = await resC.json();
            const allMatrics = await resM.json();

            // Filter courses assigned to this trainer
            const myCourseTitles = new Set(allMatrics.filter((m: any) => m.trainerId === userId).map((m: any) => m.course));
            const myCourses = allCourses.filter((c: any) => c.trainerId === userId || myCourseTitles.has(c.title));
            
            setCourses(myCourses);
            if (myCourses.length > 0 && !selectedCourse) setSelectedCourse(myCourses[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [session]);

    useEffect(() => {
        if (selectedCourse) {
            fetchSummaries();
        }
    }, [selectedCourse]);

    const fetchSummaries = async () => {
        if (!selectedCourse) return;
        try {
            const res = await fetch(`/api/summaries?courseId=${selectedCourse.id}`);
            const data = await res.json();
            setSummaries(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse || !newSummary.content) return;
        setSaving(true);
        try {
            const res = await fetch('/api/summaries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: selectedCourse.id,
                    courseTitle: selectedCourse.title,
                    date: newSummary.date,
                    content: newSummary.content,
                    trainerId: (session?.user as any)?.id || '',
                    trainerName: session?.user?.name || 'Formador'
                })
            });
            if (res.ok) {
                setNewSummary({ ...newSummary, content: '' });
                fetchSummaries();
                alert('Sumário guardado com sucesso!');
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const applyTemplate = (templateType: string) => {
        let text = '';
        if (templateType === 'teoria') {
            text = `• Apresentação dos objetivos operacionais e teóricos da norma STCW.\n• Análise detalhada dos regulamentos internacionais de segurança no mar.\n• Procedimentos de emergência, comunicação com a ponte e prevenção de riscos.`;
        } else if (templateType === 'pratica') {
            text = `• Exercício prático no simulador marítimo / tanque de instrução.\n• Inspeção de equipamentos de proteção individual (EPI) e meios de salvação.\n• Simulação de abandono de embarcação e combate ao fogo.`;
        } else if (templateType === 'avaliacao') {
            text = `• Revisão geral da matéria lecionada ao longo do módulo.\n• Esclarecimento de dúvidas com os formandos.\n• Aplicação da avaliação contínua teórica e prática para homologação.`;
        }
        setNewSummary(prev => ({ ...prev, content: text }));
    };

    if (status === 'loading') {
        return <div className="p-8 text-center text-gray-500">A carregar...</div>;
    }

    if (!session) {
        return <div className="p-8 text-center text-red-500">Acesso negado. Por favor inicie sessão.</div>;
    }

    return (
        <div className="summaries-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Registos de Sumário Pedagógico</h1>
                    <p>Documente o conteúdo lecionado em cada aula para fins de qualidade e auditoria.</p>
                </div>
            </div>

            <div className="summaries-layout">
                <div className="course-picker card shadow-sm">
                    <h3>Turmas Atribuídas</h3>
                    <div className="course-tabs">
                        {courses.map(c => (
                            <button 
                                key={c.id} 
                                className={`course-tab ${selectedCourse?.id === c.id ? 'active' : ''}`}
                                onClick={() => setSelectedCourse(c)}
                            >
                                📖 {c.title}
                            </button>
                        ))}
                        {courses.length === 0 && !loading && <p className="empty-txt">Nenhuma turma atribuída.</p>}
                    </div>
                </div>

                <div className="summaries-content">
                    <div className="new-summary-box card shadow-sm">
                        <div className="box-title-row">
                            <h3>📋 Novo Registo de Aula</h3>
                            <div className="template-btn-group">
                                <span className="template-label">Modelos Rápidos:</span>
                                <button type="button" className="btn-tpl" onClick={() => applyTemplate('teoria')}>📖 Teoria STCW</button>
                                <button type="button" className="btn-tpl" onClick={() => applyTemplate('pratica')}>🔧 Prática & Simulador</button>
                                <button type="button" className="btn-tpl" onClick={() => applyTemplate('avaliacao')}>📑 Avaliação</button>
                            </div>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="form-row">
                                <div className="field">
                                    <label>Data da Aula</label>
                                    <input 
                                        type="date" 
                                        value={newSummary.date} 
                                        onChange={e => setNewSummary({ ...newSummary, date: e.target.value })} 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label>Conteúdo / Sumário Lecionado</label>
                                <textarea 
                                    value={newSummary.content} 
                                    onChange={e => setNewSummary({ ...newSummary, content: e.target.value })} 
                                    placeholder="Descreva os tópicos abordados nesta sessão de formação..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-submit" disabled={saving || !selectedCourse}>
                                {saving ? 'A guardar...' : '💾 Registar Sumário'}
                            </button>
                        </form>
                    </div>

                    <div className="history-box card shadow-sm">
                        <h3>📜 Histórico de Sumários ({selectedCourse?.title || 'Selecione uma turma'})</h3>
                        <div className="summaries-list">
                            {summaries.map(s => (
                                <div key={s.id} className="summary-item">
                                    <div className="summary-date">📅 {new Date(s.date).toLocaleDateString('pt-PT')}</div>
                                    <div className="summary-text">{s.content}</div>
                                </div>
                            ))}
                            {summaries.length === 0 && <p className="empty-txt">Nenhum sumário registado para esta turma ainda.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .summaries-page { padding: 1.5rem 0; }
                .page-header h1 { font-size: 2rem; color: var(--color-primary); margin-top: 0.5rem; }
                .page-header p { color: var(--color-text-muted); font-size: 0.95rem; }

                .summaries-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; margin-top: 2rem; }
                .course-picker h3 { font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1.25rem; font-weight: 800; }
                .course-tabs { display: flex; flex-direction: column; gap: 0.5rem; }
                .course-tab { padding: 0.85rem 1rem; border-radius: 10px; border: 1.5px solid var(--color-border); background: var(--color-surface); text-align: left; font-weight: 700; color: var(--color-primary); cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
                .course-tab:hover { background: var(--color-sandstone-light); border-color: var(--color-accent); }
                .course-tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

                .summaries-content { display: flex; flex-direction: column; gap: 2rem; }
                .box-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
                .box-title-row h3 { margin: 0; color: var(--color-primary); font-size: 1.2rem; font-weight: 800; }

                .template-btn-group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
                .template-label { font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; }
                .btn-tpl { background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.35rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: var(--color-primary); cursor: pointer; transition: 0.2s; }
                .btn-tpl:hover { background: var(--color-accent); color: white; border-color: var(--color-accent); }

                .form-row { margin-bottom: 1rem; }
                .field label { font-size: 0.85rem; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 0.4rem; }
                .field input, .field textarea { width: 100%; padding: 0.85rem 1rem; border: 1.5px solid var(--color-border); border-radius: 10px; font-size: 0.95rem; background: var(--color-surface); outline: none; font-family: var(--font-body); }
                .field input:focus, .field textarea:focus { background: white; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12); }

                .btn-submit { background: var(--color-primary); color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.2s; margin-top: 1rem; }
                .btn-submit:hover:not(:disabled) { background: var(--color-accent); transform: translateY(-2px); }

                .history-box h3 { font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1.25rem; font-weight: 800; }
                .summaries-list { display: flex; flex-direction: column; gap: 1rem; }
                .summary-item { padding: 1.25rem; background: var(--color-surface); border-radius: 12px; border: 1px solid var(--color-border); }
                .summary-date { font-size: 0.8rem; font-weight: 800; color: var(--color-accent); margin-bottom: 0.5rem; }
                .summary-text { font-size: 0.9rem; color: var(--color-text); line-height: 1.6; whitespace: pre-wrap; }
                .empty-txt { color: var(--color-text-muted); font-size: 0.9rem; font-style: italic; }

                @media (max-width: 768px) {
                    .summaries-layout { grid-template-columns: 1fr; }
                    .box-title-row { flex-direction: column; align-items: flex-start; }
                }
            `}</style>
        </div>
    );
}
