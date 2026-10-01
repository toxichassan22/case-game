import { chromium } from 'playwright';
import {
  assert,
  cleanupProcesses,
  launchSmokeBrowser,
  registerConsoleCapture,
  registerProfile,
  startLocalStack,
  waitForPathname,
} from './smoke_helpers.mjs';

const startedChildren = [];

async function waitForToast(page, text, timeout = 10_000) {
  await page.getByText(text, { exact: false }).first().waitFor({
    state: 'visible',
    timeout,
  });
}

async function readStoreSummary(page) {
  return page.evaluate(async () => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const state = useGameStore.getState();

    return {
      chatMessages: state.chatMessages.map((message) => ({
        senderName: message.senderName,
        message: message.message,
      })),
      notifications: state.notifications.map((notification) => notification.message),
    };
  });
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();
    const consoleErrors = [];
    const consoleLogs = []; // Capture ALL console logs

    // Capture ALL console messages
    hostPage.on('console', (message) => {
      const text = message.text();
      consoleLogs.push(text);
      if (message.type() === 'error') {
        consoleErrors.push(text);
      }
      // Print GameDesktop logs immediately
      if (text.includes('[GameDesktop]')) {
        console.log(`[Browser Console] ${text}`);
      }
    });
    
    registerConsoleCapture(hostPage, consoleErrors);
    registerConsoleCapture(guestPage, consoleErrors);

    await registerProfile(hostPage, 'Collab Host');
    await hostPage.getByRole('button', { name: 'إنشاء غرفة جديدة' }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Collab Guest');
    const roomCard = guestPage.locator('.room-card').filter({ hasText: roomCode });
    await roomCard.waitFor({ state: 'visible', timeout: 30_000 });
    await roomCard.click();

    await waitForPathname(guestPage, /^\/room\/[^/]+$/);
    await guestPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    await hostPage.locator('.specialty-card').filter({ hasText: 'المحقق الزمني' }).click();
    await hostPage.getByText('✓ مقعدك').waitFor({ timeout: 30_000 });

    await guestPage.locator('.specialty-card').filter({ hasText: 'المحقق الجنائي' }).click();
    await guestPage.getByText('✓ مقعدك').waitFor({ timeout: 30_000 });

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/),
      waitForPathname(guestPage, /^\/game\/[^/]+$/),
      hostPage.locator('.waiting-footer button').click(),
    ]);

    await hostPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });
    await guestPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    console.log('[Test] Case loaded, checking URL and page content...');
    console.log('[Test] Host URL:', hostPage.url());
    console.log('[Test] Guest URL:', guestPage.url());
    
    // Debug: Check if GameDesktop component is mounted
    const hasGameDesktop = await hostPage.evaluate(() => {
      return !!document.querySelector('[class*="game-desktop"]') || 
             !!document.querySelector('main');
    });
    console.log(`[Test] Host has GameDesktop: ${hasGameDesktop}`);
    
    // Wait a bit for windows to auto-open
    await hostPage.waitForTimeout(2000);
    await guestPage.waitForTimeout(2000);

    // Debug: Check what windows exist
    const hostWindows = await hostPage.evaluate(() => {
      return document.querySelectorAll('[class*="evidence-rnd"]').length;
    });
    console.log(`[Test] Host has ${hostWindows} windows open`);
    
    const hostChatInput = hostPage.getByPlaceholder('اكتب رسالة للفريق...');
    const guestChatInput = guestPage.getByPlaceholder('اكتب رسالة للفريق...');

    console.log('[Test] Waiting for chat inputs to appear...');
    
    await hostChatInput.waitFor({ timeout: 15_000 });
    await guestChatInput.waitFor({ timeout: 15_000 });
    
    console.log('[Test] Chat inputs found!');

    await hostChatInput.fill('رسالة من الهوست');
    await hostChatInput.press('Enter');
    await guestPage.getByText('رسالة من الهوست').waitFor({ timeout: 10_000 });

    await guestChatInput.fill('رد من الضيف');
    await guestChatInput.press('Enter');
    await hostPage.getByText('رد من الضيف').waitFor({ timeout: 10_000 });

    const inventoryCards = hostPage.locator('.inventory-item-card');
    const cardCount = await inventoryCards.count();
    assert(cardCount > 0, 'Expected at least one discovered evidence item to exist for sharing');

    const firstCard = inventoryCards.first();
    const evidenceTitle = ((await firstCard.locator('.inventory-item-title').textContent()) ?? '').trim();

    await firstCard.locator('.inventory-share-icon-btn').click();
    const guestShareButton = hostPage.getByRole('button', { name: /Collab Guest/ });
    await guestShareButton.waitFor({ timeout: 10_000 });
    await guestShareButton.click();

    await waitForToast(guestPage, 'شارك معك', 10_000);

    const hostSummary = await readStoreSummary(hostPage);
    const guestSummary = await readStoreSummary(guestPage);

    assert(
      hostSummary.chatMessages.some((entry) => entry.message === 'رد من الضيف'),
      'Host did not receive the guest chat message',
    );
    assert(
      guestSummary.chatMessages.some((entry) => entry.message === 'رسالة من الهوست'),
      'Guest did not receive the host chat message',
    );
    assert(
      guestSummary.notifications.some((message) => message.includes('شارك معك')),
      'Guest did not receive the evidence share notification',
    );
    assert(
      consoleErrors.length === 0,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log(`[smoke] Multiplayer collaboration flow passed (shared: ${evidenceTitle || 'unknown'})`);
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
