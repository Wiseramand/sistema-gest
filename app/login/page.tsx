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
      // Find user role first to determine which portal to sign in to
      const userRes = await fetch(`/api/user/role?identifier=${encodeURIComponent(email)}`);
      if (!userRes.ok) {
        setError('Usuário não encontrado.');
        setIsLoading(false);
        return;
      }
      const { role } = await userRes.json();

      let basePath = '';
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        basePath = '/api/auth/admin';
      } else if (role === 'PROFESSOR' || role === 'TRAINER') {
        basePath = '/api/auth/professor';
      } else if (role === 'STUDENT') {
        basePath = '/api/auth/student';
      }

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: role === 'STUDENT' ? '/student' : (role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/professor'),
      }, {
        basePath: basePath || undefined
      } as any);

      if (res?.error) {
        setError('E-mail ou senha inválidos.');
        setIsLoading(false);
      } else {
        // Redirection will happen after session is updated
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
          <h2>Acesso aos Portais</h2>
          <p>Escolha o portal que deseja acessar.</p>
        </div>

        <div className="portal-choices">
          <Link href="/admin/login" className="portal-btn admin">
            <span className="icon">🔐</span>
            <div className="text">
              <strong>Portal Administrativo</strong>
              <span>Painel de gestão e controle</span>
            </div>
          </Link>

          <Link href="/student/login" className="portal-btn student">
            <span className="icon">🎓</span>
            <div className="text">
              <strong>Portal do Aluno</strong>
              <span>Materiais, notas e suporte</span>
            </div>
          </Link>

          <Link href="/professor/login" className="portal-btn professor">
            <span className="icon">👨‍🏫</span>
            <div className="text">
              <strong>Portal do Formador</strong>
              <span>Gestão de turmas e conteúdos</span>
            </div>
          </Link>
        </div>

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
          max-width: 450px;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .portal-choices {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .portal-btn {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            padding: 1.25rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 15px;
            text-decoration: none;
            transition: 0.2s;
            color: #1e293b;
        }

        .portal-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: #3b82f6;
        }

        .portal-btn .icon {
            font-size: 1.8rem;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border-radius: 12px;
        }

        .portal-btn.admin:hover .icon { background: #fee2e2; }
        .portal-btn.student:hover .icon { background: #dbeafe; }
        .portal-btn.professor:hover .icon { background: #fef3c7; }

        .text {
            display: flex;
            flex-direction: column;
        }

        .text strong {
            font-size: 1.05rem;
            color: #0f172a;
        }

        .text span {
            font-size: 0.85rem;
            color: #64748b;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .login-footer a {
          color: var(--navy-medium);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
