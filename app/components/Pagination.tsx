'use client';

interface PaginationProps {
  total: number;
  perPage: number;
  page: number;
  onChange: (page: number) => void;
}

export default function Pagination({ total, perPage, page, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >← Anterior</button>

      {pages.map(p => (
        <button
          key={p}
          className={`page-btn ${p === page ? 'active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >Seguinte →</button>

      <span className="page-info">Página {page} de {totalPages} · {total} registos</span>

      <style jsx>{`
        .pagination {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
          padding: 1rem 0;
        }
        .page-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          color: #334155;
          transition: 0.15s;
        }
        .page-btn:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #2D180F;
          color: #2D180F;
        }
        .page-btn.active {
          background: #2D180F;
          color: white;
          border-color: #2D180F;
        }
        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .page-info {
          margin-left: 0.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
