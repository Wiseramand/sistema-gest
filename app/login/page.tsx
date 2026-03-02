'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'PROFESSOR' || role === 'TRAINER') {
        router.push('/professor');
      } else if (role === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('E-mail ou senha inválidos.');
        setIsLoading(false);
      } else {
        // Redirection is handled by the useEffect
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar.');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return <div className="loading-screen">Direcionando para o portal...</div>;
  }

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-header">
          <div className="maritime-accent mx-auto"></div>
          <h2>Acesso ao Portal</h2>
          <p>Entre com suas credenciais para gerenciar o centro.</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail ou Utilizador</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com ou username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <Link href="/">Voltar para o início</Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--navy-deep) 0%, var(--ocean-blue) 100%);
          padding: 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-weight: 600;
          color: var(--navy-medium);
          font-size: 0.9rem;
        }

        input {
          padding: 0.75rem;
          border: 1px solid var(--gray-light);
          border-radius: var(--radius-md);
          font-family: inherit;
        }

        .alert.error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          font-size: 0.9rem;
          border: 1px solid #f5c6cb;
          text-align: center;
        }

        .w-full {
          width: 100%;
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .login-footer a {
          color: var(--navy-medium);
          text-decoration: underline;
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--navy-deep);
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
