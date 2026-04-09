'use client';

import React from 'react';

type Company = {
  name: string;
  icon: string;
};

interface CompanyMarqueeProps {
  title: string;
  companies: Company[];
  reverse?: boolean;
}

export default function CompanyMarquee({ title, companies, reverse = false }: CompanyMarqueeProps) {
  return (
    <div className="marquee-wrapper">
      <div className="container">
        <h3 className="marquee-title">{title}</h3>
      </div>
      
      <div className="marquee-container">
        <div className={`marquee-track ${reverse ? 'reverse' : ''}`}>
          {[...companies, ...companies].map((c, i) => (
            <div className="company-card" key={i}>
              <span className="company-icon">{c.icon}</span>
              <span className="company-name">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-wrapper {
          padding: 2.5rem 0;
          overflow: hidden;
        }

        .marquee-title {
          text-align: center;
          font-family: var(--font-display);
          color: var(--color-text-muted);
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 2.5rem;
          font-weight: 700;
        }

        .marquee-container {
          position: relative;
          width: 100vw;
          max-width: 100%;
          overflow: hidden;
          display: flex;
        }

        .marquee-container::before,
        .marquee-container::after {
          content: '';
          position: absolute;
          top: 0;
          width: 150px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .marquee-container::before {
          left: 0;
          background: linear-gradient(to right, #f8fafc 0%, rgba(248, 250, 252, 0) 100%);
        }

        .marquee-container::after {
          right: 0;
          background: linear-gradient(to left, #f8fafc 0%, rgba(248, 250, 252, 0) 100%);
        }

        .marquee-track {
          display: flex;
          width: fit-content;
          animation: marquee 35s linear infinite;
        }

        .marquee-track.reverse {
          animation-direction: reverse;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        .company-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 2.5rem;
          margin: 0 1rem;
          background: var(--color-white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          min-width: max-content;
          cursor: default;
        }

        .company-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary-mid);
          transform: translateY(-2px);
        }

        .company-icon {
          font-size: 1.6rem;
          filter: grayscale(100%);
          opacity: 0.7;
          transition: var(--transition);
        }

        .company-card:hover .company-icon {
          filter: grayscale(0%);
          opacity: 1;
        }

        .company-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--color-primary);
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }

        @media (max-width: 768px) {
          .marquee-container::before,
          .marquee-container::after {
            width: 50px;
          }
        }
      `}</style>
    </div>
  );
}
