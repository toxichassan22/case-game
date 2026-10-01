import React from 'react';
import { PLAYER_ACTION_TYPE } from '../../../runtime/src/engine/constants.js';
import type { RuntimeSnapshot, RuntimeCaseDefinition, CaseEvidence } from '../../../runtime/src/types.js';
import { formatCaseOrdinal } from '../utils/caseProgress';
import type { ArchivedCaseRecord } from '../stores/gameStore';
import { AudioPlayer } from './AudioPlayer';

interface EvidenceViewerProps {
  winPayload: any;
  engineSnapshot: RuntimeSnapshot | null;
  caseDefinition: RuntimeCaseDefinition | null;
  dispatchAction: (action: any) => void;
  setWindows: React.Dispatch<React.SetStateAction<any[]>>;
  bringWindowToFront: (windows: any[], id: string) => any[];
}

type ArchivedEvidenceWindowPayload = {
  kind: 'archived_evidence';
  evidence: CaseEvidence;
  archiveCase: ArchivedCaseRecord;
};

function isArchivedEvidencePayload(payload: any): payload is ArchivedEvidenceWindowPayload {
  return Boolean(payload && typeof payload === 'object' && 'kind' in payload && payload.kind === 'archived_evidence');
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  winPayload,
  engineSnapshot,
  caseDefinition,
  dispatchAction,
  setWindows,
  bringWindowToFront,
}) => {
  const archivedPayload = isArchivedEvidencePayload(winPayload) ? winPayload : null;
  const evidence = archivedPayload ? archivedPayload.evidence : winPayload as CaseEvidence;
  const [failedMedia, setFailedMedia] = React.useState<Record<string, boolean>>({});
  if (!evidence || !('evidence_id' in evidence)) return <div>جاري التحميل...</div>;

  const contextSnapshot = archivedPayload ? archivedPayload.archiveCase.snapshot : engineSnapshot;
  const contextDefinition = archivedPayload ? archivedPayload.archiveCase.caseDefinition : caseDefinition;
  const contextTags = contextSnapshot?.evidenceTags?.[evidence.evidence_id] ?? (((evidence as unknown) as { tags?: string[] }).tags || []);
  const contextRole = contextSnapshot?.evidenceRoles?.[evidence.evidence_id] ?? evidence.evidence_role;
  const contextSummary = contextSnapshot?.evidenceSummaries?.[evidence.evidence_id] ?? evidence.summary;
  const state = contextSnapshot?.evidenceStates[evidence.evidence_id] || 'locked';
  const actionType = archivedPayload ? undefined : evidence.ui_action;
  
  const reviewDelay = actionType
    ? contextSnapshot?.scheduledEffects.find(
        (effect) => effect.kind === 'review_delay' && effect.target_ref === evidence.evidence_id,
      )
    : undefined;
  
  const dependencies = evidence.depends_on_evidence_ids || [];
  const missingDependencies = dependencies.filter((depId: string) => contextSnapshot?.evidenceStates[depId] !== 'verified');
  const isActionComplete = state === 'verified';
  const isActionDisabled = !actionType || isActionComplete || Boolean(reviewDelay) || state === 'locked' || missingDependencies.length > 0;
  
  const actionLabel = !actionType
    ? 'تمت قراءة الملف'
    : actionType === PLAYER_ACTION_TYPE.INSPECT_OBJECT
      ? 'فحص واعتماد الدليل'
      : evidence.type === 'report'
        ? 'مراجعة واعتماد التقرير'
        : 'مراجعة واعتماد المستند';
  
  let actionHint = reviewDelay?.detail
    || (isActionComplete
      ? 'تم توثيق هذا الدليل بالفعل.'
      : archivedPayload
        ? `هذا الملف مؤرشف من القضية ${formatCaseOrdinal(archivedPayload.archiveCase.caseNumber)} ويُعرض كمرجع فقط.`
      : actionType
        ? 'فتح الملف لا يكفي وحده. استخدم الإجراء التالي لاعتماده داخل التحقيق.'
        : 'هذا الملف استنتاجي أو مشتق وتم توثيقه تلقائياً بمجرد فتحه.');

  if (missingDependencies.length > 0 && !isActionComplete) {
    actionHint = `يجب مراجعة وتوثيق الأدلة السابقة أولاً: ${missingDependencies.join('، ')}`;
  }

  const stateLabels: Record<string, string> = {
    verified: 'مؤكد',
    partial: 'غير مكتمل',
    contested: 'متنازع عليه',
    corrupted: 'تالف',
    locked: 'مغلق',
  };

  const stateColors: Record<string, string> = {
    verified: '#27ae60',
    partial: '#e67e22',
    contested: '#e74c3c',
    corrupted: '#9b59b6',
  };
  
  const stateColor = stateColors[state] || '#999';
  const markMediaFailed = (key: string) => {
    setFailedMedia((previous) => ({ ...previous, [key]: true }));
  };
  const mediaFallback = (label: string, detail: string) => (
    <div style={{
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      background: 'rgba(15, 23, 42, 0.08)',
      border: '1px dashed rgba(148, 163, 184, 0.45)',
      borderRadius: '12px',
      lineHeight: 1.7,
    }}>
      <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>{label}</div>
      <div style={{ fontSize: '0.85rem' }}>{detail}</div>
    </div>
  );

  return (
    <div className="document-viewer-container">
      {/* Corner Stamp */}
      <div className="document-corner-stamp" style={{
        border: `3px double ${stateColor}`,
        color: stateColor,
        padding: '0.2rem 0.6rem',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        borderRadius: '4px',
        textTransform: 'uppercase',
        opacity: 0.85,
        pointerEvents: 'none',
        zIndex: 10
      }}>
        {stateLabels[state]?.split(' / ')[1] || state.toUpperCase()}
      </div>

      <div className="document-header-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="document-header-ministry">وزارة الداخلية</span>
          <span className="mono-text" style={{ fontSize: '0.8rem', opacity: 0.6 }}>CASE ID: {contextDefinition?.case_id}</span>
        </div>
        <div className="document-header-subtitle">قطاع مصلحة الأدلة الجنائية</div>
        <div className="document-ref-badge mono-text">
          DOCUMENT REF: {evidence.evidence_id}
        </div>
      </div>

      <div className="document-content-layout">
        {/* Main body */}
        <div className="document-main-body">
          <h4 className="document-main-title">{evidence.title}</h4>
          {archivedPayload && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.7rem 0.9rem',
              borderRadius: '10px',
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.18)',
              color: '#6b4a00',
              fontSize: '0.85rem',
              lineHeight: 1.6,
            }}>
              ملف مرجعي محفوظ من {archivedPayload.archiveCase.caseTitle}، القضية {formatCaseOrdinal(archivedPayload.archiveCase.caseNumber)}.
            </div>
          )}
          
          {evidence.report_body ? (
            <div className="report-text" style={{ whiteSpace: 'pre-wrap' }}>{evidence.report_body}</div>
          ) : (
            <div className="document-processing-state">
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                📋 مستند قيد المعالجة
              </div>
              <p style={{ margin: 0 }}>{contextSummary || 'لا توجد تفاصيل إضافية متاحة حالياً.'}</p>
            </div>
          )}

          {evidence.image_url && (
            <div className="document-media-box" style={{ marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              {failedMedia.image
                ? mediaFallback('الصورة غير متاحة', 'سيبقى وصف الدليل والنص الرسمي متاحين للاعتماد.')
                : (
                  <img 
                    src={evidence.image_url} 
                    alt={evidence.title} 
                    style={{ width: '100%', display: 'block', cursor: 'zoom-in' }} 
                    onClick={() => window.open(evidence.image_url, '_blank')}
                    onError={() => markMediaFailed('image')}
                  />
                )}
            </div>
          )}

          {evidence.audio_url && (
            <div style={{ marginTop: '1.5rem' }}>
              <AudioPlayer 
                src={evidence.audio_url} 
                title={`تسجيل صوتي - ${evidence.title}`}
                type="evidence"
              />
            </div>
          )}

          {evidence.video_url && (
            <div className="document-media-box" style={{ marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--interaction-cool)' }}>🎥 تسجيل فيديو متاح:</div>
              </div>
              {failedMedia.video
                ? mediaFallback('الفيديو غير متاح', 'يمكن متابعة التحقيق من التقرير المكتوب وبقية الأدلة المرتبطة.')
                : (
                  <video 
                    controls 
                    style={{ width: '100%', display: 'block', background: '#000' }}
                    preload="metadata"
                    playsInline
                    onError={() => markMediaFailed('video')}
                  >
                    <source src={evidence.video_url} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                )}
            </div>
          )}

          {evidence.upgraded_summary && (
            <div className="document-upgrade-box">
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#4da3ff' }}>🔍 استنتاج استقصائي إضافي:</div>
              {evidence.upgraded_summary}
            </div>
          )}
        </div>

        {/* Metadata sidebar */}
        <div className="document-metadata-sidebar">
          <div>
            <div className="document-meta-label">الحالة</div>
            <div className="document-meta-state-badge" style={{
              background: `${stateColor}18`,
              border: `1px solid ${stateColor}33`,
            }}>
              {stateLabels[state]?.split(' / ')[0] || state}
            </div>
          </div>
          <div>
            <div className="document-meta-label">النوع</div>
            <div style={{ color: '#333', textTransform: 'capitalize' }}>{evidence.type}</div>
          </div>
          <div>
            <div className="document-meta-label">الأهمية</div>
            <div style={{ color: evidence.evidence_tier === 'critical' ? '#e74c3c' : '#555', fontWeight: evidence.evidence_tier === 'critical' ? 700 : 400, textTransform: 'capitalize' }}>
              {evidence.evidence_tier}
            </div>
          </div>
          <div>
            <div className="document-meta-label">الدور</div>
            <div style={{ color: '#444', textTransform: 'capitalize' }}>{contextRole}</div>
          </div>
          {contextTags.length > 0 && (
            <div>
              <div className="document-meta-label">وسوم</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {contextTags.slice(0, 6).map((tag: string) => (
                  <span key={tag} className="document-meta-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="document-meta-label">إجراء التحقيق</div>
            <button
              type="button"
              className="btn"
              disabled={isActionDisabled}
              onClick={() => {
                if (actionType === PLAYER_ACTION_TYPE.INSPECT_OBJECT) {
                  dispatchAction({ type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, source_ref: evidence.evidence_id });
                  return;
                }
                if (actionType === PLAYER_ACTION_TYPE.REVIEW_EVIDENCE) {
                  if (evidence.type === 'report') {
                    // Redirect to workbench instead of immediately dispatching
                    setWindows(prev => {
                      const existingWorkbench = prev.find(w => w.type === 'workbench');
                      if (existingWorkbench) {
                        return bringWindowToFront(
                          prev.map(w => w.type === 'workbench' ? { ...w, payload: { selectedEvidenceId: evidence.evidence_id } } : w),
                          existingWorkbench.id
                        );
                      }
                      return [...prev, { id: 'win-workbench', title: 'المختبر', type: 'workbench', payload: { selectedEvidenceId: evidence.evidence_id } }];
                    });
                  } else {
                    dispatchAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: evidence.evidence_id });
                  }
                }
              }}
              style={{
                width: '100%',
                opacity: isActionDisabled ? 0.65 : 1,
                cursor: isActionDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {actionLabel}
            </button>
            <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', lineHeight: 1.5, color: reviewDelay ? 'var(--state-warning)' : '#666' }}>
              {actionHint}
            </div>
          </div>
        </div>
      </div>

      <div className="document-footer-area">
        <div className="mono-text">
          TIER: {evidence.evidence_tier.toUpperCase()}<br />
          ROLE: {evidence.evidence_role.toUpperCase()}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div className="document-seal">
            OFFICIAL SEAL
          </div>
          <span>نظام التحقيق الموحد</span>
        </div>
      </div>
    </div>
  );
};
