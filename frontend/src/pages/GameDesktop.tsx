import { Suspense, lazy, useState, useMemo, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Taskbar } from '../components/Taskbar';
import { EvidenceWindow } from '../components/EvidenceWindow';
import { InboxPanel } from '../components/InboxPanel';
import { TeamChatWindow } from '../components/TeamChat';
import { ToastStack } from '../components/ToastStack';
import { ShadowMessage } from '../components/ShadowMessage';
import { SystemAnomaly } from '../components/SystemAnomaly';
import { ConsensusModal } from '../components/ConsensusModal';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { useGameStore, type ArchivedCaseRecord, type Specialty } from '../stores/gameStore';
import { useRoomAutoRejoin } from '../hooks/useRoomAutoRejoin';
import { useWindowSize } from '../hooks/useWindowSize';
import type { CaseEvidence, Suspect, PlayerAction } from '../../../runtime/src/types.js';
import { PLAYER_ACTION_TYPE } from '../../../runtime/src/engine/constants.js';
import {
  characterIdToInterrogationSourceRef,
  characterWindowTokenToCharacterId,
  interrogationSourceRefToCharacterId,
} from '../../../runtime/src/utils/interrogationRefs.js';
import { IMPLEMENTED_CASES, TOTAL_CASES, clampPercent, formatCaseOrdinal, parseCaseNumber } from '../utils/caseProgress';

// Lazy loaded large components
const StringBoard = lazy(() => import('../components/StringBoard').then(m => ({ default: m.StringBoard })));
const DatabaseSearch = lazy(() => import('../components/DatabaseSearch').then(m => ({ default: m.DatabaseSearch })));
const TimelineBoard = lazy(() => import('../components/TimelineBoard').then(m => ({ default: m.TimelineBoard })));
const ForensicsWorkbench = lazy(() => import('../components/ForensicsWorkbench').then(m => ({ default: m.ForensicsWorkbench })));
const CaseFilesExplorer = lazy(() => import('../components/CaseFilesExplorer').then(m => ({ default: m.CaseFilesExplorer })));
const ArrestWarrantModal = lazy(() => import('../components/ArrestWarrantModal').then(m => ({ default: m.ArrestWarrantModal })));
const InterrogationChat = lazy(() => import('../components/InterrogationChat').then(m => ({ default: m.InterrogationChat })));
const HintPanel = lazy(() => import('../components/HintPanel').then(m => ({ default: m.HintPanel })));
const InventoryPanel = lazy(() => import('../components/InventoryPanel').then(m => ({ default: m.InventoryPanel })));
// import { case01BlueprintConfig } from '../../../runtime/src/case01/config.js';

type ArchivedEvidenceWindowPayload = {
  kind: 'archived_evidence';
  evidence: CaseEvidence;
  archiveCase: ArchivedCaseRecord;
};

type WorkbenchWindowPayload = {
  selectedEvidenceId?: string;
};

type WindowData = {
  id: string;
  title: string;
  type: 'inbox' | 'board' | 'database' | 'evidence' | 'timeline' | 'workbench' | 'explorer' | 'warrant' | 'interrogation' | 'phs' | 'chat';
  payload?: CaseEvidence | Suspect | ArchivedEvidenceWindowPayload | Record<string, unknown>;
  zIndex?: number;
};

function bringWindowToFront(windows: WindowData[], id: string): WindowData[] {
  const existingWindow = windows.find((entry) => entry.id === id);
  if (!existingWindow) {
    return windows;
  }

  return [
    ...windows.filter((entry) => entry.id !== id),
    existingWindow,
  ];
}

function getMechanicallyLinkedDialogOptionIds(
  evidenceList: CaseEvidence[] | undefined,
  suspectId: string,
): string[] {
  const sourceRef = characterIdToInterrogationSourceRef(suspectId);
  const optionIds = new Set<string>();

  for (const evidence of evidenceList ?? []) {
    for (const trigger of evidence.completion_triggers ?? []) {
      for (const condition of trigger.conditions ?? []) {
        if (
          condition.source_ref === sourceRef &&
          condition.expected_player_action === PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION &&
          condition.interaction_id
        ) {
          optionIds.add(condition.interaction_id);
        }
      }
    }
  }

  return [...optionIds];
}

