'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Material {
    name: string;
    url: string;
    category?: string;
}

interface Enrollment {
    id: string;
    course: string;
    classroom: string;
    schedule: string;
    startDate: string;
    paymentStatus: string;
    amountDue: number;
    trainer: string;
    materials?: Material[];
    grade?: number;
    observations?: string;
    attendancePercent?: number;
    totalSessions?: number;
    presentSessions?: number;
}

function isVideoFile(url: string) {
    if (!url) return false;
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('drive.google.com')) return false;
    const videoRegex = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
    return videoRegex.test(url);
}

function getEmbedUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return url;
    try {
        const urlObj = new URL(url);
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

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isIDCardOpen, setIsIDCardOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        phone: '', address: '', nationality: '', photo: '', bi: '', idDocument: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [expiringCerts, setExpiringCerts] = useState<any[]>([]);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!session?.user?.name) return;
            setLoading(true);
            try {
                const userId = (session?.user as any)?.id;

                // 1. Fetch matriculations for this student
                const resM = await fetch('/api/matriculations');
                const allMatrics = await resM.json();
                const studentMatrics = Array.isArray(allMatrics) 
                    ? allMatrics.filter((m: any) => m.studentId === userId || m.studentName === session.user?.name)
                    : [];

                // 2. Fetch courses
                const resC = await fetch('/api/courses');
                const allCourses = await resC.json();

                // 3. Fetch certificates
                const resCerts = await fetch('/api/certificates');
                const allCerts = await resCerts.json();
                const studentCerts = Array.isArray(allCerts) 
                    ? allCerts.filter((c: any) => (c.studentId === userId || c.studentName === session.user?.name) && c.status === 'APROVADO')
                    : [];

                // 4. Fetch grades
                const resG = await fetch('/api/grades');
                const allGrades = await resG.json();
                const studentGrades = Array.isArray(allGrades) 
                    ? allGrades.filter((g: any) => g.studentId === userId || g.studentName === session.user?.name) 
                    : [];

                // 5. Fetch attendance
                const resAtt = await fetch('/api/attendance');
                const allAtt = await resAtt.json();
                const attendanceList = Array.isArray(allAtt) ? allAtt : [];

                const data = studentMatrics.map((m: any) => {
                    const courseInfo = Array.isArray(allCourses) ? allCourses.find((c: any) => c.title === m.course || c.id === m.courseId) : null;
                    const gradeInfo = studentGrades.find((g: any) => g.courseId === m.courseId || g.courseTitle === m.course);

                    // Compute Attendance Percentage
                    let totalSessions = 0;
                    let presentSessions = 0;

                    if (m.courseId || m.course) {
                        const courseAtt = attendanceList.filter((a: any) => a.courseId === m.courseId || a.courseId === courseInfo?.id);
                        courseAtt.forEach((a: any) => {
                            totalSessions++;
                            try {
                                const records = typeof a.records === 'string' ? JSON.parse(a.records) : a.records;
                                const myRecord = records?.find((r: any) => r.studentId === userId || r.studentName === session.user?.name);
                                if (myRecord && (myRecord.status === 'PRESENTE' || myRecord.status === 'JUSTIFICADO' || myRecord.status === 'Presente')) {
                                    presentSessions++;
                                }
                            } catch (e) {
                                presentSessions++; // default fallback
                            }
                        });
                    }

                    const attendancePercent = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

                    return {
                        ...m,
                        materials: courseInfo?.materials || [],
                        grade: gradeInfo?.score,
                        observations: gradeInfo?.observations,
                        attendancePercent,
                        totalSessions,
                        presentSessions
                    };
                });

                setEnrollments(data);

                // Expiring Certificates Filter (6 months) with countdown days calculation
                const today = new Date();
                const sixMonthsFromNow = new Date();
                sixMonthsFromNow.setMonth(today.getMonth() + 6);
                
                const expiring = studentCerts.filter((c: any) => {
                    if (!c.validUntil) return false;
                    const expiry = new Date(c.validUntil);
                    return expiry <= sixMonthsFromNow && expiry > today;
                }).map((c: any) => {
                    const expiry = new Date(c.validUntil);
                    const daysLeft = Math.max(1, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                    return { ...c, daysLeft };
                });

                setExpiringCerts(expiring);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();

        const fetchProfile = async () => {
            const userId = (session?.user as any)?.id;
            if (!userId) return;
            try {
                const res = await fetch(`/api/students/${userId}`);
                const me = await res.json();
                if (me) {
                    setProfileData({
                        phone: me.phone || '',
                        address: me.address || '',
                        nationality: me.nationality || '',
                        photo: me.photo || '',
                        bi: me.bi || '',
                        idDocument: me.idDocument || me.bi || ''
                    });
                }
            } catch (err) { console.error(err); }
        };
        fetchProfile();
    }, [session]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = (session?.user as any)?.id;
        if (!userId) return;
        setSavingProfile(true);
        try {
            const res = await fetch(`/api/students/${userId}`, {
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

    const handlePrintReceipt = (en: Enrollment) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Por favor permita popups para imprimir o comprovante.');
        const html = `
            <!DOCTYPE html>
            <html lang="pt">
            <head>
                <meta charset="UTF-8">
                <title>Comprovante de Matrícula</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; padding: 40px; background: white; }
                    .header { text-align: center; border-bottom: 3px solid #2D180F; padding-bottom: 24px; margin-bottom: 32px; }
                    .header .logo { font-size: 2rem; margin-bottom: 8px; }
                    .header h1 { color: #2D180F; font-size: 1.4rem; text-transform: uppercase; letter-spacing: 2px; }
                    .header p { color: #EA580C; font-size: 0.85rem; margin-top: 4px; font-weight: 700; }
                    .badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; border-radius: 20px; padding: 4px 16px; font-size: 0.75rem; font-weight: 700; margin-bottom: 24px; }
                    .table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
                    .table tr:nth-child(even) { background: #f8fafc; }
                    .table td { padding: 12px 18px; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }
                    .table td:first-child { font-weight: 700; color: #475569; width: 40%; }
                    .table tr:last-child td { border-bottom: none; }
                    .sig { margin-top: 60px; display: flex; justify-content: space-around; }
                    .sig-box { text-align: center; width: 200px; }
                    .sig-line { border-top: 1px solid #333; padding-top: 8px; font-size: 0.8rem; color: #475569; }
                    .footer { margin-top: 40px; text-align: center; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">⚓</div>
                    <h1>Marítimo Training Center</h1>
                    <p>Comprovante Oficial de Matrícula</p>
                </div>
                <div style="text-align:center"><span class="badge">✅ Matrícula Confirmada</span></div>
                <table class="table">
                    <tr><td>Aluno</td><td>${session?.user?.name || '—'}</td></tr>
                    <tr><td>Curso / Formação</td><td>${en.course || '—'}</td></tr>
                    <tr><td>Sala / Convés</td><td>${en.classroom || 'A designar'}</td></tr>
                    <tr><td>Formador</td><td>${en.trainer || 'A designar'}</td></tr>
                    <tr><td>Horário</td><td>${en.schedule || 'A designar'}</td></tr>
                    <tr><td>Data de Início</td><td>${en.startDate || 'A designar'}</td></tr>
                    <tr><td>Estado do Pagamento</td><td>${en.paymentStatus || 'Pendente'}${en.amountDue > 0 ? ' — Dívida: ' + en.amountDue + ' KZ' : ''}</td></tr>
                    <tr><td>Data de Emissão</td><td>${new Date().toLocaleDateString('pt-BR')}</td></tr>
                </table>
                <div class="sig">
                    <div class="sig-box"><div class="sig-line">Assinatura do Aluno</div></div>
                    <div class="sig-box"><div class="sig-line">Direção Académica MTC</div></div>
                </div>
                <div class="footer">Documento emitido pelo Sistema de Gestão Académica Marítimo Training Center<br>Homologação Digital em Tempo Real</div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="student-dashboard container">
            <div className="dashboard-header">
                <div className="header-info">
                    <div className="maritime-accent"></div>
                    <h1>Bem-vindo, {session?.user?.name}</h1>
                    <p>Portal do Formando — Acompanhe seus cursos, materiais e frequência.</p>

                    {expiringCerts.length > 0 && (
                        <div className="student-alert-box">
                            <span className="alert-icon">⏰</span>
                            <div>
                                <strong>Alerta de Expiração STCW!</strong>
                                {expiringCerts.map(c => (
                                    <div key={c.id} className="alert-item">
                                        <p>
                                            O seu certificado de <strong>{c.courseTitle}</strong> caduca em 
                                            <span className="days-badge"> {c.daysLeft} dias</span> ({new Date(c.validUntil).toLocaleDateString('pt-PT')}).
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="header-actions-group">
                    <button className="btn-id-card" onClick={() => setIsIDCardOpen(true)}>
                        🪪 ID Marítimo
                    </button>
                    <button className="btn-feedback" onClick={() => window.location.href = '/student/feedback'}>
                        ⭐ Avaliar Cursos
                    </button>
                    <button className="btn-profile" onClick={() => setIsProfileModalOpen(true)}>
                        ⚙️ Perfil
                    </button>
                </div>
            </div>

            {loading ? <p className="loading-txt">⏳ A carregar os seus dados de formando...</p> : (
                <div className="dashboard-content">
                    <div className="enrollment-section">
                        <h2>Minhas Formações & Cursos</h2>
                        <div className="grid-enroll">
                            {enrollments.map(en => {
                                const attPercent = en.attendancePercent ?? 100;
                                const isAttValid = attPercent >= 75;

                                return (
                                    <div key={en.id} className="enroll-card card">
                                        <div className="enroll-header">
                                            <h3>{en.course}</h3>
                                            <span className={`payment-badge ${en.paymentStatus.toLowerCase().replace(' ', '-')}`}>
                                                {en.paymentStatus}
                                            </span>
                                        </div>

                                        {/* Attendance & Progress Indicator */}
                                        <div className="attendance-progress-box">
                                            <div className="att-info-header">
                                                <span>Frequência STCW:</span>
                                                <strong className={isAttValid ? 'att-ok' : 'att-warning'}>
                                                    {attPercent}% {isAttValid ? '✅ Normal' : '⚠️ Atenção'}
                                                </strong>
                                            </div>
                                            <div className="att-progress-track">
                                                <div 
                                                    className={`att-progress-bar ${isAttValid ? 'ok' : 'warn'}`}
                                                    style={{ width: `${attPercent}%` }}
                                                />
                                            </div>
                                            <span className="att-subtext">
                                                {en.totalSessions ? `${en.presentSessions} de ${en.totalSessions} aulas computadas` : 'Mínimo de 75% exigido para homologação'}
                                            </span>
                                        </div>

                                        <div className="schedule-info">
                                            <p><strong>📍 Sala:</strong> {en.classroom || 'A designar'}</p>
                                            <p><strong>⏰ Horário:</strong> {en.schedule || 'A designar'}</p>
                                            <p><strong>📅 Início:</strong> {en.startDate || 'A designar'}</p>
                                            <p><strong>👨‍🏫 Formador:</strong> {en.trainer || 'A designar'}</p>
                                            
                                            {en.grade !== undefined && (
                                                <div className="student-grade-box">
                                                    <span>Nota Final:</span>
                                                    <div className={`grade-badge ${en.grade >= 10 ? 'pass' : 'fail'}`}>
                                                        {en.grade} / 20
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {en.amountDue > 0 && (
                                            <div className="payment-alert">
                                                <span className="icon">⚠️</span>
                                                <div>
                                                    <strong>Pagamento Pendente</strong>
                                                    <p>Valor a regularizar: {en.amountDue} KZ</p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            className="btn-comprovante"
                                            onClick={() => handlePrintReceipt(en)}
                                            title="Descarregar comprovante de matrícula em PDF"
                                        >
                                            📄 Comprovante de Matrícula
                                        </button>

                                        <div className="materials-section">
                                            <h4>📚 Materiais Didáticos & Recursos</h4>
                                            <div className="material-list">
                                                {['Manuais', 'Vídeos', 'Exercícios', 'Complementar'].map(cat => {
                                                    const catMaterials = en.materials?.filter(m => (m.category || 'Manuais') === cat) || [];
                                                    if (catMaterials.length === 0) return null;
                                                    return (
                                                        <div key={cat} className="student-category-group">
                                                            <p className="cat-label">{cat}</p>
                                                            {catMaterials.map((m, i) => (
                                                                <div key={i} className="student-material-item">
                                                                    <div className="mat-name-box">
                                                                        <span>{cat === 'Vídeos' ? '🎥' : '📄'}</span>
                                                                        <span>{m.name}</span>
                                                                    </div>
                                                                    <button className="btn-read" onClick={() => setReadingMaterial(m)}>Estudar</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                                {(!en.materials || en.materials.length === 0) && <p className="empty">Nenhum material disponibilizado para este curso ainda.</p>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {enrollments.length === 0 && <p className="empty-state">Você ainda não possui matrículas ativas no Marítimo Training Center.</p>}
                        </div>
                    </div>

                    {/* Reader Modal */}
                    {readingMaterial && (
                        <div className="material-reader-overlay">
                            <div className="reader-container card shadow-lg">
                                <div className="reader-header">
                                    <h3>Lendo: {readingMaterial.name}</h3>
                                    <button className="close-btn" onClick={() => setReadingMaterial(null)}>&times;</button>
                                </div>
                                <div className="reader-body">
                                    <div className="placeholder-viewer">
                                        {isVideoFile(readingMaterial.url) ? (
                                            <video
                                                src={readingMaterial.url}
                                                controls
                                                controlsList="nodownload"
                                                className="material-video"
                                                style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh', background: '#000' }}
                                            />
                                        ) : (
                                            <>
                                                <div className="viewer-msg">
                                                    <span className="icon">👁️</span>
                                                    <p>Visualização Segura Ativada</p>
                                                    <small>Leitura no portal oficial MTC.</small>
                                                </div>
                                                <iframe src={getEmbedUrl(readingMaterial.url)} className="material-iframe" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="reader-footer">
                                    <p>Apenas para leitura. Propriedade do Marítimo Training Center.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Modal */}
                    {isProfileModalOpen && (
                        <div className="material-reader-overlay">
                            <div className="modal-box card shadow-lg profile-modal">
                                <div className="modal-top">
                                    <div>
                                        <h2>✎ Editar Meu Perfil</h2>
                                        <p>Mantenha seus dados de contacto atualizados.</p>
                                    </div>
                                    <button className="close-x" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
                                </div>
                                <form onSubmit={handleSaveProfile} className="profile-form">
                                    <div className="field">
                                        <label>Telefone</label>
                                        <input type="text" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+244 9xx xxx xxx" />
                                    </div>
                                    <div className="field">
                                        <label>Nacionalidade</label>
                                        <input type="text" value={profileData.nationality} onChange={e => setProfileData({ ...profileData, nationality: e.target.value })} placeholder="Ex: Angolana" />
                                    </div>
                                    <div className="field">
                                        <label>Documento ID / BI / Passaporte</label>
                                        <input type="text" value={profileData.idDocument || profileData.bi} onChange={e => setProfileData({ ...profileData, idDocument: e.target.value, bi: e.target.value })} placeholder="Nº do BI ou Passaporte" />
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

                    {/* ID Card Modal */}
                    {isIDCardOpen && (
                        <div className="material-reader-overlay" onClick={() => setIsIDCardOpen(false)}>
                            <div className="id-card-modal card shadow-lg" onClick={e => e.stopPropagation()}>
                                <button className="close-x absolute-close" onClick={() => setIsIDCardOpen(false)}>&times;</button>
                                <div className="id-card-inner">
                                    <div className="id-card-header">
                                        <span className="anchor">⚓</span>
                                        <div>
                                            <h3>MARÍTIMO TRAINING CENTER</h3>
                                            <p>CARTÃO DIGITAL DE FORMANDO DIPLOMADO</p>
                                        </div>
                                    </div>
                                    <div className="id-card-body">
                                        <div className="id-avatar-box">
                                            {profileData.photo ? (
                                                <img src={profileData.photo} alt="Formando" className="id-photo" />
                                            ) : (
                                                <div className="id-photo-placeholder">
                                                    {(session?.user?.name || 'F').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="id-status-tag">✅ ATIVO</span>
                                        </div>
                                        <div className="id-details">
                                            <span className="label">NOME DO FORMANDO</span>
                                            <strong className="val-name">{session?.user?.name || 'Formando MTC'}</strong>
                                            
                                            <span className="label">DOCUMENTO ID / BI</span>
                                            <strong className="val">{profileData.idDocument || profileData.bi || 'Registado no Sistema'}</strong>

                                            <span className="label">NACIONALIDADE</span>
                                            <strong className="val">{profileData.nationality || 'Angolana'}</strong>
                                        </div>
                                    </div>
                                    <div className="id-card-footer">
                                        <div className="barcode-visual">
                                            <span>||||||| | ||||| |||| |||||||| |||||</span>
                                            <small>ID: {(session?.user as any)?.id || 'MTC-2026'}</small>
                                        </div>
                                        <div className="mtc-seal">
                                            🛡️ Homologado MTC
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        .student-dashboard { padding: 1rem 0; }
        .dashboard-header { margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .dashboard-header h1 { font-size: 2rem; color: var(--color-primary); margin-top: 0.5rem; }
        .header-info p { color: var(--color-text-muted); font-size: 0.95rem; }
        
        .student-alert-box { margin-top: 1.5rem; background: var(--color-sandstone-light); border: 1.5px solid var(--color-sandstone); border-radius: 14px; padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start; animation: slideDown 0.4s ease-out; }
        .student-alert-box .alert-icon { font-size: 1.5rem; }
        .student-alert-box strong { display: block; color: var(--color-rust); margin-bottom: 0.25rem; font-size: 1rem; }
        .student-alert-box p { margin: 0; color: var(--color-text); font-size: 0.9rem; line-height: 1.5; }
        .days-badge { background: var(--color-accent); color: white; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; }
        
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .header-actions-group { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .btn-id-card { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(45,24,15,0.2); }
        .btn-id-card:hover { background: var(--color-accent); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(234,88,12,0.3); }
        .btn-profile { background: white; border: 1.5px solid var(--color-border); color: var(--color-primary); padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
        .btn-profile:hover { background: var(--color-surface); border-color: var(--color-accent); color: var(--color-accent); }
        .btn-feedback { background: var(--color-sandstone); border: none; color: var(--color-primary); padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
        .btn-feedback:hover { transform: translateY(-2px); background: var(--color-sandstone-light); }
        
        .enrollment-section h2 { font-size: 1.5rem; margin-bottom: 2rem; color: var(--color-primary); border-bottom: 2px solid var(--color-border); padding-bottom: 1rem; }
        
        .grid-enroll { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem; }
        
        .enroll-card { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .enroll-header { display: flex; justify-content: space-between; align-items: start; }
        .enroll-header h3 { font-size: 1.3rem; color: var(--color-primary); flex: 1; padding-right: 1rem; font-weight: 800; }
        
        /* Attendance Box */
        .attendance-progress-box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .att-info-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--color-primary); }
        .att-ok { color: var(--color-success-text); }
        .att-warning { color: var(--color-danger-text); }
        .att-progress-track { height: 8px; background: var(--color-border); border-radius: 10px; overflow: hidden; }
        .att-progress-bar { height: 100%; transition: width 0.4s ease; }
        .att-progress-bar.ok { background: var(--color-success-text); }
        .att-progress-bar.warn { background: var(--color-accent); }
        .att-subtext { font-size: 0.72rem; color: var(--color-text-muted); }

        .payment-badge { font-size: 0.7rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 50px; text-transform: uppercase; white-space: nowrap; }
        .payment-badge.pago-total { background: #ecfdf5; color: #059669; }
        .payment-badge.metade { background: var(--color-sandstone-light); color: var(--color-rust); }
        .payment-badge.pendente { background: #fef2f2; color: #dc2626; }

        .schedule-info { display: flex; flex-direction: column; gap: 0.75rem; background: var(--color-surface); padding: 1.25rem; border-radius: 10px; font-size: 0.95rem; }
        .schedule-info strong { color: var(--color-primary); margin-right: 0.5rem; }

        .payment-alert { display: flex; gap: 1rem; align-items: center; background: #fff5f5; border: 1px solid #feb2b2; padding: 1rem; border-radius: 8px; color: #c53030; }
        .payment-alert .icon { font-size: 1.5rem; }
        .payment-alert strong { display: block; font-size: 0.9rem; }
        .payment-alert p { font-size: 0.85rem; font-weight: 600; }

        .materials-section h4 { font-size: 1rem; color: var(--color-accent); margin-bottom: 1rem; font-weight: 800; }
        .material-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .cat-label { font-size: 0.65rem; font-weight: 900; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
        .student-material-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border); }
        .mat-name-box { display: flex; align-items: center; gap: 0.5rem; }
        .mat-name-box span { font-size: 0.85rem; font-weight: 700; color: var(--color-primary); }
        .btn-read { background: var(--color-primary); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-read:hover { background: var(--color-accent); }

        .btn-comprovante { display: flex; align-items: center; gap: 0.5rem; background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-size: 0.85rem; font-weight: 800; cursor: pointer; transition: 0.3s; justify-content: center; }
        .btn-comprovante:hover { background: var(--color-accent); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(234,88,12,0.25); }

        .student-grade-box { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--color-border); display: flex; align-items: center; justify-content: space-between; }
        .student-grade-box span { font-size: 0.85rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; }
        .grade-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 1rem; }
        .grade-badge.pass { background: #dcfce7; color: #166534; }
        .grade-badge.fail { background: #fee2e2; color: #991b1b; }

        /* Reader Modal */
        .material-reader-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(27, 14, 9, 0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
        .reader-container { width: 100%; max-width: 1000px; height: 90vh; display: flex; flex-direction: column; overflow: hidden; background: white; }
        .reader-header { padding: 1.5rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
        .reader-header h3 { color: var(--color-primary); }
        .close-btn { background: none; border: none; font-size: 2.5rem; cursor: pointer; color: var(--color-text-muted); }
        
        .reader-body { flex: 1; background: #2d3748; position: relative; }
        .material-iframe { width: 100%; height: 100%; border: none; }
        .placeholder-viewer { height: 100%; display: flex; flex-direction: column; }
        .viewer-msg { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; text-align: center; z-index: 10; pointer-events: none; }
        .reader-footer { padding: 1rem; background: var(--color-surface); border-top: 1px solid var(--color-border); text-align: center; font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; }

        /* ID Card Modal */
        .id-card-modal { background: radial-gradient(circle at top, #2D180F 0%, #1C0F0A 100%); width: 100%; max-width: 440px; border-radius: 24px; padding: 2rem; color: white; border: 1.5px solid var(--color-accent); position: relative; }
        .absolute-close { position: absolute; top: 1rem; right: 1.25rem; color: white; background: none; border: none; font-size: 2rem; cursor: pointer; }
        .id-card-inner { display: flex; flex-direction: column; gap: 1.5rem; }
        .id-card-header { display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
        .id-card-header .anchor { font-size: 2.2rem; background: rgba(234,88,12,0.2); padding: 0.5rem; border-radius: 50%; border: 1px solid var(--color-accent); }
        .id-card-header h3 { font-size: 1rem; font-weight: 900; color: white; margin: 0; letter-spacing: 1px; }
        .id-card-header p { font-size: 0.68rem; color: var(--color-sandstone); margin: 0; font-weight: 700; letter-spacing: 0.5px; }

        .id-card-body { display: flex; gap: 1.25rem; align-items: center; background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(234,88,12,0.2); }
        .id-avatar-box { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .id-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-accent); }
        .id-photo-placeholder { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--color-accent), var(--color-rust)); color: white; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 900; border: 3px solid var(--color-sandstone); }
        .id-status-tag { font-size: 0.65rem; background: rgba(16,185,129,0.2); color: #34D399; border: 1px solid rgba(16,185,129,0.4); padding: 0.15rem 0.5rem; border-radius: 20px; font-weight: 800; }

        .id-details { display: flex; flex-direction: column; gap: 0.25rem; }
        .id-details .label { font-size: 0.65rem; text-transform: uppercase; color: var(--color-sandstone); font-weight: 800; letter-spacing: 0.5px; }
        .id-details .val-name { font-size: 1.1rem; color: white; font-weight: 900; line-height: 1.2; margin-bottom: 0.4rem; }
        .id-details .val { font-size: 0.85rem; color: #D1D5DB; margin-bottom: 0.4rem; }

        .id-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; }
        .barcode-visual { display: flex; flex-direction: column; font-family: monospace; letter-spacing: 2px; color: rgba(255,255,255,0.5); font-size: 0.75rem; }
        .mtc-seal { font-size: 0.75rem; color: var(--color-sandstone); font-weight: 800; background: rgba(234,88,12,0.15); padding: 0.3rem 0.75rem; border-radius: 8px; border: 1px solid rgba(234,88,12,0.3); }

        .loading-txt { text-align: center; padding: 4rem; color: var(--color-text-muted); font-weight: 500; }
        .empty-state { text-align: center; padding: 3rem; color: var(--color-text-muted); }
        .empty { font-size: 0.85rem; color: var(--color-text-muted); font-style: italic; }

        /* Profile Modal */
        .profile-modal { background: white; width: 100%; max-width: 500px; padding: 2.5rem; border-radius: 20px; }
        .modal-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1.5rem; }
        .modal-top h2 { margin: 0; color: var(--color-primary); font-size: 1.4rem; }
        .modal-top p { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); }
        .close-x { background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--color-text-muted); line-height: 1; }
        .profile-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .field { display: flex; flex-direction: column; gap: 0.5rem; }
        .field label { font-weight: 700; font-size: 0.85rem; color: var(--color-primary); }
        .field input { padding: 0.8rem 1rem; border: 1.5px solid var(--color-border); border-radius: 10px; font-size: 0.95rem; background: var(--color-surface); }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); }
        .btn-cancel { background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; color: var(--color-text-muted); }
        .btn-save { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

        @media (max-width: 600px) {
            .grid-enroll { grid-template-columns: 1fr; }
            .reader-container { height: 100vh; max-width: none; border-radius: 0; }
            .dashboard-header { flex-direction: column; gap: 1.5rem; }
        }
      `}</style>
        </div>
    );
}
