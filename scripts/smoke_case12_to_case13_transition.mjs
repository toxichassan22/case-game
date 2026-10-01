import { chromium } from 'playwright';
import {
  assert,
  cleanupProcesses,
  dispatchActionWithFallback,
  dispatchScenarioSteps,
  invokeStoreMethod,
  launchSmokeBrowser,
  registerConsoleCapture,
  registerProfile,
  startLocalStack,
  waitForPathname,
} from './smoke_helpers.mjs';
import {
  CASE01_FALSE_SUCCESS_ATTEMPT,
  CASE01_FALSE_SUCCESS_STEPS,
} from './smoke_case01_scenarios.mjs';

const startedChildren = [];

const CASE02_MINIMAL_STEPS = [
  { type: 'open_source', source_ref: 'BK-SRC-01' },
  { type: 'review_evidence', source_ref: 'BK-SRC-01' },
  { type: 'open_source', source_ref: 'BK-OBJ-01' },
  { type: 'inspect_object', source_ref: 'BK-OBJ-01' },
];

const CASE02_FALSE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'char_ibrahim_giar',
  submitted_motive: 'motive_insurance_fraud',
  submitted_method_or_timeline: 'magnetic_pulse',
  submitted_evidence_ids: ['BK-DOC-01', 'BK-SRC-01', 'BK-OBJ-01'],
};

const CASE03_MINIMAL_STEPS = [
  { type: 'inspect_object', source_ref: 'CASE03_MED_BOX' },
  { type: 'review_evidence', source_ref: 'CASE03_VICTIM_PHONE' },
  { type: 'review_evidence', source_ref: 'CASE03_ADEL_FINANCE' },
  { type: 'review_evidence', source_ref: 'LAB-TOX-03' },
];

const CASE03_FALSE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-03-01',
  submitted_motive: 'motive_natural_heart_attack',
  submitted_method_or_timeline: 'method_chemical_poisoning',
  submitted_evidence_ids: ['EVID-03-01', 'EVID-03-02', 'EVID-03-03'],
};

const CASE04_MINIMAL_STEPS = [
  { type: 'inspect_object', source_ref: 'CASE04_KEYSET' },
  { type: 'review_evidence', source_ref: 'LAB-DOC-04' },
  { type: 'review_evidence', source_ref: 'CASE04_CCTV_LOG' },
];

const CASE04_FALSE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-04-NONE',
  submitted_motive: 'motive_natural_stroke',
  submitted_method_or_timeline: 'method_covert_assassination_forgery',
  submitted_evidence_ids: ['EVID-04-02', 'EVID-04-03', 'EVID-04-04'],
};

const CASE05_MINIMAL_STEPS = [
  { type: 'inspect_object', source_ref: 'CASE05_BODY_NECK' },
  { type: 'review_evidence', source_ref: 'LAB-TOX-05' },
  { type: 'inspect_object', source_ref: 'CASE05_HIDDEN_USB' },
  { type: 'inspect_object', source_ref: 'CASE05_CIGARETTE' },
  { type: 'review_evidence', source_ref: 'LAB-DNA-05' },
];

const CASE05_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-05-01',
  submitted_motive: 'motive_conceal_forgery',
  submitted_method_or_timeline: 'method_institutional_forgery_homocide',
  submitted_evidence_ids: ['EVID-05-01', 'EVID-05-02', 'EVID-05-03'],
};

const CASE06_MINIMAL_STEPS = [
  { type: 'inspect_object', source_ref: 'CASE06_ROPE' },
  { type: 'review_evidence', source_ref: 'LAB-LING-06' },
];

const CASE06_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-06-NONE',
  submitted_motive: 'motive_psychological_manipulation_murder',
  submitted_method_or_timeline: 'method_psychological_manipulation_murder',
  submitted_evidence_ids: ['EVID-06-01', 'EVID-06-02', 'EVID-06-03'],
};

const CASE07_MINIMAL_STEPS = [
  { type: 'review_evidence', source_ref: 'LAB-DOC-07' },
  { type: 'choose_dialog_option', source_ref: 'INT-GABER-01', interaction_id: 'Q02' },
];

