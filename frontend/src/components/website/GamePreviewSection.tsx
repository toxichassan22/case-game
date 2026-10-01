import React from 'react';

export const GamePreviewSection: React.FC = () => {
  return (
    <section className="ws-preview ws-section" id="preview">
      <div className="ws-container">
        <div className="ws-preview-header">
          <h2 className="ws-section-title">غرفة التحقيق الرقمية</h2>
          <p className="ws-section-subtitle" style={{ margin: '0 auto' }}>
            نظام شرطي حقيقي. نوافذ متعددة. أدلة قابلة للسحب والربط. كل أداة في مكانها.
          </p>
        </div>
        
        {/* UI Mockup */}
        <div className="ws-mockup-container ws-animate-on-scroll">
          {/* OS Title bar */}
          <div className="ws-mockup-titlebar">
            <div className="ws-mockup-dot" />
            <div className="ws-mockup-dot" />
            <div className="ws-mockup-dot" />
            <span className="ws-mockup-title-text">Investigation Terminal v1.0.4 — SECURE SESSION</span>
          </div>
          
          {/* Simulated app body */}
          <div className="ws-mockup-body">
            {/* Sidebar - Evidence bag */}
            <div className="ws-mock-sidebar">
              <div className="ws-mock-sidebar-title">
                📦 حقيبة الأدلة
              </div>
              <div className="ws-mock-evidence">
                <span className="ws-mock-evidence-id">EVID-03-01</span>
                <span className="ws-mock-evidence-name">تقرير الطب الشرعي</span>
              </div>
              <div className="ws-mock-evidence">
                <span className="ws-mock-evidence-id">EVID-03-02</span>
                <span className="ws-mock-evidence-name">سجل المكالمات</span>
              </div>
              <div className="ws-mock-evidence">
                <span className="ws-mock-evidence-id">EVID-03-03</span>
                <span className="ws-mock-evidence-name">كاميرا المراقبة</span>
              </div>
              <div className="ws-mock-evidence" style={{ borderColor: 'var(--ws-accent-gold)', opacity: 0.5 }}>
                <span className="ws-mock-evidence-id">EVID-03-04</span>
                <span className="ws-mock-evidence-name" style={{ color: 'var(--ws-text-muted)' }}>🔒 ملف مشفر</span>
              </div>
            </div>
            
            {/* Main area with windows */}
            <div className="ws-mock-main">
              <div className="ws-mock-window">
                <div className="ws-mock-window-header">
                  <span className="ws-mock-window-title">تقرير الطب الشرعي — القضية ٠٣</span>
                  <div className="ws-mock-window-btns">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="ws-mock-window-body">
                  <div style={{ marginBottom: '0.75rem', color: 'var(--ws-text-hero)' }}>
                    نتائج الفحص المبدئي:
                  </div>
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(77, 163, 255, 0.05)', 
                    border: '1px solid rgba(77, 163, 255, 0.1)', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    lineHeight: 2
                  }}>
                    • سبب الوفاة: صدمة حادة في الجمجمة
                    <br />
                    • وقت الوفاة المقدر: بين ١١:٠٠ م و ١:٠٠ ص
                    <br />
                    • آثار مقاومة: لا توجد علامات واضحة
                    <br />
                    • <span style={{ color: 'var(--ws-accent-gold)' }}>⚠ ملاحظة: عينة دم غير مطابقة للضحية</span>
                  </div>
                  <div style={{ 
                    marginTop: '0.75rem', 
                    fontFamily: "'Fira Code', monospace", 
                    fontSize: '0.65rem', 
                    color: 'var(--ws-text-muted)',
                    direction: 'ltr' as const
                  }}>
                    TIER: T2 | ROLE: DIRECT | STATUS: PARTIAL
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mock Taskbar */}
          <div className="ws-mock-taskbar">
            <div className="ws-mock-taskbar-btns">
              <span className="ws-mock-taskbar-btn">📨 الانبوكس</span>
              <span className="ws-mock-taskbar-btn">🔗 لوحة الخيوط</span>
              <span className="ws-mock-taskbar-btn">🗄 قاعدة البيانات</span>
            </div>
            <div className="ws-mock-trust">
              <span>الثقة:</span>
              <div className="ws-mock-trust-bar">
                <div className="ws-mock-trust-fill" />
              </div>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.65rem', direction: 'ltr' as const }}>SYS.ONLINE</span>
            </div>
          </div>
        </div>
        
        <div className="ws-preview-overlay">
          <p className="ws-preview-overlay-text">
            هل تقدر تكشف الحقيقة؟
          </p>
        </div>
      </div>
    </section>
  );
};
