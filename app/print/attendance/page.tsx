'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Matriculation {
    studentName: string;
    course: string;
    trainer: string;
    classroom: string;
    startDate: string;
    id: string;
}

function AttendanceListContent() {
    const searchParams = useSearchParams();
    const courseTitle = searchParams?.get('course') || '';
    const [students, setStudents] = useState<{ id: string, name: string }[]>([]);
    const [courseInfo, setCourseInfo] = useState<{ trainer: string, startDate: string, classroom: string } | null>(null);
    const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!courseTitle) return;
            setLoading(true);
            try {
                const res = await fetch('/api/matriculations');
                const allMatriculations: Matriculation[] = await res.json();

                const courseMatriculations = allMatriculations.filter(m => m.course === courseTitle);

                if (courseMatriculations.length > 0) {
                    setCourseInfo({
                        trainer: courseMatriculations[0].trainer,
                        startDate: courseMatriculations[0].startDate,
                        classroom: courseMatriculations[0].classroom
                    });

                    const studentList = courseMatriculations.map(m => ({
                        id: m.id,
                        name: m.studentName
                    }));
                    // Sort alphabetically
                    studentList.sort((a, b) => a.name.localeCompare(b.name));
                    setStudents(studentList);
                }

                const attRes = await fetch(`/api/attendance?course=${encodeURIComponent(courseTitle)}`);
                const attData = await attRes.json();

                const dates = new Set<string>();
                const recordsMap: Record<string, Record<string, string>> = {};

                if (Array.isArray(attData)) {
                    attData.forEach((dayRecord: any) => {
                        dates.add(dayRecord.date);
                        dayRecord.records.forEach((sRec: any) => {
                            if (!recordsMap[sRec.studentId]) {
                                recordsMap[sRec.studentId] = {};
                            }
                            recordsMap[sRec.studentId][dayRecord.date] = sRec.status;
                        });
                    });
                }

                const sortedDates = Array.from(dates).sort();
                setAttendanceDates(sortedDates);
                setAttendanceData(recordsMap);

            } catch (error) {
                console.error("Error fetching students for attendance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [courseTitle]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="loading">A carregar lista de presença...</div>;
    }

    if (!courseTitle) {
        return <div className="error">Nome do curso não fornecido.</div>;
    }

    return (
        <div className="print-page">
            <div className="no-print controls">
                <button onClick={handlePrint} className="print-btn">🖨️ Imprimir Agora</button>
                <button onClick={() => window.close()} className="close-btn">Fechar</button>
            </div>

            <div className="print-document">
                <div className="document-header">
                    <div className="logo-placeholder">⚓ MARÍTIMO</div>
                    <div className="header-text">
                        <h1>Lista de Presença</h1>
                        <h2>{courseTitle}</h2>
                    </div>
                </div>

                <div className="course-details">
                    <div className="detail-item"><strong>Formador:</strong> {courseInfo?.trainer || 'N/D'}</div>
                    <div className="detail-item"><strong>Sala:</strong> {courseInfo?.classroom || 'N/D'}</div>
                    <div className="detail-item"><strong>Data de Início:</strong> {courseInfo?.startDate ? new Date(courseInfo.startDate).toLocaleDateString('pt-BR') : 'N/D'}</div>
                    <div className="detail-item"><strong>Referência:</strong> __________</div>
                </div>

                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th className="num-col">Nº</th>
                            <th className="name-col">Nome do Aluno</th>
                            {attendanceDates.length > 0 ? (
                                attendanceDates.map(date => (
                                    <th key={date} className="sig-col">{new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</th>
                                ))
                            ) : (
                                <>
                                    <th className="sig-col">_______</th>
                                    <th className="sig-col">_______</th>
                                    <th className="sig-col">_______</th>
                                    <th className="sig-col">_______</th>
                                    <th className="sig-col">_______</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student, index) => (
                                <tr key={student.id}>
                                    <td className="num-cell">{index + 1}</td>
                                    <td className="name-cell">{student.name}</td>
                                    {attendanceDates.length > 0 ? (
                                        attendanceDates.map(date => {
                                            const status = attendanceData[student.id]?.[date];
                                            let display = '';
                                            if (status === 'PRESENT') display = 'P';
                                            else if (status === 'ABSENT') display = 'F';
                                            else if (status === 'LATE') display = 'A';
                                            return <td key={date} style={{ textAlign: 'center', fontWeight: 'bold', color: status === 'ABSENT' ? 'red' : status === 'LATE' ? 'orange' : 'inherit' }}>{display}</td>;
                                        })
                                    ) : (
                                        <>
                                            <td></td><td></td><td></td><td></td><td></td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="empty-row">Nenhum aluno matriculado neste curso.</td>
                            </tr>
                        )}
                        {/* Add empty rows to fill the page if there are few students */}
                        {Array.from({ length: Math.max(0, 15 - students.length) }).map((_, i) => (
                            <tr key={`empty-${i}`} className="empty-fill-row">
                                <td className="num-cell"></td>
                                <td className="name-cell"></td>
                                {attendanceDates.length > 0 ? (
                                    attendanceDates.map(date => <td key={`e-${date}`}></td>)
                                ) : (
                                    <><td></td><td></td><td></td><td></td><td></td></>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="document-footer">
                    <div className="signature-area">
                        <div className="sig-line"></div>
                        <p>Assinatura do Formador</p>
                    </div>
                    <div className="signature-area">
                        <div className="sig-line"></div>
                        <p>Visto da Coordenação</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                body {
                    background-color: #f1f5f9;
                    margin: 0;
                    padding: 0;
                }
                
                .print-page {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .controls {
                    margin-bottom: 2rem;
                    display: flex;
                    gap: 1rem;
                }

                .print-btn {
                    background: #1e3a8a;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                }
                
                .close-btn {
                    background: white;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .print-document {
                    background: white;
                    width: 210mm; /* A4 width */
                    min-height: 297mm; /* A4 height */
                    padding: 20mm;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }

                .document-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #1e3a8a;
                    padding-bottom: 1rem;
                    margin-bottom: 1.5rem;
                }

                .logo-placeholder {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #1e3a8a;
                    letter-spacing: 1px;
                }

                .header-text {
                    text-align: right;
                }

                .header-text h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #0f172a;
                    text-transform: uppercase;
                }

                .header-text h2 {
                    margin: 0.5rem 0 0 0;
                    font-size: 1.1rem;
                    color: #475569;
                    font-weight: normal;
                }

                .course-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .detail-item {
                    font-size: 0.9rem;
                    color: #334155;
                }

                .attendance-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 3rem;
                }

                .attendance-table th, .attendance-table td {
                    border: 1px solid #cbd5e1;
                    padding: 0.75rem;
                    text-align: left;
                }

                .attendance-table th {
                    background-color: #f1f5f9;
                    color: #1e293b;
                    font-weight: bold;
                    font-size: 0.85rem;
                    text-align: center;
                }

                .attendance-table td {
                    height: 1.5rem; /* Space for signature */
                }

                .num-col { width: 40px; }
                .name-col { width: 300px; text-align: left !important; }
                .sig-col { width: auto; }

                .num-cell { text-align: center; font-size: 0.85rem; color: #64748b; }
                .name-cell { font-weight: 600; color: #0f172a; font-size: 0.9rem; }
                
                .empty-row {
                    text-align: center;
                    color: #94a3b8;
                    font-style: italic;
                    padding: 2rem !important;
                }

                .document-footer {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 4rem;
                }

                .signature-area {
                    text-align: center;
                    width: 250px;
                }

                .sig-line {
                    border-top: 1px solid #0f172a;
                    margin-bottom: 0.5rem;
                }

                .signature-area p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #475569;
                }

                @media print {
                    body { background: white; }
                    .no-print { display: none !important; }
                    .print-page { padding: 0; }
                    .print-document {
                        width: 100%;
                        height: 100%;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                        margin: 0;
                    }
                    /* Ensure background colors print */
                    .course-details { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .attendance-table th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}

export default function AttendancePrintPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>A preparar documento...</div>}>
            <AttendanceListContent />
        </Suspense>
    );
}
