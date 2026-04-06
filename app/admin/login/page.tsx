'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin');
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
        callbackUrl: '/admin',
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
           <p>Direcionando para o centro administrativo...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0a2a5e;
            color: white;
            font-family: 'Outfit', sans-serif;
          }
          .loader-inner { text-align: center; }
          .spinner { font-size: 3rem; margin-bottom: 1rem; animation: pulse 2s infinite ease-in-out; }
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
           <span>Centro Administrativo</span>
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
              placeholder="Ex: admin@maritimo.com"
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
            {isLoading ? 'A autenticar...' : 'Entrar no Sistema'}
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
          background-color: #f4f7fb;
          padding: 1.5rem;
          font-family: 'DM Sans', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          padding: 3.5rem 2.5rem;
          border-radius: 14px;
          border: 1px solid #dce6f0;
          box-shadow: 0 10px 25px rgba(10, 42, 94, 0.05);
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
          font-family: 'Outfit', sans-serif;
          font-size: 2.2rem;
          margin-bottom: 2px;
          color: #0a2a5e;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .login-header span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: #6b7ea0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
        }

        .brand-accent {
          width: 40px;
          height: 3px;
          background: #F5C518;
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
          color: #0f1e35;
          font-size: 0.85rem;
        }

        .input-group input {
          padding: 0.85rem 1rem;
          border: 1px solid #dce6f0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          transition: all 0.25s ease;
          background: #ffffff;
        }

        .input-group input:focus {
          outline: none;
          border-color: #1a4fa0;
          box-shadow: 0 0 0 4px rgba(26, 79, 160, 0.08);
        }

        .login-alert {
          background-color: #fde8e8;
          color: #991b1b;
          padding: 0.85rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          border: 1px solid rgba(153, 27, 27, 0.1);
          text-align: center;
          font-weight: 500;
        }

        .login-submit {
          background: #0a2a5e;
          color: #ffffff;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }

        .login-submit:hover {
          background: #1a4fa0;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(10, 42, 94, 0.2);
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
          color: #0a2a5e;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.25s ease;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          border: 1px solid #dce6f0;
        }

        .btn-return:hover {
          background: #e8f0fb;
          border-color: #1a4fa0;
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
