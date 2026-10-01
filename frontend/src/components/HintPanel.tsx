import React from 'react';
import { useGameStore } from '../stores/gameStore';
import './HintPanel.css';

export const HintPanel: React.FC = () => {
  const phsHintHistory = useGameStore(s => s.phsHintHistory);
  const activePhsHintIndex = useGameStore(s => s.activePhsHintIndex);
  const navigatePhsHint = useGameStore(s => s.navigatePhsHint);
  const requestHint = useGameStore(s => s.requestHint);
  const caseDefinition = useGameStore(s => s.caseDefinition);

  const currentHint = phsHintHistory[activePhsHintIndex] ?? null;
  const totalHints = phsHintHistory.length;
  const isAtLatest = activePhsHintIndex === totalHints - 1;
  const isAtFirst = activePhsHintIndex <= 0;
  const resolvedHintReference = currentHint?.payload.source_ref
    && currentHint.payload.source_ref !== 'generic'
    ? caseDefinition?.evidence_list.find((e) => e.evidence_id === currentHint.payload.source_ref)?.title || currentHint.payload.source_ref
    : null;

  // Hint level descriptions
  const levelDescriptions: Record<string, string> = {
    'L1': 'تلميح عام جداً - توجهك للاتجاه الصحيح',
    'L2': 'تلميح عام - يشير لمنطقة معينة',
    'L3': 'تلميح محدد - يذكر دليلاً معيناً',
    'L4': 'تلميح مباشر - يكشف علاقة مهمة',
    'L5': 'تلميح قوي جداً - يقترب من الحل',
    'L6': 'شبه حل - يكشف جزءاً من الحقيقة',
    'L7+': 'حل كامل - يكشف القصة كاملة',
  };

  if (!caseDefinition) return <div className="p-4">جاري التحميل...</div>;

  return (
    <div className="hint-panel-container">
      <div className="hint-content">
        {currentHint ? (
          <div className="hint-body">
            <div className="hint-level-badge">
              المستوى: {currentHint.level}
              {levelDescriptions[currentHint.level] && (
                <div style={{
                  fontSize: '0.65rem',
                  opacity: 0.8,
                  marginTop: '0.25rem',
                  fontWeight: 400,
                }}>
                  {levelDescriptions[currentHint.level]}
                </div>
              )}
            </div>
            <p className="hint-text">{currentHint.payload.text}</p>
            {resolvedHintReference && (
              <div className="hint-ref">
                مرجع: {resolvedHintReference}
              </div>
            )}
          </div>
        ) : (
          <div className="hint-empty">
            <div className="hint-empty-icon">💡</div>
            <p>هل أنت عالق ميكانيكياً أو سردياً؟</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>اطلب تلميحاً استخباراتياً من المكتب الرئيسي للمتابعة.</p>
          </div>
        )}

        {totalHints > 1 && (
          <div className="hint-nav">
            <button type="button" className="btn hint-nav-btn" disabled={isAtFirst} onClick={() => navigatePhsHint('prev')}>▶</button>
            <span className="hint-nav-counter">{activePhsHintIndex + 1} / {totalHints}</span>
            <button type="button" className="btn hint-nav-btn" disabled={isAtLatest} onClick={() => navigatePhsHint('next')}>◀</button>
          </div>
        )}
      </div>

      <div className="hint-footer">
        <button 
          type="button"
          className="request-hint-btn-large" 
          onClick={() => requestHint()}
        >
          {totalHints > 0 ? (
            <>
              <span style={{ fontSize: '1.1rem' }}>🔍</span> طلب تلميح متقدم جديد
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.1rem' }}>💡</span> طلب تلميح أول (مجاني)
            </>
          )}
        </button>
      </div>
    </div>
  );
};
