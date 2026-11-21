'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface CourseItem {
  id: string | number;
  title: string;
  category: string;
  duration: string;
  image: string;
  description: string;
  price?: string;
  badge?: string;
  nextDate?: string;
  slots?: number;
}

const defaultCourseCatalog: CourseItem[] = [
  {
    id: 1,
    title: 'Segurança Básica (STCW) — Regra VI/1',
    category: 'STCW',
    duration: '40 horas',
    image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1200&auto=format&fit=crop',
    description: 'Curso mandatório para todo tripulante em navios internacionais. Abrange sobrevivência, combate a incêndio e primeiros socorros.',
    price: 'USD 450',
    badge: 'STCW 2010',
    nextDate: '15 Jan 2026',
    slots: 5
  },
  {
    id: 2,
    title: 'BOSIET — Sobrevivência Offshore com HUET',
    category: 'Offshore',
    duration: '56 horas',
    image: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1200&auto=format&fit=crop',
    description: 'Formação obrigatória para atuação em plataformas de petróleo e gás. Inclui escape de helicóptero submerso e sobrevivência.',
    price: 'USD 980',
    badge: 'OPITO Standard',
    nextDate: '22 Jan 2026',
    slots: 3
  },
  {
    id: 3,
    title: 'Código ISPS — Proteção do Navio e Instalações Portuárias',
    category: 'Segurança',
    duration: '24 horas',
    image: '/assets/hero/banner3.png',
    description: 'Capacitação tática em segurança portuária e marítima conforme o código internacional de proteção contra atos ilícitos.',
    price: 'USD 320',
    badge: 'IMO Model Course',
    nextDate: '05 Fev 2026',
    slots: 8
  },
  {
    id: 4,
    title: 'Revalidação Quinquenal STCW',
    category: 'STCW',
    duration: '16 horas',
    image: '/assets/hero/banner4.png',
    description: 'Atualização periódica obrigatória a cada 5 anos para renovação da carteira de marítimo e certidões de competência.',
    price: 'USD 180',
    badge: 'Revalidação',
    nextDate: 'Turmas Quinzenais',
    slots: 12
  },
  {
    id: 5,
    title: 'Liderança e Gestão de Recursos no Passadiço (MRM)',
    category: 'Comando',
    duration: '32 horas',
    image: '/assets/hero/banner2.png',
    description: 'Treinamento avançado de gestão de crise, tomada de decisão e sinergia de equipes de navegação em simulador.',
    price: 'USD 650',
    badge: 'Simulador Náutico',
    nextDate: '10 Fev 2026',
    slots: 2
  },
  {
    id: 6,
    title: 'Primeiros Socorros Médicos Avançados a Bordo',
    category: 'Segurança',
    duration: '40 horas',
    image: '/assets/hero/banner1.png',
    description: 'Atendimento de emergência, suporte básico e avançado de vida e procedimentos para resgate aeromédico offshore.',
    price: 'USD 390',
    badge: 'STCW VI/4',
    nextDate: '01 Mar 2026',
    slots: 6
  }
];

