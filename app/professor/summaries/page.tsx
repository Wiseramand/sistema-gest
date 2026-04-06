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
    const { data: session } = useSession();
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
            const userId = (session.user as any).id;
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
                    trainerId: (session?.user as any).id,
                    trainerName: session?.user.name
                })
            });
            if (res.ok) {
                setNewSummary({ ...newSummary, content: '' });
                fetchSummaries();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <div className="summaries-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Registos de Sumário</h1>
                    <p>Documente o conteúdo lecionado em cada aula para fins de qualidade e histórico.</p>
                </div>
            </div>

            <div className="summaries-layout">
                <div className="course-picker card shadow-sm">
                    <h3>Selecionar Turma</h3>
                    <div className="course-tabs">
                        {courses.map(c => (
                            <button 
                                key={c.id} 
                                className={`course-tab ${selectedCourse?.id === c.id ? 'active' : ''}`}
                                onClick={() => setSelectedCourse(c)}
                            >
                                {c.title}
                            </button>
                        ))}
                        {courses.length === 0 && !loading && <p className="empty-txt">Nenhuma turma atribuída.</p>}
                    </div>
                </div>

                <div className="summaries-content">
                    <div className="new-summary-box card shadow-sm">
                        <h3>📋 Novo Registo</h3>
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
                                <label>Conteúdo / Sumário</label>
                                <textarea 
                                    value={newSummary.content} 
                                    onChange={e => setNewSummary({ ...newSummary, content: e.target.value })} 
                                    placeholder="Descreva o que foi lecionado hoje..."
                                    rows={5}
                                    required
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save" disabled={saving || !selectedCourse}>
                                    {saving ? 'A guardar...' : '✓ Guardar Sumário'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="history-box">
                        <h3>Histórico de Sumários</h3>
                        <div className="summary-list">
                            {summaries.map(s => (
                                <div key={s.id} className="summary-card card shadow-sm">
                                    <div className="summary-meta">
                                        <span className="date-badge">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="summary-body">
                                        {s.content}
                                    </div>
                                </div>
                            ))}
                            {summaries.length === 0 && <div className="empty-state">Sem sumários registados para esta turma.</div>}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .summaries-page { padding: 1rem 0; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 1.8rem; color: var(--navy-deep); margin-top: 0.5rem; }
                
                .summaries-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start; }
                
                .course-picker { padding: 1.5rem; }
                .course-picker h3 { font-size: 1rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
                .course-tabs { display: flex; flex-direction: column; gap: 0.5rem; }
                .course-tab { padding: 1rem; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; text-align: left; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
                .course-tab:hover { background: #f8fafc; border-color: var(--ocean-blue); }
                .course-tab.active { background: #f0f7ff; border-color: var(--ocean-blue); color: var(--ocean-blue); box-shadow: 0 4px 12px rgba(0,116,217,0.1); }
                
                .summaries-content { display: flex; flex-direction: column; gap: 2rem; }
                
                .new-summary-box { padding: 2rem; }
                .new-summary-box h3 { margin-bottom: 1.5rem; color: var(--navy-deep); }
                .form-row { margin-bottom: 1rem; }
                .field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
                .field label { font-size: 0.85rem; font-weight: 700; color: #475569; }
                .field input, .field textarea { padding: 1rem; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; }
                .field input:focus, .field textarea:focus { outline: none; border-color: var(--ocean-blue); background: white; }
                
                .form-actions { display: flex; justify-content: flex-end; }
                .btn-save { background: var(--navy-deep); color: white; border: none; padding: 0.85rem 2rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-save:hover { background: var(--ocean-blue); transform: translateY(-2px); }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .history-box h3 { font-size: 1.2rem; color: var(--navy-deep); margin-bottom: 1rem; }
                .summary-list { display: flex; flex-direction: column; gap: 1rem; }
                .summary-card { padding: 1.5rem; border-left: 4px solid var(--sand-gold); }
                .date-badge { font-family: 'Outfit', sans-serif; font-weight: 800; color: var(--ocean-blue); background: #f0f9ff; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; }
                .summary-body { margin-top: 1rem; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 1rem; }
                
                .empty-state { padding: 3rem; text-align: center; color: #94a3b8; background: white; border-radius: 16px; border: 2px dashed #e2e8f0; }
                .empty-txt { font-size: 0.85rem; color: #94a3b8; }
            `}</style>
        </div>
    );
}
