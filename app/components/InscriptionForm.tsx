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
        // Only show courses with "Inscrições Abertas" status
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
      setTimeout(() => setStatus('idle'), 5000);
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
        <div className="alert success">Inscrição enviada com sucesso! Nossa equipe entrará em contato.</div>
      )}
      {status === 'error' && (
        <div className="alert error">Ocorreu um erro. Por favor, tente novamente mais tarde.</div>
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
            placeholder="(xx) xxxx-xxxx"
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
          {courses.length === 0 && <option disabled>Nenhum curso com inscrições abertas no momento.</option>}
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

      <button type="submit" className="btn btn-primary w-full" disabled={status === 'loading' || courses.length === 0}>
        {status === 'loading' ? 'Processando...' : 'Confirmar Pré-Inscrição'}
      </button>

      <style jsx>{`
        .inscription-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          font-weight: 700;
          color: var(--navy-medium);
          font-size: 0.85rem;
        }

        input, select, textarea {
          padding: 0.85rem;
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--ocean-blue);
          box-shadow: 0 0 0 3px rgba(0, 116, 217, 0.1);
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-weight: 700;
          text-align: center;
          font-size: 0.9rem;
        }

        .alert.success {
          background-color: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

         .alert.error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .w-full {
          width: 100%;
          padding: 1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
}
