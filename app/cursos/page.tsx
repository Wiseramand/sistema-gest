'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const courses = [
    {
        id: 1,
        title: 'Marinheiro de Convés',
        category: 'Nacional',
        duration: '6 meses',
        image: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1200&auto=format&fit=crop',
        description: 'Formação completa para atuação em embarcações de comércio e recreio.'
    },
    {
        id: 2,
        title: 'Segurança Básica (STCW)',
        category: 'Internacional',
        duration: '60 horas',
        image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1200&auto=format&fit=crop',
        description: 'Curso obrigatório para todo tripulante que deseja trabalhar em navios internacionais.'
    },
    {
        id: 3,
        title: 'Combate a Incêndio Avançado',
        category: 'Técnico',
        duration: '40 horas',
        image: 'https://images.unsplash.com/photo-1533903345206-13a89ce8fd0a?q=80&w=1200&auto=format&fit=crop',
        description: 'Treinamento intensivo para liderança em equipes de resposta a emergências.'
    },
    {
        id: 4,
        title: 'Inglês Marítimo',
        category: 'Linguagem',
        duration: '3 meses',
        image: 'https://images.unsplash.com/photo-1454165833767-027ffea10c3b?q=80&w=1200&auto=format&fit=crop',
        description: 'Comunicação rádio e terminologia técnica padrão da IMO.'
    }
];

export default function CursosPage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            <Navbar />

            <div className="page-banner" style={{ backgroundImage: "linear-gradient(rgba(0, 31, 63, 0.7), rgba(0, 31, 63, 0.7)), url('/assets/hero/cursos-banner.png')" }}>
                <div className="container">
                    <h1>Nossos Cursos</h1>
                    <p>Explore as melhores oportunidades de formação marítima com certificação internacional.</p>
                </div>
            </div>

            <section className="container courses-section">
                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card card">
                            <div className="course-image" style={{ backgroundImage: `url(${course.image})` }}>
                                <span className="category-badge">{course.category}</span>
                            </div>
                            <div className="course-info">
                                <h3>{course.title}</h3>
                                <p className="duration">⏱️ {course.duration}</p>
                                <p className="desc">{course.description}</p>
                                <div className="course-footer">
                                    <a href="/contacto" className="btn btn-primary btn-sm">Saber Mais</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />

            <style jsx>{`
        .page-banner {
          height: 300px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          color: white;
          text-align: center;
        }
        .page-banner h1 { color: white; font-size: 3rem; margin-bottom: 1rem; }
        .page-banner p { font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }

        .courses-section { padding: 5rem 1.5rem; }
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2.5rem;
        }
        .course-card {
           padding: 0;
           overflow: hidden;
           border: 1px solid #e2e8f0;
           display: flex;
           flex-direction: column;
        }
        .course-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .category-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--sand-gold);
          color: var(--navy-deep);
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .course-info { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .course-info h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--navy-deep); }
        .duration { font-size: 0.85rem; color: var(--ocean-blue); font-weight: 700; margin-bottom: 1rem; }
        .desc { font-size: 0.9rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; flex: 1; }
        
        .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; }

        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2rem; }
        }
      `}</style>
        </main>
    );
}
