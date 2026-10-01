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

    await registerProfile(hostPage, 'Resume Host');
    await hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Resume Guest');
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

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/),
      waitForPathname(guestPage, /^\/game\/[^/]+$/),
      hostPage.locator('.waiting-footer button').click(),
    ]);

    await hostPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });
    await guestPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    await hostPage.goto('http://127.0.0.1:5173/lobby', { waitUntil: 'networkidle' });
    await waitForPathname(hostPage, /^\/lobby$/);

    const activeRoomCard = hostPage.locator('.active-room-card').filter({ hasText: roomCode });
    await activeRoomCard.waitFor({ state: 'visible', timeout: 30_000 });
    await activeRoomCard.getByRole('button', { name: /متابعة الفتح/ }).click();

    await waitForPathname(hostPage, /^\/game\/[^/]+$/);
    await hostPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    const resumedUrl = hostPage.url();
    const resumedBody = await hostPage.locator('body').textContent();
    const guestUrl = guestPage.url();
    const guestBody = await guestPage.locator('body').textContent();

    assert(
      resumedUrl.endsWith(`/game/${roomSlug}`),
      `Host resume landed on unexpected route: ${resumedUrl}`,
    );
    assert(
      resumedBody?.includes('أنت الآن في القضية 01 من 59 مخططة'),
      'Host did not resume the investigation desktop',
    );
    assert(
      guestUrl.endsWith(`/game/${roomSlug}`),
      `Guest was displaced from the investigation route: ${guestUrl}`,
    );
    assert(
      guestBody?.includes('أنت الآن في القضية 01 من 59 مخططة'),
      'Guest lost the investigation desktop while host resumed',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Resume active room flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