export const GameDesktop: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [windows, setWindows] = useState<WindowData[]>(() => {
    // Load from store on initial render
    const stored = useGameStore.getState().activeWindows;
    return stored && stored.length > 0 ? stored : [];
  });
  const [highlightedSourceRef, setHighlightedSourceRef] = useState<string | null>(null);
  const [isMobileInventoryOpen, setIsMobileInventoryOpen] = useState(false);
  // Initialize hasAutoOpenedInbox from localStorage to persist across refreshes
  const getInitialAutoOpenedState = (): boolean => {
    try {
      const stored = localStorage.getItem('hasAutoOpenedInbox');
      return stored === 'true';
    } catch {
      return false;
    }
  };
  const hasAutoOpenedInbox = useRef<boolean>(getInitialAutoOpenedState());
  const hasEnteredRoom = useRef(false);
  const workspaceRef = useRef<HTMLElement | null>(null);
  const topBannerRef = useRef<HTMLDivElement | null>(null);
  const activeTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const mode = useGameStore((s) => s.mode);
  const isSolo = mode === 'solo';
  const currentRoom = useGameStore((s) => s.currentRoom);
  const playerId = useGameStore((s) => s.playerId);
  const engineSnapshot = useGameStore((s) => s.engineSnapshot);
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const caseArchive = useGameStore((s) => s.caseArchive);
  const shadowMessage = useGameStore((s) => s.shadowMessage);
  const connected = useGameStore((s) => s.connected);
  const notifications = useGameStore((s) => s.notifications);
  const markEvidenceOpened = useGameStore((s) => s.markEvidenceOpened);
  const setActiveWindows = useGameStore((s) => s.setActiveWindows);

  // Sync windows to store whenever they change
  useEffect(() => {
    setActiveWindows(windows);
  }, [windows, setActiveWindows]);

  const requestSolution = useGameStore((s) => s.requestSolution);
  const solutionRequests = useGameStore((s) => s.solutionRequests);
  const revealedHint = useGameStore((s) => s.revealedHint);
  const revealedSolution = useGameStore((s) => s.revealedSolution);
  const revealedPhsHint = useGameStore((s) => s.revealedPhsHint);

  const { width: windowWidth, height: windowHeight, isMobile: isCompactViewport } = useWindowSize();

  useRoomAutoRejoin(roomId);

  // Cleanup all timeouts on unmount to prevent memory leaks
  useEffect(() => {
    const timeouts = activeTimeoutsRef.current;
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const dispatchAction = useCallback((action: PlayerAction) => {
    useGameStore.getState().sendAction(action);
  }, []);

  const trustScore = useMemo(() => engineSnapshot?.globalState?.trustLevels?.police_trust ?? 100, [engineSnapshot]);
  const currentCaseNumber = useMemo(() => parseCaseNumber(caseDefinition?.case_id ?? null), [caseDefinition]);
  
  const evidenceStats = useMemo(() => {
    if (!caseDefinition) return { total: 0, discovered: 0, verified: 0, progress: 0, verifiedPercent: 0 };
    
    const relevantEvidence = caseDefinition.evidence_list.filter(
      e => !e.evidence_id.startsWith('EVID-PARTIAL-') && !e.evidence_id.startsWith('EVID-SUP-')
    );
    
    const total = relevantEvidence.length;
    const states = relevantEvidence.map(
      (evidence) => engineSnapshot?.evidenceStates[evidence.evidence_id] ?? 'locked',
    );
    
    const discovered = states.filter((state) => state !== 'locked').length;
    const verified = states.filter((state) => state === 'verified').length;
    
    const progress = total > 0 ? clampPercent((discovered / total) * 100) : 0;
    const verifiedPercent = total > 0 ? clampPercent((verified / total) * 100) : 0;
    
    return { total, discovered, verified, progress, verifiedPercent };
  }, [caseDefinition, engineSnapshot]);

  const overallProgressPercent = useMemo(() => 
    currentCaseNumber ? clampPercent((currentCaseNumber / TOTAL_CASES) * 100) : 0,
    [currentCaseNumber]
  );

  const currentCaseProgressPercent = evidenceStats.progress;
  const currentCaseVerifiedPercent = evidenceStats.verifiedPercent;
  const totalEvidenceCount = evidenceStats.total;
  const discoveredEvidenceCount = evidenceStats.discovered;
  const verifiedEvidenceCount = evidenceStats.verified;

  // Current player specialty
  const currentSpecialty: Specialty | null = useMemo(() => 
    currentRoom?.players.find(p => p.playerId === playerId)?.specialty ?? null,
    [currentRoom, playerId]
  );
  const [windowLayout, setWindowLayout] = useState(() => ({
    workspaceWidth: windowWidth || 1024,
    workspaceHeight: windowHeight || 768,
    safeTop: isCompactViewport ? 110 : 180,
    safeBottom: isCompactViewport ? 118 : 116,
  }));

  useEffect(() => {
    windows.forEach(win => {
      if (win.type === 'evidence' && win.payload && 'evidence_id' in win.payload) {
        markEvidenceOpened((win.payload as CaseEvidence).evidence_id);
      }
    });
  }, [windows, markEvidenceOpened]);

  useLayoutEffect(() => {
    const updateWindowLayout = () => {
      const workspaceRect = workspaceRef.current?.getBoundingClientRect();
      const topBannerRect = topBannerRef.current?.getBoundingClientRect();
      const taskbarRect = document.querySelector('.taskbar')?.getBoundingClientRect();
      const workspaceWidth = Math.round(workspaceRef.current?.clientWidth ?? windowWidth);
      const workspaceHeight = Math.round(workspaceRef.current?.clientHeight ?? windowHeight);
      const workspaceTop = workspaceRect?.top ?? 0;
      const safeTop = Math.round(
        topBannerRect && topBannerRect.height > 0
          ? (topBannerRect.bottom - workspaceTop) + 2
          : (isCompactViewport ? 110 : 180),
      );
      const safeBottom = Math.round((taskbarRect?.height ?? (isCompactViewport ? 110 : 108)) + 8);

      setWindowLayout((previous) => {
        if (
          previous.workspaceWidth === workspaceWidth
          && previous.workspaceHeight === workspaceHeight
          && previous.safeTop === safeTop
          && previous.safeBottom === safeBottom
        ) {
          return previous;
        }

        return {
          workspaceWidth,
          workspaceHeight,
          safeTop,
          safeBottom,
        };
      });
    };

    updateWindowLayout();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateWindowLayout())
      : null;

    if (workspaceRef.current && resizeObserver) {
      resizeObserver.observe(workspaceRef.current);
    }

    if (topBannerRef.current && resizeObserver) {
      resizeObserver.observe(topBannerRef.current);
    }

    const taskbarElement = document.querySelector('.taskbar');
    if (taskbarElement && resizeObserver) {
      resizeObserver.observe(taskbarElement);
    }

    window.addEventListener('resize', updateWindowLayout);

    return () => {
      window.removeEventListener('resize', updateWindowLayout);
      resizeObserver?.disconnect();
    };
  }, [windowWidth, windowHeight, isCompactViewport]);

  const windowCascadeOffset = isCompactViewport ? 18 : 34;
  const windowStartX = isCompactViewport ? 12 : 72;
  const windowSafeTop = windowLayout.safeTop;
  const windowBoundsWidth = windowLayout.workspaceWidth;
  const windowBoundsHeight = windowLayout.workspaceHeight;
  const windowMaxWidth = Math.max(320, windowBoundsWidth - 24);
  const windowMaxHeight = Math.max(240, windowBoundsHeight - windowSafeTop - windowLayout.safeBottom);

  const inventoryItems = useMemo(() => {
    if (!engineSnapshot || !caseDefinition?.evidence_list) return [];
    return caseDefinition.evidence_list.map((def: CaseEvidence) => {
      const state = engineSnapshot.evidenceStates[def.evidence_id] || 'locked';
      return {
        id: def.evidence_id,
        title: def.title,
        type: def.type,
        state,
      };
    }).filter((item: { state: string }) => item.state !== 'locked');
  }, [engineSnapshot, caseDefinition]);

  const addNotification = useGameStore((s) => s.addNotification);

  // Soft exposure rules are authored in case data and consumed here without case-specific hardcoding.
  useEffect(() => {
    if (!caseDefinition || !engineSnapshot) {
      return;
    }

    const verifiedFacts = new Set(engineSnapshot.verifiedFacts ?? []);
    const rules = caseDefinition.hidden_systems.soft_exposure_rules ?? [];

    for (const rule of rules) {
      const storageKey = `soft-exposure:${caseDefinition.case_id}:${rule.rule_id}`;
      const isVisible = (engineSnapshot.evidenceStates[rule.source_ref] ?? 'locked') !== 'locked';
      const isTriggered = rule.when_any.some((predicate) => {
        const factKey = `${predicate.fact_type}:${predicate.ref}`;
        return verifiedFacts.has(factKey) === predicate.equals;
      });

      if (!isTriggered || (rule.required_visibility && !isVisible) || sessionStorage.getItem(storageKey)) {
        continue;
      }

      addNotification({
        message: rule.player_toast || 'تم استرجاع ملف رقمي ناقص.',
        type: 'info',
      });
      sessionStorage.setItem(storageKey, 'true');
    }
  }, [caseDefinition, engineSnapshot, addNotification]);

  // Auto-open Inbox once when investigation becomes ready (Comment 5)
  useEffect(() => {
    console.log('[GameDesktop useEffect] Checking conditions:', {
      hasCaseDefinition: !!caseDefinition,
      hasEngineSnapshot: !!engineSnapshot,
      hasAutoOpened: hasAutoOpenedInbox.current,
      isSolo,
      hasRoom: !!currentRoom,
      roomPhase: currentRoom?.phase,
      windowCount: windows.length,
      hasStoredWindows: useGameStore.getState().activeWindows.length > 0
    });
    
    // Don't auto-open if we have stored windows from before refresh
    const hasStoredWindows = useGameStore.getState().activeWindows.length > 0;
    const shouldOpenWindows = currentRoom && !hasAutoOpenedInbox.current && !hasStoredWindows;

    if (shouldOpenWindows) {
      hasAutoOpenedInbox.current = true;
      // Persist to localStorage so it survives refreshes
      try {
        localStorage.setItem('hasAutoOpenedInbox', 'true');
      } catch (e) {
        console.error('[GameDesktop] Failed to save hasAutoOpenedInbox:', e);
      }
      
      console.log('[GameDesktop] Auto-opening inbox and chat windows...', { 
        isSolo, 
        roomPhase: currentRoom.phase,
        hasCaseDefinition: !!caseDefinition 
      });
      
      const newWindows: WindowData[] = [];
      newWindows.push({ id: `win-inbox-auto`, title: 'صندوق الوارد', type: 'inbox' });
      if (!isSolo) {
        newWindows.push({ id: `win-chat-auto`, title: 'دردشة الفريق', type: 'chat' });
      }
      
      console.log('[GameDesktop] Setting windows:', newWindows.map(w => w.type));
      
      // Use setTimeout to skip a frame and avoid React's "cascading renders" warning 
      // when updating state synchronously in an effect based on other state.
      const timer = setTimeout(() => {
        setWindows(newWindows);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentRoom, isSolo, windows.length, setWindows, caseDefinition, engineSnapshot]);

  const openWindow = useCallback((type: string) => {
    if (type.startsWith('CHAR-') || type.startsWith('INT-')) {
       const suspectId = characterWindowTokenToCharacterId(type) ?? interrogationSourceRefToCharacterId(type);
       const suspectData = caseDefinition?.suspects?.find((s: Suspect) => s.character_id === suspectId);
       if (!suspectData) return;

       const winId = `interrogation-${suspectData.character_id}`;
       setWindows(prev => {
         if (prev.some(w => w.id === winId)) return bringWindowToFront(prev, winId);
         const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex ?? 500), 500);
         return [...prev, { id: winId, title: `استجواب: ${suspectData.name}`, type: 'interrogation', payload: suspectData, zIndex: maxZ + 1 }];
       });
       return;
    }

    if (type.startsWith('EVID-') || type.startsWith('CASE') || type.startsWith('LAB-') || type.startsWith('SCN-') || type.startsWith('DB-') || type.startsWith('OBJ-') || type.startsWith('DIG-')) {
      const evidenceData = caseDefinition?.evidence_list?.find((e: CaseEvidence) => e.evidence_id === type);
      if (!evidenceData) return;

      const state = useGameStore.getState().engineSnapshot?.evidenceStates[type] || 'locked';
      if (state === 'locked') {
        useGameStore.getState().addNotification({
          message: "هذا الملف مغلق حالياً. يجب فتح ومراجعة الأدلة المرتبطة به أولاً.",
          type: 'error'
        });
        return;
      }

      const dependencies = evidenceData.depends_on_evidence_ids || [];
      const missingDependencies = dependencies.filter((depId: string) => useGameStore.getState().engineSnapshot?.evidenceStates[depId] !== 'verified');
      if (missingDependencies.length > 0) {
        useGameStore.getState().addNotification({
          message: `عذراً، يجب مراجعة وتوثيق الأدلة السابقة أولاً لفتح هذا الملف: ${missingDependencies.join('، ')}`,
          type: 'warning'
        });
        return;
      }

      if (type === highlightedSourceRef) setHighlightedSourceRef(null);
      dispatchAction({ type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: type });
      
      // Smart File Suggestion: Check if this file unlocks any lab analyses
      const caseDef = useGameStore.getState().caseDefinition;
      const snapshot = useGameStore.getState().engineSnapshot;
      if (caseDef && snapshot) {
        const relatedLabEvidence = caseDef.evidence_list.filter(e => {
          const requiredFiles = e.lab_unlock_requires_evidence_ids || 
                               (e.lab_unlock_requires_evidence_id ? [e.lab_unlock_requires_evidence_id] : []);
          return requiredFiles.includes(type) && 
                 snapshot.evidenceStates[e.evidence_id] !== 'verified';
        });
        
        if (relatedLabEvidence.length > 0) {
          const labNames = relatedLabEvidence.map(e => e.title).join('، ');
          addNotification({
            message: `💡 فتح هذا الملف سيحلل: ${labNames}`,
            type: 'info'
          });
        }
      }
      
      // Auto-verify if no action is required AND evidence is not locked AND it's not a forensics item
      const isForensic = evidenceData.tags?.includes('forensics') || (evidenceData.route_weight?.forensics ?? 0) > 0;
      if (!evidenceData.ui_action && !isForensic) {
        // Track timeout in ref for cleanup on unmount
        const timer = setTimeout(() => {
          // Remove from tracking set
          activeTimeoutsRef.current.delete(timer);
          
          const currentState = useGameStore.getState();
          const latestSnapshot = currentState.engineSnapshot;
          // Double-check evidence state before sending action
          if (latestSnapshot && latestSnapshot.evidenceStates[type] !== 'locked') {
            const isObject = evidenceData.type === 'object';
            const actionType = isObject ? PLAYER_ACTION_TYPE.INSPECT_OBJECT : PLAYER_ACTION_TYPE.REVIEW_EVIDENCE;
            currentState.sendAction({ type: actionType, source_ref: type });
          }
        }, 100);
        
        // Add to tracking set
        activeTimeoutsRef.current.add(timer);
      }
      
      const evidenceId = `win-${type}`;
      setWindows(prev => {
        if (prev.some(w => w.id === evidenceId)) return bringWindowToFront(prev, evidenceId);
        const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex ?? 500), 500);
        return [...prev, { id: evidenceId, title: evidenceData.title, type: 'evidence', payload: evidenceData, zIndex: maxZ + 1 }];
      });
      return;
    }

    const id = `win-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
    let title = type;
    if (type === 'Chat') title = 'دردشة الفريق';
    if (type === 'Inbox') title = 'صندوق الوارد';
    if (type === 'StringBoard') title = 'لوحة الخيوط';
    if (type === 'Database') title = 'قاعدة البيانات';
    if (type === 'Timeline') title = 'الخط الزمني';
    if (type === 'Workbench') title = 'المختبر';
    if (type === 'Explorer') title = 'الأرشيف';
    if (type === 'Warrant') title = 'أمر الضبط';
    if (type === 'PHS') title = 'نظام المساعدة المتقدم (PHS)';

    const actionToType: Record<string, string> = {
      Chat: 'chat',
      Inbox: 'inbox',
      StringBoard: 'board',
      Database: 'database',
      Timeline: 'timeline',
      Workbench: 'workbench',
      Explorer: 'explorer',
      Warrant: 'warrant',
      PHS: 'phs'
    };
    const internalType = actionToType[type] || type.toLowerCase();
    if (type === highlightedSourceRef) setHighlightedSourceRef(null);

    setWindows(prev => {
      if (['Chat', 'Inbox', 'StringBoard', 'Database', 'Timeline', 'Workbench', 'Explorer', 'Warrant', 'PHS'].includes(type)) {
        const existingWindow = prev.find((w) => w.type === internalType);
        if (existingWindow) {
          return bringWindowToFront(prev, existingWindow.id);
        }
      }
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex ?? 500), 500);
      return [...prev, { id, title, type: internalType as WindowData['type'], zIndex: maxZ + 1 }];
    });
  }, [caseDefinition, highlightedSourceRef, dispatchAction]);

  const handleWindowFocus = useCallback((id: string) => {
    setWindows(prev => {
      const reordered = bringWindowToFront(prev, id);
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex ?? 500), 500);
      return reordered.map(win => 
        win.id === id 
          ? { ...win, zIndex: maxZ + 1 }
          : win
      );
    });
  }, []);

  const openArchivedEvidence = useCallback((archiveCaseId: string, evidenceId: string) => {
    const archiveCase = caseArchive.find((entry) => entry.caseId === archiveCaseId);
    if (!archiveCase) return;

    const evidence = archiveCase.caseDefinition.evidence_list.find((entry) => entry.evidence_id === evidenceId);
    if (!evidence) return;

    const windowId = `archive-${archiveCaseId}-${evidenceId}`;
    setWindows((prev) => {
      if (prev.some((windowEntry) => windowEntry.id === windowId)) {
        return bringWindowToFront(prev, windowId);
      }

      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex ?? 500), 500);
      return [
        ...prev,
        {
          id: windowId,
          title: `${archiveCase.caseTitle} / ${evidence.title}`,
          type: 'evidence',
          payload: {
            kind: 'archived_evidence',
            evidence,
            archiveCase,
          },
          zIndex: maxZ + 1,
        },
      ];
    });
  }, [caseArchive]);

  // PHS Hint Orchestration
  useEffect(() => {
    if (!revealedPhsHint) return;

    const { level, type, payload } = revealedPhsHint;
    const sourceRef = payload.source_ref;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (level === 'L1' && sourceRef) {
      timers.push(setTimeout(() => setHighlightedSourceRef(sourceRef), 0));
      timers.push(setTimeout(() => setHighlightedSourceRef(null), 10000));
      return () => timers.forEach(t => clearTimeout(t));
    }

    if (level === 'L2' || type === 'note') {
      addNotification({
        message: `🔎 ملاحظة المحقق: ${payload.text}`,
        type: 'info',
      });
    }

    if (level === 'L3' || type === 'message') {
      timers.push(setTimeout(() => {
        setWindows(prev => {
          if (prev.some(w => w.type === 'inbox')) return prev;
          const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex ?? 500), 500);
          return [{ id: `win-inbox-phs`, title: 'صندوق الوارد', type: 'inbox', zIndex: maxZ + 1 }, ...prev];
        });
      }, 0));
    }

    // L4-L6: Advanced orchestration
    if (['L4', 'L5', 'L6'].includes(level)) {
      addNotification({
        message: `🚨 تلميح متقدم: ${payload.text}`,
        type: 'warning',
      });
      timers.push(setTimeout(() => openWindow('PHS'), 0));
      if (sourceRef) {
        timers.push(setTimeout(() => setHighlightedSourceRef(sourceRef), 0));
      }
    }

    if (level === 'L7+' || type === 'direct') {
      if (sourceRef) {
        timers.push(setTimeout(() => openWindow(sourceRef), 0));
      }
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [revealedPhsHint, openWindow, addNotification]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);



  const handleRequestClosure = useCallback(() => {
    useGameStore.getState().requestClosure();
  }, []);

  const handleCloseRoom = useCallback(() => {
    useGameStore.getState().closeRoom();
  }, []);

  const isHost = currentRoom?.players.find(p => p.playerId === playerId)?.isHost ?? false;

  // Listen for phase changes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (currentRoom?.phase === 'tribunal') {
      if (isSolo) {
        timer = setTimeout(() => openWindow('Warrant'), 0);
      } else {
        void navigate(`/tribunal/${roomId}`);
      }
    }
    if (currentRoom?.phase === 'results') {
      void navigate(`/results/${roomId}`);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [currentRoom?.phase, isSolo, roomId, navigate, openWindow]);

  const renderWindowContent = useCallback((win: WindowData) => {
    return (
      <Suspense fallback={<div className="p-4 center-layout" style={{ height: '100%', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}><div className="loading-spinner"></div><div>جاري التحميل...</div></div>}>
        {(() => {
          switch (win.type) {
            case 'inbox': return <InboxPanel />;
            case 'phs': return <HintPanel />;
            case 'board': return <StringBoard />;
            case 'database': return <DatabaseSearch onOpenWindow={openWindow} />;
            case 'timeline': return <TimelineBoard />;
            case 'workbench': {
              const payload = win.payload as WorkbenchWindowPayload | undefined;
              return <ForensicsWorkbench initialSelectedEvidence={payload?.selectedEvidenceId} />;
            }
            case 'explorer': return <CaseFilesExplorer onOpenWindow={openWindow} onOpenArchivedEvidence={openArchivedEvidence} />;
            case 'warrant': return <ArrestWarrantModal />;
            case 'chat': return <TeamChatWindow />;
            case 'interrogation': {
              const suspect = win.payload as Suspect;
              if (!suspect || !('character_id' in suspect)) return <div>جاري التحميل...</div>;
              const supportedOptionIds = getMechanicallyLinkedDialogOptionIds(
                caseDefinition?.evidence_list,
                suspect.character_id,
              );
              
              return (
                <InterrogationChat
                  key={suspect.character_id}
                  suspectId={suspect.character_id}
                  suspectName={suspect.name}
                  supportedOptionIds={supportedOptionIds}
                  onClose={() => closeWindow(win.id)}
                />
              );
            }
            case 'evidence': {
              return (
                <EvidenceViewer
                  winPayload={win.payload}
                  engineSnapshot={engineSnapshot}
                  caseDefinition={caseDefinition}
                  dispatchAction={dispatchAction}
                  setWindows={setWindows}
                  bringWindowToFront={bringWindowToFront}
                />
              );
            }
            default: return <div>جاري التحميل...</div>;
          }
        })()}
      </Suspense>
    );
  }, [engineSnapshot, caseDefinition, dispatchAction, openArchivedEvidence, closeWindow, openWindow]);

  // Redirect to lobby if room is closed/left
  useEffect(() => {
    if (currentRoom) {
      hasEnteredRoom.current = true;
      return;
    }

    // Skip the lobby redirect during refresh/direct-open while auto-rejoin is still resolving.
    if (!hasEnteredRoom.current && roomId) {
      return;
    }

    if (!currentRoom && connected) {
      void navigate('/lobby');
    }
  }, [currentRoom, connected, navigate, roomId]);

  if (!caseDefinition || !engineSnapshot) {
    const errorNotif = notifications.find(n => n.type === 'error');
    return (
      <div className="desktop-shell">
        <div className="loading-screen" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <div>جاري تهيئة بيئة التحقيق...</div>
          {errorNotif && (
            <div style={{
              background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
              padding: '1.5rem', borderRadius: '12px', color: '#ffcccc',
              display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center',
              maxWidth: '450px', textAlign: 'center', fontSize: '0.95rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ff4d4d' }}>⚠️ تنبيه: تعذر إكمال العملية</div>
              <div style={{ lineHeight: '1.5' }}>
                {errorNotif.message.includes('لا يمكن الانضمام') ? 'لا يمكن الانضمام لهذه الغرفة، قد تكون ممتلئة أو لم تعد متاحة.' :
                 errorNotif.message.includes('الغرفة غير موجودة') ? 'عذراً، الغرفة التي تحاول الانضمام إليها غير موجودة أو تم إغلاقها.' :
                 errorNotif.message.includes('غير صالح') ? 'حدث خطأ في مزامنة البيانات مع السيرفر. يرجى المحاولة مرة أخرى.' :
                 errorNotif.message}
              </div>
              <button className="btn" onClick={() => {
                useGameStore.getState().removeNotification(errorNotif.id);
                void navigate('/lobby');
              }} style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                العودة لقاعة الانتظار
              </button>
            </div>
          )}
        </div>
        <ToastStack />
      </div>
    );
  }

  return (
    <div className="desktop-shell">
      {/* Shadow Message Overlay */}
      {shadowMessage && (
        <ShadowMessage message={shadowMessage} onDismiss={() => useGameStore.getState().dismissShadow()} />
      )}

      <main className="workspace" ref={workspaceRef}>
        <div className="workspace-overlay" />

        <div className="case-status-banner" style={{
          position: 'absolute',
          top: isCompactViewport ? '1.25rem' : '3rem',
          left: isCompactViewport ? '50%' : 'calc((100% - 280px) / 2)',
          transform: 'translateX(-50%)',
          width: isCompactViewport ? 'calc(100% - 1rem)' : 'min(860px, calc(100% - 280px - 2rem))',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <div
            ref={topBannerRef}
            className="case-status-panel"
            style={{
            padding: isCompactViewport ? '0.5rem' : '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: isCompactViewport ? '0.4rem' : '0.6rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{ fontSize: isCompactViewport ? '0.85rem' : '1rem', fontWeight: 700, color: '#fff' }}>
                  {isCompactViewport
                    ? `القضية ${currentCaseNumber}`
                    : `أنت الآن في القضية ${formatCaseOrdinal(currentCaseNumber)} من ${TOTAL_CASES} مخططة`}
                </span>
                <span style={{ fontSize: isCompactViewport ? '0.68rem' : '0.8rem', color: 'var(--text-secondary)', maxWidth: isCompactViewport ? '180px' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {caseDefinition?.title || 'جاري التحميل...'}
                </span>
              </div>
              <span className="mono-text" style={{ fontSize: isCompactViewport ? '0.62rem' : '0.78rem', color: 'rgba(255,255,255,0.58)' }}>
                {caseDefinition?.case_id?.toUpperCase() || 'CASE --'}
              </span>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isCompactViewport ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: isCompactViewport ? '0.75rem' : '1.25rem' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: isCompactViewport ? '0.7rem' : '0.76rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📁 {isCompactViewport ? 'التقدم العام' : 'التقدم العام'}
                  </span>
                  <span className="mono-text">{formatCaseOrdinal(currentCaseNumber)} / {TOTAL_CASES} مخططة · {IMPLEMENTED_CASES} منفذة</span>
                </div>
                <div style={{ position: 'relative', height: isCompactViewport ? '8px' : '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'visible' }}>
                  <div style={{
                    width: `${overallProgressPercent}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
                    boxShadow: '0 0 12px rgba(249, 115, 22, 0.35)',
                    transition: 'width 0.3s ease',
                  }} />
                  {currentCaseNumber !== null && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: `calc(${overallProgressPercent}% - 7px)`,
                      transform: 'translateY(-50%)',
                      width: '14px',
                      height: '14px',
                      borderRadius: '999px',
                      background: '#fff4d6',
                      border: '2px solid rgba(249, 115, 22, 0.95)',
                      boxShadow: '0 0 14px rgba(249, 115, 22, 0.45)',
                    }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: isCompactViewport ? '0.7rem' : '0.76rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🔍 {isCompactViewport ? 'تقدم القضية' : 'تقدم القضية'}
                  </span>
                  <span className="mono-text">{verifiedEvidenceCount} / {totalEvidenceCount} ({Math.round(currentCaseVerifiedPercent)}%)</span>
                </div>
                <div style={{ position: 'relative', height: isCompactViewport ? '8px' : '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${currentCaseProgressPercent}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, var(--interaction-cool) 0%, #34c759 100%)',
                    boxShadow: '0 0 12px rgba(52, 199, 89, 0.25)',
                    transition: 'width 0.3s ease',
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${currentCaseVerifiedPercent}%`,
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)',
                    boxShadow: '0 0 12px rgba(21, 128, 61, 0.28)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="workspace-center">
          <div className="workspace-title-box">
            <h1 className="workspace-title">نظام التحقيق الموحد</h1>
            
            {/* Current Objective / Next Step - HIGHEST VISUAL PRIORITY */}
            <div className="current-objective-card" style={{
              marginTop: '2.5rem',
              padding: isCompactViewport ? '1rem 1.5rem' : '1.75rem 3rem',
              background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15) 0%, rgba(10, 25, 45, 0.95) 100%)',
              border: '3px solid rgba(77, 163, 255, 1)',
              backdropFilter: 'blur(20px)',
              display: 'inline-flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              boxShadow: '0 0 60px rgba(77, 163, 255, 0.35), 0 8px 32px rgba(0,0,0,0.6), inset 0 0 30px rgba(77, 163, 255, 0.15)',
              animation: 'pulse-glow-strong 2.5s infinite alternate',
              position: 'relative',
              overflow: 'hidden',
              maxWidth: '90vw'
            }}>
              {/* Decorative corner accents */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', width: '20px', height: '20px', borderTop: '3px solid rgba(255,255,255,0.5)', borderLeft: '3px solid rgba(255,255,255,0.5)' }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderTop: '3px solid rgba(255,255,255,0.5)', borderRight: '3px solid rgba(255,255,255,0.5)' }} />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '20px', height: '20px', borderBottom: '3px solid rgba(255,255,255,0.5)', borderLeft: '3px solid rgba(255,255,255,0.5)' }} />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '20px', height: '20px', borderBottom: '3px solid rgba(255,255,255,0.5)', borderRight: '3px solid rgba(255,255,255,0.5)' }} />
              
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: isCompactViewport ? '0.9rem' : '1.15rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 2px 10px rgba(77, 163, 255, 0.6)' }}>
                <span style={{ fontSize: '1.4em' }}>🎯</span>
                <span>الهدف الحالي</span>
              </span>
              <span style={{ fontSize: isCompactViewport ? '1.05rem' : '1.35rem', color: '#ffffff', textAlign: 'center', fontWeight: 700, textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)', lineHeight: '1.6', padding: '0 1rem' }}>
                {discoveredEvidenceCount === 0 
                  ? '📬 تفقد صندوق الوارد (Inbox) لبدء التحقيق.' 
                  : discoveredEvidenceCount > verifiedEvidenceCount 
                    ? '📂 اضغط على الأدلة في الحقيبة الجانبية لمراجعتها وتوثيقها.'
                    : '🔍 ابحث عن خيوط جديدة أو استجوب المشتبه بهم.'}
              </span>
              {/* Subtle hint text */}
              <span style={{ fontSize: isCompactViewport ? '0.7rem' : '0.8rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', textAlign: 'center' }}>
                {discoveredEvidenceCount === 0 
                  ? '💡 ابدأ بقراءة الرسائل الواردة' 
                  : discoveredEvidenceCount > verifiedEvidenceCount 
                    ? '💡 كل دليل يحتاج إلى مراجعة قبل الانتقال للتالي'
                    : '💡 استخدم الأدوات في الشريط السفلي للمساعدة'}
              </span>
            </div>
            <style>{`
              @keyframes pulse-glow-strong {
                0% { box-shadow: 0 0 20px rgba(77, 163, 255, 0.25), inset 0 0 15px rgba(77, 163, 255, 0.15); border-color: rgba(77, 163, 255, 0.6); }
                100% { box-shadow: 0 0 50px rgba(77, 163, 255, 0.6), inset 0 0 30px rgba(77, 163, 255, 0.3); border-color: rgba(102, 179, 255, 1); }
              }
            `}</style>
          </div>
        </div>

        {windows.map((win, index) => {
          const isEvidence = win.type === 'evidence';
          const isToolWindow = !isEvidence; // All non-evidence windows are tool windows
          const isWideWindow = ['explorer', 'timeline', 'database', 'board'].includes(win.type);
          const isMediumWindow = ['interrogation', 'workbench'].includes(win.type);
          const isInboxWindow = win.type === 'inbox';
          const isChatWindow = win.type === 'chat';

          // Tool windows open fullscreen (docked to fill area between progress & taskbar, beside sidebar)
          const shouldDockFullscreen = isToolWindow;
          
          // Evidence windows should look like vertical papers by default
          const desiredWidth = isEvidence ? 600 : (isWideWindow ? 800 : (isMediumWindow ? 500 : (isInboxWindow ? 850 : (isChatWindow ? 350 : 400))));
          const desiredHeight = isEvidence ? 800 : (isWideWindow ? 600 : (isInboxWindow ? 600 : (isChatWindow ? 500 : 500)));
          
          // Dock all tool windows fullscreen; evidence only docks on mobile
          const shouldDockWindow = shouldDockFullscreen || (isCompactViewport && isEvidence);
          
          const defaultWidth = Math.min(desiredWidth, windowMaxWidth);
          const defaultHeight = Math.min(desiredHeight, windowMaxHeight);
          const minWidth = Math.min(isWideWindow || isEvidence ? 400 : 300, defaultWidth);
          
          // Center evidence windows for better visibility
          const centerX = Math.max(windowStartX, (windowBoundsWidth - defaultWidth) / 2);
          const centerY = Math.max(windowSafeTop, (windowBoundsHeight - windowSafeTop - windowLayout.safeBottom - defaultHeight) / 2) + windowSafeTop;
          
          const offsetX = Math.min(index * windowCascadeOffset, Math.max(0, windowBoundsWidth - defaultWidth - windowStartX));
          const offsetY = Math.min(index * windowCascadeOffset, Math.max(0, windowMaxHeight - 120));
          
          const initialX = isEvidence ? centerX + (index % 5) * 15 : windowStartX + offsetX;
          const initialY = isEvidence ? centerY + (index % 5) * 15 : windowSafeTop + offsetY;
          
          // Set minTop to windowSafeTop to leave space for the top banner/progress bar
          const effectiveMinTop = windowSafeTop;
          
          // Allow windows to be dragged over the taskbar by using full viewport height for bounds
          const effectiveBoundsHeight = windowHeight;
          
          return (
            <EvidenceWindow
              key={win.id}
              id={win.id}
              title={win.title}
              type={win.type}
              onClose={closeWindow}
              onFocus={() => handleWindowFocus(win.id)}
              defaultPosition={{ x: initialX, y: initialY }}
              defaultWidth={defaultWidth}
              defaultHeight={defaultHeight}
              minWidth={minWidth}
              minTop={effectiveMinTop}
              maxWidth={windowBoundsWidth}
              maxHeight={effectiveBoundsHeight}
              boundsWidth={windowBoundsWidth}
              boundsHeight={effectiveBoundsHeight}
              docked={shouldDockWindow}
              toolFullscreen={shouldDockFullscreen}
              zIndex={win.zIndex ?? (500 + index)}
            >
              {renderWindowContent(win)}
            </EvidenceWindow>
          );
        })}

        <Suspense fallback={null}>
          <InventoryPanel 
            items={inventoryItems} 
            onItemClick={(id) => {
              openWindow(id);
              if (window.innerWidth <= 768) setIsMobileInventoryOpen(false);
            }} 
            highlightedSourceRef={highlightedSourceRef}
            isOpenMobile={isMobileInventoryOpen}
            onCloseMobile={() => setIsMobileInventoryOpen(false)}
          />
        </Suspense>
      </main>

      <Taskbar
        activeWindow={windows.length > 0 ? windows[windows.length - 1].title : null}
        onOpenWindow={openWindow}
        trustScore={trustScore}
        specialty={currentSpecialty || 'timeline'}
        isSolo={isSolo}
        isHost={isHost}
        onSwitchSpecialty={() => {
          const specs: Specialty[] = ['timeline', 'forensics', 'behavioral'];
          const idx = specs.indexOf(currentSpecialty || 'timeline');
          useGameStore.getState().selectSpecialty(specs[(idx + 1) % 3]);
        }}
        onRequestClosure={handleRequestClosure}
        onCloseRoom={handleCloseRoom}
        onRequestSolution={requestSolution}
        solutionRequests={solutionRequests}
        totalPlayers={currentRoom?.players.length || 1}
        highlightedSourceRef={highlightedSourceRef}
        onToggleInventory={() => setIsMobileInventoryOpen(!isMobileInventoryOpen)}
        isInventoryOpen={isMobileInventoryOpen}
        currentCaseNumber={currentCaseNumber}
        discoveredEvidenceCount={evidenceStats.discovered}
        verifiedEvidenceCount={evidenceStats.verified}
      />

      {/* Consensus Reveals - For L4+ or Legacy Hints */}
      {revealedHint && (!revealedPhsHint || ['L4', 'L5', 'L6', 'L7+'].includes(revealedPhsHint.level)) && (
        <ConsensusModal 
          type="hint" 
          data={revealedHint} 
          onClose={() => useGameStore.setState({ revealedHint: null, revealedPhsHint: null })} 
        />
      )}
      {revealedSolution && (
        <ConsensusModal 
          type="solution" 
          data={revealedSolution} 
          onClose={() => useGameStore.setState({ revealedSolution: null })} 
        />
      )}

      {/* Toast Notifications */}
      <ToastStack />
      
      {/* UI Anomalies - Paranoia Layer */}
      <SystemAnomaly />
    </div>
  );
};
