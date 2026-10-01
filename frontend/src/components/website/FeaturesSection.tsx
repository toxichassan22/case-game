import React from 'react';
import { Clock, FlaskConical, Brain, ShieldAlert } from 'lucide-react';

const features = [
  {
    icon: <Clock size={24} />,
    title: 'المسار الزمني',
    desc: 'حلل الجداول الزمنية، اكشف الثغرات في الأوقات، وأعد بناء تسلسل الأحداث لحظة بلحظة. كل ثانية ممكن تغير كل حاجة.',
    tag: 'TIMELINE ANALYSIS',
    accent: 'gold' as const,
  },
  {
    icon: <FlaskConical size={24} />,
    title: 'المسار الجنائي',
    desc: 'افحص مسارح الجريمة، حلل العينات، واستخدم الأدوات الجنائية لكشف أدلة مادية لا تكذب. الحقيقة مستنية في التفاصيل.',
    tag: 'FORENSIC SCIENCE',
    accent: 'green' as const,
  },
  {
    icon: <Brain size={24} />,
    title: 'المسار السلوكي',
    desc: 'ادرس النفسيات، اكشف الكذب في الاستجوابات، وافهم الدوافع الخفية. مش كل اعتراف حقيقي، ومش كل بريء فعلاً بريء.',
    tag: 'BEHAVIORAL PROFILING',
    accent: 'red' as const,
  },
  {
    icon: <ShieldAlert size={24} />,
    title: 'مستوى الثقة',
    desc: 'قراراتك تأثر على ثقة الجهات فيك. الثقة العالية تفتح لك أبواب وأدلة جديدة، وانعدامها قد يغلق القضية في وجهك.',
    tag: 'PUBLIC TRUST',
    accent: 'blue' as const,
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="ws-features ws-section" id="features">
      <div className="ws-container">
        <div className="ws-features-header">
          <h2 className="ws-section-title">أنظمة التحقيق المتقدمة</h2>
          <p className="ws-section-subtitle" style={{ margin: '0 auto' }}>
            كل قضية ممكن تتحل بأكتر من طريقة. اختيارك هيحدد مين أنت... ومستوى الثقة هيحدد مين هيساعدك.
          </p>
        </div>
        
        <div className="ws-features-grid">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="ws-feature-card ws-animate-on-scroll" 
              data-accent={f.accent}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="ws-feature-icon">{f.icon}</div>
              <h3 className="ws-feature-title">{f.title}</h3>
              <p className="ws-feature-desc">{f.desc}</p>
              <span className="ws-feature-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
