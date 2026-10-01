import { chromium } from 'playwright';
import {
  assert,
  cleanupProcesses,
  dispatchActionWithTickResult,
  registerConsoleCapture,
  registerProfile,
  startLocalStack,
  waitForPathname,
  waitForStoreCondition,
} from './smoke_helpers.mjs';

const startedChildren = [];

const SUSPECT_WINDOWS = [
  {
    characterId: 'char_sharif',
    searchText: 'شريف',
    expectedVisibleOptions: 3,
  },
  {
    characterId: 'char_layla',
    searchText: 'ليلى',
    expectedVisibleOptions: 1,
  },
  {
    characterId: 'char_hatem',
    searchText: 'حاتم',
    expectedVisibleOptions: 0,
  },
  {
    characterId: 'char_abu_khaled',
    searchText: 'أبو خالد',
    expectedVisibleOptions: 0,
  },
];

async function readStoreMeta(page) {
  return page.evaluate(async () => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const state = useGameStore.getState();
    const snapshot = state.engineSnapshot;
    const currentTick = snapshot?.currentTick ?? 0;

    return {
      currentTick,
      rejectedThisTick: snapshot?.debugTrace?.some(
        (entry) => entry.tick === currentTick && entry.kind === 'action_rejected',
      ) ?? false,
      interrogationEventThisTick: snapshot?.eventTrace?.some(
        (event) => event.tick === currentTick && event.event_name === 'EVENT_INTERROGATION_NODE_UNLOCKED',
      ) ?? false,
      notificationMessages: (state.notifications ?? []).map((notification) => notification.message),
    };
  });
}

async function openDatabase(page) {
  await page.getByRole('button', { name: 'قاعدة البيانات' }).click();
  const databaseWindow = page
    .locator('.window-inner')
    .filter({ has: page.locator('.window-title', { hasText: 'قاعدة البيانات' }) })
    .last();
  await databaseWindow.waitFor({ state: 'visible', timeout: 10_000 });
  return databaseWindow;
}

async function resolveSuspectName(page, characterId) {
  const name = await page.evaluate(async (id) => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    return useGameStore.getState().caseDefinition?.suspects?.find((suspect) => suspect.character_id === id)?.name ?? null;
  }, characterId);

  assert(name, `Could not resolve suspect name for ${characterId}`);
  return name;
}

async function openInterrogationWindow(page, databaseWindow, suspect) {
  const fullName = await resolveSuspectName(page, suspect.characterId);
  const searchInput = databaseWindow.getByPlaceholder('ابحث بالاسم، رقم الدليل، الكلمة المفتاحية...');
  await searchInput.fill(suspect.searchText);
  await searchInput.press('Enter');
  await page.waitForTimeout(800);

  const resultCard = databaseWindow.locator(`.database-result-card[data-result-id="${suspect.characterId}"]`).first();

  await resultCard.waitFor({ state: 'visible', timeout: 10_000 });
  await resultCard.getByText(fullName).waitFor({ state: 'visible', timeout: 10_000 });
  await resultCard.getByText('→ اضغط لبدء الاستجواب').waitFor({ state: 'visible', timeout: 10_000 });
  await resultCard.click();

  const windowTitle = `استجواب: ${fullName}`;
  const interrogationWindow = page
    .locator('.window-inner')
    .filter({ has: page.locator('.window-title', { hasText: windowTitle }) })
    .last();

  await interrogationWindow.waitFor({ state: 'visible', timeout: 10_000 });
  return { interrogationWindow, fullName };
}

