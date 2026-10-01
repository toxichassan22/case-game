import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { MessageCircle, User, AlertTriangle, Loader2 } from 'lucide-react';
import { PLAYER_ACTION_TYPE } from '../../../runtime/src/engine/constants.js';
import type { RuntimeSnapshot } from '../../../runtime/src/types';
import { AudioPlayer } from './AudioPlayer';
import {
  characterIdToInterrogationSourceRef,
  interrogationSourceRefToCharacterId,
} from '../../../runtime/src/utils/interrogationRefs.js';

interface DialogOption {
  id: string;
  text: string;
  /** Used (asked) options — answered already. */
  burned?: boolean;
  /** Session-burned by mechanic (e.g. aggressive choice burned the parallel empathetic option). */
  sessionBurned?: boolean;
}

interface DialogMessage {
  speaker: 'investigator' | 'suspect';
  text: string;
  timestamp: number;
}

interface InterrogationChatProps {
  suspectName: string;
  suspectId: string;
  /** IDs of dialog options that are actually supported by engine blueprints for this suspect */
  supportedOptionIds?: string[];
  onClose: () => void;
}

const InterrogationChatInner: React.FC<InterrogationChatProps> = ({
  suspectName,
  suspectId,
  supportedOptionIds,
  // onClose,
}) => {
  const [messages, setMessages] = useState<DialogMessage[]>([
    {
      speaker: 'suspect',
      text: 'أنا مستعد للإجابة على أسئلتكم.',
      timestamp: 0,
    },
  ]);

  // Track which option is pending engine confirmation (sent, not yet confirmed)
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [showEvidencePicker, setShowEvidencePicker] = useState(false);
  const [pendingEvidenceId, setPendingEvidenceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedEventsRef = useRef<Set<string>>(new Set());


  const snapshot = useGameStore((s) => s.engineSnapshot) as RuntimeSnapshot;
  const session = snapshot?.interrogation_sessions?.[suspectId];
  const suspectState = session?.current_stage === 'collapse' ? 'collapsing' : (session?.current_stage ?? snapshot?.suspectStates?.[suspectId] ?? 'normal');
  const pressureScore = session?.pressure_score ?? snapshot?.suspectPressureScores?.[suspectId] ?? 0;
  const burnedChoiceIds = useMemo(() => new Set(session?.burned_choice_ids ?? []), [session?.burned_choice_ids]);
  const lockedChoiceIds = useMemo(() => new Set(session?.locked_choice_ids ?? []), [session?.locked_choice_ids]);

  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const sendAction = useGameStore((s) => s.sendAction);

  const sourceRef = characterIdToInterrogationSourceRef(suspectId);

  const suspect = useMemo(() =>
    [
      ...(caseDefinition?.suspects ?? []),
      ...(caseDefinition?.witnesses ?? []),
      ...(caseDefinition?.related_persons ?? []),
    ].find(s => s.character_id === suspectId),
    [caseDefinition, suspectId],
  );

  // Computed options dynamically based on verifiedFacts
  const options: DialogOption[] = React.useMemo(() => {
    return (suspect?.dialogue_options || [])
      .filter((o: { id: string; text: string }) =>
        !supportedOptionIds || supportedOptionIds.includes(o.id)
      )
      .map((o: { id: string; text: string }) => {
        const isUsed = snapshot?.verifiedFacts?.includes(`dialog_option_used:${sourceRef}:${o.id}`) === true;
        return {
          id: o.id,
          text: o.text,
          burned: isUsed,
          sessionBurned: !isUsed && (burnedChoiceIds.has(o.id) || lockedChoiceIds.has(o.id)),
        };
      });
  }, [suspect?.dialogue_options, supportedOptionIds, snapshot?.verifiedFacts, sourceRef, burnedChoiceIds, lockedChoiceIds]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timeout for pending option / evidence presentation
  useEffect(() => {
    if (pendingOptionId || pendingEvidenceId) {
      const timer = setTimeout(() => {
        setPendingOptionId(null);
        setPendingEvidenceId(null);
        useGameStore.getState().addNotification({
          message: 'انتهى وقت انتظار الرد. يرجى المحاولة مرة أخرى.',
          type: 'warning'
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pendingOptionId, pendingEvidenceId]);

  // Listen to engine events for responses
  useEffect(() => {
    if (!snapshot) return;

    const newMessages: DialogMessage[] = [];

    snapshot.eventTrace.forEach((ev, idx) => {
      const isInterrogationEvent = ev.event_name === 'EVENT_INTERROGATION_NODE_UNLOCKED'
        || ev.event_name === 'EVENT_INTERROGATION_STAGE_ENTERED'
        || ev.event_name === 'EVENT_INTERROGATION_EVIDENCE_PRESENTED'
        || ev.event_name === 'EVENT_INTERROGATION_COLLAPSED'
        || ev.event_name === 'EVENT_INTERROGATION_LAWYER_UP';
      if (
        isInterrogationEvent &&
        interrogationSourceRefToCharacterId(ev.source_ref) === suspectId
      ) {
        const eventKey = `${ev.tick}-${idx}`;
        if (!processedEventsRef.current.has(eventKey)) {
          processedEventsRef.current.add(eventKey);
          newMessages.push({
            speaker: 'suspect',
            text: ev.display_text || ev.result || '',
            timestamp: Date.now() + idx,
          });
        }
      }
    });

    if (newMessages.length > 0) {
      // Use setTimeout to make the update asynchronous and avoid "cascading renders" lint error
      const timer = setTimeout(() => {
          setMessages((prev) => [...prev, ...newMessages]);
          setPendingOptionId(null);
          setPendingEvidenceId(null);
      }, 0);
      return () => clearTimeout(timer);
    } else if (pendingOptionId || pendingEvidenceId) {
      const pendingRef = pendingOptionId ?? pendingEvidenceId ?? '';
      const wasRejected = snapshot.debugTrace?.some(
        (t: { kind: string; message?: string }) =>
          t.kind === 'action_rejected' &&
          (t.message?.includes(pendingRef) || t.message?.includes(sourceRef))
      );
      if (wasRejected) {
        // Move into a microtask/timer to avoid cascading render warning
        const timer = setTimeout(() => {
            setPendingOptionId(null);
            setPendingEvidenceId(null);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [snapshot, suspectId, pendingOptionId, pendingEvidenceId, sourceRef]);

  const handleChooseOption = (option: DialogOption) => {
    if (option.burned || option.sessionBurned || pendingOptionId || pendingEvidenceId) return; // prevent double-fire

    // Add investigator's question immediately for responsiveness
    setMessages(prev => [...prev, {
      speaker: 'investigator',
      text: option.text,
      timestamp: Date.now(),
    }]);

    // Mark as pending (visually disabled) but NOT burned yet — wait for engine confirmation
    setPendingOptionId(option.id);

    // Dispatch to engine
    sendAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: sourceRef,
      interaction_id: option.id,
    });
  };

  // Presenting evidence to the suspect is the spec's way of driving pressure
  const presentableEvidence = (caseDefinition?.evidence_list ?? [])
    .filter((ev) => snapshot?.evidenceStates?.[ev.evidence_id] && snapshot.evidenceStates[ev.evidence_id] !== 'locked')
    .map((ev) => ({
      id: ev.evidence_id,
      title: ev.title,
      verified: snapshot?.evidenceStates?.[ev.evidence_id] === 'verified',
    }));

  const handlePresentEvidence = (evidenceId: string, title: string) => {
    if (pendingEvidenceId || pendingOptionId) return;
    setMessages(prev => [...prev, {
      speaker: 'investigator',
      text: `🗂️ قدّمت الدليل: ${title}`,
      timestamp: Date.now(),
    }]);
    setPendingEvidenceId(evidenceId);
    setShowEvidencePicker(false);
    sendAction({
      type: PLAYER_ACTION_TYPE.PRESENT_EVIDENCE,
      source_ref: sourceRef,
      interaction_id: evidenceId,
    });
  };

  const phase = suspectState;
  const phaseLabels: Record<string, string> = {
    normal: 'مرحلة الاستكشاف',
    probing: 'مرحلة الاستكشاف',
    pressure: 'مرحلة الضغط',
    branching: 'مرحلة التفرع',
    collapsing: 'انهيار المشتبه به!',
    lawyer_up: 'طلب المحامي',
  };

  const phaseColors: Record<string, string> = {
    normal: 'var(--interaction-cool)',
    probing: 'var(--interaction-cool)',
    pressure: 'var(--state-warning)',
    branching: 'var(--state-success)',
    collapsing: 'var(--thread-link)',
    lawyer_up: 'var(--thread-link)',
  };

  // Active = not used, not session-burned, not the one currently pending confirmation
  const activeOptions = options.filter(o => !o.burned && !o.sessionBurned && o.id !== pendingOptionId);
  const sessionBurnedOptions = options.filter(o => o.sessionBurned);

  // Consolidated status strip values — thresholds are point-scale, not percentages
  const cognitiveProfile = suspect?.cognitive_profile;
  const collapseThreshold = cognitiveProfile?.base_collapse_threshold ?? 0;
  const lawyerUpThreshold = cognitiveProfile?.base_lawyer_up_threshold ?? 0;
  const pressureScale = Math.max(collapseThreshold, lawyerUpThreshold, 1);
  const pressurePercent = Math.min(100, Math.max(0, (pressureScore / pressureScale) * 100));
  const pressureColor = pressurePercent < 30 ? '#48bb78' : pressurePercent < 60 ? '#ecc94b' : pressurePercent < 80 ? '#ed8936' : '#f56565';
  const trustLevel = snapshot?.globalState?.trustLevels?.[suspectId] ?? 50;

  return (
    <div className="chat-container">
      {/* Suspect Header */}
      <div className="chat-header">
        <div className="chat-avatar" style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {suspect?.image_url ? (
            <img 
              src={suspect.image_url} 
              alt={suspectName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                // Fallback for broken images - hide img and show parent background
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <User size={24} color="var(--text-secondary)" />
          )}
        </div>
        <div className="chat-header-text">
          <div className="chat-header-name">{suspectName}</div>
          <span
            className="chat-phase-chip"
            style={{ color: phaseColors[phase], borderColor: phaseColors[phase] }}
          >
            {phaseLabels[phase]}
          </span>
        </div>
      </div>

      {/* Consolidated status strip — pressure bar + threshold markers + trust */}
      {cognitiveProfile && (
        <div className="interro-status">
          <span className="interro-status-label">ضغط</span>
          <div className="interro-pressure-track" dir="ltr">
            <div
              className="interro-pressure-fill"
              style={{ width: `${pressurePercent}%`, background: pressureColor }}
            />
            <i
              className="interro-marker"
              style={{ left: `${(lawyerUpThreshold / pressureScale) * 100}%`, background: '#ed8936' }}
              title={`طلب المحامي عند ${lawyerUpThreshold}`}
            />
            <i
              className="interro-marker"
              style={{ left: `${(collapseThreshold / pressureScale) * 100}%`, background: '#f56565' }}
              title={`الانهيار عند ${collapseThreshold}`}
            />
          </div>
          <span className="interro-status-value mono-text" title={`مؤشر الضغط ${pressureScore} من ${pressureScale}`}>
            {pressureScore}/{pressureScale}
          </span>
          <span
            className="interro-trust"
            title="مستوى الثقة — ثقة أعلى قد تفتح مسارات حوار إضافية"
          >
            🤝 {trustLevel}%
          </span>
        </div>
      )}

      {/* Audio Player for Suspect */}
      {suspect?.audio_url && (
        <div className="interro-audio">
          <AudioPlayer 
            src={suspect.audio_url} 
            title={`تسجيل استجواب - ${suspectName}`}
            type="interrogation"
            compact
          />
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg-base ${msg.speaker === 'investigator' ? 'chat-msg-investigator' : 'chat-msg-suspect'}`}>
            <div className="chat-msg-speaker">
              {msg.speaker === 'investigator' ? '🧠 أنت' : `👤 ${suspectName}`}
            </div>
            <div className="chat-msg-text">{msg.text}</div>
          </div>
        ))}

        {/* Pending indicator — shows while waiting for engine confirmation */}
        {pendingOptionId && (
          <div className="chat-pending">
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.8rem' }}>يفكر...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Options */}
      <div className="chat-options-container">
        {phase === 'collapsing' || phase === 'lawyer_up' ? (
          <div className="chat-phase-alert" style={{ color: phaseColors[phase] }}>
            <AlertTriangle size={16} />
            {phase === 'collapsing' ? 'المشتبه به انهار تحت الضغط' : 'المشتبه به طلب محاميه'}
          </div>
        ) : activeOptions.length === 0 && sessionBurnedOptions.length === 0 && !pendingOptionId ? (
          <div className="chat-empty-state">
            {options.length === 0
              ? 'لا توجد أسئلة متاحة لهذا المشتبه به حاليًا.'
              : 'تم استنفاد جميع الأسئلة المتاحة.'}
          </div>
        ) : (
          <>
            {activeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleChooseOption(option)}
                disabled={!!pendingOptionId || !!pendingEvidenceId}
                className="chat-option-btn"
              >
                <MessageCircle size={12} style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />
                {option.text}
              </button>
            ))}
            {sessionBurnedOptions.map((option) => (
              <div key={option.id} className="chat-option-burned" title="هذا الخيار لم يعد متاحًا في هذه الجلسة">
                🔒 {option.text}
              </div>
            ))}
          </>
        )}

        {/* Present evidence to the suspect — drives the pressure mechanic */}
        {phase !== 'collapsing' && phase !== 'lawyer_up' && presentableEvidence.length > 0 && (
          <div className="interro-evidence">
            <button
              className="interro-evidence-toggle"
              onClick={() => setShowEvidencePicker(v => !v)}
              disabled={!!pendingOptionId || !!pendingEvidenceId}
            >
              🗂️ مواجهة بدليل {showEvidencePicker ? '▾' : '▸'}
            </button>
            {showEvidencePicker && (
              <div className="interro-evidence-list">
                {presentableEvidence.map((ev) => (
                  <button
                    key={ev.id}
                    className="interro-evidence-item"
                    onClick={() => handlePresentEvidence(ev.id, ev.title)}
                    title={ev.verified ? 'دليل موثّق — مواجهة قوية' : 'دليل غير موثّق — قد يضعف موقفك'}
                  >
                    <span className="interro-evidence-check">{ev.verified ? '✅' : '📄'}</span>
                    <span className="interro-evidence-title">{ev.title}</span>
                    <span className="interro-evidence-id mono-text">{ev.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const InterrogationChat = React.memo(InterrogationChatInner);
