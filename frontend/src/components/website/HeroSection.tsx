import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../stores/profileStore';

// Penrose Triangle SVG Component
const PenroseTriangle: React.FC = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    {/* Penrose Triangle - Impossible Triangle */}
    <defs>
      <linearGradient id="triGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4da3ff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#4da3ff" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="triGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ff3b30" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="triGrad3" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#f5a623" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#f5a623" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    
    {/* Three sides of the Penrose triangle */}
    <polygon 
      points="100,20 170,140 140,140 100,70 60,140 30,140" 
      fill="url(#triGrad1)" 
      className="ws-penrose-fill"
    />
    <polygon 
      points="30,140 60,140 100,70 100,20 65,85 30,140" 
      fill="url(#triGrad2)" 
      className="ws-penrose-fill"
    />
    <polygon 
      points="170,140 140,140 100,70 135,85 170,140" 
      fill="url(#triGrad3)" 
      className="ws-penrose-fill"
    />
    
    {/* Outline strokes */}
    <path 
      d="M100,20 L170,140 H30 Z" 
      className="ws-penrose-path"
      strokeLinejoin="round"
    />
    <path 
      d="M100,55 L140,128 H60 Z" 
      fill="none"
      stroke="rgba(77, 163, 255, 0.2)"
      strokeWidth="1"
      strokeDasharray="300"
      style={{ animation: 'ws-triangle-draw 3s ease 0.5s forwards', strokeDashoffset: 300 }}
    />
  </svg>
);

// Typing effect hook
function useTypingEffect(text: string, speed: number = 80, delay: number = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  
  return { displayed, done };
}

export const HeroSection: React.FC<{ onPlay?: () => void }> = ({ onPlay }) => {
  const { displayed, done } = useTypingEffect('نظام التحقيق الموحد', 100, 800);
  const navigate = useNavigate();
  const hasProfile = useProfileStore(s => s.hasProfile());

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      navigate(hasProfile ? '/lobby' : '/profile');
    }
  };
  
  return (
    <section className="ws-hero" id="hero">
      {/* Backgrounds */}
      <div className="ws-hero-grid" />
      <div className="ws-hero-scanline" />
      <div className="ws-hero-glow" />
      
      {/* Content */}
      <div className="ws-hero-content">
        <div className="ws-penrose-container">
          <PenroseTriangle />
        </div>
        
        <h1 className="ws-hero-title">
          {displayed}
          {!done && <span className="ws-typing-cursor" />}
        </h1>
        
        <p className="ws-hero-tagline">
          ٥٩ قضية. ٣ تخصصات. حقيقة واحدة مخفية.
          <br />
          هل تقدر تكشف الحقيقة قبل ما الحقيقة تكشفك؟
        </p>
        
        <button className="ws-cta-btn" onClick={handlePlay}>
          {hasProfile ? 'دخول النظام' : 'تأسيس هوية'}
          <span style={{ fontSize: '1.3rem' }}>←</span>
        </button>
      </div>
      
      {/* Scroll indicator */}
      <div className="ws-scroll-indicator">
        <span>SCROLL</span>
        <div className="ws-scroll-arrow" />
      </div>
    </section>
  );
};
