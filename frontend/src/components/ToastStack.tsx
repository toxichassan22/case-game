import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ICON_MAP = {
  info: <Info size={16} color="var(--interaction-cool)" />,
  warning: <AlertTriangle size={16} color="var(--state-warning)" />,
  success: <CheckCircle size={16} color="var(--state-success)" />,
  error: <XCircle size={16} color="var(--thread-link)" />,
};

const BG_MAP = {
  info: 'rgba(77,163,255,0.1)',
  warning: 'rgba(245,166,35,0.1)',
  success: 'rgba(52,199,89,0.1)',
  error: 'rgba(255,59,48,0.1)',
};

const BORDER_MAP = {
  info: 'rgba(77,163,255,0.3)',
  warning: 'rgba(245,166,35,0.3)',
  success: 'rgba(52,199,89,0.3)',
  error: 'rgba(255,59,48,0.3)',
};

export const ToastStack: React.FC = () => {
  const notifications = useGameStore((s) => s.notifications);
  const removeNotification = useGameStore((s) => s.removeNotification);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const notif of notifications) {
      const age = Date.now() - notif.timestamp;
      if (age < 5000) {
        timers.push(setTimeout(() => {
          removeNotification(notif.id);
        }, 5000 - age));
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16,
      display: 'flex', flexDirection: 'column',
      gap: '0.5rem', zIndex: 1000,
      maxWidth: '360px',
    }}>
      {notifications.slice(-5).map((notif) => (
        <div key={notif.id} style={{
          background: BG_MAP[notif.type],
          border: `1px solid ${BORDER_MAP[notif.type]}`,
          borderRadius: '8px', padding: '0.75rem 1rem',
          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          animation: 'slideInRight 0.3s ease',
          backdropFilter: 'blur(8px)',
        }}>
          {ICON_MAP[notif.type]}
          <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.4 }}>
            {notif.message}
          </div>
          <button title="إغلاق الإشعار" onClick={() => removeNotification(notif.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: '2px',
          }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
