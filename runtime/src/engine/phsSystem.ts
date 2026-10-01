import { EVENT_NAME } from "./constants.js";
import { type EngineState, recordEvent, addNotice } from "./store.js";
import type { 
  DomainEvent, 
  PhsHint, 
  PhsHintLevel, 
  PhsHintType, 
  RuntimeCaseDefinition 
} from "../types.js";

export function generatePhsHint(state: EngineState, definition: RuntimeCaseDefinition): DomainEvent | null {
  const phs = state.phsState;
  const maxLevels = Math.min(definition.maxPhsLevels ?? 7, 7);
  
  // 1. Detect Progress
  const currentVerifiedCount = state.verifiedEvidenceIds.size;
  const currentClosureBucketSize = state.closureBuckets.behavioralVerified.size + state.closureBuckets.crossRouteVerified.size;
  
  const madeProgress = currentVerifiedCount > phs.lastVerifiedCount || currentClosureBucketSize > phs.lastClosureBucketSize;
  
  // Track if this is the first hint request ever for this session
  const isFirstRequest = phs.lastProgressTick === 0 && phs.activeHint === null;

  if (madeProgress || isFirstRequest) {
    phs.lastVerifiedCount = currentVerifiedCount;
    phs.lastClosureBucketSize = currentClosureBucketSize;
    // Reset hint level when progress is made so the player gets subtle hints for the next step
    if (madeProgress) {
      phs.currentLevel = 1;
    }
  } else {
    // Increment level if no progress and not the first request
    if (phs.currentLevel < maxLevels) {
      phs.currentLevel++;
    }
  }
  
  phs.lastProgressTick = state.currentTick;
  
  // 2. Identify the "Stuck Point" (Next Best Action)
  let targetEvidenceId: string | null = null;
  let missingReason: string | null = null;
  
  // Prioritize partial evidence
  for (const evidence of definition.evidence_list) {
    if (state.evidenceStates[evidence.evidence_id] === "partial" && !state.verifiedEvidenceIds.has(evidence.evidence_id)) {
      targetEvidenceId = evidence.evidence_id;
      missingReason = "missing_partial_evidence";
      break;
    }
  }
  
  // Followed by closure requirements
  if (!targetEvidenceId) {
    if (state.closureBuckets.behavioralVerified.size < definition.closure_rules.validate_closure.minimum_behavioral_chain_verified) {
      missingReason = "missing_behavioral_chain";
    } else if (state.closureBuckets.crossRouteVerified.size < definition.closure_rules.validate_closure.minimum_cross_route_verified) {
      missingReason = "missing_cross_route_evidence";
    }
  }
  
  // 3. Select/Generate Hint
  const level: PhsHintLevel = phs.currentLevel <= maxLevels 
    ? `L${phs.currentLevel}` as PhsHintLevel 
    : `L${maxLevels}+` as PhsHintLevel;
  
  let hint: PhsHint | null = null;
  
  // Try to find a specific PHS hint in the definition with tiered matching
  if (definition.phs_hints) {
    // Tier 1: Exact matching for evidence stuck points
    if (targetEvidenceId) {
      hint = definition.phs_hints.find(h => h.level === level && h.payload.source_ref === targetEvidenceId) || null;
    }
    
    // Tier 2: Generic level-only hints (no source_ref or 'generic')
    if (!hint) {
      hint = definition.phs_hints.find(h => h.level === level && (!h.payload.source_ref || h.payload.source_ref === 'generic')) || null;
    }
    
    // Tier 3: Reason-aware closure hints (if no targetEvidenceId)
    if (!hint && !targetEvidenceId && missingReason) {
      hint = definition.phs_hints.find(h => h.level === level && (h.payload.metadata?.reason === missingReason)) || null;
    }
  }
  
  // Fallback to generic hint generation if no specific hint found
  if (!hint) {
    hint = createFallbackHint(level, targetEvidenceId, missingReason, definition, state);
  }
  
  phs.activeHint = hint;
  
  // 4. Emit Event
  const event: DomainEvent = {
    event_name: EVENT_NAME.PHS_HINT_REVEALED,
    source_type: "system",
    source_ref: "phs_system",
    interaction_id: `hint_${level}_${state.currentTick}`,
    player_action: "request_phs",
    result: JSON.stringify(hint),
    tick: state.currentTick
  };
  
  recordEvent(state, event);
  addNotice(state, state.currentTick, "phs_hint_revealed", `Hint ${level} revealed.`);
  
  return event;
}

