'use client';

import React, { useEffect } from 'react';

interface MaterialViewerProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    name: string;
    url: string;
    type: string;
  } | null;
}

export default function MaterialViewer({ isOpen, onClose, material }: MaterialViewerProps) {
  useEffect(() => {
    if (isOpen) {
      // Disable right-click and some hotkeys globally within the modal when open
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable Ctrl+S, Ctrl+P, Ctrl+U (view source), F12 (dev tools)
        if ((e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) || e.key === 'F12') {
          e.preventDefault();
          alert('Ação não permitida para proteção de conteúdo.');
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  if (!isOpen || !material) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/|)(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return url;
  };

  const isVideoFile = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i);
  };

  const isExternalVideo = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const isVideo = isVideoFile(material.url) || 
                  isExternalVideo(material.url) ||
                  material.type.toLowerCase().includes('vídio') || 
                  material.type.toLowerCase().includes('video') ||
                  material.type === 'LINK';

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-container" onClick={e => e.stopPropagation()}>
        <div className="viewer-header">
          <h3>{material.name}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="viewer-content">
          {isVideoFile(material.url) ? (
            <video 
              src={material.url} 
              controls 
              controlsList="nodownload" 
              onContextMenu={e => e.preventDefault()}
              className="video-player"
              autoPlay
            >
              O seu navegador não suporta a visualização deste vídeo.
            </video>
          ) : isExternalVideo(material.url) ? (
            <iframe 
              src={getEmbedUrl(material.url)} 
              className="doc-viewer"
              title={material.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="viewer-inner-wrap">
              <iframe 
                src={`${material.url}#toolbar=0`} 
                className="doc-viewer"
                title={material.name}
              />
              <div className="external-fallback">
                <p>Se o conteúdo não carregar, use o botão abaixo para abrir externamente.</p>
                <a href={material.url} target="_blank" rel="noopener noreferrer" className="external-link-btn">
                  Abrir link em novo separador ↗
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="viewer-footer">
          <p>⚠️ Este material é propriedade do Marítimo Training Center. O download não é permitido.</p>
        </div>
      </div>

      <style jsx>{`
        .viewer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
        }
        .viewer-container {
          background: #1e293b;
          width: 100%;
          max-width: 1000px;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .viewer-header {
          padding: 1rem 1.5rem;
          background: #0f172a;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #334155;
        }
        .viewer-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-family: 'Outfit', sans-serif;
          color: #F5C518;
        }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }
        .viewer-content {
          flex: 1;
          background: #000;
          min-height: 60vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .video-player {
          width: 100%;
          height: 100%;
          max-height: 80vh;
          outline: none;
          object-fit: contain;
        }
        .viewer-inner-wrap {
          width: 100%;
          height: 75vh;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .external-fallback {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #334155;
          text-align: center;
          color: white;
          width: 80%;
          max-width: 400px;
          z-index: 10;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .external-fallback p {
          margin: 0 0 1rem;
          font-size: 0.85rem;
          color: #94a3b8;
        }
        .external-link-btn {
          display: inline-block;
          background: #F5C518;
          color: #000;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: 0.2s;
        }
        .external-link-btn:hover {
          background: #eab308;
          transform: translateY(-2px);
        }
        .doc-viewer {
          width: 100%;
          height: 80vh;
          flex: 1;
          border: none;
          background: white;
        }
        .viewer-footer {
          padding: 0.75rem 1.5rem;
          background: #0f172a;
          color: #94a3b8;
          font-size: 0.8rem;
          text-align: center;
          border-top: 1px solid #334155;
        }
      `}</style>
    </div>
  );
}
