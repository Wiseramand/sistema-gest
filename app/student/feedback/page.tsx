'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Course {
    id: string;
    title: string;
}

export default function StudentFeedbackPage() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        courseTitle: '',
        institutionFeedback: '',
        trainerFeedback: '',
        courseFeedback: '',
        comments: ''
    });

    useEffect(() => {
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => {
                setCourses(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.courseTitle || !formData.institutionFeedback || !formData.trainerFeedback || !formData.courseFeedback) {
            alert('Por favor preencha todos os campos de avaliação.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/feedbacks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    studentId: (session?.user as any)?.id,
                    studentName: session?.user?.name
                })
            });

            if (res.ok) {
                setSuccess(true);
                setFormData({ courseTitle: '', institutionFeedback: '', trainerFeedback: '', courseFeedback: '', comments: '' });
            } else {
                alert('Erro ao enviar feedback.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao enviar feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loader">A carregar...</div>;

    if (success) {
        return (
            <div className="page-wrapper center-wrapper">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Obrigado pelo seu feedback!</h2>
                    <p>A sua opinião é muito importante para melhorarmos continuamente os nossos serviços na MARÍTIMO TRAINING CENTER.</p>
                    <button className="btn-primary mt-4" onClick={() => setSuccess(false)}>Enviar outro feedback</button>
                </div>
                <style jsx>{`
                    .center-wrapper { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
                    .success-card { background: white; padding: 3rem; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 500px; width: 100%; border-top: 5px solid #10b981; }
                    .success-icon { font-size: 4rem; margin-bottom: 1rem; }
                    .success-card h2 { color: var(--navy-deep); margin-bottom: 0.5rem; }
                    .success-card p { color: #64748b; font-size: 0.95rem; line-height: 1.6; }
                    .mt-4 { margin-top: 2rem; }
                    .btn-primary { background: var(--ocean-blue); color: white; border: none; padding: 0.85rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                    .btn-primary:hover { background: var(--navy-deep); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="feedback-container">
                <div className="header-section">
                    <div className="maritime-accent"></div>
                    <h1>Formulário de Satisfação</h1>
                    <p>Partilhe a sua experiência connosco. O seu feedback ajuda-nos a melhorar!</p>
                </div>

                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-group">
                        <label>De qual curso está a dar feedback?</label>
                        <select
                            value={formData.courseTitle}
                            onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                            className="form-select"
                        >
                            <option value="">Selecione um curso...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.title}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ratings-section">
                        <div className="rating-card-vertical">
                            <label>🏫 Instituição</label>
                            <p className="helper-text">Avalie as instalações, atendimento e organização da MARÍTIMO TRAINING CENTER.</p>
                            <textarea
                                value={formData.institutionFeedback}
                                onChange={(e) => setFormData({ ...formData, institutionFeedback: e.target.value })}
                                placeholder="A sua opinião sobre a instituição..."
                                rows={3}
                                className="form-textarea"
                            />
                        </div>

                        <div className="rating-card-vertical">
                            <label>👨‍🏫 Formador</label>
                            <p className="helper-text">Avalie o domínio do assunto, clareza e didática do formador.</p>
                            <textarea
                                value={formData.trainerFeedback}
                                onChange={(e) => setFormData({ ...formData, trainerFeedback: e.target.value })}
                                placeholder="A sua opinião sobre o formador..."
                                rows={3}
                                className="form-textarea"
                            />
                        </div>

                        <div className="rating-card-vertical">
                            <label>📚 Conteúdo do Curso</label>
                            <p className="helper-text">Avalie a atualidade, relevância e aplicabilidade dos temas abordados.</p>
                            <textarea
                                value={formData.courseFeedback}
                                onChange={(e) => setFormData({ ...formData, courseFeedback: e.target.value })}
                                placeholder="A sua opinião sobre o curso..."
                                rows={3}
                                className="form-textarea"
                            />
                        </div>
                    </div>

                    <div className="form-group mb-0">
                        <label>Comentários Adicionais (Opcional)</label>
                        <textarea
                            rows={3}
                            className="form-textarea"
                            placeholder="Outras sugestões ou elogios..."
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? 'A enviar...' : '⭐ Enviar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .page-wrapper { padding: 1rem; max-width: 800px; margin: 0 auto; }
                .feedback-container { background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); overflow: hidden; }
                
                .header-section { background: linear-gradient(135deg, var(--navy-deep), #1e3a8a); color: white; padding: 2.5rem; text-align: center; }
                .header-section h1 { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
                .header-section p { margin: 0.5rem 0 0; color: #93c5fd; font-size: 1.05rem; }
                
                .feedback-form { padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; }
                
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-weight: 700; color: var(--navy-deep); font-size: 1.05rem; }
                .form-select, .form-textarea { padding: 1rem; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; font-family: inherit; transition: 0.2s; background: #f8fafc; }
                .form-select:focus, .form-textarea:focus { border-color: var(--ocean-blue); outline: none; background: white; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
                
                .ratings-section { display: flex; flex-direction: column; gap: 1.5rem; }
                .rating-card-vertical { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; }
                .rating-card-vertical label { font-weight: 800; color: var(--navy-deep); font-size: 1.1rem; }
                .helper-text { margin: 0; font-size: 0.85rem; color: #64748b; line-height: 1.4; }
                
                .mb-0 { margin-bottom: 0; }
                
                .form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 2rem; }
                .btn-submit { background: var(--ocean-blue); color: white; border: none; padding: 1rem 2.5rem; border-radius: 12px; font-weight: 800; font-size: 1.05rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2); }
                .btn-submit:hover:not(:disabled) { background: var(--navy-deep); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(10, 25, 47, 0.3); }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
                
                .loader { padding: 4rem; text-align: center; color: #64748b; font-weight: 600; font-size: 1.1rem; }
            `}</style>
        </div>
    );
}
