import React from 'react';
import { useGameStore, type ArchivedCaseRecord } from '../stores/gameStore';
import { Archive, FileText, Folder, Search } from 'lucide-react';
import type { CaseEvidence } from '../../../runtime/src/types.js';
import { formatCaseOrdinal, parseCaseNumber } from '../utils/caseProgress';

interface CaseFilesExplorerProps {
  onOpenWindow: (id: string) => void;
  onOpenArchivedEvidence: (archiveCaseId: string, evidenceId: string) => void;
}

type ExplorerView = 'current' | 'archive';

const stateLabels: Record<string, { label: string; color: string }> = {
  verified: { label: 'موثق', color: '#27ae60' },
  partial: { label: 'جزئي', color: '#e67e22' },
  contested: { label: 'متنازع', color: '#e74c3c' },
  corrupted: { label: 'تالف', color: '#9b59b6' },
};

const decisionLabels: Record<string, { label: string; color: string }> = {
  true_success: { label: 'محلولة', color: '#27ae60' },
  false_success: { label: 'محلولة جزئيًا', color: '#f59e0b' },
  rejected: { label: 'مرفوضة', color: '#ef4444' },
};

function filterEvidenceList(evidenceList: CaseEvidence[], evidenceStates: Record<string, string> | undefined, searchQuery: string): CaseEvidence[] {
  return evidenceList
    .filter((evidence) => evidenceStates?.[evidence.evidence_id] !== 'locked')
    .filter((evidence) =>
      evidence.title.toLowerCase().includes(searchQuery.toLowerCase())
      || evidence.evidence_id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
}

export const CaseFilesExplorer: React.FC<CaseFilesExplorerProps> = ({
  onOpenWindow,
  onOpenArchivedEvidence,
}) => {
  const snapshot = useGameStore((s) => s.engineSnapshot);
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const caseArchive = useGameStore((s) => s.caseArchive);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeView, setActiveView] = React.useState<ExplorerView>('current');
  const [selectedArchiveCaseId, setSelectedArchiveCaseId] = React.useState<string | null>(null);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isNarrowLayout = typeof window !== 'undefined' && window.innerWidth <= 1024;

  const archivedCases = React.useMemo(
    () => [...caseArchive].sort((left, right) => {
      const leftNumber = left.caseNumber ?? Number.MAX_SAFE_INTEGER;
      const rightNumber = right.caseNumber ?? Number.MAX_SAFE_INTEGER;
      return leftNumber - rightNumber;
    }),
    [caseArchive],
  );

  React.useEffect(() => {
    if (archivedCases.length === 0) {
      setSelectedArchiveCaseId(null);
      if (activeView === 'archive') {
        setActiveView('current');
      }
      return;
    }

    if (!selectedArchiveCaseId || !archivedCases.some((entry) => entry.caseId === selectedArchiveCaseId)) {
      setSelectedArchiveCaseId(archivedCases[archivedCases.length - 1]?.caseId ?? null);
    }
  }, [activeView, archivedCases, selectedArchiveCaseId]);

  const currentCaseNumber = parseCaseNumber(caseDefinition?.case_id);

  const discoveredEvidence = React.useMemo(
    () => filterEvidenceList(caseDefinition?.evidence_list ?? [], snapshot?.evidenceStates, searchQuery),
    [caseDefinition?.evidence_list, searchQuery, snapshot?.evidenceStates],
  );

  const selectedArchive = React.useMemo<ArchivedCaseRecord | null>(
    () => archivedCases.find((entry) => entry.caseId === selectedArchiveCaseId) ?? archivedCases[archivedCases.length - 1] ?? null,
    [archivedCases, selectedArchiveCaseId],
  );

  const archivedEvidence = React.useMemo(
    () => selectedArchive
      ? filterEvidenceList(selectedArchive.caseDefinition.evidence_list, selectedArchive.snapshot.evidenceStates, searchQuery)
      : [],
    [searchQuery, selectedArchive],
  );

  const renderEvidenceCard = React.useCallback((
    evidence: CaseEvidence,
    stateKey: string,
    onClick: () => void,
    reactKey: string,
  ) => {
    const statusMeta = stateLabels[stateKey] ?? { label: stateKey, color: '#333' };

    return (
      <div
        key={reactKey}
        className="file-card"
        style={isCompactLayout ? {
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 52px',
          alignItems: 'start',
          textAlign: 'right',
          gap: '0.85rem',
          padding: '0.9rem 0.95rem',
          borderRadius: '12px',
        } : undefined}
        onClick={onClick}
      >
        {isCompactLayout ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span className="mono-text" style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.5)' }}>
                {evidence.evidence_id}
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  color: '#fff',
                  background: `${statusMeta.color}22`,
                  border: `1px solid ${statusMeta.color}44`,
                  borderRadius: '999px',
                  padding: '0.16rem 0.45rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {statusMeta.label}
              </span>
            </div>
            <span
              className="evidence-card-title-mini"
              style={{
                textAlign: 'right',
                fontSize: '0.88rem',
                lineHeight: 1.55,
                color: '#fff',
              }}
            >
              {evidence.title}
            </span>
          </div>
        ) : (
          <span className="evidence-card-title-mini">{evidence.title}</span>
        )}
        <div
          className="evidence-icon-box"
          style={isCompactLayout ? { width: '52px', height: '64px', flexShrink: 0, justifySelf: 'end' } : undefined}
        >
          <FileText size={isCompactLayout ? 26 : 32} className="evidence-icon-main" />
          <div className="evidence-card-corner" />
          {!isCompactLayout && (
            <div
              className="evidence-status-badge-mini"
              style={{ background: statusMeta.color }}
            >
              {statusMeta.label}
            </div>
          )}
        </div>
      </div>
    );
  }, [isCompactLayout]);

  return (
    <div className="explorer-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(0,0,0,0.1)',
    }}>
      <div style={{
        padding: isCompactLayout ? '0.75rem' : '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isCompactLayout ? '0.75rem' : '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Folder size={18} className="text-interaction-cool" />
            <span style={{ fontWeight: 600 }}>الأرشيف التحقيقي</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveView('current')}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '999px',
                border: `1px solid ${activeView === 'current' ? 'var(--interaction-cool)' : 'rgba(255,255,255,0.1)'}`,
                background: activeView === 'current' ? 'rgba(77,163,255,0.14)' : 'rgba(255,255,255,0.03)',
                color: activeView === 'current' ? 'var(--interaction-cool)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.75rem',
              }}
            >
              القضية الحالية
            </button>
            <button
              type="button"
              onClick={() => archivedCases.length > 0 && setActiveView('archive')}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '999px',
                border: `1px solid ${activeView === 'archive' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                background: activeView === 'archive' ? 'rgba(245,166,35,0.14)' : 'rgba(255,255,255,0.03)',
                color: activeView === 'archive' ? '#f59e0b' : 'var(--text-secondary)',
                cursor: archivedCases.length > 0 ? 'pointer' : 'not-allowed',
                opacity: archivedCases.length > 0 ? 1 : 0.5,
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.75rem',
              }}
            >
              القضايا السابقة ({archivedCases.length})
            </button>
          </div>
        </div>
        <div style={{ position: 'relative', width: isCompactLayout ? '100%' : 'auto' }}>
          <Search size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input
            type="text"
            placeholder={activeView === 'archive' ? 'بحث في ملفات القضايا السابقة...' : 'بحث في مستندات القضية...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '0.4rem 2.5rem 0.4rem 0.75rem',
              fontSize: '0.8rem',
              color: '#fff',
              outline: 'none',
              width: isCompactLayout ? '100%' : '240px',
              minWidth: 0,
              fontFamily: 'var(--font-arabic)',
            }}
          />
        </div>
      </div>

      {activeView === 'current' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: isCompactLayout ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: isCompactLayout ? '0.75rem' : '1.5rem',
          padding: isCompactLayout ? '0.75rem' : '2rem',
          alignContent: 'start',
        }}>
          <div style={{
            gridColumn: '1/-1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isCompactLayout ? 'flex-start' : 'center',
            flexDirection: isCompactLayout ? 'column' : 'row',
            gap: isCompactLayout ? '0.3rem' : 0,
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'rgba(77,163,255,0.08)',
            border: '1px solid rgba(77,163,255,0.16)',
            color: 'var(--text-secondary)',
          }}>
            <span>ملفات القضية الحالية</span>
            <span className="mono-text">
              القضية {formatCaseOrdinal(currentCaseNumber)} {caseDefinition?.title ? `// ${caseDefinition.title}` : ''}
            </span>
          </div>
          {discoveredEvidence.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.3, marginTop: '4rem' }}>
              <FileText size={64} strokeWidth={1} style={{ marginBottom: '1rem' }} />
              <p>لا توجد مستندات مكتشفة في الأرشيف</p>
            </div>
          ) : (
            discoveredEvidence.map((evidence) => renderEvidenceCard(
              evidence,
              snapshot?.evidenceStates[evidence.evidence_id] || 'locked',
              () => onOpenWindow(evidence.evidence_id),
              evidence.evidence_id,
            ))
          )}
        </div>
      )}

      {activeView === 'archive' && (
        archivedCases.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.35, gap: '0.8rem' }}>
            <Archive size={54} strokeWidth={1} />
            <p>لا توجد قضايا مؤرشفة بعد.</p>
          </div>
        ) : (
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: isNarrowLayout ? '1fr' : 'minmax(220px, 250px) minmax(0, 1fr)',
            gap: '1rem',
            padding: isCompactLayout ? '0.75rem' : '1rem',
          }}>
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              padding: '0.75rem',
              overflowY: isNarrowLayout ? 'hidden' : 'auto',
              overflowX: isNarrowLayout ? 'auto' : 'hidden',
              display: 'flex',
              flexDirection: isNarrowLayout ? 'row' : 'column',
              gap: '0.6rem',
            }}>
              {archivedCases.map((archiveCase) => {
                const decision = archiveCase.closureDecision?.mode ? decisionLabels[archiveCase.closureDecision.mode] : null;
                const isSelected = archiveCase.caseId === selectedArchive?.caseId;

                return (
                  <button
                    key={archiveCase.caseId}
                    type="button"
                    onClick={() => setSelectedArchiveCaseId(archiveCase.caseId)}
                    style={{
                      textAlign: 'right',
                      padding: '0.85rem',
                      minWidth: isNarrowLayout ? '220px' : undefined,
                      borderRadius: '10px',
                      border: `1px solid ${isSelected ? 'rgba(245,166,35,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      background: isSelected ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.02)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-arabic)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{archiveCase.caseTitle}</span>
                      <span className="mono-text" style={{ fontSize: '0.72rem', opacity: 0.75 }}>
                        #{formatCaseOrdinal(archiveCase.caseNumber)}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {archiveCase.snapshot.closureBuckets.verifiedEvidenceIds.length} ملفًا موثقًا
                      </span>
                      {decision && (
                        <span style={{
                          fontSize: '0.68rem',
                          color: decision.color,
                          background: `${decision.color}18`,
                          border: `1px solid ${decision.color}33`,
                          borderRadius: '999px',
                          padding: '0.15rem 0.45rem',
                        }}>
                          {decision.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {selectedArchive ? (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isCompactLayout ? 'flex-start' : 'center',
                    flexDirection: isCompactLayout ? 'column' : 'row',
                    gap: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    flexWrap: 'wrap',
                  }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedArchive.caseTitle}</div>
                      <div className="mono-text" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        القضية {formatCaseOrdinal(selectedArchive.caseNumber)} {' // '} {selectedArchive.caseId}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      اضغط على أي ملف لفتحه كمستند مرجعي قديم
                    </div>
                  </div>

                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: isCompactLayout ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: isCompactLayout ? '0.75rem' : '1rem',
                    alignContent: 'start',
                    paddingRight: '0.25rem',
                  }}>
                    {archivedEvidence.length === 0 ? (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.35, marginTop: '4rem' }}>
                        <Archive size={60} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                        <p>لا توجد ملفات مطابقة في هذه القضية.</p>
                      </div>
                    ) : (
                      archivedEvidence.map((evidence) => renderEvidenceCard(
                        evidence,
                        selectedArchive.snapshot.evidenceStates[evidence.evidence_id] || 'locked',
                        () => onOpenArchivedEvidence(selectedArchive.caseId, evidence.evidence_id),
                        `${selectedArchive.caseId}-${evidence.evidence_id}`,
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  اختر قضية من القائمة اليسرى.
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
