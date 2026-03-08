'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrainerLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            }, {
                basePath: '/api/auth/professor'
            } as any);

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
        return <div className="loading-screen">Direcionando para o portal do formador...</div>;
    }

    return (
        <div className="login-container">
            <div className="login-card card">
                <div className="login-header">
                    <div className="maritime-accent mx-auto"></div>
                    <h2>Portal do Formador</h2>
                    <p>Acesso para professores e formadores.</p>
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
                            placeholder="formador@email.com"
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
                        {isLoading ? 'Entrando...' : 'Entrar no Portal'}
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
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          padding: 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .maritime-accent {
            width: 50px;
            height: 5px;
            background: #3b82f6;
            border-radius: 10px;
            margin-bottom: 1rem;
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
          color: #1e293b;
          font-size: 0.9rem;
        }

        input {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-family: inherit;
        }

        .alert.error {
          background-color: #fca5a5;
          color: #7f1d1d;
          padding: 0.75rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          border: 1px solid #f87171;
          text-align: center;
        }

        .btn-primary {
            background: #1e293b;
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-primary:hover {
            background: #0f172a;
            transform: translateY(-2px);
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
          color: #64748b;
          text-decoration: underline;
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #1e293b;
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}
