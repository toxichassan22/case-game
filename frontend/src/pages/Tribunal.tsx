import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useRoomAutoRejoin } from '../hooks/useRoomAutoRejoin';
import { Scale, Check, X, FileText, AlertTriangle } from 'lucide-react';
import type { CaseEvidence, ClosureAttempt } from '../../../runtime/src/types.js';
import './Tribunal.css';

export const Tribunal: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  useRoomAutoRejoin(roomId);
  const mode = useGameStore((s) => s.mode);
  const isSolo = mode === 'solo';
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Optimized selectors to prevent unnecessary re-renders
  const currentRoom = useGameStore((s) => s.currentRoom);
  const tribunalVotes = useGameStore((s) => s.tribunalVotes);
  const closureResult = useGameStore((s) => s.closureResult);
  const tribunalSubmitting = useGameStore((s) => s.tribunalSubmitting);
  const notifications = useGameStore((s) => s.notifications);
  const engineSnapshot = useGameStore((s) => s.engineSnapshot);
  const caseDefinition = useGameStore((s) => s.caseDefinition);

  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [selectedMotive, setSelectedMotive] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);

  const suspects = caseDefinition?.suspects ?? [];
  const verifiedEvidence = useMemo<CaseEvidence[]>(() => {
    if (!engineSnapshot || !caseDefinition?.evidence_list) return [];
    return caseDefinition.evidence_list.filter((e) => {
      const state = engineSnapshot.evidenceStates[e.evidence_id];
      return state === 'verified' || state === 'partial';
    });
  }, [engineSnapshot, caseDefinition]);

  const toggleEvidence = (id: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const attempt: ClosureAttempt = {
      submitted_suspect: selectedSuspect,
      submitted_motive: selectedMotive,
      submitted_method_or_timeline: selectedMethod,
      submitted_evidence_ids: selectedEvidence,
    };

    useGameStore.getState().submitTribunalAccusation(attempt);
  };

  // Listen for closure result in multiplayer
  useEffect(() => {
    if (!isSolo && closureResult) {
      navigate(`/results/${roomId}`);
    }
  }, [closureResult, isSolo, navigate, roomId]);

  const canSubmit = selectedSuspect && selectedMotive && selectedMethod && selectedEvidence.length > 0;
  const isPartiallyComplete = selectedSuspect && selectedMotive && selectedEvidence.length > 0 && !selectedMethod;

  if (!caseDefinition || !engineSnapshot) {
    const errorNotif = notifications.find((n) => n.type === 'error');
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center', maxWidth: '420px' }}>
          <div>جاري تهيئة غرفة المحاكمة...</div>
          {errorNotif && (
            <div style={{
              background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
              padding: '1rem', borderRadius: '8px', color: 'var(--thread-link)',
              display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center',
              width: '100%', fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 700 }}>حدث خطأ أثناء استعادة الجلسة:</div>
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

  const motiveDescriptions = caseDefinition.closure_rules.available_motive_descriptions ?? {};
  const methodDescriptions = caseDefinition.closure_rules.available_method_descriptions ?? {};

  return (
    <div style={{
      width: '100vw', height: '100dvh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        padding: isCompactLayout ? '0.9rem 1rem' : '1rem 1.5rem', background: '#111',
        borderBottom: '1px solid var(--border-window)',
        display: 'flex', justifyContent: 'space-between', alignItems: isCompactLayout ? 'stretch' : 'center',
        flexDirection: isCompactLayout ? 'column' : 'row',
        gap: isCompactLayout ? '0.85rem' : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Scale size={24} color="var(--state-warning)" />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>⚖️ غرفة المحاكمة</h2>
            <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              TRIBUNAL SESSION // AWAITING VOTES
            </div>
          </div>
        </div>
        {!isSolo && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(tribunalVotes).map(([pid, vote]) => {
              const player = currentRoom?.players.find(p => p.playerId === pid);
              return (
                <div key={pid} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.3rem 0.6rem', borderRadius: '6px',
                  background: vote === null ? 'var(--bg-window)' : vote ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)',
                  border: `1px solid ${vote === null ? 'var(--border-window)' : vote ? 'rgba(52,199,89,0.3)' : 'rgba(255,59,48,0.3)'}`,
                  fontSize: '0.75rem',
                }}>
                  {player?.name ?? pid.slice(0, 6)}
                  {vote === true && <Check size={12} color="var(--state-success)" />}
                  {vote === false && <X size={12} color="var(--thread-link)" />}
                  {vote === null && <span style={{ color: 'var(--text-secondary)' }}>⏳</span>}
                </div>
              );
            })}
          </div>
        )}
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: isCompactLayout ? 'column' : 'row' }}>
        {/* Accusation Form */}
        <div style={{ flex: 1, padding: isCompactLayout ? '1rem' : '1.5rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            تقديم الاتهام
          </h3>

          {/* Suspect */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              المشتبه به
            </label>
            <select
              title="اختيار المشتبه به"
              value={selectedSuspect}
              onChange={(e) => setSelectedSuspect(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem', background: 'var(--bg-window)',
                border: '1px solid var(--border-window)', borderRadius: '6px',
                color: 'var(--text-primary)', fontSize: isCompactLayout ? '16px' : '0.9rem',
                fontFamily: 'var(--font-arabic)',
              }}
            >
              <option value="">اختر المشتبه به...</option>
              {suspects.map((s) => (
                <option key={s.character_id} value={s.character_id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Motive */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              الدافع
            </label>
            <select
              title="اختيار الدافع"
              value={selectedMotive}
              onChange={(e) => setSelectedMotive(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem', background: 'var(--bg-window)',
                border: '1px solid var(--border-window)', borderRadius: '6px',
                color: 'var(--text-primary)', fontSize: isCompactLayout ? '16px' : '0.9rem',
                fontFamily: 'var(--font-arabic)',
              }}
            >
              <option value="">اختر الدافع...</option>
              {Object.entries(motiveDescriptions).map(([id, text]) => (
                <option key={id} value={id}>{text}</option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              الطريقة / الفرصة
            </label>
            <select
              title="اختيار الطريقة"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem', background: 'var(--bg-window)',
                border: '1px solid var(--border-window)', borderRadius: '6px',
                color: 'var(--text-primary)', fontSize: isCompactLayout ? '16px' : '0.9rem',
                fontFamily: 'var(--font-arabic)',
              }}
            >
              <option value="">اختر الطريقة...</option>
              {Object.entries(methodDescriptions).map(([id, text]) => (
                <option key={id} value={id}>{text}</option>
              ))}
            </select>
          </div>

          {/* Evidence chips */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              الأدلة الداعمة ({selectedEvidence.length} محددة)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {verifiedEvidence.map((e) => {
                const isSelected = selectedEvidence.includes(e.evidence_id);
                return (
                  <button
                    key={e.evidence_id}
                    onClick={() => toggleEvidence(e.evidence_id)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      background: isSelected ? 'rgba(77,163,255,0.2)' : 'var(--bg-window)',
                      border: `1px solid ${isSelected ? 'var(--interaction-cool)' : 'var(--border-window)'}`,
                      borderRadius: '16px', cursor: 'pointer',
                      color: isSelected ? 'var(--interaction-cool)' : 'var(--text-primary)',
                      fontSize: isCompactLayout ? '0.76rem' : '0.8rem', fontFamily: 'var(--font-arabic)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isSelected && '✓ '}{e.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message for Missing Method */}
          {isPartiallyComplete && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem', 
              background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
              borderRadius: '6px', color: 'var(--thread-link)', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              يرجى تحديد &quot;الطريقة / الفرصة&quot; لإكمال ملف الاتهام.
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || tribunalSubmitting}
            style={{
              width: '100%', marginTop: '2rem', padding: '0.85rem',
              background: canSubmit && !tribunalSubmitting ? 'var(--state-warning)' : 'var(--border-window)',
              border: 'none', borderRadius: '6px',
              color: canSubmit && !tribunalSubmitting ? '#000' : 'var(--text-secondary)',
              fontSize: '1rem', fontWeight: 600,
              fontFamily: 'var(--font-arabic)',
              cursor: canSubmit && !tribunalSubmitting ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {tribunalSubmitting ? 'جارٍ تقديم الاتهام...' : '⚖️ تقديم الاتهام'}
          </button>
        </div>

        {/* Evidence Sidebar */}
        <aside style={{
          width: isCompactLayout ? '100%' : '280px', background: 'var(--bg-window)',
          borderLeft: isCompactLayout ? 'none' : '1px solid var(--border-window)',
          borderTop: isCompactLayout ? '1px solid var(--border-window)' : 'none',
          overflowY: 'auto', padding: '1rem',
          maxHeight: isCompactLayout ? '34vh' : 'none',
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={14} /> الأدلة المتاحة
          </h4>
          {verifiedEvidence.map((e) => (
            <div key={e.evidence_id} style={{
              padding: '0.6rem', marginBottom: '0.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-window)',
              borderRadius: '4px', fontSize: '0.8rem',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{e.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {e.summary?.slice(0, 80)}...
              </div>
              <div className="mono-text" style={{ fontSize: '0.6rem', color: 'var(--interaction-cool)', marginTop: '0.25rem' }}>
                {e.evidence_id}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};
