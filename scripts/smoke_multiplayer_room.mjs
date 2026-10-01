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

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();
    const consoleErrors = [];

    registerConsoleCapture(hostPage, consoleErrors);
    registerConsoleCapture(guestPage, consoleErrors);

    await registerProfile(hostPage, 'Host Investigator');
    await hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Guest Investigator');

    const roomCard = guestPage.locator('.room-card').filter({ hasText: roomCode });
    await roomCard.waitFor({ state: 'visible', timeout: 30_000 });
    await roomCard.click();

    await waitForPathname(guestPage, /^\/room\/[^/]+$/);
    await guestPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });
    await hostPage.getByText('2 / 3 محققين جاهزين').waitFor({ timeout: 30_000 });

    await hostPage.locator('.specialty-card').filter({ hasText: 'المحقق الزمني' }).click();
    await hostPage.getByText('✓ مقعدك').waitFor({ timeout: 30_000 });

    await guestPage.locator('.specialty-card').filter({ hasText: 'المحقق الجنائي' }).click();
    await guestPage.getByText('✓ مقعدك').waitFor({ timeout: 30_000 });

    await hostPage.getByText('ابدأ القضية').waitFor({ timeout: 30_000 });
    const startButton = hostPage.locator('.waiting-footer button');

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/),
      waitForPathname(guestPage, /^\/game\/[^/]+$/),
      startButton.click(),
    ]);

    await hostPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });
    await guestPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    const hostRoomUrl = hostPage.url();
    const guestRoomUrl = guestPage.url();
    const hostBody = await hostPage.locator('body').textContent();
    const guestBody = await guestPage.locator('body').textContent();

    assert(
      hostRoomUrl.endsWith(`/game/${roomSlug}`),
      `Host landed on unexpected route: ${hostRoomUrl}`,
    );
    assert(
      guestRoomUrl.endsWith(`/game/${roomSlug}`),
      `Guest landed on unexpected route: ${guestRoomUrl}`,
    );
    assert(
      hostBody?.includes('أنت الآن في القضية 01 من 59 مخططة'),
      'Host did not reach the investigation desktop',
    );
    assert(
      guestBody?.includes('أنت الآن في القضية 01 من 59 مخططة'),
      'Guest did not reach the investigation desktop',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Multiplayer room flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
