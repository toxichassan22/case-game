import React, { useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Lock, BookOpen } from 'lucide-react';
import { PLAYER_ACTION_TYPE } from '../../../runtime/src/engine/constants.js';
import type { FixedTimelineEvent, RuntimeSnapshot } from '../../../runtime/src/types';
import './TimelineBoard.css';

/**
 * Prerequisite resolver that dispatches by ID prefix, mirroring engine semantics:
 *
 * - INT-*               → interrogation source
 * - LOCK-EVENT-*        → timeline lock
 * - everything else     → evidence ref
 */
function isPrerequisiteSatisfied(pid: string, snapshot: RuntimeSnapshot): boolean {
  if (pid.startsWith('INT-')) {
    const prefix = `dialog_option_used:${pid}:`;
    return snapshot.verifiedFacts.some((fact: string) => fact.startsWith(prefix));
  }
  if (pid.startsWith('LOCK-EVENT-')) {
    return snapshot.verifiedFacts.includes(`timeline_lock:${pid}`);
  }
  return snapshot.evidenceStates[pid] === 'verified';
}

interface TimelineNode {
  id: string;
  time?: string;
  title: string;
  description?: string;
  character?: string;
  type: 'verified' | 'locked' | 'available' | 'missing';
  prerequisites?: string[];
  missingPrereqs?: string[];
  isBlueprint?: boolean;
  sortOrder: number;
}

const TimelineBoardInner: React.FC = () => {
  const snapshot = useGameStore((s) => s.engineSnapshot) as RuntimeSnapshot;
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const sendAction = useGameStore((s) => s.sendAction);
  
  const evidenceTitleMap = React.useMemo(
    () => new Map((caseDefinition?.evidence_list ?? []).map((evidence) => [evidence.evidence_id, evidence.title])),
    [caseDefinition?.evidence_list],
  );
  
  const characterNameMap = React.useMemo(() => {
    const allCharacters = [
      ...(caseDefinition?.suspects ?? []),
      ...(caseDefinition?.witnesses ?? []),
      ...(caseDefinition?.related_persons ?? []),
    ];
    return new Map(allCharacters.map((character) => [character.character_id.toUpperCase(), character.name]));
  }, [caseDefinition?.related_persons, caseDefinition?.suspects, caseDefinition?.witnesses]);

  const resolveInteractionName = (interactionId: string): string | null => {
    const normalized = interactionId.toUpperCase();
    const directMatch = characterNameMap.get(normalized);
    if (directMatch) return directMatch;

    const suspectKey = normalized.replace(/^INT-/, '').replace(/-\d+$/, '');
    const fuzzyMatch = [...characterNameMap.entries()].find(([key]) => key.includes(suspectKey));
    return fuzzyMatch?.[1] ?? null;
  };

  const formatPrerequisiteLabel = (pid: string): string => {
    if (pid.startsWith('INT-')) {
      return `استجواب ${resolveInteractionName(pid) ?? pid.replace(/^INT-/, '')}`;
    }
    if (pid.startsWith('LOCK-EVENT-')) {
      return `تثبيت ${pid.replace(/^LOCK-EVENT-/, '')}`;
    }
    return evidenceTitleMap.get(pid) ?? pid;
  };

  const handleLockEvent = (interactionId: string) => {
    sendAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: interactionId
    });
  };

  // Merge timeline_events and timeline_blueprints into unified structure
  const unifiedTimeline = useMemo(() => {
    if (!snapshot || !caseDefinition) return [];

    const referenceEvents = (caseDefinition.timeline_events || []).map((ev: FixedTimelineEvent, idx: number) => ({
      id: `ref-${idx}`,
      time: ev.time,
      title: ev.description,
      character: ev.character,
      type: 'verified' as const,
      isBlueprint: false,
      sortOrder: idx * 10,
    }));

    const timelineBlueprints = caseDefinition.timeline_blueprints || [];
    const blueprintNodes = timelineBlueprints.map((bp, bpIndex) => {
      const isLocked = snapshot.verifiedFacts.includes(`timeline_lock:${bp.id}`);
      const missingPrereqs = bp.prerequisites.filter(
        (pid: string) => !isPrerequisiteSatisfied(pid, snapshot)
      );

      // Extract time from title if present (e.g., "تأكيد وجود شريف (20:41)")
      const timeMatch = bp.title.match(/(\d{2}:\d{2})/);
      const extractedTime = timeMatch ? timeMatch[1] : undefined;

      return {
        id: bp.id,
        time: extractedTime,
        title: bp.title,
        character: undefined,
        type: isLocked ? 'locked' : missingPrereqs.length === 0 ? 'available' : 'missing',
        prerequisites: bp.prerequisites,
        missingPrereqs,
        isBlueprint: true,
        sortOrder: (bpIndex + 1) * 10 - 5,
      } as TimelineNode;
    });

    const unified = [...referenceEvents, ...blueprintNodes];
    unified.sort((a, b) => a.sortOrder - b.sortOrder);
    return unified;
  }, [snapshot, caseDefinition]);

  if (!snapshot || !caseDefinition) {
    return (
      <div className="center-layout" style={{ height: '100%', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <div className="loading-spinner"></div>
        <div>جاري تحميل الخط الزمني...</div>
      </div>
    );
  }

  return (
    <div className="crime-reconstruction-board">
      <div className="board-header">
        <h2>إعادة بناء أحداث الجريمة</h2>
        <p className="board-subtitle">رتب الأحداث الزمنية لتكشف الرواية الكاملة</p>
      </div>

      {unifiedTimeline.length === 0 ? (
        <div className="timeline-empty">
          <BookOpen size={36} strokeWidth={1} />
          <p>لا توجد أحداث زمنية لهذه القضية</p>
        </div>
      ) : (
        <div className="timeline-center">
          {/* Wrapper that grows with content to fix line height */}
          <div className="timeline-content-wrapper">
            <div className="timeline-line" />
            
            {unifiedTimeline.map((node, index) => {
            const position = index % 2 === 0 ? 'left' : 'right';
            
            return (
              <div key={node.id} className={`timeline-node-wrapper ${position}`}>
                {node.time && (
                  <div className="time-tag">{node.time}</div>
                )}
                
                <div className={`timeline-dot ${node.type}`} />
                
                <div className={`timeline-card ${node.type}`}>
                  {node.isBlueprint && node.type === 'missing' ? (
                    <>
                      <div className="card-icon" style={{ opacity: 0.5 }}>🕵️‍♂️</div>
                      {/* Hide actual title to prevent spoilers - show mystery placeholder */}
                      <div className="card-title" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        ؟؟؟ فجوة في التسلسل الزمني ؟؟؟
                      </div>
                      <div className="card-hint">
                        ينقص إثبات: {node.missingPrereqs?.map(formatPrerequisiteLabel).join('، ')}
                      </div>
                    </>
                  ) : node.isBlueprint && node.type === 'available' ? (
                    <>
                      <div className="card-title">{node.title}</div>
                      <button 
                        className="btn-lock-available"
                        onClick={() => handleLockEvent(node.id)}
                      >
                        🔒 تثبيت الحدث
                      </button>
                    </>
                  ) : node.isBlueprint && node.type === 'locked' ? (
                    <>
                      <div className="card-title">{node.title}</div>
                      <div className="card-status locked">
                        <Lock size={12} /> تم التثبيت كحقيقة
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="card-title">{node.title}</div>
                      {node.character && (
                        <div className="card-character">👤 {node.character}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export const TimelineBoard = React.memo(TimelineBoardInner);
