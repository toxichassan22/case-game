import React from 'react';

const trinityMembers = [
  {
    icon: '⏱',
    name: 'صانع الساعات',
    role: 'THE CLOCKMAKER',
  },
  {
    icon: '⚗️',
    name: 'الخيميائي',
    role: 'THE ALCHEMIST',
  },
  {
    icon: '🎭',
    name: 'المُلقّن',
    role: 'THE WHISPERER',
  },
];

export const StorySection: React.FC = () => {
  return (
    <section className="ws-story ws-section" id="story">
      <div className="ws-story-ambient" />
      
      <div className="ws-container ws-story-content">
        
        <h2 className="ws-story-title">
          ٣ عقول صنعوا{' '}
          <span className="ws-glitch" data-text="الثالوث">الثالوث</span>
          <br />
          وقرروا يكتبوا الواقع من الصفر
        </h2>
        
        <div className="ws-story-quote">
          الطريقة الوحيدة للسيطرة على الجريمة هي أن تكون أنت من يصنعها ويوجهها.
          <br />
          كل قضية حليتها كانت اختبار... والاختبار الأخير هو إنت.
        </div>
        
        <div className="ws-trinity-grid">
          {trinityMembers.map((m, i) => (
            <div 
              key={i} 
              className="ws-trinity-card ws-animate-on-scroll"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <span className="ws-trinity-icon">{m.icon}</span>
              <div className="ws-trinity-name">{m.name}</div>
              <div className="ws-trinity-role">{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
