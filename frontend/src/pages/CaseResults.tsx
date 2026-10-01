import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useProfileStore } from '../stores/profileStore';
import { useRoomAutoRejoin } from '../hooks/useRoomAutoRejoin';
import { getClosureReasonLabel } from '../utils/closureReasonLabels';
import { Trophy, AlertTriangle, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import './CaseResults.css';

export const CaseResults: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  useRoomAutoRejoin(roomId);

  const currentRoom = useGameStore((s) => s.currentRoom);
  const playerId = useGameStore((s) => s.playerId);
  const closureResult = useGameStore((s) => s.closureResult);
  const requestNextCase = useGameStore((s) => s.requestNextCase);
  const nextCaseLoading = useGameStore((s) => s.nextCaseLoading);
  const updateStats = useProfileStore((s) => s.updateStats);
  const storeSnapshot = useGameStore((s) => s.engineSnapshot);
  const notifications = useGameStore((s) => s.notifications);
  const engineSnapshot = storeSnapshot;

  const lastDecision = closureResult ?? engineSnapshot?.lastClosureDecision;
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const [revealed, setRevealed] = useState(false);
  const autoTransitionRequestedRef = useRef(false);
  const isSolo = currentRoom?.isSolo === true;
  const isHost = currentRoom?.players.find((player) => player.playerId === playerId)?.isHost === true;
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Dramatic reveal effect
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Keep rejected verdicts on screen until the player explicitly returns to the investigation.
    if (currentRoom?.phase === 'investigating' && roomId && (lastDecision?.accepted !== false)) {
      navigate(`/game/${roomId}`);
    }
  }, [currentRoom?.phase, roomId, navigate, lastDecision?.accepted]);

  useEffect(() => {
    if (!revealed || !lastDecision?.accepted || !isSolo || !roomId) {
      return;
    }
    if (currentRoom?.phase !== 'results' || nextCaseLoading || autoTransitionRequestedRef.current) {
      return;
    }

    autoTransitionRequestedRef.current = true;
    const timer = setTimeout(() => {
      requestNextCase();
    }, 1200);

    return () => clearTimeout(timer);
  }, [revealed, lastDecision?.accepted, isSolo, roomId, currentRoom?.phase, nextCaseLoading, requestNextCase]);

  // Update player stats
  useEffect(() => {
    if (lastDecision && revealed && engineSnapshot) {
      const won = lastDecision.accepted && lastDecision.mode === 'true_success';
      const resultKey = `${roomId ?? 'unknown-room'}:${engineSnapshot.case_id || 'case01'}`;
      updateStats(won, resultKey);
    }
  }, [revealed, updateStats, lastDecision, engineSnapshot, roomId]);

  const getResultConfig = () => {
    if (!lastDecision) return {
      color: '#666', bg: 'rgba(100,100,100,0.1)', borderColor: 'rgba(100,100,100,0.3)',
      icon: <AlertTriangle size={48} />, title: 'نتيجة غير متوفرة',
      subtitle: 'لم يتم العثور على نتيجة إغلاق مرتبطة بهذه الجلسة.',
      statusText: 'نتيجة غير متاحة',
    };

    if (lastDecision.accepted && lastDecision.mode === 'true_success') {
      return {
        color: 'var(--state-success)', bg: 'rgba(52,199,89,0.1)', borderColor: 'rgba(52,199,89,0.3)',
        icon: <Trophy size={48} color="var(--state-success)" />,
        title: 'القضية أُغلقت بنجاح! ✓',
        subtitle: 'تم تحديد الجاني والدافع والأدلة بشكل صحيح',
        statusText: 'إغلاق ناجح',
      };
    }

    if (lastDecision.accepted && lastDecision.mode === 'false_success') {
      return {
        color: 'var(--state-warning)', bg: 'rgba(245,166,35,0.1)', borderColor: 'rgba(245,166,35,0.3)',
        icon: <AlertTriangle size={48} color="var(--state-warning)" />,
        title: 'القضية أُغلقت جزئيًا',
        subtitle: 'تم إغلاق القضية لكن بعض التفاصيل لم تكن دقيقة',
        statusText: 'إغلاق جزئي',
      };
    }

    return {
      color: 'var(--thread-link)', bg: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.3)',
      icon: <XCircle size={48} color="var(--thread-link)" />,
      title: 'الاتهام مرفوض',
      subtitle: 'الأدلة المقدمة غير كافية لإغلاق القضية',
      statusText: 'اتهام مرفوض',
    };
  };

  const config = getResultConfig();
  const isRejected = lastDecision && !lastDecision.accepted;

  // Case-authored closing text: most specific key first, then the mode fallback.
  // A case that convicts an innocent states his innocence here — truth is a
  // player right, never gated behind interrogation skill.
  const outcomeText = (() => {
    if (!lastDecision) return null;
    const texts = caseDefinition?.closure_rules?.outcome_text;
    if (!texts) return null;
    const accused = lastDecision.submitted_suspect;
    if (accused) {
      const specific = texts[`${lastDecision.mode}:${accused}`];
      if (specific) return specific;
    }
    return texts[`${lastDecision.mode}:*`] ?? null;
  })();

  if (!currentRoom || !engineSnapshot) {
    const errorNotif = notifications.find((n) => n.type === 'error');
    return (
      <div style={{
        width: '100vw', height: '100dvh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', color: '#fff',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center', maxWidth: '420px' }}>
          <div>جارٍ استعادة شاشة النتائج...</div>
          {errorNotif && (
            <div style={{
              background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
              padding: '1rem', borderRadius: '8px', color: 'var(--thread-link)',
              display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center',
              width: '100%', fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 700 }}>تعذر استعادة نتيجة هذه الغرفة:</div>
              <div>{errorNotif.message}</div>
              <button className="btn" onClick={() => navigate('/lobby')} style={{ padding: '0.45rem 1rem', background: 'var(--thread-link)', color: '#fff', border: 'none' }}>
                العودة للوبي
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw', height: '100dvh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflowY: 'auto', overflowX: 'hidden',
      padding: isCompactLayout ? '1rem 0.9rem 1.4rem' : '2rem',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isCompactLayout ? '380px' : '600px', height: isCompactLayout ? '380px' : '600px',
        background: `radial-gradient(circle, ${config.bg} 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: revealed ? 1 : 0,
        transition: 'opacity 1.5s ease',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', maxWidth: '560px', width: '100%',
        background: isCompactLayout ? 'rgba(24,24,24,0.82)' : 'transparent',
        border: isCompactLayout ? '1px solid rgba(255,255,255,0.08)' : 'none',
        borderRadius: isCompactLayout ? '16px' : '0',
        padding: isCompactLayout ? '1.25rem 1rem 1rem' : 0,
        boxShadow: isCompactLayout ? '0 18px 36px rgba(0,0,0,0.35)' : 'none',
        backdropFilter: isCompactLayout ? 'blur(10px)' : 'none',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease 0.5s',
      }}>
        {/* Icon */}
        <div style={{ marginBottom: '1.5rem' }}>{config.icon}</div>

        {/* Status */}
        <div className="mono-text" style={{
          fontSize: isCompactLayout ? '0.64rem' : '0.7rem', color: config.color,
          marginBottom: '1rem', letterSpacing: '0.15em',
        }}>
          {config.statusText}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: isCompactLayout ? '1.38rem' : '1.8rem', fontWeight: 700, marginBottom: '0.75rem',
          color: config.color,
          lineHeight: 1.35,
        }}>
          {config.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: isCompactLayout ? '0.9rem' : '1rem', color: 'var(--text-secondary)',
          marginBottom: isCompactLayout ? '1.35rem' : '2rem', lineHeight: 1.6,
        }}>
          {config.subtitle}
        </p>

        {/* Case-authored closing text */}
        {outcomeText && (
          <div style={{
            background: config.bg,
            border: `1px solid ${config.borderColor}`,
            borderRadius: '8px',
            padding: isCompactLayout ? '0.9rem' : '1.1rem',
            marginBottom: isCompactLayout ? '1.35rem' : '2rem',
            textAlign: 'right',
            fontSize: isCompactLayout ? '0.88rem' : '0.95rem',
            lineHeight: 1.75,
            color: 'var(--text-primary)',
          }}>
            {outcomeText}
          </div>
        )}

        {/* Granted Flags */}
        {(lastDecision?.granted_flags?.length ?? 0) > 0 && (
          <div style={{
            background: config.bg,
            border: `1px solid ${config.borderColor}`,
            borderRadius: '8px', padding: isCompactLayout ? '0.85rem' : '1rem', marginBottom: '1.5rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              العلامات المكتسبة:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'flex-end' }}>
              {lastDecision?.granted_flags?.map((flag: string) => (
                <span key={flag} className="mono-text" style={{
                  fontSize: isCompactLayout ? '0.66rem' : '0.7rem', padding: '0.2rem 0.5rem',
                  background: 'var(--bg-primary)', borderRadius: '4px',
                  border: '1px solid var(--border-window)',
                }}>
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reason codes */}
        {(lastDecision?.reason_codes?.length ?? 0) > 0 && (
          <div style={{
            background: 'var(--bg-window)',
            border: '1px solid var(--border-window)',
            borderRadius: '8px', padding: isCompactLayout ? '0.85rem' : '1rem', marginBottom: '1.5rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              التفاصيل:
            </div>
            {lastDecision?.reason_codes?.map((code: string, i: number) => (
              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                • {getClosureReasonLabel(code)}
              </div>
            ))}
          </div>
        )}

        {isSolo && lastDecision?.accepted && (
          <div style={{
            marginTop: '-0.35rem',
            marginBottom: '1rem',
            fontSize: isCompactLayout ? '0.78rem' : '0.82rem',
            color: 'var(--text-secondary)',
          }}>
            {nextCaseLoading ? 'جارٍ تجهيز القضية التالية...' : 'سيتم نقلك تلقائيًا إلى القضية التالية خلال لحظات.'}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.85rem',
          justifyContent: 'center',
          marginTop: isCompactLayout ? '1.2rem' : '2rem',
          flexDirection: isCompactLayout ? 'column' : 'row',
        }}>
          {isRejected ? (
            <button className="btn" onClick={() => {
              useGameStore.setState({ closureResult: null });
              navigate(`/game/${roomId}`);
            }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', width: isCompactLayout ? '100%' : 'auto' }}>
              <RotateCcw size={16} /> العودة للتحقيق
            </button>
          ) : (
            <>
              <button className="btn" onClick={() => navigate('/lobby')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', width: isCompactLayout ? '100%' : 'auto' }}>
                <ArrowLeft size={16} /> خروج للـ Lobby
              </button>
              {!isSolo && isHost && (
                <button className="btn" onClick={() => {
                  requestNextCase();
                }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--interaction-cool)', color: '#fff',
                    border: '1px solid var(--interaction-cool)',
                    opacity: nextCaseLoading ? 0.7 : 1,
                    pointerEvents: nextCaseLoading ? 'none' : 'auto',
                    width: isCompactLayout ? '100%' : 'auto',
                  }}>
                  {nextCaseLoading ? 'جاري التحميل...' : 'القضية التالية ←'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {(!revealed) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-primary)',
          zIndex: 100,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              PROCESSING VERDICT...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
