'use client';

export default function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div className="loader-content">
                <div className="anchor-spinner">⚓</div>
                <div className="loading-text">
                    <span className="main-text">MARÍTIMO</span>
                    <span className="dots">A carregar sistema...</span>
                </div>
            </div>

            <style jsx>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: #001f3f; /* Deep Navy */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .anchor-spinner {
          font-size: 3.5rem;
          color: #f4d03f; /* Sand Gold */
          animation: anchor-bob 2s ease-in-out infinite;
          filter: drop-shadow(0 0 15px rgba(244, 208, 63, 0.4));
        }

        .loading-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }

        .main-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 1.25rem;
          letter-spacing: 4px;
          margin-bottom: 0.5rem;
        }

        .dots {
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 1px;
          opacity: 0.7;
          text-transform: uppercase;
        }

        @keyframes anchor-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