const CASE07_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-07-01',
  submitted_motive: 'motive_conceal_forgery_network',
  submitted_method_or_timeline: 'method_institutional_forgery_assault',
  submitted_evidence_ids: ['EVID-07-01', 'EVID-07-02', 'EVID-07-03'],
};

const CASE08_MINIMAL_STEPS = [
  { type: 'inspect_object', source_ref: 'CASE08_BANK_RECORDS' },
  { type: 'review_evidence', source_ref: 'LAB-CYBER-08' },
  { type: 'choose_dialog_option', source_ref: 'INT-SAYED-01', interaction_id: 'Q04' },
];

const CASE08_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-08-01',
  submitted_motive: 'motive_clockmaker_field_test',
  submitted_method_or_timeline: 'method_digital_identity_theft',
  submitted_evidence_ids: ['EVID-08-01', 'EVID-08-02', 'EVID-08-03'],
};

const _CASE09_MINIMAL_STEPS = [
  { type: 'review_evidence', source_ref: 'LAB-CYBER-09' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-09-01-08' },
];

const CASE09_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-09-01',
  submitted_motive: 'motive_clockmaker_coverup',
  submitted_method_or_timeline: 'method_evidence_tampering_bombing',
  submitted_evidence_ids: ['EVID-09-01', 'EVID-09-02', 'EVID-09-03'],
};

const CASE10_PROGRESS_STEPS = [
  { type: 'review_evidence', source_ref: 'LAB-MED-10' },
  { type: 'inspect_object', source_ref: 'CASE10_SECURITY_FOOTAGE_LOG' },
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'review_evidence', source_ref: 'LAB-DOC-10' },
  { type: 'choose_dialog_option', source_ref: 'INT-SAMEH-01', interaction_id: 'Q05' },
];

const CASE10_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-10-01',
  submitted_motive: 'motive_trinity_liquidation',
  submitted_method_or_timeline: 'method_syndicate_assassination',
  submitted_evidence_ids: ['EVID-10-01', 'EVID-10-02', 'EVID-10-03', 'EVID-10-04'],
};

const CASE11_PROGRESS_STEPS = [
  { type: 'review_evidence', source_ref: 'CASE11_SARAH_ARTICLE' },
  { type: 'review_evidence', source_ref: 'LAB-MED-11' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-11-01' },
];

const CASE11_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-11-01',
  submitted_motive: 'motive_trinity_silencing',
  submitted_method_or_timeline: 'method_syndicate_liquidation',
  submitted_evidence_ids: ['EVID-11-01', 'EVID-11-02', 'EVID-11-03'],
};

const CASE12_PROGRESS_STEPS = [
  { type: 'choose_dialog_option', source_ref: 'INT-MOHAMED-01', interaction_id: 'Q02' },
  { type: 'choose_dialog_option', source_ref: 'INT-MOHAMED-01', interaction_id: 'Q04' },
  { type: 'review_evidence', source_ref: 'LAB-CYBER-12' },
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
];

const CASE12_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-12-01',
  submitted_motive: 'motive_whisperer_manipulation',
  submitted_method_or_timeline: 'method_proxy_family_murder',
  submitted_evidence_ids: ['EVID-12-01', 'EVID-12-02', 'EVID-12-03'],
};

const CASE13_PROGRESS_STEPS = [
  { type: 'review_evidence', source_ref: 'LAB-TOX-13' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-13-CCTV' },
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'review_evidence', source_ref: 'CASE13_KAMAL_NOTES' },
];

