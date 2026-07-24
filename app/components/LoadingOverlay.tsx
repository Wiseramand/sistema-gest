'use client';

export default function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div className="loader-content">
                <div className="anchor-spinner">⚓</div>
                <div className="loading-text">
                    <span className="main-text">MARÍTIMO</span>
                    <span className="dots">SISTEMA A CARREGAR...</span>
                </div>
            </div>

            <style jsx>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: #2D180F;
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
          color: #E6C5A8;
          animation: anchor-rotate 2.5s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(245, 197, 24, 0.4));
        }

        .loading-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }

        .main-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: 5px;
          margin-bottom: 0.5rem;
        }

        .dots {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          opacity: 0.6;
          text-transform: uppercase;
        }

        @keyframes anchor-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(15deg); }
          75% { transform: translateY(-15px) rotate(-15deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