async function consumeVisibleOptions(page, interrogationWindow, suspect, fullName) {
  if (suspect.expectedVisibleOptions > 0) {
    await interrogationWindow
      .locator('.chat-option-btn')
      .nth(suspect.expectedVisibleOptions - 1)
      .waitFor({ state: 'visible', timeout: 10_000 });
  } else {
    await interrogationWindow
      .getByText(/لا توجد أسئلة متاحة لهذا المشتبه به حاليًا\.|تم استنفاد جميع الأسئلة المتاحة\./)
      .waitFor({ timeout: 10_000 });
  }

  const initialCount = await interrogationWindow.locator('.chat-option-btn').count();
  assert(
    initialCount === suspect.expectedVisibleOptions,
    `${fullName} expected ${suspect.expectedVisibleOptions} visible options, got ${initialCount}`,
  );

  if (suspect.expectedVisibleOptions === 0) {
    return;
  }

  for (let index = 0; index < suspect.expectedVisibleOptions; index += 1) {
    const optionButton = interrogationWindow.locator('.chat-option-btn').first();
    const label = (await optionButton.textContent())?.trim() || `<option-${index + 1}>`;
    const before = await readStoreMeta(page);

    await optionButton.click();
    await waitForStoreCondition(
      page,
      `state => (state.engineSnapshot?.currentTick ?? 0) > ${before.currentTick}`,
      10_000,
      `Timed out while waiting for interrogation option "${label}" to advance the runtime`,
    );

    const after = await readStoreMeta(page);
    assert(!after.rejectedThisTick, `Visible option "${label}" for ${fullName} was rejected`);
    assert(after.interrogationEventThisTick, `Visible option "${label}" for ${fullName} did not emit an interrogation event`);
  }
}

async function triggerSoftExposure(page) {
  const steps = [
    { type: 'choose_dialog_option', source_ref: 'CHIEF-DESK', interaction_id: 'REQ-EVIDENCE-01' },
    { type: 'open_source', source_ref: 'SCN-03' },
    { type: 'review_evidence', source_ref: 'SCN-03' },
  ];

  for (const step of steps) {
    const result = await dispatchActionWithTickResult(page, step);
    assert(result.advanced, `Action ${step.type} did not advance the runtime while triggering DIG-03 soft exposure`);
  }

  await waitForStoreCondition(
    page,
    'state => state.notifications.some((notification) => notification.message.includes("تم استرجاع ملف رقمي ناقص"))',
    10_000,
    'Timed out while waiting for the DIG-03 soft exposure toast',
  );

  const firstMeta = await readStoreMeta(page);
  const firstCount = firstMeta.notificationMessages.filter((message) => message.includes('تم استرجاع ملف رقمي ناقص')).length;
  assert(firstCount === 1, `Expected DIG-03 soft exposure toast once after trigger, got ${firstCount}`);

  const followUp = await dispatchActionWithTickResult(page, { type: 'open_source', source_ref: 'TIMELINE-BOARD' });
  assert(followUp.advanced, 'Follow-up action did not advance the runtime while checking DIG-03 toast deduplication');

  const secondMeta = await readStoreMeta(page);
  const secondCount = secondMeta.notificationMessages.filter((message) => message.includes('تم استرجاع ملف رقمي ناقص')).length;
  assert(secondCount === 1, `Expected DIG-03 soft exposure toast to remain deduplicated, got ${secondCount}`);
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchBrowser();

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];

    registerConsoleCapture(page, consoleErrors);
    await registerProfile(page, 'Case01 UI Smoke');

    await Promise.all([
      waitForPathname(page, /^\/game\/[^/]+$/),
      page.getByRole('button', { name: /ابدأ Solo/ }).click(),
    ]);

    await page.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    const databaseWindow = await openDatabase(page);

    for (const suspect of SUSPECT_WINDOWS) {
      const { interrogationWindow, fullName } = await openInterrogationWindow(page, databaseWindow, suspect);
      await consumeVisibleOptions(page, interrogationWindow, suspect, fullName);
      await interrogationWindow.locator('.close-btn').click();
      await interrogationWindow.waitFor({ state: 'hidden', timeout: 10_000 });
    }

    await triggerSoftExposure(page);

    assert(
      consoleErrors.length === 0,
      `Console errors detected during case01 interrogation UI smoke:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] case01 interrogation UI flow passed');
  } finally {
    await browser.close();
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Executable doesn't exist")) {
      throw error;
    }

    return chromium.launch({
      channel: 'msedge',
      headless: true,
    });
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
