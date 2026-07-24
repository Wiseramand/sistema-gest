'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  status: string;
}

export default function InscriptionForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setCourses(data.filter((c: Course) => c.status === 'Inscrições Abertas'));
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course) {
      alert('Por favor, selecione um curso.');
      return;
    }
    setStatus('loading');

    try {
      const response = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Falha ao enviar inscrição');

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', course: '', message: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className="inscription-form" onSubmit={handleSubmit}>
      {status === 'success' && (
        <div className="alert success">
          <span className="icon">✅</span>
          <div>
            <strong>Inscrição enviada!</strong>
            <p>Nossa equipe entrará em contato em breve.</p>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="alert error">
          <span className="icon">⚠️</span>
          <div>
            <strong>Ocorreu um erro</strong>
            <p>Por favor, tente novamente mais tarde.</p>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nome Completo</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome"
          disabled={status === 'loading'}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="exemplo@email.com"
            disabled={status === 'loading'}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+244 9XX XXX XXX"
            disabled={status === 'loading'}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="course">Curso de Interesse</label>
        <select
          id="course"
          name="course"
          required
          value={formData.course}
          onChange={handleChange}
          disabled={status === 'loading'}
        >
          <option value="">Selecione uma formação aberta</option>
          {courses.map(course => (
            <option key={course.id} value={course.title}>{course.title}</option>
          ))}
          {courses.length === 0 && <option disabled>Nenhum curso disponível no momento.</option>}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="message">Mensagem Adicional (Opcional)</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Dúvidas ou observações específicas..."
          disabled={status === 'loading'}
        ></textarea>
      </div>

      <button type="submit" className="submit-btn" disabled={status === 'loading' || courses.length === 0}>
        {status === 'loading' ? 'Processando...' : 'Confirmar Pré-Inscrição'}
      </button>

      <style jsx>{`
        .inscription-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: var(--font-body);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        label {
          font-weight: 600;
          color: var(--color-primary);
          font-size: 0.85rem;
          letter-spacing: 0.3px;
        }

        input, select, textarea {
          padding: 1rem;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.25s ease;
          background: #fdfdfd;
          color: var(--color-text);
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--color-accent);
          background: white;
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.12);
        }

        input::placeholder, textarea::placeholder {
          color: var(--color-text-muted);
          opacity: 0.7;
        }

        .alert {
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          font-size: 0.9rem;
          border: 0.5px solid;
        }
        .alert strong { display: block; margin-bottom: 2px; }
        .alert p { margin: 0; opacity: 0.9; }
        .alert .icon { font-size: 1.25rem; }

        .alert.success {
          background-color: var(--color-success-bg);
          color: var(--color-success-text);
          border-color: rgba(27, 94, 32, 0.2);
        }

        .alert.error {
          background-color: var(--color-danger-bg);
          color: var(--color-danger-text);
          border-color: rgba(198, 40, 40, 0.2);
        }

        .submit-btn {
          width: 100%;
          padding: 1.1rem;
          background: var(--color-accent);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
        }

        .submit-btn:hover {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(234, 88, 12, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; gap: 1.5rem; }
        }
      `}</style>
    </form>
  );
}