function createFallbackHint(level: PhsHintLevel, targetEvidenceId: string | null, reason: string | null, definition: RuntimeCaseDefinition, state: EngineState): PhsHint {
  let text = "واصل التحقيق.";
  let type: PhsHintType = "note";
  
  // Extract number from level (e.g., "L1" -> 1)
  const levelNum = parseInt(level.substring(1)) || 1;
  const isEscalated = level.includes("+");

  if (targetEvidenceId) {
    const evidence = definition.evidence_list.find(e => e.evidence_id === targetEvidenceId);
    const title = evidence?.title || targetEvidenceId;
    
    const templates: Record<number, { text: string; type: PhsHintType }> = {
      1: { type: "highlight", text: `يوجد تفصيل ناقص هنا. افتح "${title}" وقم بتحليله لتوثيقه.` },
      2: { type: "note", text: `دليل "${title}" غير مكتمل. ابحث عن دليل أو إفادة أخرى تطابقه وقم بالربط بينهما.` },
      3: { type: "message", text: `مكتب التحقيقات: لا يمكننا اعتماد "${title}" كدليل قاطع حتى الآن. يجب مطابقة الدليل مع مصدر آخر لإثباته.` },
    };

    const config = templates[levelNum] || { 
      type: "direct", 
      text: isEscalated 
        ? `النظام (تحذير): لتوثيق "${title}" فوراً، طابقه مع الدليل المكمل له في لوحة الأدلة.` 
        : `النظام: لتوثيق "${title}"، طابقه مع الدليل المكمل له عن طريق الربط بينهما لإنشاء دليل موثق.` 
    };
    
    type = config.type;
    text = config.text;

  } else if (reason === "missing_behavioral_chain") {
    const chainIds = definition.closure_rules.validate_closure.behavioral_chain_evidence_ids || [];
    const missing = chainIds.find(id => !state.verifiedEvidenceIds.has(id));
    const title = missing ? (definition.evidence_list.find(e => e.evidence_id === missing)?.title || missing) : null;
    
    const templates: Record<number, { text: string; type: PhsHintType }> = {
      1: { 
        type: "highlight", 
        text: title 
          ? `تصرفات المشتبه به غير مفهومة. ابحث في أدلة مثل "${title}" لتوضيح دافعه.` 
          : `نحتاج إلى توضيح سلوك المشتبه بهم ودوافعهم للتقدم في القضية.` 
      },
      2: { 
        type: "note", 
        text: title
          ? `لإثبات الدافع، ابحث عن تصرفات أو أقوال سابقة تطابق تصرفاً في "${title}" وقم بربطها معاً.`
          : `لإثبات الدافع، اربط بين أدلة تصرفات المشتبه بهم والأدلة المادية الأخرى.` 
      },
      3: { 
        type: "message", 
        text: title
          ? `مكتب التحقيقات: يجب إثبات الدافع أو النية. قم بمطابقة "${title}" مع دليل يدل على القصد الجنائي.`
          : `مكتب التحقيقات: القضية ينقصها الدافع... طابق الأدلة التي تثبت النية لتأسيس سلسلة سلوكية.` 
      },
    };

    const config = templates[levelNum] || { 
      type: "direct", 
      text: title
        ? `النظام: السلسلة السلوكية ناقصة. قم بربط "${title}" مع الأدلة الداعمة له لإثبات الدافع الملموس.`
        : `النظام: إغلاق القضية يتطلب سلسلة سلوكية. اربط الأدلة المتعلقة بسلوك وتصرفات المشتبه بهم لتوثيق الدافع.` 
    };

    type = config.type;
    text = config.text;

  } else if (reason === "missing_cross_route_evidence") {
    const routeIds = definition.closure_rules.validate_closure.cross_route_evidence_ids || [];
    const missing = routeIds.find(id => !state.verifiedEvidenceIds.has(id));
    const title = missing ? (definition.evidence_list.find(e => e.evidence_id === missing)?.title || missing) : null;
    
    const templates: Record<number, { text: string; type: PhsHintType }> = {
      1: { 
        type: "highlight", 
        text: title
          ? `الأدلة لدينا من مصدر واحد فقط. نحتاج دعماً مثل "${title}" من مسار مختلف تماماً.`
          : `روايتك تعتمد على مسار تحقيق واحد فقط. ابحث عن مصادر مختلفة وقم بمقاطعتها.` 
      },
      2: { 
        type: "note", 
        text: title
          ? `لتعزيز قوة "${title}"، ابحث عن دليل من مصدر مختلف (كالشهود أو المستندات) وقم بربطهما.`
          : `لتقوية مسار التحقيق، طابق الأدلة المادية مثلاً مع أقوال الشهود لإنشاء تقاطع متين في الأدلة.` 
      },
      3: { 
        type: "message", 
        text: title
          ? `مكتب التحقيقات: لن تقبل القضية بدون فئات مختلفة من الأدلة. اربط "${title}" مع دليل معاكس لتكوين تقاطع.`
          : `مكتب التحقيقات: لا زلنا نحتاج إلى أدلة متقاطعة لدعم الرواية. اربط المستندات باعترافات الشهود مثلاً.` 
      },
    };

    const config = templates[levelNum] || { 
      type: "direct", 
      text: title
        ? `النظام: لتوثيق التقاطع، يجب عليك مطابقة "${title}" مع دليل من مسار مختلف لتكوين صلة قاطعة.`
        : `النظام: لاكتمال إغلاق القضية، يجب سحب أدلة من مسارات مختلفة (أقوال، مستندات، فحص فني) وربطها معاً.` 
    };

    type = config.type;
    text = config.text;
  }
  
  return {
    level,
    type,
    payload: {
      text,
      source_ref: targetEvidenceId || undefined
    }
  };
}
