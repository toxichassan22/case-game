import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { InboxMsg, DialogueOption } from '../stores/gameStore';
import { ShieldAlert, Monitor } from 'lucide-react';
import type { RuntimeCaseDefinition, RuntimeSnapshot } from '../../../runtime/src/types.js';
import { PLAYER_ACTION_TYPE } from '../../../runtime/src/engine/constants.js';
import { AudioPlayer } from './AudioPlayer';
import './InboxPanel.css';

// Stable empty fallbacks to avoid re-render loops from new array references
const EMPTY_MESSAGES: InboxMsg[] = [];
const EMPTY_SENT_IDS: string[] = [];
const EMPTY_OPTIONS: DialogueOption[] = [];

// Dynamic dialogue tree builder with gameplay effects
const buildDialogueTree = (_caseDefinition: RuntimeCaseDefinition | null, snapshot: RuntimeSnapshot | null): DialogueOption[] => {
  const evidenceStates = snapshot?.evidenceStates || {};
  
  const isEvidenceVerified = (id: string) => evidenceStates[id] === 'verified';
  
  return [
    {
      id: 'opt_intro',
      text: 'طلب توجيهات أولية حول القضية',
      response: 'كل المعطيات الأولية موجودة في "ملف القضية". راجع الأدلة المتاحة ثم اطلب تحليلها عبر "المختبر الجنائي".',
      category: 'initial',
      nextOptions: [
        {
          id: 'opt_request_evidence',
          text: 'هل هناك أدلة إضافية أو ملفات من مسرح الجريمة؟',
          response: 'جاري إرسال ما لدينا من أحراز إضافية وصور الكاميرات الأولية إلى جهازك الآن.',
          triggerActionId: 'REQ-EVIDENCE-01',
          category: 'evidence_request',
          effects: {
            unlock_evidence_ids: ['DB-01'],
            trust_modifier: 2,
            objective_hint: 'راجع السجل الجديد (DB-01) في حقيبة الأدلة ووثقه'
          }
        },
        {
          id: 'opt1_2',
          text: 'حسناً، سأبدأ العمل.',
          response: 'بالتوفيق في التحقيق. ابق النوافذ مفتوحة لتلقي الإشعارات الفورية متى ظهرت أي أدلة.',
          category: 'initial'
        }
      ]
    },
    {
      id: 'opt_suspect_records',
      text: 'أين أجد سجلات المشتبه بهم؟',
      response: 'لا يوجد مشتبه بهم مؤكدين حتى اللحظة. استخدم "لوحة الخيوط" واربط الأدلة لتحديد هوياتهم.',
      category: 'investigation',
      nextOptions: [
        {
          id: 'opt2_1',
          text: 'كيف أفتح مسارات استجواب معهم؟',
          response: 'بمجرد كشف مشتبه به، ستفتح لك نافذة استجواب خاصة به. اجمع الدلائل أولاً لمواجهته بها.',
          category: 'investigation'
        }
      ]
    },
    // Progression-based dialogues with effects and unlock conditions
    {
      id: 'opt_fire_origin',
      text: 'أريد تقريراً مفصلاً عن منشأ الحريق',
      response: isEvidenceVerified('SCN-03')
        ? 'تم تأكيد أن منشأ الحريق في مكتب الإدارة. هذا يشير إلى أن الجاني كان يستهدف ملفات محددة.'
        : 'جاري إرسال التقرير الأولي. لاحظ أن التحديد النهائي يتطلب التحقق من الأدلة في المختبر.',
      category: 'forensics',
      effects: {
        unlock_evidence_ids: ['SCN-03'],
        trust_modifier: 3,
        objective_hint: 'افتح تقرير منشأ الحريق (SCN-03) ووثقه للمضي قدماً',
        requires_verified_evidence: []
      },
      unlock_condition: {
        requires_discovered_evidence: []  // Always available
      },
      nextOptions: [
        {
          id: 'opt_external_lock',
          text: 'هل هناك احتمال إغلاق خارجي؟',
          response: 'ظهرت مؤشرات على احتمال وجود إغلاق خارجي. سنرسل لك تقرير السخام فوراً.',
          category: 'forensics',
          effects: {
            unlock_evidence_ids: ['SCN-04'],
            trust_modifier: 5,
            objective_hint: 'حلل تقرير السخام (SCN-04) للتحقق من فرضية الإغلاق الخارجي',
            requires_verified_evidence: ['SCN-03']
          },
          unlock_condition: {
            requires_verified_evidence: ['SCN-03']
          }
        }
      ]
    },
    {
      id: 'opt_financial_records',
      text: 'أريد الاطلاع على السجلات المالية لسكان المبنى',
      response: 'هذا طلب جيد. لكن تذكر أن الوصول للسجلات المالية يتطلب مبرراً قوياً.',
      category: 'evidence_request',
      effects: {
        unlock_evidence_ids: isEvidenceVerified('OBJ-01') ? ['DB-08'] : [],
        trust_modifier: isEvidenceVerified('OBJ-01') ? 5 : -3,
        objective_hint: isEvidenceVerified('OBJ-01')
          ? 'راجع كشف حساب شريف (DB-08) للبحث عن تحركات مشبوهة'
          : 'يجب العثور على مبرر قوي (مثل OBJ-01) قبل طلب السجلات المالية',
        requires_verified_evidence: isEvidenceVerified('OBJ-01') ? [] : ['OBJ-01']
      },
      unlock_condition: {
        requires_discovered_evidence: ['OBJ-01']  // Only show after discovering OBJ-01
      }
    },
    {
      id: 'opt_gps_tracking',
      text: 'هل يمكننا تتبع تحركات المشتبه بهم عبر GPS؟',
      response: 'نعم، لدينا صلاحية الوصول لسجلات GPS. جاري إرسال البيانات المتاحة.',
      category: 'evidence_request',
      effects: {
        unlock_evidence_ids: ['DB-07'],
        trust_modifier: 3,
        objective_hint: 'حلل سجلات GPS لشريف (DB-07) للتحقق من وجوده في مكان الحريق'
      },
      unlock_condition: {
        requires_discovered_evidence: ['DB-01']  // Only show after finding inventory record
      }
    },
    {
      id: 'opt_locksmith_records',
      text: 'أريد سجلات صانع الأقفال الذي تعامل مع المبنى',
      response: 'فكرة ممتازة. قد يكون هناك نسخة مفتاح إضافية. جاري البحث في السجلات...',
      category: 'evidence_request',
      effects: {
        unlock_evidence_ids: ['DB-09'],
        trust_modifier: 4,
        objective_hint: 'راجع سجل صانع الأقفال (DB-09) للبحث عن نسخ مفاتيح غير مصرح بها'
      },
      unlock_condition: {
        requires_verified_evidence: ['SCN-04']  // Only after confirming external lock
      }
    },
    // Aggressive/unprofessional options (trust penalties) - hidden by default
    {
      id: 'opt_demand_all_files',
      text: 'أريد كل الملفات فوراً دون استثناء!',
      response: 'المحقق، هذا طلب غير رسمي. يجب أن تتبع الإجراءات القانونية. سنرسل لك ما هو متاح حالياً فقط.',
      category: 'aggressive',
      effects: {
        trust_modifier: -8,
        objective_hint: 'انتبه: طلباتك غير الرسمية تؤثر سلباً على ثقتك المؤسسية'
      },
      unlock_condition: {
        minimum_trust: 0,
        hidden_by_default: true
      }
    }
  ];
};