export default function CursosPage() {
  const [courses, setCourses] = useState<CourseItem[]>(defaultCourseCatalog);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    async function loadApiCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: CourseItem[] = data.map((c: any, index: number) => ({
              id: c.id || index + 10,
              title: c.title || c.name,
              category: c.category || 'STCW',
              duration: c.duration ? `${c.duration}h` : '40 horas',
              image: c.image || defaultCourseCatalog[index % defaultCourseCatalog.length].image,
              description: c.description || 'Formação certificada Marítimo Training Center conforme padrões IMO.',
              price: c.price ? `USD ${c.price}` : 'Consulte',
              badge: c.stcwCode || 'STCW',
              nextDate: 'Consulte Próxima Turma',
              slots: c.availableSlots || 6
            }));
            setCourses(mapped);
          }
        }
      } catch (err) {
        console.error('Falha ao carregar cursos da API, usando catálogo local:', err);
      }
    }
    loadApiCourses();
  }, []);

  const categories = ['Todos', 'STCW', 'Offshore', 'Segurança', 'Comando'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || course.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <main style={{ paddingTop: '74px' }}>
      <Navbar />

      {/* Header Banner */}
      <div className="page-banner">
        <div className="container">
          <div className="banner-badge">Catálogo Oficial MTC</div>
          <h1>Cursos & Certificações</h1>
          <p>Explore as melhores oportunidades de capacitação marítima e offshore com homologação internacional.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="container filter-container">
          <div className="search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por curso, código STCW ou palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <section className="container courses-section">
        <div className="section-meta-header">
          <span className="results-indicator">
            A apresentar <strong>{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'formação disponível' : 'formações disponíveis'}
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>Nenhum curso encontrado</h3>
            <p>Tente ajustar os termos de pesquisa ou remover os filtros aplicados.</p>
            <button className="btn-reset" onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}>
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-image" style={{ backgroundImage: `url(${course.image})` }}>
                  <div className="image-overlay"></div>
                  <span className="category-badge">{course.badge || course.category}</span>
                  {course.slots && course.slots <= 5 && (
                    <span className="slots-badge">
                      <span className="pulse-dot"></span>
                      {course.slots} vagas restantes
                    </span>
                  )}
                </div>

                <div className="course-info">
                  <div className="course-meta-tags">
                    <span className="meta-tag">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {course.duration}
                    </span>
                    <span className="meta-tag">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      Homologado IMO
                    </span>
                  </div>

                  <h3>{course.title}</h3>
                  <p className="desc">{course.description}</p>

                  {course.nextDate && (
                    <div className="next-date-row">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Início previsto: <strong>{course.nextDate}</strong></span>
                    </div>
                  )}

                  <div className="card-divider"></div>

                  <div className="course-footer">
                    {course.price && (
                      <div className="price-wrap">
                        <span className="price-label">Investimento</span>
                        <strong className="price-val">{course.price}</strong>
                      </div>
                    )}
                    <Link href={`/?curso=${encodeURIComponent(course.title)}#inscrever`} className="btn-enroll">
                      <span>Candidatar</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />

      <style jsx>{`
        .page-banner {
          padding: 4.5rem 1.5rem;
          background-size: cover;
          background-position: center;
          background-image: linear-gradient(rgba(45, 24, 15, 0.88), rgba(45, 24, 15, 0.85)), url('/assets/hero/cursos-banner.png');
          color: white;
          text-align: center;
        }
        .banner-badge {
          display: inline-block;
          background: rgba(230, 197, 168, 0.16);
          border: 1px solid rgba(230, 197, 168, 0.35);
          color: var(--color-sandstone, #E6C5A8);
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 0.35rem 0.95rem;
          border-radius: 50px;
          margin-bottom: 1rem;
        }
        .page-banner h1 {
          color: white;
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .page-banner p {
          font-size: 1.15rem;
          opacity: 0.9;
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Filter bar */
        .filter-bar {
          background: #ffffff;
          border-bottom: 1px solid #EAE3DC;
          padding: 1.25rem 0;
          position: sticky;
          top: 74px;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(45, 24, 15, 0.05);
        }
        .filter-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
          max-width: 480px;
        }
        .search-wrap svg {
          position: absolute;
          left: 14px;
          color: #9CA3AF;
          pointer-events: none;
        }
        .search-wrap input {
          width: 100%;
          padding: 0.7rem 1rem 0.7rem 2.6rem;
          border: 1.5px solid #E0D6CD;
          border-radius: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.925rem;
          color: #2D180F;
          outline: none;
          transition: all 0.2s ease;
        }
        .search-wrap input:focus {
          border-color: var(--color-accent, #EA580C);
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.14);
        }

        .category-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .pill-btn {
          background: #F8F4EF;
          border: 1px solid #E2D7CC;
          color: #5C4A3A;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pill-btn:hover {
          background: #EFE8DF;
          color: #2D180F;
        }
        .pill-btn.active {
          background: var(--color-accent, #EA580C);
          border-color: var(--color-accent, #EA580C);
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);
        }

        /* Section */
        .courses-section {
          padding: 3rem 1.5rem 5rem;
        }
        .section-meta-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .results-indicator {
          font-size: 0.9rem;
          color: #78685E;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .course-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #E6DDD4;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 16px rgba(45, 24, 15, 0.05);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .course-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(45, 24, 15, 0.12);
          border-color: var(--color-accent, #EA580C);
        }

        .course-image {
          height: 190px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%);
        }
        .category-badge {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          background: rgba(45, 24, 15, 0.88);
          backdrop-filter: blur(4px);
          color: #E6C5A8;
          border: 1px solid rgba(230, 197, 168, 0.35);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.725rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          z-index: 2;
        }
        .slots-badge {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          background: rgba(220, 38, 38, 0.9);
          backdrop-filter: blur(4px);
          color: white;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.725rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          animation: blink 1.5s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .course-info {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .course-meta-tags {
          display: flex;
          gap: 0.85rem;
          margin-bottom: 0.75rem;
        }
        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #78685E;
        }

        .course-info h3 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #2D180F;
          line-height: 1.35;
          margin-bottom: 0.65rem;
        }

        .desc {
          font-size: 0.88rem;
          color: #64748B;
          line-height: 1.55;
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .next-date-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #F8F4EF;
          padding: 0.45rem 0.75rem;
          border-radius: 6px;
          font-size: 0.775rem;
          color: #5C4A3A;
          margin-bottom: 1.25rem;
        }
        .next-date-row svg {
          color: var(--color-accent, #EA580C);
          flex-shrink: 0;
        }

        .card-divider {
          height: 1px;
          background: #F1ECE6;
          margin-bottom: 1.1rem;
        }

        .course-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .price-wrap {
          display: flex;
          flex-direction: column;
        }
        .price-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #9CA3AF;
          font-weight: 600;
        }
        .price-val {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--color-accent, #EA580C);
          line-height: 1.1;
        }

        .btn-enroll {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #2D180F;
          color: #ffffff;
          padding: 0.65rem 1.2rem;
          border-radius: 8px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .btn-enroll:hover {
          background: var(--color-accent, #EA580C);
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(234, 88, 12, 0.35);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 1.5rem;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #EAE3DC;
        }
        .empty-state svg {
          color: #9CA3AF;
          margin-bottom: 1rem;
        }
        .empty-state h3 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.35rem;
          color: #2D180F;
          margin-bottom: 0.5rem;
        }
        .empty-state p {
          font-size: 0.95rem;
          color: #78685E;
          margin-bottom: 1.5rem;
        }
        .btn-reset {
          background: #2D180F;
          color: white;
          border: none;
          padding: 0.65rem 1.35rem;
          border-radius: 8px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2.2rem; }
          .filter-container { flex-direction: column; align-items: stretch; }
          .search-wrap { max-width: 100%; }
        }
      `}</style>
    </main>
  );
}
