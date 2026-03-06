'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
    id: string; // studentId
    name: string;
    matriculationId: string;
}

interface ClassGroup {
    id: string;
    course: string;
    classroom: string;
    trainer: string;
    trainerId: string;
    startDate: string;
    schedule: string;
    students: Student[];
}

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
    const [filters, setFilters] = useState({
        course: '',
        trainer: '',
        startDate: '',
        classroom: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mRes, tRes] = await Promise.all([
                fetch('/api/matriculations'),
                fetch('/api/trainers')
            ]);
            const matriculations = await mRes.json();
            const trainers = await tRes.json();

            // Grouping logic
            const groups: { [key: string]: ClassGroup } = {};

            matriculations.forEach((m: any) => {
                const groupKey = `${m.course}-${m.classroom}-${m.trainer}-${m.startDate}-${m.schedule}`;
                if (!groups[groupKey]) {
                    const trainerObj = trainers.find((t: any) => t.name === m.trainer);
                    groups[groupKey] = {
                        id: groupKey,
                        course: m.course,
                        classroom: m.classroom,
                        trainer: m.trainer,
                        trainerId: trainerObj?.id || '',
                        startDate: m.startDate,
                        schedule: m.schedule,
                        students: []
                    };
                }
                groups[groupKey].students.push({
                    id: m.studentId,
                    name: m.studentName,
                    matriculationId: m.id
                });
            });

            setClasses(Object.values(groups));
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(cls => {
        const matchCourse = filters.course ? cls.course.toLowerCase().includes(filters.course.toLowerCase()) : true;
        const matchTrainer = filters.trainer ? cls.trainer.toLowerCase().includes(filters.trainer.toLowerCase()) : true;
        const matchDate = filters.startDate ? cls.startDate.includes(filters.startDate) : true;
        const matchRoom = filters.classroom ? cls.classroom.toLowerCase().includes(filters.classroom.toLowerCase()) : true;
        return matchCourse && matchTrainer && matchDate && matchRoom;
    });

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemoveStudent = async (matriculationId: string) => {
        if (!confirm('Tem a certeza que deseja remover este aluno desta turma? Esta ação irá cancelar a matrícula.')) return;

        try {
            const res = await fetch(`/api/matriculations/${matriculationId}`, { method: 'DELETE' });
            if (res.ok) {
                // Refresh data and update local state to close modal if empty or just refresh list
                await fetchData();
                if (selectedClass) {
                    const updatedClass = (await (await fetch('/api/matriculations')).json())
                        .filter((m: any) => `${m.course}-${m.classroom}-${m.trainer}-${m.startDate}-${m.schedule}` === selectedClass.id);

                    if (updatedClass.length === 0) {
                        setSelectedClass(null);
                    } else {
                        // Normally grouping would handle this but for simplicity just refresh all
                        fetchData();
                    }
                }
            }
        } catch (error) {
            console.error('Error removing student:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Formações & Turmas</h1>
                    <p>Visualize todos os grupos de alunos organizados por curso, formador e sala.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-item">
                    <label>Curso</label>
                    <input
                        type="text"
                        placeholder="Filtrar curso..."
                        value={filters.course}
                        onChange={e => setFilters({ ...filters, course: e.target.value })}
                    />
                </div>
                <div className="filter-item">
                    <label>Formador</label>
                    <input
                        type="text"
                        placeholder="Filtrar formador..."
                        value={filters.trainer}
                        onChange={e => setFilters({ ...filters, trainer: e.target.value })}
                    />
                </div>
                <div className="filter-item">
                    <label>Data de Início</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>
                <div className="filter-item">
                    <label>Sala</label>
                    <input
                        type="text"
                        placeholder="Filtrar sala..."
                        value={filters.classroom}
                        onChange={e => setFilters({ ...filters, classroom: e.target.value })}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loader">A carregar turmas...</div>
            ) : (
                <div className="classes-grid">
                    {filteredClasses.map((cls) => (
                        <div key={cls.id} className="class-card card" onClick={() => setSelectedClass(cls)}>
                            <div className="card-header">
                                <span className="course-name">{cls.course}</span>
                                <span className="student-count">👥 {cls.students.length} Alunos</span>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="label">Formador:</span>
                                    {cls.trainerId ? (
                                        <Link href={`/admin/trainers/${cls.trainerId}`} className="name-link" onClick={e => e.stopPropagation()}>
                                            <span className="val highlight">{cls.trainer}</span>
                                        </Link>
                                    ) : (
                                        <span className="val">{cls.trainer}</span>
                                    )}
                                </div>
                                <div className="info-row">
                                    <span className="label">Início:</span>
                                    <span className="val">{cls.startDate}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Horário:</span>
                                    <span className="val">{cls.schedule}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Sala:</span>
                                    <span className="val">{cls.classroom}</span>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn-view">Ver Lista de Alunos</button>
                            </div>
                        </div>
                    ))}

                    {classes.length === 0 && (
                        <div className="empty-state">
                            Nenhuma turma formada ainda. Crie matrículas para começar a agrupar.
                        </div>
                    )}
                </div>
            )}

            {/* Student List Modal */}
            {selectedClass && (
                <div className="overlay" onClick={() => setSelectedClass(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-top">
                            <div>
                                <span className="badge-mini">⚓ Lista da Turma</span>
                                <h2>{selectedClass.course}</h2>
                                <p>{selectedClass.trainer} | {selectedClass.startDate} às {selectedClass.schedule}</p>
                            </div>
                            <button className="close-x" onClick={() => setSelectedClass(null)}>&times;</button>
                        </div>

                        <div className="student-list">
                            <table className="student-table">
                                <thead>
                                    <tr>
                                        <th>Nº</th>
                                        <th>Nome do Aluno</th>
                                        <th>ID de Matrícula</th>
                                        <th className="align-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedClass.students.map((s, index) => (
                                        <tr key={index}>
                                            <td className="idx">{index + 1}</td>
                                            <td className="name">
                                                <Link href={`/admin/students/${s.id}`} className="name-link">
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td className="id">{(s.matriculationId || 'N/A').substring(0, 8)}</td>
                                            <td className="align-right">
                                                <button
                                                    className="btn-remove"
                                                    title="Remover da Turma"
                                                    onClick={() => handleRemoveStudent(s.matriculationId)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir Lista</button>
                            <button className="btn-close" onClick={() => setSelectedClass(null)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { margin-bottom: 2rem; }
                .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; font-size: 0.95rem; }

                .filter-bar { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
                .filter-item { display: flex; flex-direction: column; gap: 0.5rem; }
                .filter-item label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .filter-item input { padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 0.9rem; background: #f8fafc; color: var(--navy-deep); outline: none; transition: 0.2s; }
                .filter-item input:focus { border-color: var(--ocean-blue); background: white; box-shadow: 0 0 0 4px rgba(0, 116, 217, 0.1); }

                .loader { padding: 5rem; text-align: center; color: #94a3b8; font-weight: 600; }
                .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; background: white; border-radius: 16px; color: #94a3b8; border: 2px dashed #e2e8f0; }
                
                .name-link { text-decoration: none; color: inherit; transition: 0.2s; display: inline-block; }
                .name-link:hover { color: var(--ocean-blue); }
                .highlight { font-weight: 800; text-decoration: underline; text-decoration-color: var(--sand-gold); text-underline-offset: 4px; }

                .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
                
                .class-card { cursor: pointer; transition: all 0.3s ease; border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; }
                .class-card:hover { transform: translateY(-5px); border-color: var(--ocean-blue); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                
                .card-header { padding: 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .course-name { font-weight: 800; color: var(--navy-deep); font-size: 1.1rem; }
                .student-count { font-size: 0.75rem; font-weight: 700; color: var(--ocean-blue); background: #f0f9ff; padding: 0.3rem 0.6rem; border-radius: 50px; }
                
                .card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
                .info-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
                .label { color: #64748b; font-weight: 600; }
                .val { color: var(--navy-medium); font-weight: 700; }
                
                .card-footer { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; text-align: center; }
                .btn-view { color: var(--ocean-blue); background: none; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
                
                /* Modal Styles */
                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-box { background: white; width: 100%; max-width: 600px; border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.3); }
                .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
                .badge-mini { font-size: 0.65rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.25rem; }
                .modal-top h2 { margin: 0; font-size: 1.4rem; color: var(--navy-deep); font-weight: 800; }
                .modal-top p { margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b; font-weight: 600; }
                .close-x { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; }
                
                .student-list { max-height: 400px; overflow-y: auto; margin-bottom: 1.5rem; border: 1px solid #f1f5f9; border-radius: 12px; }
                .student-table { width: 100%; border-collapse: collapse; }
                .student-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 700; position: sticky; top: 0; }
                .student-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
                .idx { color: #94a3b8; font-weight: 700; width: 40px; }
                .name { font-weight: 700; color: var(--navy-deep); }
                .id { font-family: monospace; color: #64748b; font-size: 0.8rem; }
                .align-right { text-align: right; }
                .btn-remove { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.5; transition: 0.2s; padding: 0.4rem; border-radius: 6px; }
                .btn-remove:hover { opacity: 1; background: #fee2e2; }
                
                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; }
                .btn-print { background: var(--ocean-blue); color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-print:hover { background: var(--navy-deep); }
                .btn-close { background: #f1f5f9; color: #64748b; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-close:hover { background: #e2e8f0; }

                /* Print Styles */
                @media print {
                    body * { visibility: hidden; }
                    .modal-box, .modal-box * { visibility: visible; }
                    .modal-box { position: absolute; left: 0; top: 0; width: 100%; border-radius: 0; box-shadow: none; padding: 20px; }
                    .overlay { background: none; }
                    .btn-print, .btn-close, .btn-remove, .close-x { display: none !important; }
                    .student-list { max-height: none; overflow: visible; border: none; }
                    .student-table th, .student-table td { color: black; border-bottom: 1px solid #ddd; }
                    .badge-mini { color: black; }
                    .modal-top h2, .modal-top p { color: black; }
                }
            `}</style>
        </div>
    );
}
