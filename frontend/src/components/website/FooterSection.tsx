import React from 'react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="ws-footer" id="footer">
      {/* Small Penrose icon */}
      <div className="ws-footer-logo">
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', opacity: 0.4 }}>
          <path 
            d="M100,20 L170,140 H30 Z" 
            fill="none" 
            stroke="var(--ws-accent-blue)" 
            strokeWidth="2" 
          />
        </svg>
      </div>
      
      <p className="ws-footer-text">
        نظام التحقيق الموحد — لعبة تحقيق سردية تفاعلية
        <br />
        ٥٩ قضية. ٣ مسارات. نهايات متعددة.
      </p>
      
      <div className="ws-footer-links">
        <a href="#hero" className="ws-footer-link">الرئيسية</a>
        <a href="#features" className="ws-footer-link">التخصصات</a>
        <a href="#story" className="ws-footer-link">القصة</a>
        <a href="#preview" className="ws-footer-link">الواجهة</a>
      </div>

      <div className="ws-footer-divider" />
      
      <p className="ws-footer-copy">
        © 2026 Investigation Terminal — All Rights Reserved
      </p>
    </footer>
  );
};
