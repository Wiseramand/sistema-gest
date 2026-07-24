'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/student');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/student',
      });

      if (res?.error) {
        setError('E-mail ou senha inválidos.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar.');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="loading-screen">
        <div className="loader-inner">
           <div className="spinner">⚓</div>
           <p>Direcionando para o portal do aluno...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-primary);
            color: white;
            font-family: var(--font-display);
          }
          .loader-inner { text-align: center; }
          .spinner { font-size: 3.5rem; margin-bottom: 1rem; animation: pulse 2s infinite ease-in-out; }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
           <div className="brand-icon">⚓</div>
           <h1>Marítimo</h1>
           <span>Portal do Aluno</span>
           <div className="brand-accent"></div>
        </div>

        {error && <div className="login-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Utilizador ou E-mail</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ex: aluno@maritimo.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Palavra-passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? 'A autenticar...' : 'Entrar no Portal'}
          </button>
        </form>

        <div className="login-options">
          <Link href="/" className="btn-return">
            <span>←</span> Voltar ao Site Principal
          </Link>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-surface);
          padding: 1.5rem;
          font-family: var(--font-body);
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          padding: 3.5rem 2.5rem;
          border-radius: 16px;
          border: 1px solid var(--color-border);
          box-shadow: 0 12px 32px rgba(45, 24, 15, 0.08);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brand-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .login-header h1 {
          font-family: var(--font-display);
          font-size: 2.2rem;
          margin-bottom: 2px;
          color: var(--color-primary);
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .login-header span {
          font-family: var(--font-display);
          font-size: 0.85rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
        }

        .brand-accent {
          width: 40px;
          height: 4px;
          background: var(--color-accent);
          margin: 1.25rem auto 0;
          border-radius: 2px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.85rem;
        }

        .input-group input {
          padding: 0.85rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          transition: all 0.25s ease;
          background: #ffffff;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
        }

        .login-alert {
          background-color: var(--color-danger-bg);
          color: var(--color-danger-text);
          padding: 0.85rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          border: 1px solid rgba(198, 40, 40, 0.2);
          text-align: center;
          font-weight: 500;
        }

        .login-submit {
          background: var(--color-accent);
          color: #ffffff;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
        }

        .login-submit:hover {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(234, 88, 12, 0.4);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-options {
          margin-top: 2.5rem;
          text-align: center;
        }

        .btn-return {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.25s ease;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
        }

        .btn-return:hover {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
          transform: translateX(-5px);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2.5rem 1.5rem;
          }
          .login-header h1 { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}
