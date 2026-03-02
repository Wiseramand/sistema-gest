'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Feedback {
    id: string;
    studentName: string;
    courseTitle: string;
    institutionFeedback: string;
    trainerFeedback: string;
    courseFeedback: string;
    comments: string;
    createdAt: string;
}

export default function AdminFeedbacksPage() {
    const { data: session } = useSession();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [printingFeedback, setPrintingFeedback] = useState<Feedback | null>(null);

    useEffect(() => {
        fetch('/api/feedbacks')
            .then(res => res.json())
            .then(data => {
                setFeedbacks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handlePrintIndividual = (f: Feedback) => {
        setPrintingFeedback(f);
        // We use a small timeout to ensure the state update is rendered if needed,
        // though for print-only templates it's usually immediate.
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (loading) return <div className="loader">A carregar feedbacks...</div>;

    return (
        <div className="feedbacks-page">
            <div className="page-header no-print">
                <div>
                    <h1>Relatórios de Satisfação</h1>
                    <p>Feedback detalhado dos alunos sobre a instituição, formadores e cursos.</p>
                </div>
            </div>

            {/* Hidden Print Template for Individual Feedback */}
            {printingFeedback && (
                <div className="print-template">
                    <div className="print-header">
                        <h1>MARÍTIMO TRAINING CENTER</h1>
                        <h2>RELATÓRIO DE SATISFAÇÃO</h2>
                    </div>

                    <div className="print-fields">
                        <div className="print-field">
                            <strong>NOME DO FORMANDO:</strong> <span>{printingFeedback.studentName}</span>
                        </div>
                        <div className="print-field">
                            <strong>CURSO:</strong> <span>{printingFeedback.courseTitle}</span>
                        </div>
                        <div className="print-field">
                            <strong>DATA:</strong> <span>{new Date(printingFeedback.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="print-content">
                        <h3>DETALHES DA AVALIAÇÃO</h3>

                        <div className="print-section">
                            <h4>Instituição</h4>
                            <p>{printingFeedback.institutionFeedback}</p>
                        </div>

                        <div className="print-section">
                            <h4>Formador</h4>
                            <p>{printingFeedback.trainerFeedback}</p>
                        </div>

                        <div className="print-section">
                            <h4>Conteúdo do Curso</h4>
                            <p>{printingFeedback.courseFeedback}</p>
                        </div>

                        {printingFeedback.comments && (
                            <div className="print-section">
                                <h4>Observações Adicionais</h4>
                                <p>{printingFeedback.comments}</p>
                            </div>
                        )}
                    </div>

                    <div className="print-footer">
                        <div className="print-sig-line"></div>
                        <p>Assinatura da Coordenação</p>
                    </div>
                </div>
            )}

            <div className="feedbacks-grid no-print">
                {feedbacks.map(f => (
                    <div key={f.id} className="feedback-card card shadow-sm">
                        <div className="card-header">
                            <div className="student-info">
                                <h3>{f.studentName}</h3>
                                <span className="course-tag">{f.courseTitle}</span>
                            </div>
                            <div className="header-actions">
                                <div className="date-tag">
                                    📅 {new Date(f.createdAt).toLocaleDateString()}
                                </div>
                                <button onClick={() => handlePrintIndividual(f)} className="btn-individual-print">
                                    🖨️ Imprimir A4
                                </button>
                            </div>
                        </div>

                        <div className="detailed-feedback">
                            <div className="feedback-item">
                                <label>🏫 Instituição:</label>
                                <p>{f.institutionFeedback}</p>
                            </div>
                            <div className="feedback-item">
                                <label>👨‍🏫 Formador:</label>
                                <p>{f.trainerFeedback}</p>
                            </div>
                            <div className="feedback-item">
                                <label>📚 Conteúdo do Curso:</label>
                                <p>{f.courseFeedback}</p>
                            </div>
                        </div>

                        {f.comments && (
                            <div className="comment-box">
                                <label>💬 Outros Comentários:</label>
                                <p>"{f.comments}"</p>
                            </div>
                        )}
                    </div>
                ))}

                {feedbacks.length === 0 && (
                    <div className="empty-state card no-print">
                        <span className="icon">📝</span>
                        <p>Ainda não foram recebidos feedbacks de alunos.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .feedbacks-page { display: flex; flex-direction: column; gap: 2rem; }
                .page-header { display: flex; justify-content: space-between; align-items: center; }
                .page-header h1 { font-size: 1.8rem; color: var(--navy-deep); margin-bottom: 0.5rem; }
                .page-header p { color: #64748b; font-size: 0.95rem; }

                .feedbacks-grid { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .feedback-card { padding: 2rem; border-radius: 16px; transition: transform 0.2s; }
                .feedback-card:hover { transform: translateY(-2px); }
                
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem; }
                .student-info h3 { margin: 0 0 0.5rem 0; font-size: 1.25rem; color: var(--navy-deep); font-weight: 800; }
                .course-tag { background: #f1f5f9; color: var(--navy-medium); padding: 0.35rem 0.85rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; }
                
                .header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
                .date-tag { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
                .btn-individual-print { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.8rem; transition: 0.2s; }
                .btn-individual-print:hover { background: var(--ocean-blue); color: white; border-color: var(--ocean-blue); }

                .detailed-feedback { display: flex; flex-direction: column; gap: 1.25rem; }
                .feedback-item label { font-weight: 800; color: #1e293b; font-size: 0.9rem; display: block; margin-bottom: 0.25rem; }
                .feedback-item p { color: #475569; font-size: 0.95rem; line-height: 1.6; margin: 0; padding-left: 1rem; border-left: 3px solid #e2e8f0; }

                .comment-box { margin-top: 1.5rem; background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px dashed #e2e8f0; }
                .comment-box label { font-weight: 700; color: var(--navy-deep); font-size: 0.85rem; display: block; margin-bottom: 0.5rem; }
                .comment-box p { font-style: italic; color: #334155; font-size: 0.9rem; margin: 0; }

                .empty-state { padding: 4rem; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .empty-state .icon { font-size: 3rem; opacity: 0.3; }

                .loader { padding: 5rem; text-align: center; color: #64748b; font-weight: 600; }

                /* Print Styles */
                .print-template { display: none; }

                @media print {
                    :global(.sidebar), :global(.admin-header) { display: none !important; }
                    :global(.admin-content) { margin-left: 0 !important; }
                    :global(.content-inner) { padding: 0 !important; margin: 0 !important; max-width: none !important; }
                    
                    .no-print { display: none !important; }
                    .print-template { 
                        display: block !important; 
                        background: white; 
                        color: black; 
                        padding: 0; 
                        min-height: 297mm; /* A4 height */
                        font-family: 'Times New Roman', serif;
                    }
                    .print-header { text-align: center; border-bottom: 4px double #001f3f; padding-bottom: 1.5rem; margin-bottom: 3rem; }
                    .print-header h1 { font-size: 2.2rem; margin: 0; color: #001f3f; }
                    .print-header h2 { font-size: 1.4rem; margin: 0.5rem 0 0 0; color: #666; letter-spacing: 2px; }
                    
                    .print-fields { margin-bottom: 3rem; font-size: 1.1rem; }
                    .print-field { margin-bottom: 0.75rem; border-bottom: 1px dotted #ccc; padding-bottom: 0.25rem; }
                    .print-field strong { width: 220px; display: inline-block; color: #333; }
                    
                    .print-content { margin-bottom: 4rem; }
                    .print-content h3 { border-bottom: 1px solid #000; padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-size: 1.2rem; }
                    .print-section { margin-bottom: 2rem; }
                    .print-section h4 { color: #444; margin-bottom: 0.5rem; font-size: 1.1rem; }
                    .print-section p { font-size: 1.05rem; line-height: 1.6; margin: 0; font-style: italic; }
                    
                    .print-footer { margin-top: auto; text-align: center; padding-top: 5rem; width: 300px; margin-left: auto; margin-right: auto; }
                    .print-sig-line { border-top: 1px solid #000; margin-bottom: 0.5rem; }
                    .print-footer p { font-size: 0.9rem; font-weight: 700; }

                    @page { margin: 2.5cm; size: A4; }
                }
            `}</style>
        </div>
    );
}
