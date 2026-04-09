'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Grade {
    id: string;
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    score: number;
    observations: string;
    updatedAt: string;
}

interface Course {
    id: string;
    title: string;
}

export default function AdminGradesPage() {
    const { data: session, status } = useSession();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resG, resC] = await Promise.all([
                fetch('/api/grades'),
                fetch('/api/courses')
            ]);
            const gData = await resG.json();
            const cData = await resC.json();
            
            setGrades(Array.isArray(gData) ? gData : []);
            setCourses(Array.isArray(cData) ? cData : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredGrades = grades.filter(g => {
        const matchesSearch = g.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse === 'all' || g.courseId === selectedCourse || g.courseTitle === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    if (status === 'loading') return <div className="p-8 text-center">A carregar...</div>;

    return (
        <div className="admin-grades-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Monitorização de Notas</h1>
                    <p>Visualize e acompanhe o desempenho académico de todos os alunos.</p>
                </div>
            </div>

            <div className="filters-bar card shadow-sm">
                <div className="filter-group">
                    <label>Procurar Aluno</label>
                    <input 
                        type="text" 
                        placeholder="Nome do aluno..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <label>Filtrar por Curso</label>
                    <select 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="select-input"
                    >
                        <option value="all">Todos os Cursos</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                    </select>
                </div>
                <button className="refresh-btn" onClick={fetchData}>🔄 Atualizar</button>
            </div>

            <div className="grades-table-container card shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">A carregar notas...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Curso / Formação</th>
                                <th>Nota Final</th>
                                <th>Observações</th>
                                <th>Última Atualização</th>
                                <th className="align-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGrades.map(g => (
                                <tr key={g.id}>
                                    <td>
                                        <div className="student-info">
                                            <span className="bold">{g.studentName}</span>
                                            <span className="sub">ID: {g.studentId.substring(0,8)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="course-tag">{g.courseTitle}</span>
                                    </td>
                                    <td>
                                        <div className={`grade-badge ${g.score >= 10 ? 'pass' : 'fail'}`}>
                                            {g.score} / 20
                                        </div>
                                    </td>
                                    <td className="obs-cell">
                                        {g.observations || '—'}
                                    </td>
                                    <td>
                                        {new Date(g.updatedAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="align-right">
                                        <Link href={`/admin/students/${g.studentId}`} className="btn-icon" title="Ver Aluno">👤</Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredGrades.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-gray-400">
                                        Nenhum registo de nota encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx>{`
                .admin-grades-page { padding: 1rem 0; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 1.8rem; color: var(--navy-deep); margin-top: 0.5rem; }
                
                .filters-bar { padding: 1.5rem; display: flex; gap: 1.5rem; align-items: flex-end; margin-bottom: 2rem; background: white; }
                .filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
                .filter-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .search-input, .select-input { padding: 0.75rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
                .search-input:focus, .select-input:focus { outline: none; border-color: var(--ocean-blue); }
                
                .refresh-btn { padding: 0.75rem 1.5rem; background: #f1f5f9; border: none; border-radius: 10px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
                .refresh-btn:hover { background: #e2e8f0; }
                
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 1.25rem 1rem; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; border-bottom: 2px solid #e2e8f0; }
                .admin-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
                
                .student-info { display: flex; flex-direction: column; }
                .sub { font-size: 0.75rem; color: #94a3b8; }
                .bold { font-weight: 700; color: var(--navy-deep); }
                
                .course-tag { background: #f0f7ff; color: var(--ocean-blue); padding: 0.25rem 0.75rem; border-radius: 50px; font-weight: 700; font-size: 0.8rem; }
                
                .grade-badge { display: inline-block; padding: 0.4rem 1rem; border-radius: 8px; font-weight: 800; font-family: 'Outfit', sans-serif; }
                .grade-badge.pass { background: #dcfce7; color: #166534; }
                .grade-badge.fail { background: #fee2e2; color: #991b1b; }
                
                .obs-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b; font-style: italic; }
                
                .align-right { text-align: right; }
                .btn-icon { text-decoration: none; padding: 0.5rem; border-radius: 8px; transition: 0.2s; }
                .btn-icon:hover { background: #f1f5f9; transform: scale(1.1); }
            `}</style>
        </div>
    );
}
