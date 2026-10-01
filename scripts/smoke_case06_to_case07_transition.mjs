import { chromium } from 'playwright';
import {
  FRONTEND_URL,
  assert,
  cleanupProcesses,
  dispatchScenarioSteps,
  invokeStoreMethod,
  launchSmokeBrowser,
  registerConsoleCapture,
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

const CASE07_CARRYOVER_STEPS = [
  { type: 'review_evidence', source_ref: 'LAB-DOC-07' },
  { type: 'choose_dialog_option', source_ref: 'INT-GABER-01', interaction_id: 'Q02' },
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
      case07Summary: state.engineSnapshot?.evidenceSummaries?.['EVID-07-03'] ?? null,
      case07State: state.engineSnapshot?.evidenceStates?.['EVID-07-03'] ?? null,
      case07BehavioralState: state.engineSnapshot?.evidenceStates?.['EVID-07-02'] ?? null,
      flags: state.engineSnapshot?.flags ?? [],
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

    await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });
    await page.getByLabel('اسم المحقق').fill('Case07 Transition Investigator');
    await page.getByRole('button', { name: /تأكيد الهوية/ }).click();
    await waitForPathname(page, /^\/lobby$/);

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

    await dispatchScenarioSteps(page, CASE07_CARRYOVER_STEPS);
    const storeSummary = await readStoreSummary(page);

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case07 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case07 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case07',
      `Expected runtime snapshot for case07, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 6,
      `Expected all previous cases to be archived, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case07State === 'verified',
      `Expected case07 forgery evidence to resolve after delayed trigger, got ${storeSummary.case07State}`,
    );
    assert(
      storeSummary.case07BehavioralState === 'verified',
      `Expected case07 behavioral evidence to resolve after interrogation, got ${storeSummary.case07BehavioralState}`,
    );
    assert(
      typeof storeSummary.case07Summary === 'string' && storeSummary.case07Summary.includes('مصر الجديدة'),
      `Expected case07 carryover summary to mention prior forgery network, got ${storeSummary.case07Summary}`,
    );
    assert(
      storeSummary.flags.includes('forgery_network_confirmed'),
      `Expected carryover-derived forgery flag in case07, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case07 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case07 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case06 to case07 transition flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
