import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../stores/profileStore';
import { FileText, Fingerprint, Camera, Mic } from 'lucide-react';

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

const dossierItems = [
  { icon: FileText, id: 'DB-01', name: 'سجل الجرد الليلي', state: 'مستند' },
  { icon: Fingerprint, id: 'SCN-03', name: 'تقرير مسرح الجريمة', state: 'جنائي' },
  { icon: Camera, id: 'DIG-01', name: 'كاميرا المخزن المقابلة', state: 'رقمي' },
  { icon: Mic, id: 'INT-02', name: 'تسجيل استجواب الشاهد', state: 'صوتي' },
];

export const HeroSection: React.FC<{ onPlay?: () => void }> = ({ onPlay }) => {
  const { displayed, done } = useTypingEffect('نظام التحقيق الموحد', 90, 600);
  const navigate = useNavigate();
  const hasProfile = useProfileStore(s => s.hasProfile());

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      void navigate(hasProfile ? '/lobby' : '/profile');
    }
  };

  return (
    <section className="ws-hero" id="hero">
      <div className="ws-hero-grid" />
      <div className="ws-hero-scanline" />
      <div className="ws-hero-vignette" />

      <div className="ws-hero-layout">
        {/* Copy side */}
        <div className="ws-hero-content">
          <div className="ws-hero-kicker">
            <span className="ws-hero-kicker-dot" />
            وزارة الداخلية — منظومة التحقيق المركزية
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

          <div className="ws-hero-actions">
            <button className="ws-cta-btn" onClick={handlePlay}>
              {hasProfile ? 'دخول النظام' : 'تأسيس هوية'}
              <span className="ws-cta-arrow">←</span>
            </button>
            <a href="#features" className="ws-ghost-btn">استكشف الأنظمة</a>
          </div>

          <div className="ws-hero-status">
            SYS.STATUS: ONLINE&nbsp;&nbsp;|&nbsp;&nbsp;CLEARANCE: PUBLIC&nbsp;&nbsp;|&nbsp;&nbsp;BUILD 1.0.4
          </div>
        </div>

        {/* Dossier visual side */}
        <div className="ws-dossier-wrap" aria-hidden="true">
          <div className="ws-dossier">
            <div className="ws-dossier-tab">CASE FILE</div>
            <div className="ws-dossier-head">
              <div>
                <div className="ws-dossier-case">القضية ٠١</div>
                <div className="ws-dossier-name">رماد الرصيف الأخير</div>
              </div>
              <div className="ws-dossier-stamp">سري للغاية</div>
            </div>
            <div className="ws-dossier-list">
              {dossierItems.map((item) => (
                <div className="ws-dossier-item" key={item.id}>
                  <span className="ws-dossier-item-icon"><item.icon size={15} /></span>
                  <span className="ws-dossier-item-name">{item.name}</span>
                  <span className="ws-dossier-item-id">{item.id}</span>
                  <span className="ws-dossier-item-state">{item.state}</span>
                </div>
              ))}
            </div>
            <div className="ws-dossier-foot">
              <span>٢٠ ملف مرفق</span>
              <span className="ws-dossier-thread" />
              <span>THREAD: ACTIVE</span>
            </div>
          </div>
          <div className="ws-dossier-string" />
        </div>
      </div>

      <div className="ws-scroll-indicator">
        <span>SCROLL</span>
        <div className="ws-scroll-arrow" />
      </div>
    </section>
  );
};
