import React from 'react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4 py-12">
      <div className="relative w-64 h-64 mb-8">
        <img
          src="/404.png"
          alt="Page Not Found Mascot"
          className="relative z-10 w-full h-full object-contain drop-shadow-2xl animate-bounce-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB3C1] via-[#B3D9FF] to-[#E8D4FF] rounded-full blur-2xl opacity-60 scale-110 animate-pulse delay-300"></div>
      </div>
      <h1
        className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-4"
        style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: '1.2', fontWeight: 700 }}
      >
        404 - Page Not Found
      </h1>
      <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-8 max-w-md" style={{ fontSize: '16px' }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Button variant="primary" onClick={handleGoHome}>
        Go to Homepage
      </Button>
    </div>
  );
}