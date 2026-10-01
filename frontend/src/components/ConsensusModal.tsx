import React from 'react';
import { Lightbulb, FileSearch, X, User, Search, MapPin, FileText } from 'lucide-react';

import './ConsensusModal.css';

interface CaseSolution {
  culprit: string;
  motive: string;
  method: string;
  explanation: string;
}

interface ConsensusModalProps {
  type: 'hint' | 'solution';
  data: string | CaseSolution;
  onClose: () => void;
}

export const ConsensusModal: React.FC<ConsensusModalProps> = ({ type, data, onClose }) => {
  const solutionData = type === 'solution' ? data as CaseSolution : null;
  const hintData = type === 'hint' ? data as string : null;

  return (
    <div className="consensus-overlay">
      <div className="consensus-modal">
        {/* Header */}
        <div className={`consensus-header ${type === 'hint' ? 'hint-mode' : 'solution-mode'}`}>
          <div className="consensus-header-left">
            <div className="consensus-icon-box">
              {type === 'hint' ? <Lightbulb size={28} /> : <FileSearch size={28} />}
            </div>
            <div className="consensus-title">
              <h2>
                {type === 'hint' ? 'تلميحات التحقيق المجمعة' : 'تقرير الحل النهائي للقضية'}
              </h2>
              <p className="consensus-subtitle">
                {type === 'hint' ? 'تلميحات التحقيق // وصول جماعي' : 'نتيجة الإغلاق النهائية // مصنف'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="إغلاق"
            className="consensus-close-btn"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="consensus-content">
          {type === 'hint' ? (
            <div className="solution-grid">
              <div className="hint-text-box">
                {hintData}
              </div>
              <div className="hint-footer-note">
                <Lightbulb size={16} />
                <span>تم الكشف عن هذه التلميحات بعد إجماع فريق المحققين.</span>
              </div>
            </div>
          ) : solutionData && (
            <div className="solution-grid">
              {/* Culprit */}
              <div className="solution-card-primary">
                <div className="card-label red">
                  <User size={20} />
                  <span>الجاني الحقيقي // المتهم الأساسي</span>
                </div>
                <div className="primary-value">
                  {solutionData.culprit}
                </div>
              </div>

              {/* Motive & Method */}
              <div className="solution-row">
                <div className="solution-card-secondary amber-theme">
                  <div className="card-label amber">
                    <Search size={18} />
                    <span>الدافع // المحرك الرئيسي</span>
                  </div>
                  <p className="secondary-value">
                    {solutionData.motive}
                  </p>
                </div>
                <div className="solution-card-secondary blue-theme">
                  <div className="card-label blue">
                    <MapPin size={18} />
                    <span>طريقة التنفيذ // الآلية</span>
                  </div>
                  <p className="secondary-value">
                    {solutionData.method}
                  </p>
                </div>
              </div>

              {/* Explanation */}
                <div className="solution-card-tertiary">
                  <div className="glow-orb"></div>
                  <div className="card-label purple">
                    <FileText size={20} />
                    <span>التفسير والتحليل // قراءة الملف</span>
                  </div>
                  <p className="tertiary-value">
                    {solutionData.explanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="consensus-footer">
          <button onClick={onClose} className="report-close-btn">
            <div className="btn-bg-gradient"></div>
            <div className="btn-shimmer"></div>
            <span className="btn-content">
              <span>إغلاق التقرير</span>
              <span className="btn-sys">SYS.CMD //</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