const InboxPanelInner: React.FC = () => {
  const caseId = useGameStore((s) => s.caseDefinition?.case_id || 'case01');
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const snapshot = useGameStore((s) => s.engineSnapshot);
  const trustScore = useGameStore((s) => s.engineSnapshot?.globalState?.trustLevels?.police_trust ?? 100);
  const revealedPhsHint = useGameStore((s) => s.revealedPhsHint);
  const inboxMessages = useGameStore((s) => s.inboxMessages?.[caseId] || EMPTY_MESSAGES);
  const inboxOptions = useGameStore((s) => s.inboxOptions?.[caseId]);
  const sentOptionIds = useGameStore((s) => s.inboxSentOptionIds?.[caseId] || EMPTY_SENT_IDS);
  
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeOptions, setActiveOptions] = useState<DialogueOption[]>(inboxOptions || EMPTY_OPTIONS);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setInboxMessages = useGameStore((s) => s.setInboxMessages);
  const setInboxOptions = useGameStore((s) => s.setInboxOptions);
  const addInboxSentOptionId = useGameStore((s) => s.addInboxSentOptionId);

  // SIDE EFFECT: Handle persistence of initial tree if missing
  useEffect(() => {
    if (caseDefinition && !inboxOptions) {
      const initialTree = buildDialogueTree(caseDefinition, snapshot);
      setActiveOptions(initialTree);
      setInboxOptions(caseId, initialTree);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, !!inboxOptions]); 

  useEffect(() => {
    if (inboxOptions) {
      setActiveOptions(inboxOptions);
    }
  }, [inboxOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
        replyTimerRef.current = null;
      }
    };
  }, []);

  const evidenceTitleMap = React.useMemo(
    () => new Map((caseDefinition?.evidence_list || []).map((evidence) => [evidence.evidence_id, evidence.title])),
    [caseDefinition?.evidence_list],
  );

  // NEW: Filter dialogue options based on unlock conditions and Rule of 3
  const filterDialogueOptions = (options: DialogueOption[]): DialogueOption[] => {
    const evidenceStates = snapshot?.evidenceStates || {};
    
    const isEvidenceVerified = (id: string) => evidenceStates[id] === 'verified';
    const isEvidenceDiscovered = (id: string) => evidenceStates[id] && evidenceStates[id] !== 'locked';
    
    // Filter by unlock conditions
    const availableOptions = options.filter(opt => {
      if (!opt.unlock_condition) return true;
      
      const cond = opt.unlock_condition;
      
      // Check verified evidence prerequisites
      if (cond.requires_verified_evidence?.some(id => !isEvidenceVerified(id))) {
        return false;
      }
      
      // Check discovered evidence prerequisites
      if (cond.requires_discovered_evidence?.some(id => !isEvidenceDiscovered(id))) {
        return false;
      }
      
      // Check minimum trust
      if (cond.minimum_trust && trustScore < cond.minimum_trust) {
        return false;
      }
      
      // Check minimum case number
      const currentCaseNumber = parseInt(caseDefinition?.case_id?.replace('case', '') || '1');
      if (cond.minimum_case_number && currentCaseNumber < cond.minimum_case_number) {
        return false;
      }
      
      // Hide options marked as hidden_by_default unless in sub-menu
      if (cond.hidden_by_default && activeCategory !== opt.category) {
        return false;
      }
      
      return true;
    });
    
    // Rule of 3: Limit to max 3 options at a time, prioritizing:
    // 1. Initial guidance (always show)
    // 2. Contextually relevant options
    // 3. Investigation options
    const priorityOrder = ['initial', 'investigation', 'forensics', 'evidence_request', 'aggressive'];
    
    const sortedOptions = availableOptions.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.category || 'investigation');
      const bPriority = priorityOrder.indexOf(b.category || 'investigation');
      return aPriority - bPriority;
    });
    
    // Return max 3 options
    return sortedOptions.slice(0, 3);
  };


  const updateInboxMessages = (updater: (prev: InboxMsg[]) => InboxMsg[]) => {
    const next = updater(inboxMessages);
    setInboxMessages(caseId, next);
  };

  const updateActiveOptions = (opts: DialogueOption[]) => {
    setActiveOptions(opts);
    setInboxOptions(caseId, opts);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [snapshot?.eventTrace, revealedPhsHint, inboxMessages, isTyping]);

  if (!caseDefinition) {
    return (
      <div className="p-4 center-layout" style={{ height: '100%', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <div className="loading-spinner"></div>
        <div>جاري تحميل صندوق الوارد...</div>
      </div>
    );
  }

  const baseEmail: InboxMsg = {
    id: 'briefing',
    sender: 'Chief Desk',
    senderName: 'مكتب الرئيس',
    text: `${
      typeof caseDefinition.inbox_brief === 'object'
        ? caseDefinition.inbox_brief.message
        : (caseDefinition.inbox_brief || 'قم بجمع أدلة لفك التفاصيل.')
    }`,
    time: '08:00 AM',
    timestamp: 0,
  };

  const formatDiscoveryMessage = (eventName: string, sourceRef: string, rawDetail: string): string => {
    const evidenceTitle = evidenceTitleMap.get(sourceRef);

    if (eventName === 'EVENT_LAB_ANALYSIS_STARTED') {
      return `جاري البدء في التحليل المخبري الدقيق لـ [${evidenceTitle || sourceRef}]. سيتم إخطارك فور توفر النتائج.`;
    }

    if (eventName === 'EVENT_EVIDENCE_VERIFIED') {
      const prefix = '🔬 تقرير التحليل: ';
      if (rawDetail === 'office_origin_confirmed') {
        return `${prefix}تم تأكيد منشأ الحريق كيميائياً داخل مكتب الإدارة باستخدام تقنية كشف المسرعات.`;
      }
      if (rawDetail === 'outer_lock_possible') {
        return `${prefix}رصد المختبر آثار فحص فيزيائي على القفل تشير لاحتمال وجود إغلاق خارجي بقوة قسرية.`;
      }
      return `${prefix}${evidenceTitle ? `تم الانتهاء من فحص وتوثيق ${evidenceTitle} بنجاح.` : 'تم توثيق النتائج المعملية لدليل جديد.'}`;
    }

    if (eventName === 'EVENT_INTERROGATION_NODE_UNLOCKED') {
      return evidenceTitle ? `تنبيه نظام الاستجواب: ظهرت قرائن جديدة مرتبطة بـ [${evidenceTitle}].` : 'تم كشف معلومة جديدة استراتيجية.';
    }

    return rawDetail || sourceRef;
  };

  const discoveryEmails: InboxMsg[] = (snapshot?.eventTrace || [])
    .filter(ev => 
      ev.event_name === 'EVENT_EVIDENCE_VERIFIED' || 
      ev.event_name === 'EVENT_INTERROGATION_NODE_UNLOCKED' ||
      ev.event_name === 'EVENT_LAB_ANALYSIS_STARTED'
    )
    .map((ev, idx) => ({
      id: `ev-${idx}-${ev.tick}`,
      sender: 'Forensics Hub',
      senderName: 'المختبر الجنائي',
      text: `تحديث دليل: ${evidenceTitleMap.get(ev.source_ref) || ev.source_ref}\n${formatDiscoveryMessage(ev.event_name, ev.source_ref, ev.display_text || ev.result)}`,
      time: 'الآن',
      timestamp: ev.tick,
    }));

  const phsEmails: InboxMsg[] = (revealedPhsHint && (revealedPhsHint.level === 'L3' || revealedPhsHint.type === 'message'))
    ? [{
        id: `phs-${revealedPhsHint.payload.text}`,
        sender: 'Chief Desk',
        senderName: 'مكتب الرئيس',
        text: `الرسالة: ${revealedPhsHint.payload.text}`,
        time: 'الآن',
        timestamp: snapshot?.currentTick || 1000000,
      }]
    : [];

  const allMessages = [baseEmail, ...discoveryEmails, ...phsEmails, ...inboxMessages]
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleOptionClick = (opt: DialogueOption) => {
    if (isTyping || sentOptionIds.includes(opt.id)) return;
    
    // Check prerequisites
    if (opt.effects?.requires_verified_evidence) {
      const verifiedFacts = snapshot?.verifiedFacts || [];
      const missingEvidence = opt.effects.requires_verified_evidence.filter(
        evidId => !verifiedFacts.includes(`evidence_verified:${evidId}`)
      );
      
      if (missingEvidence.length > 0) {
        const missingNames = missingEvidence.map(id => {
          const evidence = caseDefinition?.evidence_list.find(e => e.evidence_id === id);
          return evidence?.title || id;
        }).join('، ');
        
        useGameStore.getState().addNotification({
          message: `⚠️ يجب توثيق الأدلة التالية أولاً: ${missingNames}`,
          type: 'warning'
        });
        return;
      }
    }
    
    addInboxSentOptionId(caseId, opt.id);
    
    // Trigger engine actions if defined — the chief desk channel maps to the
    // CHIEF-DESK interrogation source in case data.
    if (opt.triggerActionId) {
      useGameStore.getState().sendAction({
        type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
        source_ref: 'CHIEF-DESK',
        interaction_id: opt.triggerActionId,
      });
    }
    
    // Apply gameplay effects
    if (opt.effects) {
      // Unlock evidence
      if (opt.effects.unlock_evidence_ids && opt.effects.unlock_evidence_ids.length > 0) {
        // Note: Evidence unlocking is handled server-side via the triggerActionId
        console.log(`[Inbox] Would unlock evidence: ${opt.effects.unlock_evidence_ids.join(', ')}`);
      }
      
      // Modify trust
      if (opt.effects.trust_modifier) {
        const trustChange = opt.effects.trust_modifier;
        const message = trustChange > 0 
          ? `✅ زادت ثقتك المؤسسية بمقدار ${trustChange} نقطة`
          : `⚠️ نقصت ثقتك المؤسسية بمقدار ${Math.abs(trustChange)} نقطة`;
        
        useGameStore.getState().addNotification({
          message,
          type: trustChange > 0 ? 'success' : 'warning'
        });
        
        // Note: Trust modification would need backend support
        // For now, we log it and could send a special action
        console.log(`[Inbox] Trust modifier: ${trustChange}`);
      }
      
      // Update objective hint
      if (opt.effects.objective_hint) {
        useGameStore.getState().addNotification({
          message: `🎯 ${opt.effects.objective_hint}`,
          type: 'info'
        });
      }
    }

    const currentTick = snapshot?.currentTick || 0;
    
    const nextMsgId = inboxMessages.length + 1;
    const newMsg: InboxMsg = {
      id: `msg-${nextMsgId}`,
      sender: 'player',
      senderName: 'المحقق (أنت)',
      text: opt.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: currentTick + (nextMsgId * 0.0001)
    };
    
    updateInboxMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    // Clear any previous reply timer to prevent stale replies
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
    }
    replyTimerRef.current = setTimeout(() => {
      replyTimerRef.current = null;
      const replyMsgId = nextMsgId + 1;
      const replyMsg: InboxMsg = {
         id: `reply-${replyMsgId}`,
         sender: 'Chief Desk',
         senderName: 'مكتب الرئيس',
         text: opt.response,
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         timestamp: currentTick + (replyMsgId * 0.0001)
      };
      
      updateInboxMessages(prev => [...prev, replyMsg]);
      setIsTyping(false);

      // Rebuild dialogue tree based on new state
      const nextOpts = opt.nextOptions && opt.nextOptions.length > 0 
          ? opt.nextOptions 
          : buildDialogueTree(caseDefinition, snapshot);
      
      updateActiveOptions(nextOpts);
    }, 1500);
  };

  const authoredBrief = typeof caseDefinition.inbox_brief === 'object' && caseDefinition.inbox_brief !== null
    ? caseDefinition.inbox_brief
    : null;
  const audioUrl = authoredBrief?.audio_url;

  return (
    <div className="inbox-panel">
      {/* Message Header - Clean, No Borders */}
      <div className="inbox-message-header">
        <div className="inbox-header-top">
          <div className="inbox-sender-info">
            <ShieldAlert size={20} className="inbox-sender-icon" />
            <h3 className="inbox-sender-name">مكتب الرئيس</h3>
          </div>
          <span className="inbox-message-time">08:00 AM</span>
        </div>
        <p className="inbox-message-subject">
          قضية جديدة: {caseDefinition.title}
        </p>
      </div>

      {/* Message Content - Scrollable */}
      <div className="inbox-message-content">
        {/* Audio Attachment */}
        {audioUrl && (
          <div className="inbox-audio-attachment">
            <AudioPlayer 
              src={audioUrl} 
              title="توجيهات صوتية من رئاسة المباحث"
              type="briefing"
            />
          </div>
        )}

        {/* Message Bubbles */}
        {allMessages.map((msg) => {
          const isPlayer = msg.sender === 'player';
          return (
            <div key={msg.id} className={`inbox-bubble-wrapper ${isPlayer ? 'outgoing' : 'incoming'}`}>
              {!isPlayer && (
                <div className="inbox-avatar">
                  {msg.sender === 'Chief Desk' ? <ShieldAlert size={16} /> : <Monitor size={16} />}
                </div>
              )}
              <div className="inbox-bubble">
                <div className="inbox-bubble-header">
                  <span className="inbox-bubble-name">{msg.senderName}</span>
                  <span className="inbox-bubble-time">{msg.time}</span>
                </div>
                <div className="inbox-bubble-text">
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="inbox-typing-indicator">مكتب الرئيس يطبع الآن...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Area - Separated with Divider */}
      {!isTyping && (
        <div className="inbox-reply-area">
          <div className="inbox-reply-header">خيارات الرد المتاحة</div>
          
          {/* Category Tabs - Text Style */}
          {activeOptions.some(opt => opt.category && opt.unlock_condition?.hidden_by_default !== true) && (
            <div className="inbox-category-tabs">
              <button
                onClick={() => setActiveCategory(null)}
                className={`inbox-category-tab ${activeCategory === null ? 'active' : ''}`}
              >
                الكل
              </button>
              {['investigation', 'forensics', 'evidence_request'].map(cat => {
                const hasOptions = activeOptions.some(opt => opt.category === cat);
                if (!hasOptions) return null;
                
                const labels: Record<string, string> = {
                  investigation: '🔍 تحقيق',
                  forensics: '🔬 جنائي',
                  evidence_request: '📁 أدلة'
                };
                
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`inbox-category-tab ${activeCategory === cat ? 'active' : ''}`}
                  >
                    {labels[cat]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Reply Options */}
          <div className="inbox-reply-options">
            {filterDialogueOptions(activeOptions)
              .filter(opt => !activeCategory || opt.category === activeCategory)
              .map(opt => (
                <button 
                  key={opt.id} 
                  className="inbox-reply-btn"
                  onClick={() => handleOptionClick(opt)}
                  disabled={sentOptionIds.includes(opt.id)}
                >
                  {opt.text}
                </button>
              ))}
            
            {filterDialogueOptions(activeOptions).length === 0 && (
              <div className="inbox-empty-state">
                لا توجد خيارات متاحة حالياً. تابع التحقيق لفتح خيارات جديدة.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const InboxPanel = React.memo(InboxPanelInner);
