import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConsensusModal.css';

interface ConfirmationModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div className="consensus-overlay" style={{ zIndex: 1000 }}>
      <div className="consensus-modal" style={{ maxWidth: '450px', width: '100%' }}>
        {/* Header */}
        <div className={`consensus-header`} style={{ background: type === 'danger' ? 'rgba(255, 59, 48, 0.15)' : 'rgba(245, 166, 35, 0.15)' }}>
          <div className="consensus-header-left">
            <div className="consensus-icon-box" style={{ background: type === 'danger' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(245, 166, 35, 0.2)' }}>
              <AlertTriangle size={24} color={type === 'danger' ? '#ff3b30' : '#f5a623'} />
            </div>
            <div className="consensus-title">
              <h2 style={{ fontSize: '1.1rem', color: type === 'danger' ? '#ff3b30' : '#f5a623' }}>{title}</h2>
              <p className="consensus-subtitle" style={{ fontSize: '0.65rem' }}>
                SYS.REQ // تأكيد مطلوب من المستخدم
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onCancel}
            title="إغلاق"
            className="consensus-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="consensus-content" style={{
          padding: isCompactLayout ? '1rem' : '1.5rem',
          textAlign: 'right',
          fontSize: isCompactLayout ? '0.88rem' : '0.9rem',
          lineHeight: 1.7
        }}>
          {message}
        </div>

        {/* Footer */}
        <div className="consensus-footer" style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          flexDirection: isCompactLayout ? 'column-reverse' : 'row',
          padding: isCompactLayout ? '1rem' : '1rem 1.5rem',
          background: 'rgba(0,0,0,0.5)'
        }}>
          <button 
            type="button"
            onClick={onCancel} 
            className="btn"
            style={{
              padding: '0.7rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              width: isCompactLayout ? '100%' : 'auto'
            }}
          >
            {cancelLabel}
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="btn"
            style={{ 
              padding: '0.5rem 1.5rem', 
              background: type === 'danger' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(245, 166, 35, 0.2)', 
              color: type === 'danger' ? '#ff3b30' : '#f5a623', 
              border: `1px solid ${type === 'danger' ? 'rgba(255, 59, 48, 0.4)' : 'rgba(245, 166, 35, 0.4)'}`,
              fontWeight: 'bold',
              width: isCompactLayout ? '100%' : 'auto'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
