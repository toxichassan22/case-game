import React, { useEffect, useRef } from 'react';
import '../styles/website.css';
import { HeroSection } from '../components/website/HeroSection';
import { FeaturesSection } from '../components/website/FeaturesSection';
import { StorySection } from '../components/website/StorySection';
import { GamePreviewSection } from '../components/website/GamePreviewSection';
import { FooterSection } from '../components/website/FooterSection';

interface WebsiteProps {
  onEnterGame?: () => void;
}

export const Website: React.FC<WebsiteProps> = ({ onEnterGame }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ws-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = rootRef.current?.querySelectorAll('.ws-animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="website-root" ref={rootRef}>
      <HeroSection onPlay={onEnterGame} />

      {/* Stats Bar */}
      <section className="ws-stats">
        <div className="ws-stats-grid">
          <div className="ws-stat-item">
            <div className="ws-stat-number">22/59</div>
            <div className="ws-stat-label">منفذة / مخططة</div>
          </div>
          <div className="ws-stat-item">
            <div className="ws-stat-number">3</div>
            <div className="ws-stat-label">تخصصات تحقيق</div>
          </div>
          <div className="ws-stat-item">
            <div className="ws-stat-number">∞</div>
            <div className="ws-stat-label">مسارات محتملة</div>
          </div>
          <div className="ws-stat-item">
            <div className="ws-stat-number">1</div>
            <div className="ws-stat-label">حقيقة مخفية</div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <StorySection />
      <GamePreviewSection />
      <FooterSection />
    </div>
  );
};
