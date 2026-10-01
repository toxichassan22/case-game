import React from 'react';
import { Shield, HelpCircle } from 'lucide-react';

interface PsychologicalProfileProps {
  suspectId: string;
  trustLevel: number;
  pressureScore: number;
  state: 'normal' | 'collapsing' | 'lawyer_up';
}

export const PsychologicalProfile: React.FC<PsychologicalProfileProps> = ({
  trustLevel,
  pressureScore,
  state
}) => {
  const getStatusMessage = () => {
    if (state === 'collapsing') return 'المشتبه به يفقد السيطرة وسيكشف الحقائق قريباً.';
    if (state === 'lawyer_up') return 'المشتبه به يتخذ موقفاً هجومياً وسيطلب محامياً.';
    if (pressureScore > 7) return 'الضغط مرتفع جداً؛ المشتبه به على وشك الانهيار.';
    if (trustLevel > 70) return 'الثقة عالية؛ المشتبه به متعاون جداً.';
    return 'المشتبه به في حالة مستقرة حالياً.';
  };

  return (
    <div className="psycho-profile-card" style={{
      background: 'rgba(20, 20, 35, 0.8)',
      border: '1px solid var(--border-window)',
      borderRadius: '12px',
      padding: '1rem',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-arabic)',
      fontSize: '0.85rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)',
      marginTop: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <Shield size={18} color="var(--interaction-cool)" />
        <strong style={{ fontSize: '0.9rem' }}>الملف النفسي الرقمي</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Trust Meter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>منسوب الثقة بالتحقيق</span>
            <span>{trustLevel}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${trustLevel}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #3498db, #2ecc71)',
              transition: 'width 1s ease-in-out'
            }} />
          </div>
        </div>

        {/* Pressure Meter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>مؤشر الضغط النفسي</span>
            <span>{pressureScore}/15</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(pressureScore / 15) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #f1c40f, #e74c3c)',
              transition: 'width 1s ease-in-out'
            }} />
          </div>
        </div>

        {/* Explanation Alert */}
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px', 
          display: 'flex', 
          gap: '0.5rem',
          alignItems: 'flex-start',
          borderLeft: '3px solid var(--interaction-cool)'
        }}>
          <HelpCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>
            {getStatusMessage()}
            <br />
            <em style={{ opacity: 0.8 }}>* الثقة تفتح مسارات حوارية سرية، بينما الضغط الزائد قد ينهي الاستجواب مبكراً.</em>
          </div>
        </div>
      </div>
    </div>
  );
};
