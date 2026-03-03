'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    status: string;
    materials: { name: string, url: string, category?: string }[];
    studentsList?: Student[];
    startDate?: string;
    schedule?: string;
}
function isVideoFile(url: string) {
    if (!url) return false;
    // Don't treat external video platforms (YouTube/Drive) as raw video files
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('drive.google.com')) return false;
    const videoRegex = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
    return videoRegex.test(url);
}

function getEmbedUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return url;
    try {
        const urlObj = new URL(url);

        // YouTube Support
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            if (urlObj.hostname === 'youtu.be') {
                return `https://www.youtube.com/embed${urlObj.pathname}`;
            }
            if (urlObj.pathname === '/watch') {
                const videoId = urlObj.searchParams.get('v');
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
            if (urlObj.pathname.startsWith('/shorts/')) {
                const videoId = urlObj.pathname.split('/')[2];
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        // Google Drive Support
        if (urlObj.hostname.includes('drive.google.com')) {
            if (urlObj.pathname.includes('/file/d/')) {
                const parts = urlObj.pathname.split('/');
                const fileId = parts[parts.indexOf('d') + 1];
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }

        return url;
    } catch (e) {
        return url;
    }
}

export default function ProfessorDashboard() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        specialty: '', phone: '', address: '', nationality: '', photo: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [readingMaterial, setReadingMaterial] = useState<{ name: string, url: string } | null>(null);

    // Attendance State
    const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string, participated: boolean }>>({});
    const [savingAttendance, setSavingAttendance] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.name) return;
            setLoading(true);
            try {
                // 1. Fetch all courses assigned to this professor
                const userId = (session?.user as any)?.id;
                const resC = await fetch('/api/courses');
                const allCourses = await resC.json();
                const profCourses = allCourses.filter((c: any) => (c.trainerId && c.trainerId === userId) || c.trainerName === session.user?.name);

                // 2. Fetch matriculations to get student lists for these courses
                const resM = await fetch('/api/matriculations');
                const allMatriculations = await resM.json();

                const enrichedCourses = profCourses.map((c: Course) => {
                    const courseMatrics = allMatriculations.filter((m: any) => m.courseId === c.id || m.course === c.title);
                    return {
                        ...c,
                        studentsList: courseMatrics.map((m: any) => ({ id: m.studentId, name: m.studentName })),
                        startDate: courseMatrics[0]?.startDate || c.startDate || 'A definir',
                        schedule: courseMatrics[0]?.schedule || 'A definir'
                    };
                });

                setCourses(enrichedCourses);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const fetchProfile = async () => {
            const userId = (session?.user as any)?.id;
            if (!userId) return;
            try {
                const res = await fetch(`/api/trainers/${userId}`);
                const me = await res.json();
                if (me) {
                    setProfileData({
                        specialty: me.specialty || '',
                        phone: me.phone || '',
                        address: me.address || '',
                        nationality: me.nationality || '',
                        photo: me.photo || ''
                    });
                }
            } catch (err) { console.error(err); }
        };
        fetchProfile();
    }, [session]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedCourse || !attendanceDate) return;
            try {
                const res = await fetch(`/api/attendance?course=${encodeURIComponent(selectedCourse.title)}&date=${attendanceDate}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const recordMap: Record<string, { status: string, participated: boolean }> = {};
                    data[0].records.forEach((r: any) => {
                        recordMap[r.studentId] = {
                            status: r.status,
                            participated: !!r.participated
                        };
                    });
                    setAttendanceRecords(recordMap as any);
                } else {
                    const defaultMap: Record<string, { status: string, participated: boolean }> = {};
                    selectedCourse.studentsList?.forEach(s => {
                        defaultMap[s.id] = { status: 'PRESENT', participated: false };
                    });
                    setAttendanceRecords(defaultMap as any);
                }
            } catch (err) { console.error(err); }
        };
        fetchAttendance();
    }, [selectedCourse, attendanceDate]);

    const handleSaveAttendance = async () => {
        if (!selectedCourse) return;
        setSavingAttendance(true);
        try {
            const records = selectedCourse.studentsList?.map(s => ({
                studentId: s.id,
                studentName: s.name,
                status: (attendanceRecords[s.id] as any)?.status || 'PRESENT',
                participated: (attendanceRecords[s.id] as any)?.participated || false
            })) || [];

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: selectedCourse.title,
                    date: attendanceDate,
                    trainerId: (session?.user as any)?.id,
                    records
                })
            });

            if (res.ok) {
                alert('Chamada guardada com sucesso!');
            } else {
                alert('Erro ao guardar chamada.');
            }
        } catch (err) {
            alert('Erro de conexão ao guardar chamada.');
        } finally {
            setSavingAttendance(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = (session?.user as any)?.id;
        if (!userId) return;
        setSavingProfile(true);
        try {
            const res = await fetch(`/api/trainers/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            if (res.ok) {
                setIsProfileModalOpen(false);
                alert('Perfil atualizado com sucesso!');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className="professor-dashboard container">
            <div className="dashboard-header">
                <div className="header-info">
                    <div className="maritime-accent"></div>
                    <h1>Olá, {session?.user?.name}</h1>
                    <p>Acompanhe suas turmas, alunos e materiais didáticos.</p>
                </div>
                <button className="btn-profile" onClick={() => setIsProfileModalOpen(true)}>⚙️ Editar Perfil</button>
            </div>

            <div className="dashboard-layout">
                <div className="courses-sidebar card">
                    <h2>Minhas Formações</h2>
                    {loading ? <p>Carregando...</p> : (
                        <div className="course-list">
                            {courses.map(course => (
                                <div
                                    key={course.id}
                                    className={`course-item ${selectedCourse?.id === course.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCourse(course)}
                                >
                                    <strong>{course.title}</strong>
                                    <span>{course.studentsList?.length || 0} alunos ativos</span>
                                </div>
                            ))}
                            <div className="total-stats" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--navy-deep)', color: 'white', borderRadius: '12px' }}>
                                <small style={{ opacity: 0.8, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800 }}>Total de Alunos Sob Sua Responsabilidade</small>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{courses.reduce((acc, c) => acc + (c.studentsList?.length || 0), 0)} Alunos</div>
                            </div>
                            {courses.length === 0 && <p className="empty-msg">Nenhum curso atribuído no momento.</p>}
                        </div>
                    )}
                </div>

                <div className="course-detail-view card">
                    {selectedCourse ? (
                        <div className="detail-content">
                            <div className="detail-header">
                                <h2>{selectedCourse.title}</h2>
                                <div className="header-actions-inline">
                                    <span className="status-badge">{selectedCourse.status}</span>
                                    <button
                                        className="btn-print-attendance"
                                        onClick={() => window.open(`/print/attendance?course=${encodeURIComponent(selectedCourse.title)}`, '_blank')}
                                    >
                                        🖨️ Lista de Presença
                                    </button>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-box">
                                    <small>Horário</small>
                                    <p>{selectedCourse.schedule}</p>
                                </div>
                                <div className="info-box">
                                    <small>Início das Aulas</small>
                                    <p>{selectedCourse.startDate}</p>
                                </div>
                                <div className="info-box">
                                    <small>Carga Horária</small>
                                    <p>{selectedCourse.duration}</p>
                                </div>
                            </div>

                            <div className="content-tabs">
                                <div className="tab-section">
                                    <h3>Registo de Chamada Diária</h3>
                                    <div className="attendance-controls">
                                        <div className="date-picker-group">
                                            <label>Data da Aula:</label>
                                            <input
                                                type="date"
                                                value={attendanceDate}
                                                onChange={(e) => setAttendanceDate(e.target.value)}
                                                className="date-input"
                                            />
                                        </div>
                                        <button
                                            className="btn-save-attendance"
                                            onClick={handleSaveAttendance}
                                            disabled={savingAttendance}
                                        >
                                            {savingAttendance ? 'A guardar...' : '✓ Guardar Chamada'}
                                        </button>
                                    </div>
                                    <table className="student-table attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Nome do Aluno</th>
                                                <th className="center">Presente</th>
                                                <th className="center">Ausente</th>
                                                <th className="center">Atrasado</th>
                                                <th className="center">Participou?</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCourse.studentsList?.map(s => (
                                                <tr key={s.id}>
                                                    <td>{s.name}</td>
                                                    <td className="center">
                                                        <input
                                                            type="radio"
                                                            name={`att-${s.id}`}
                                                            checked={(attendanceRecords[s.id] as any)?.status === 'PRESENT' || !(attendanceRecords[s.id] as any)?.status}
                                                            onChange={() => setAttendanceRecords({ ...attendanceRecords, [s.id]: { ...(attendanceRecords[s.id] as any), status: 'PRESENT' } })}
                                                        />
                                                    </td>
                                                    <td className="center">
                                                        <input
                                                            type="radio"
                                                            name={`att-${s.id}`}
                                                            checked={(attendanceRecords[s.id] as any)?.status === 'ABSENT'}
                                                            onChange={() => setAttendanceRecords({ ...attendanceRecords, [s.id]: { ...(attendanceRecords[s.id] as any), status: 'ABSENT' } })}
                                                        />
                                                    </td>
                                                    <td className="center">
                                                        <input
                                                            type="radio"
                                                            name={`att-${s.id}`}
                                                            checked={(attendanceRecords[s.id] as any)?.status === 'LATE'}
                                                            onChange={() => setAttendanceRecords({ ...attendanceRecords, [s.id]: { ...(attendanceRecords[s.id] as any), status: 'LATE' } })}
                                                        />
                                                    </td>
                                                    <td className="center">
                                                        <div className="participation-star" onClick={() => setAttendanceRecords({ ...attendanceRecords, [s.id]: { ...(attendanceRecords[s.id] as any), participated: !(attendanceRecords[s.id] as any)?.participated } })}>
                                                            {(attendanceRecords[s.id] as any)?.participated ? '⭐' : '☆'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {selectedCourse.studentsList?.length === 0 && <p className="empty-msg">Nenhum aluno inscrito nesta turma ainda.</p>}
                                </div>

                                <div className="tab-section">
                                    <h3>Listagem Completa de Alunos</h3>
                                    <table className="student-table">
                                        <thead>
                                            <tr><th>Nome do Estudante</th><th>Ações</th></tr>
                                        </thead>
                                        <tbody>
                                            {selectedCourse.studentsList?.map(s => (
                                                <tr key={s.id}>
                                                    <td>{s.name}</td>
                                                    <td><button className="btn-link">Ver Perfil</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {selectedCourse.studentsList?.length === 0 && <p className="empty-msg">Nenhum aluno inscrito nesta turma ainda.</p>}
                                </div>

                                <div className="tab-section">
                                    <h3>Materiais de Apoio</h3>
                                    <div className="professor-materials-list">
                                        {['Manuais', 'Vídeos', 'Exercícios', 'Complementar'].map(cat => {
                                            const catMaterials = selectedCourse.materials?.filter(m => (m.category || 'Manuais') === cat) || [];
                                            if (catMaterials.length === 0) return null;
                                            return (
                                                <div key={cat} className="professor-category-group" style={{ marginBottom: '1.5rem' }}>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{cat}</p>
                                                    <div className="materials-grid">
                                                        {catMaterials.map((m, i) => (
                                                            <div key={i} className="material-card">
                                                                <span className="file-icon">{cat === 'Vídeos' ? '🎥' : '📄'}</span>
                                                                <span className="file-name">{m.name}</span>
                                                                <button onClick={() => setReadingMaterial(m as any)} className="btn-link">Visualizar</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!selectedCourse.materials || selectedCourse.materials.length === 0) && <p className="empty-msg">Nenhum material anexado a este curso.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="select-prompt">
                            <div className="prompt-icon">⚓</div>
                            <p>Selecione um curso ao lado para ver os detalhes da turma e materiais.</p>
                        </div>
                    )}
                </div>

                {isProfileModalOpen && (
                    <div className="material-reader-overlay">
                        <div className="modal-box card shadow-lg profile-modal">
                            <div className="modal-top">
                                <div>
                                    <h2>✎ Editar Meu Perfil</h2>
                                    <p>Mantenha seus dados e especialidade em dia.</p>
                                </div>
                                <button className="close-x" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSaveProfile} className="profile-form">
                                <div className="field">
                                    <label>Especialidade</label>
                                    <input type="text" value={profileData.specialty} onChange={e => setProfileData({ ...profileData, specialty: e.target.value })} placeholder="Ex: Segurança e Salvamento" />
                                </div>
                                <div className="field">
                                    <label>Telefone</label>
                                    <input type="text" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+244 9xx xxx xxx" />
                                </div>
                                <div className="field">
                                    <label>Nacionalidade</label>
                                    <input type="text" value={profileData.nationality} onChange={e => setProfileData({ ...profileData, nationality: e.target.value })} placeholder="Ex: Angolana" />
                                </div>
                                <div className="field">
                                    <label>Morada / Endereço</label>
                                    <input type="text" value={profileData.address} onChange={e => setProfileData({ ...profileData, address: e.target.value })} placeholder="Sua morada completa" />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setIsProfileModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-save" disabled={savingProfile}>
                                        {savingProfile ? 'A guardar...' : '✓ Guardar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {readingMaterial && (
                    <div className="material-reader-overlay">
                        <div className="reader-modal">
                            <div className="reader-header">
                                <div>
                                    <h3>Lendo: {readingMaterial.name}</h3>
                                    <small>O download está desabilitado para este material.</small>
                                </div>
                                <button className="close-btn" onClick={() => setReadingMaterial(null)}>&times;</button>
                            </div>
                            <div className="reader-content">
                                {isVideoFile(readingMaterial.url) ? (
                                    <video src={readingMaterial.url} controls controlsList="nodownload" className="material-video" style={{ width: '100%', height: '100%', borderRadius: '8px', background: '#000' }} />
                                ) : (
                                    <iframe src={getEmbedUrl(readingMaterial.url)} className="material-iframe" />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .professor-dashboard { padding: 1rem 0; }
        .dashboard-header { margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .dashboard-header h1 { font-size: 2rem; color: var(--navy-deep); margin-top: 0.5rem; }
        .btn-profile { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
        .btn-profile:hover { background: #f8fafc; border-color: var(--ocean-blue); color: var(--ocean-blue); }
        
        .dashboard-layout { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start; }
        
        .courses-sidebar { padding: 1.5rem; height: calc(100vh - 250px); overflow-y: auto; }
        .courses-sidebar h2 { font-size: 1.25rem; margin-bottom: 1.5rem; border-left: 4px solid var(--sand-gold); padding-left: 1rem; }
        
        .course-list { display: flex; flex-direction: column; gap: 1rem; }
        .course-item { padding: 1.25rem; border: 1px solid #edf2f7; border-radius: 10px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; gap: 0.25rem; }
        .course-item:hover { background-color: #f8fafc; border-color: var(--ocean-blue); }
        .course-item.active { background-color: #f0f7ff; border-color: var(--ocean-blue); box-shadow: 0 4px 12px rgba(0,116,217,0.1); }
        .course-item strong { color: var(--navy-deep); font-size: 1rem; }
        .course-item span { font-size: 0.85rem; color: var(--gray-medium); }
        
        .course-detail-view { min-height: calc(100vh - 250px); padding: 2.5rem; }
        .detail-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; }
        .header-actions-inline { display: flex; align-items: center; gap: 1rem; }
        .detail-header h2 { font-size: 1.75rem; color: var(--navy-deep); }
        .status-badge { background: #e0f2fe; color: #0369a1; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .btn-print-attendance { background: var(--sand-gold); color: var(--navy-deep); border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn-print-attendance:hover { brightness: 1.1; transform: translateY(-1px); }
        
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
        .info-box { background: #f8fafc; padding: 1rem; border-radius: 8px; }
        .info-box small { color: var(--gray-medium); text-transform: uppercase; font-size: 0.7rem; font-weight: 700; }
        .info-box p { font-weight: 700; color: var(--navy-medium); margin-top: 0.25rem; }
        
        .content-tabs { display: flex; flex-direction: column; gap: 2.5rem; }
        .tab-section h3 { font-size: 1.1rem; color: var(--navy-deep); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        
        .attendance-controls { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
        .date-picker-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .date-picker-group label { font-size: 0.8rem; font-weight: 700; color: #475569; }
        .date-input { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; color: var(--navy-deep); }
        .btn-save-attendance { background: var(--ocean-blue); color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.85rem; }
        .btn-save-attendance:hover:not(:disabled) { background: #02569b; }
        .btn-save-attendance:disabled { opacity: 0.7; cursor: not-allowed; }
        .center { text-align: center !important; }
        .participation-star { font-size: 1.25rem; cursor: pointer; user-select: none; transition: 0.2s; }
        .participation-star:hover { transform: scale(1.2); }

        .student-table { width: 100%; border-collapse: collapse; }
        .student-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #edf2f7; font-size: 0.8rem; color: var(--gray-medium); }
        .student-table td { padding: 1rem 0.75rem; border-bottom: 1px solid #edf2f7; font-weight: 600; color: var(--navy-medium); }
        .btn-link { background: none; border: none; color: var(--ocean-blue); text-decoration: underline; cursor: pointer; font-weight: 700; font-size: 0.85rem; }
        
        .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .material-card { padding: 1rem; border: 1px solid #edf2f7; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; }
        .file-icon { font-size: 1.5rem; }
        .file-name { font-size: 0.85rem; font-weight: 600; flex: 1; }

        .select-prompt { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--gray-medium); text-align: center; }
        .prompt-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.2; }
        .empty-msg { font-size: 0.9rem; color: var(--gray-medium); font-style: italic; }

        .empty-msg { font-size: 0.9rem; color: var(--gray-medium); font-style: italic; }

        /* Same Profile Modal Styles as Student */
        .material-reader-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
        .profile-modal { background: white; width: 100%; max-width: 500px; padding: 2.5rem; border-radius: 20px; text-align: left; }
        .modal-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1.5rem; }
        .modal-top h2 { margin: 0; color: var(--navy-deep); font-size: 1.4rem; }
        .modal-top p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #64748b; }
        .close-x { background: none; border: none; font-size: 2rem; cursor: pointer; color: #94a3b8; line-height: 1; }
        .profile-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .field { display: flex; flex-direction: column; gap: 0.5rem; }
        .field label { font-weight: 700; font-size: 0.85rem; color: #475569; }
        .field input { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; background: #f8fafc; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
        .btn-cancel { background: #f1f5f9; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; color: #64748b; }
        .btn-save { background: var(--navy-deep); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

        .reader-modal { background: #1e293b; width: 95%; max-width: 1200px; height: 90vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        .reader-header { padding: 1rem 1.5rem; background: #0f172a; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
        .reader-header h3 { color: white; margin: 0 0 0.25rem; font-size: 1.1rem; }
        .reader-header small { color: #94a3b8; font-size: 0.8rem; }
        .reader-content { flex: 1; padding: 1rem; background: #1e293b; }
        .material-iframe { width: 100%; height: 100%; border: none; background: white; border-radius: 8px; }
        .close-btn { background: none; border: none; color: #94a3b8; font-size: 2rem; cursor: pointer; line-height: 1; }
        .close-btn:hover { color: white; }

        @media (max-width: 1024px) {
          .dashboard-layout { grid-template-columns: 1fr; }
          .courses-sidebar { height: auto; }
          .dashboard-header { flex-direction: column; gap: 1.5rem; }
        }
      `}</style>
        </div>
    );
}
