'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrainerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/professor');
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
        callbackUrl: '/professor',
      });

      if (res?.error) {
        setError('Credenciais de formador inválidas.');
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
        <div className="spinner-box">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="3"/>
            <line x1="12" y1="8" x2="12" y2="21"/>
            <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
          </svg>
        </div>
        <p>A carregar o Portal do Formador...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0F2235;
            color: white;
            font-family: 'Outfit', sans-serif;
            gap: 1rem;
          }
          .spinner-box { color: #EA580C; animation: pulse 1.8s infinite ease-in-out; }
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-icon-box" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="8" x2="12" y2="21"/>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
            </svg>
          </div>
          <h2>Portal do Formador</h2>
          <span className="portal-sub">Corpo Docente & Oficiais de Instrução</span>
          <div className="brand-accent"></div>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail ou Código de Instrutor</label>
            <div className="input-wrap">
              <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ex: formador@maritimo-training.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <div className="input-wrap">
              <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="A sua palavra-passe"
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="meta-row">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Manter sessão ativa</span>
            </label>
            <a href="mailto:pedagogico@maritimo-training.com?subject=Recuperar%20Credenciais%20Formador" className="help-link">
              Precisa de ajuda?
            </a>
          </div>

          <button type="submit" className="btn-trainer-submit" disabled={isLoading}>
            {isLoading ? 'A autenticar...' : 'Entrar no Portal do Formador'}
          </button>
        </form>

        <div className="login-footer">
          <Link href="/" className="site-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar ao Site Principal
          </Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #0B1926 0%, #152E48 55%, #1E3A5F 100%);
          padding: 2rem 1.5rem;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          padding: 3rem 2.25rem;
          border-radius: 18px;
          border: 1px solid rgba(230, 197, 168, 0.35);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.25rem;
        }

        .brand-icon-box {
          background: #1E3A5F;
          color: #ffffff;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 20px rgba(30, 58, 95, 0.4);
        }

        .login-header h2 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 2rem;
          color: #0F2235;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 3px;
        }

        .portal-sub {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.8rem;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 600;
        }

        .brand-accent {
          width: 44px;
          height: 4px;
          background: #1E3A5F;
          margin: 1.1rem auto 0;
          border-radius: 4px;
        }

        .alert-error {
          background-color: #FEF2F2;
          color: #991B1B;
          border: 1px solid #FCA5A5;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-group label {
          font-weight: 600;
          color: #0F2235;
          font-size: 0.86rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          pointer-events: none;
        }

        .input-wrap input {
          width: 100%;
          padding: 0.85rem 2.8rem 0.85rem 2.65rem;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.95rem;
          color: #0F2235;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-wrap input:focus {
          border-color: #1E3A5F;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.16);
        }

        .btn-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .btn-eye:hover { color: #1E3A5F; }

        .meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #475569;
        }
        .checkbox-wrap input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #1E3A5F;
        }

        .help-link {
          color: #1E3A5F;
          font-weight: 600;
          text-decoration: none;
        }
        .help-link:hover { text-decoration: underline; }

        .btn-trainer-submit {
          background: #1E3A5F;
          color: #ffffff;
          border: none;
          padding: 0.95rem 1.5rem;
          border-radius: 10px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 8px 22px rgba(30, 58, 95, 0.35);
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }
        .btn-trainer-submit:hover:not(:disabled) {
          background: #0F2235;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(30, 58, 95, 0.45);
        }
        .btn-trainer-submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .site-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #64748B;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .site-link:hover { color: #1E3A5F; }
      `}</style>
    </div>
  );
}
