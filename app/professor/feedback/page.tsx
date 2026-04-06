'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Feedback {
    id: string;
    studentName: string;
    courseTitle: string;
    trainerFeedback: string;
    comments: string;
    createdAt: string;
}

export default function ProfessorFeedbackPage() {
    const { data: session, status } = useSession();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            if (!session?.user) return;
            setLoading(true);
            try {
                const userId = (session?.user as any)?.id;
                const userName = session?.user?.name;
                if (!userId) return;

                // 1. Fetch feedbacks
                const resF = await fetch('/api/feedbacks');
                const allFeedbacks = await resF.json();

                // 2. Fetch trainer's courses to filter feedback
                const resM = await fetch('/api/matriculations');
                const allMatrics = await resM.json();
                const myCourseTitles = Array.from(new Set(
                    allMatrics
                        .filter((m: any) => m.trainerId === userId || m.trainer === userName)
                        .map((m: any) => m.course)
                ));

                // 3. Filter feedbacks by these courses
                const myFeedbacks = allFeedbacks.filter((f: any) => 
                    myCourseTitles.includes(f.courseTitle)
                );

                setFeedbacks(myFeedbacks);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [session]);

    if (status === 'loading') {
        return <div className="p-8 text-center text-gray-500">A carregar...</div>;
    }

    if (!session) {
        return <div className="p-8 text-center text-red-500">Acesso negado. Por favor inicie sessão.</div>;
    }

    return (
        <div className="professor-feedback container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Feedback de Alunos</h1>
                    <p>Veja o que os alunos estão a dizer sobre o seu desempenho e o desenrolar do curso.</p>
                </div>
            </div>

            <div className="feedback-list">
                {loading ? <div className="loader">A carregar feedbacks...</div> : (
                    <>
                        {feedbacks.length === 0 ? (
                            <div className="empty card">
                                <p>Ainda não recebeu qualquer feedback oficial.</p>
                            </div>
                        ) : feedbacks.map((fb) => (
                            <div key={fb.id} className="feedback-card card shadow-sm">
                                <div className="card-top">
                                    <div className="author-info">
                                        <strong>{fb.studentName || 'Aluno Anónimo'}</strong>
                                        <span> Turma: {fb.courseTitle}</span>
                                    </div>
                                    <span className="date">{new Date(fb.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="feedback-content">
                                    <div className="section">
                                        <label>Sobre o Formador:</label>
                                        <p>{fb.trainerFeedback || 'Sem comentários específicos para o formador.'}</p>
                                    </div>
                                    <div className="section">
                                        <label>Comentários Gerais:</label>
                                        <p>{fb.comments || 'Sem comentários adicionais.'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <style jsx>{`
                .professor-feedback { padding: 1rem 0; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 1.8rem; color: var(--navy-deep); margin-top: 0.5rem; }
                
                .feedback-list { display: grid; grid-template-columns: 1fr; gap: 1.5rem; max-width: 800px; }
                .feedback-card { padding: 2rem; border-left: 4px solid var(--ocean-blue); transition: 0.2s; }
                .feedback-card:hover { transform: translateX(5px); }
                
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
                .author-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .author-info strong { font-size: 1.1rem; color: var(--navy-deep); font-weight: 800; }
                .author-info span { font-size: 0.85rem; color: #64748b; font-weight: 600; }
                .date { font-size: 0.75rem; color: #94a3b8; font-weight: 700; background: #f8fafc; padding: 0.35rem 0.75rem; border-radius: 50px; }
                
                .feedback-content { display: flex; flex-direction: column; gap: 1.25rem; }
                .section label { font-size: 0.7rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem; }
                .section p { font-size: 0.95rem; color: #334155; line-height: 1.6; font-style: italic; background: #f8fafc; padding: 1rem; border-radius: 10px; border: 1px solid #e2e8f0; }
                
                .loader { padding: 5rem; text-align: center; color: #94a3b8; font-weight: 600; }
                .empty { padding: 4rem; text-align: center; color: #94a3b8; font-style: italic; }
            `}</style>
        </div>
    );
}