async function readStoreSummary(page) {
  return page.evaluate(async () => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const state = useGameStore.getState();
    return {
      roomId: state.currentRoom?.roomId ?? null,
      phase: state.currentRoom?.phase ?? null,
      caseId: state.engineSnapshot?.case_id ?? null,
      caseArchiveLength: state.caseArchive.length,
      nextCaseLoading: state.nextCaseLoading,
      lastDecision: state.closureResult ?? state.engineSnapshot?.lastClosureDecision ?? null,
      case13State01: state.engineSnapshot?.evidenceStates?.['EVID-13-01'] ?? null,
      case13State02: state.engineSnapshot?.evidenceStates?.['EVID-13-02'] ?? null,
      case13State03: state.engineSnapshot?.evidenceStates?.['EVID-13-03'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

async function closeSoloCase(page, attempt, expectedAcceptedMessage) {
  await page.evaluate(async () => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    useGameStore.setState({ closureResult: null });
  });
  await invokeStoreMethod(
    page,
    'requestClosure',
    [],
    "state => state.currentRoom?.phase === 'tribunal'",
    12_000,
    'Timed out while waiting for solo tribunal phase',
  );
  await invokeStoreMethod(
    page,
    'submitTribunalAccusation',
    [attempt],
    "state => state.currentRoom?.phase === 'results' && state.closureResult?.accepted === true",
    12_000,
    'Timed out while waiting for accepted closure result',
  );
  await waitForPathname(page, /^\/results\/[^/]+$/);
  await page.getByText(expectedAcceptedMessage).waitFor({ timeout: 20_000 });
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];

    registerConsoleCapture(page, consoleErrors);
    await registerProfile(page, 'Case13 Transition Investigator');

    await page.getByRole('button', { name: /ابدأ Solo/ }).click();
    await waitForPathname(page, /^\/game\/[^/]+$/);
    await page.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(page.url()).pathname.split('/').pop();
    assert(roomSlug, 'Solo game URL did not include a room id');

    await dispatchScenarioSteps(page, CASE01_FALSE_SUCCESS_STEPS);
    await closeSoloCase(page, CASE01_FALSE_SUCCESS_ATTEMPT, 'القضية أُغلقت جزئيًا');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE02_MINIMAL_STEPS);
    await closeSoloCase(page, CASE02_FALSE_SUCCESS_ATTEMPT, 'القضية أُغلقت جزئيًا');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 03 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE03_MINIMAL_STEPS);
    await closeSoloCase(page, CASE03_FALSE_SUCCESS_ATTEMPT, 'القضية أُغلقت جزئيًا');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 04 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE04_MINIMAL_STEPS);
    await closeSoloCase(page, CASE04_FALSE_SUCCESS_ATTEMPT, 'القضية أُغلقت جزئيًا');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 05 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE05_MINIMAL_STEPS);
    await closeSoloCase(page, CASE05_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 06 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE06_MINIMAL_STEPS);
    await closeSoloCase(page, CASE06_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 07 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE07_MINIMAL_STEPS);
    await closeSoloCase(page, CASE07_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 08 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE08_MINIMAL_STEPS);
    await closeSoloCase(page, CASE08_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 09 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, [{ type: 'review_evidence', source_ref: 'LAB-CYBER-09' }]);
    await dispatchActionWithFallback(
      page,
      { type: 'lock_timeline_event', interaction_id: 'LINK-09-01-08' },
      { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
      'Expected case09 timeline link to advance after queue-pressure delay',
    );
    await closeSoloCase(page, CASE09_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 10 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE10_PROGRESS_STEPS);
    await closeSoloCase(page, CASE10_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 11 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE11_PROGRESS_STEPS);
    await closeSoloCase(page, CASE11_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 12 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE12_PROGRESS_STEPS);
    await closeSoloCase(page, CASE12_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 13 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE13_PROGRESS_STEPS);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case13 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case13 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case13',
      `Expected runtime snapshot for case13, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 12,
      `Expected all previous cases to be archived, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case13State01 === 'verified',
      `Expected case13 toxin evidence to verify, got ${storeSummary.case13State01}`,
    );
    assert(
      storeSummary.case13State02 === 'verified',
      `Expected case13 notes evidence to verify, got ${storeSummary.case13State02}`,
    );
    assert(
      storeSummary.case13State03 === 'verified',
      `Expected case13 CCTV evidence to verify, got ${storeSummary.case13State03}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case13 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('operation_symmetry_named'),
      `Expected case11 intel flag to persist into case13 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('whisperer_escalation'),
      `Expected case12 whisperer escalation flag to persist into case13 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case13_resolved_true'),
      `Expected case13 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case13 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case13 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case12 to case13 transition flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
