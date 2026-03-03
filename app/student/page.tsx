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
    if (url.startsWith('/uploads/')) return url; // Don't modify local uploads
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

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        phone: '', address: '', nationality: '', photo: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);

    const [expiringCerts, setExpiringCerts] = useState<any[]>([]);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!session?.user?.name) return;
            setLoading(true);
            try {
                // 1. Fetch matriculations for this student
                const userId = (session?.user as any)?.id;
                const resM = await fetch('/api/matriculations');
                const allMatrics = await resM.json();
                const studentMatrics = allMatrics.filter((m: any) => m.studentId === userId || m.studentName === session.user?.name);

                // 2. Fetch course details to get materials
                const resC = await fetch('/api/courses');
                const allCourses = await resC.json();

                // 3. Fetch certificates for this student
                const resCerts = await fetch('/api/certificates');
                const allCerts = await resCerts.json();
                const studentCerts = allCerts.filter((c: any) => (c.studentId === userId || c.studentName === session.user?.name) && c.status === 'APROVADO');

                const data = studentMatrics.map((m: any) => {
                    const courseInfo = allCourses.find((c: any) => c.title === m.course);
                    return {
                        ...m,
                        materials: courseInfo?.materials || []
                    };
                });
                setEnrollments(data);

                // Filter expiring certificates (6 months)
                const today = new Date();
                const sixMonthsFromNow = new Date();
                sixMonthsFromNow.setMonth(today.getMonth() + 6);
                const expiring = studentCerts.filter((c: any) => {
                    const expiry = new Date(c.validUntil);
                    return expiry <= sixMonthsFromNow && expiry > today;
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
                        photo: me.photo || ''
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

    return (
        <div className="student-dashboard container">
            <div className="dashboard-header">
                <div className="header-info">
                    <div className="maritime-accent"></div>
                    <h1>Bem-vindo, {session?.user?.name}</h1>
                    <p>Abaixo você encontra suas matrículas ativas e materiais de estudo.</p>

                    {expiringCerts.length > 0 && (
                        <div className="student-alert-box">
                            <span className="alert-icon">🔔</span>
                            <div>
                                <strong>Atenção à Validade!</strong>
                                {expiringCerts.map(c => (
                                    <p key={c.id}>O seu certificado de <u>{c.courseTitle}</u> expira em {new Date(c.validUntil).toLocaleDateString('pt-BR')}. Considere a renovação.</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="header-actions-group" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-feedback" onClick={() => window.location.href = '/student/feedback'}>⭐ Dar Feedback</button>
                    <button className="btn-profile" onClick={() => setIsProfileModalOpen(true)}>⚙️ Editar Perfil</button>
                </div>
            </div>

            {loading ? <p>Carregando seu portal...</p> : (
                <div className="dashboard-content">
                    <div className="enrollment-section">
                        <h2>Minhas Matrículas</h2>
                        <div className="grid-enroll">
                            {enrollments.map(en => (
                                <div key={en.id} className="enroll-card card">
                                    <div className="enroll-header">
                                        <h3>{en.course}</h3>
                                        <span className={`payment-badge ${en.paymentStatus.toLowerCase().replace(' ', '-')}`}>
                                            {en.paymentStatus}
                                        </span>
                                    </div>

                                    <div className="schedule-info">
                                        <p><strong>📍 Sala:</strong> {en.classroom}</p>
                                        <p><strong>⏰ Horário:</strong> {en.schedule}</p>
                                        <p><strong>📅 Início:</strong> {en.startDate}</p>
                                        <p><strong>👨‍🏫 Formador:</strong> {en.trainer}</p>
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

                                    <div className="materials-section">
                                        <h4>📚 Materiais e Recursos</h4>
                                        <div className="material-list">
                                            {['Manuais', 'Vídeos', 'Exercícios', 'Complementar'].map(cat => {
                                                const catMaterials = en.materials?.filter(m => (m.category || 'Manuais') === cat) || [];
                                                if (catMaterials.length === 0) return null;
                                                return (
                                                    <div key={cat} className="student-category-group" style={{ marginBottom: '1rem' }}>
                                                        <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{cat}</p>
                                                        {catMaterials.map((m, i) => (
                                                            <div key={i} className="student-material-item">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <span style={{ fontSize: '1rem' }}>{cat === 'Vídeos' ? '🎥' : '📄'}</span>
                                                                    <span>{m.name}</span>
                                                                </div>
                                                                <button className="btn-read" onClick={() => setReadingMaterial(m)}>Estudar</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                            {(!en.materials || en.materials.length === 0) && <p className="empty">Nenhum material disponível ainda.</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {enrollments.length === 0 && <p className="empty-state">Você ainda não possui matrículas ativas.</p>}
                        </div>
                    </div>

                    {readingMaterial && (
                        /* ... existing reader modal ... */
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
                                                    <small>O download está desabilitado para este material.</small>
                                                </div>
                                                <iframe src={getEmbedUrl(readingMaterial.url)} className="material-iframe" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="reader-footer">
                                    <p>Apenas para leitura. Propriedade do Centro de Formação Marítimo.</p>
                                </div>
                            </div>
                        </div>
                    )}

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
                </div>
            )}

            <style jsx>{`
        .student-dashboard { padding: 1rem 0; }
        .dashboard-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .dashboard-header h1 { font-size: 2.2rem; color: var(--navy-deep); margin-top: 0.5rem; }
        
        .student-alert-box { margin-top: 1.5rem; background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 12px; padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start; animation: slideDown 0.4s ease-out; }
        .student-alert-box .alert-icon { font-size: 1.5rem; }
        .student-alert-box strong { display: block; color: #92400e; margin-bottom: 0.25rem; font-size: 1rem; }
        .student-alert-box p { margin: 0; color: #b45309; font-size: 0.9rem; line-height: 1.5; }
        
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .btn-profile { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
        .btn-profile:hover { background: #f8fafc; border-color: var(--ocean-blue); color: var(--ocean-blue); }
        .btn-feedback { background: var(--sand-gold); border: none; color: var(--navy-deep); padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .btn-feedback:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
        
        .enrollment-section h2 { font-size: 1.5rem; margin-bottom: 2rem; color: var(--navy-medium); border-bottom: 2px solid #edf2f7; padding-bottom: 1rem; }
        
        .grid-enroll { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem; }
        
        .enroll-card { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .enroll-header { display: flex; justify-content: space-between; align-items: start; }
        .enroll-header h3 { font-size: 1.3rem; color: var(--navy-deep); flex: 1; padding-right: 1rem; }
        
        .payment-badge { font-size: 0.7rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 50px; text-transform: uppercase; white-space: nowrap; }
        .payment-badge.pago-total { background: #ecfdf5; color: #059669; }
        .payment-badge.metade { background: #fffbeb; color: #d97706; }
        .payment-badge.pendente { background: #fef2f2; color: #dc2626; }

        .schedule-info { display: flex; flex-direction: column; gap: 0.75rem; background: #f8fafc; padding: 1.25rem; border-radius: 10px; font-size: 0.95rem; }
        .schedule-info strong { color: var(--navy-medium); margin-right: 0.5rem; }

        .payment-alert { display: flex; gap: 1rem; align-items: center; background: #fff5f5; border: 1px solid #feb2b2; padding: 1rem; border-radius: 8px; color: #c53030; }
        .payment-alert .icon { font-size: 1.5rem; }
        .payment-alert strong { display: block; font-size: 0.9rem; }
        .payment-alert p { font-size: 0.85rem; font-weight: 600; }

        .materials-section h4 { font-size: 1rem; color: var(--ocean-blue); margin-bottom: 1rem; }
        .material-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .student-material-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #f1f5f9; border-radius: 8px; }
        .student-material-item span { font-size: 0.85rem; font-weight: 700; color: var(--navy-medium); }
        .btn-read { background: var(--navy-medium); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-read:hover { background: var(--ocean-blue); }

        /* Reader Modal */
        .material-reader-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
        .reader-container { width: 100%; max-width: 1000px; height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
        .reader-header { padding: 1.5rem; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center; }
        .reader-header h3 { color: var(--navy-deep); }
        .close-btn { background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #94a3b8; }
        
        .reader-body { flex: 1; background: #2d3748; position: relative; }
        .material-iframe { width: 100%; height: 100%; border: none; }
        .placeholder-viewer { height: 100%; display: flex; flex-direction: column; }
        .viewer-msg { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; text-align: center; z-index: 10; pointer-events: none; }
        
        .reader-footer { padding: 1rem; background: #f8fafc; border-top: 1px solid #edf2f7; text-align: center; font-size: 0.75rem; color: var(--gray-medium); font-weight: 600; }

        .empty-state { text-align: center; padding: 3rem; color: var(--gray-medium); }
        .empty { font-size: 0.85rem; color: #94a3b8; font-style: italic; }

        /* Profile Modal */
        .profile-modal { background: white; width: 100%; max-width: 500px; padding: 2.5rem; border-radius: 20px; }
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

        @media (max-width: 600px) {
            .grid-enroll { grid-template-columns: 1fr; }
            .reader-container { height: 100vh; max-width: none; border-radius: 0; }
            .dashboard-header { flex-direction: column; gap: 1.5rem; }
        }
      `}</style>
        </div>
    );
}
