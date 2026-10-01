import React, { useState, useEffect } from 'react';

interface ShadowMessageProps {
  message: string;
  onDismiss: () => void;
}

export const ShadowMessage: React.FC<ShadowMessageProps> = ({ message, onDismiss }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);

  // Fade in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Typing effect
  useEffect(() => {
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < message.length) {
          setDisplayed(message.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setDone(true);
        }
      }, 60);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(delay);
  }, [message]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: '2rem',
      opacity: visible ? 1 : 0,
      transition: 'opacity 2s ease',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Message */}
      <div style={{
        maxWidth: '600px', textAlign: 'center',
        position: 'relative',
      }}>
        <div className="mono-text" style={{
          fontSize: '0.65rem', color: 'rgba(255,59,48,0.5)',
          marginBottom: '2rem', letterSpacing: '0.2em',
        }}>
          INCOMING TRANSMISSION // ENCRYPTED
        </div>

        <p style={{
          fontSize: '1.2rem', lineHeight: 2,
          color: 'rgba(243,243,243,0.9)',
          fontWeight: 300,
          minHeight: '120px',
        }}>
          {displayed}
          {!done && (
            <span style={{
              display: 'inline-block', width: '2px', height: '1.2em',
              background: 'var(--thread-link)', marginRight: '4px',
              verticalAlign: 'text-bottom',
              animation: 'blink 0.8s step-end infinite',
            }} />
          )}
        </p>

        {done && (
          <button
            onClick={onDismiss}
            style={{
              marginTop: '2rem', padding: '0.75rem 2rem',
              background: 'transparent',
              border: '1px solid rgba(255,59,48,0.4)',
              borderRadius: '4px', color: 'var(--thread-link)',
              fontSize: '0.9rem', fontFamily: 'var(--font-arabic)',
              cursor: 'pointer', transition: 'all 0.3s',
              opacity: 0,
              animation: 'fadeIn 1s ease 0.5s forwards',
            }}
          >
            متابعة ←
          </button>
        )}
      </div>
    </div>
  );
};

