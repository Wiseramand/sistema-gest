'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Course {
    id: string;
    title: string;
}

interface StudentGrade {
    studentId: string;
    studentName: string;
    gradeId?: string;
    score: number | '';
    observations: string;
}

export default function GradesPage() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
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

                const myCourseTitles = new Set(allMatrics.filter((m: any) => m.trainerId === userId).map((m: any) => m.course));
                const myCourses = allCourses.filter((c: any) => c.trainerId === userId || myCourseTitles.has(c.title));
                
                setCourses(myCourses);
                if (myCourses.length > 0) setSelectedCourse(myCourses[0]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchCourses();
    }, [session]);

    useEffect(() => {
        const fetchGrades = async () => {
            if (!selectedCourse) return;
            try {
                const userId = (session?.user as any)?.id;
                if (!userId) return;
                const [resM, resG] = await Promise.all([
                    fetch('/api/matriculations'),
                    fetch(`/api/grades?courseId=${selectedCourse.id}`)
                ]);
                const allMatrics = await resM.json();
                const allGrades = await resG.json();

                const courseMatrics = allMatrics.filter((m: any) => 
                    (m.courseId === selectedCourse.id || m.course === selectedCourse.title) &&
                    (m.trainerId === userId || m.trainer === session?.user?.name)
                );

                const gradesMap: Record<string, any> = {};
                if (Array.isArray(allGrades)) {
                    allGrades.forEach(g => { gradesMap[g.studentId] = g; });
                }

                const list = courseMatrics.map((m: any) => ({
                    studentId: m.studentId,
                    studentName: m.studentName,
                    gradeId: gradesMap[m.studentId]?.id,
                    score: gradesMap[m.studentId]?.score ?? '',
                    observations: gradesMap[m.studentId]?.observations ?? ''
                }));

                setStudentGrades(list);
            } catch (e) { console.error(e); }
        };
        fetchGrades();
    }, [selectedCourse, session]);

    const handleScoreChange = (studentId: string, value: string) => {
        const score = value === '' ? '' : parseFloat(value);
        setStudentGrades(prev => prev.map(sg => sg.studentId === studentId ? { ...sg, score: score as any } : sg));
    };

    const handleObsChange = (studentId: string, value: string) => {
        setStudentGrades(prev => prev.map(sg => sg.studentId === studentId ? { ...sg, observations: value } : sg));
    };

    const saveGrades = async () => {
        if (!selectedCourse) return;
        setSaving(true);
        try {
            const userId = (session?.user as any)?.id;
            if (!userId) return;
            const promises = studentGrades.map(sg => {
                const body = {
                    studentId: sg.studentId,
                    studentName: sg.studentName,
                    courseId: selectedCourse.id,
                    courseTitle: selectedCourse.title,
                    score: sg.score === '' ? null : sg.score,
                    observations: sg.observations,
                    trainerId: userId
                };
                
                if (sg.gradeId) {
                    return fetch(`/api/grades/${sg.gradeId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                } else {
                    return fetch('/api/grades', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                }
            });

            await Promise.all(promises);
            alert('Notas guardadas com sucesso!');
        } catch (e) {
            console.error(e);
            alert('Erro ao guardar notas.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grades-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Lançamento de Notas</h1>
                    <p>Atribua avaliações acadêmicas aos alunos das turmas sob sua responsabilidade.</p>
                </div>
            </div>

            <div className="grades-layout">
                <div className="course-nav card shadow-sm">
                    <h3>Minhas Turmas</h3>
                    <div className="nav-list">
                        {courses.map(c => (
                            <button 
                                key={c.id} 
                                className={`nav-item ${selectedCourse?.id === c.id ? 'active' : ''}`}
                                onClick={() => setSelectedCourse(c)}
                            >
                                {c.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grades-content">
                    {selectedCourse ? (
                        <div className="grades-table-card card shadow-sm">
                            <div className="card-top">
                                <h2>Turma: {selectedCourse.title}</h2>
                                <button className="btn-save" onClick={saveGrades} disabled={saving}>
                                    {saving ? 'A guardar...' : '✓ Guardar Todas as Notas'}
                                </button>
                            </div>

                            <table className="grades-table">
                                <thead>
                                    <tr>
                                        <th>Nome do Aluno</th>
                                        <th style={{ width: '120px' }}>Nota (0-20)</th>
                                        <th>Observações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentGrades.map(sg => (
                                        <tr key={sg.studentId}>
                                            <td className="student-name">{sg.studentName}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    min="0" max="20" step="0.5"
                                                    value={sg.score}
                                                    onChange={e => handleScoreChange(sg.studentId, e.target.value)}
                                                    className="score-input"
                                                    placeholder="--"
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    value={sg.observations}
                                                    onChange={e => handleObsChange(sg.studentId, e.target.value)}
                                                    className="obs-input"
                                                    placeholder="Ex: Bom desempenho, Falta participação..."
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {studentGrades.length === 0 && (
                                        <tr><td colSpan={3} className="empty-msg">Nenhum aluno inscrito nesta turma.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state card">
                            <p>Selecione uma turma para lançar as notas.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .grades-page { padding: 1rem 0; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 1.8rem; color: var(--navy-deep); margin-top: 0.5rem; }
                
                .grades-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start; }
                
                .course-nav { padding: 1.5rem; }
                .course-nav h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 800; margin-bottom: 1.25rem; }
                .nav-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .nav-item { padding: 1rem; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; text-align: left; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; }
                .nav-item:hover { background: #f8fafc; border-color: var(--ocean-blue); }
                .nav-item.active { background: #f0f7ff; border-color: var(--ocean-blue); color: var(--ocean-blue); }
                
                .grades-table-card { padding: 2rem; }
                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; }
                .card-top h2 { font-size: 1.3rem; color: var(--navy-deep); margin: 0; }
                
                .btn-save { background: var(--navy-deep); color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-save:hover { background: var(--ocean-blue); transform: translateY(-1px); }
                
                .grades-table { width: 100%; border-collapse: collapse; }
                .grades-table th { text-align: left; padding: 0.75rem 1rem; border-bottom: 2px solid #edf2f7; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 800; }
                .grades-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                
                .student-name { font-weight: 700; color: var(--navy-deep); font-size: 0.95rem; }
                .score-input { width: 80px; padding: 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 8px; text-align: center; font-weight: 800; font-family: 'Outfit', sans-serif; color: var(--ocean-blue); font-size: 1.1rem; }
                .score-input:focus { outline: none; border-color: var(--ocean-blue); background: #f0f9ff; }
                
                .obs-input { width: 100%; padding: 0.6rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; color: #475569; }
                .obs-input:focus { outline: none; border-color: var(--ocean-blue); background: #f8fafc; }
                
                .empty-msg { text-align: center; color: #94a3b8; padding: 3rem; font-style: italic; }
                .empty-state { padding: 5rem; text-align: center; color: #94a3b8; font-weight: 600; }
            `}</style>
        </div>
    );
}
