import { spawn, execFileSync } from 'node:child_process';
import process from 'node:process';

export const SERVER_URL = 'http://127.0.0.1:3001/api/server-info';
export const FRONTEND_URL = 'http://127.0.0.1:5173';
const START_TIMEOUT_MS = 45_000;
const POLL_INTERVAL_MS = 750;
const FORCE_RESTART_STACK = process.env.SMOKE_FORCE_RESTART === '1';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isReady(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs) {
  const startedAt = Date.now();

  while ((Date.now() - startedAt) < timeoutMs) {
    if (await isReady(url)) {
      return;
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function startProcess(label, command, startedChildren) {
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', command], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
      })
    : spawn(command, {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
        shell: true,
      });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0 && !child.wasStoppedBySmoke) {
      process.stderr.write(`[${label}] exited with code ${code}\n`);
    }
  });

  startedChildren.push(child);
  return child;
}

function clearPorts(ports) {
  if (process.platform === 'win32') {
    for (const port of ports) {
      try {
        const output = execFileSync(
          'powershell.exe',
          [
            '-NoProfile',
            '-Command',
            `Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`,
          ],
          { cwd: process.cwd(), encoding: 'utf8' },
        ).trim();

        for (const processId of output.split(/\s+/).filter(Boolean)) {
          execFileSync('taskkill.exe', ['/F', '/PID', processId], {
            cwd: process.cwd(),
            stdio: 'ignore',
          });
        }
      } catch {
        // Ignore ports that are already free.
      }
    }

    return;
  }

  for (const port of ports) {
    try {
      const output = execFileSync('bash', ['-lc', `lsof -ti tcp:${port}`], {
        cwd: process.cwd(),
        encoding: 'utf8',
      }).trim();

      for (const processId of output.split(/\s+/).filter(Boolean)) {
        execFileSync('kill', ['-9', processId], { cwd: process.cwd(), stdio: 'ignore' });
      }
    } catch {
      // Ignore ports that are already free.
    }
  }
}

export async function startLocalStack(startedChildren) {
  const serverReady = await isReady(SERVER_URL);
  const frontendReady = await isReady(FRONTEND_URL);

  if (!FORCE_RESTART_STACK && serverReady && frontendReady) {
    process.stdout.write('[smoke] Reusing existing local stack on 3001/5173\n');
    return;
  }

  if (FORCE_RESTART_STACK || !serverReady) {
    clearPorts([3001]);
    startProcess('server', 'npm run dev --prefix server', startedChildren);
    await waitForUrl(SERVER_URL, START_TIMEOUT_MS);
  }

  if (FORCE_RESTART_STACK || !frontendReady) {
    clearPorts([5173]);
    startProcess(
      'frontend',
      'npm run dev --prefix frontend -- --host 127.0.0.1 --port 5173 --strictPort',
      startedChildren,
    );
    await waitForUrl(FRONTEND_URL, START_TIMEOUT_MS);
  }
}

export async function cleanupProcesses(startedChildren) {
  await Promise.all(startedChildren.map(async (child) => {
    if (child.exitCode !== null) {
      return;
    }

    try {
      if (process.platform === 'win32') {
        child.wasStoppedBySmoke = true;
        execFileSync('taskkill.exe', ['/T', '/F', '/PID', String(child.pid)], {
          cwd: process.cwd(),
          stdio: 'ignore',
        });
        return;
      }

      child.wasStoppedBySmoke = true;
      child.kill('SIGTERM');
      await sleep(300);
      if (child.exitCode === null) {
        child.kill('SIGKILL');
      }
    } catch {
      if (child.exitCode === null) {
        child.kill('SIGKILL');
      }
    }
  }));
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function waitForPathname(page, predicate, timeoutMs = 30_000) {
  await page.waitForFunction(
    (matcherSource) => {
      const matcher = new RegExp(matcherSource);
      return matcher.test(window.location.pathname);
    },
    predicate.source,
    { timeout: timeoutMs },
  );
}

export function registerConsoleCapture(page, bucket) {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      bucket.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    bucket.push(error.message);
  });
}

export async function registerProfile(page, investigatorName) {
  await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });
  await page.getByLabel('اسم المحقق').fill(investigatorName);
  await page.getByRole('button', { name: /تأكيد الهوية/ }).click();
  await waitForPathname(page, /^\/lobby$/);
}

export async function installWsSendSpy(page) {
  await page.evaluate(async () => {
    const globalScope = window;
    if (globalScope.__wsSendSpyInstalled) {
      return;
    }

    const { wsService } = await import('/src/services/websocket.ts');
    const counts = {};
    const originalSend = wsService.send.bind(wsService);

    wsService.send = (type, payload) => {
      counts[type] = (counts[type] ?? 0) + 1;
      return originalSend(type, payload);
    };

    globalScope.__wsSendSpyInstalled = true;
    globalScope.__wsSendCounts = counts;
  });
}

export async function resetWsSendCounts(page) {
  await page.evaluate(() => {
    const globalScope = window;
    const counts = globalScope.__wsSendCounts ?? {};
    for (const key of Object.keys(counts)) {
      delete counts[key];
    }
  });
}

export async function readWsSendCounts(page) {
  return page.evaluate(() => ({ ...(window.__wsSendCounts ?? {}) }));
}

export async function waitForStoreCondition(
  page,
  predicateSource,
  timeoutMs = 10_000,
  timeoutMessage = 'Timed out while waiting for store condition',
) {
  await page.evaluate(async ({ predicateSource: source, timeoutMs: timeout, timeoutMessage: message }) => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const predicate = new Function('state', `return (${source})(state);`);
    const startedAt = Date.now();

    while ((Date.now() - startedAt) < timeout) {
      if (predicate(useGameStore.getState())) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error(message);
  }, { predicateSource, timeoutMs, timeoutMessage });
}

export async function invokeStoreMethod(
  page,
  methodName,
  args = [],
  waitPredicateSource = null,
  timeoutMs = 10_000,
  timeoutMessage = 'Timed out while waiting for store action to settle',
) {
  await page.evaluate(async ({
    methodName: targetMethod,
    args: methodArgs,
    waitPredicateSource: predicateSource,
    timeoutMs: timeout,
    timeoutMessage: message,
  }) => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const method = useGameStore.getState()[targetMethod];

    if (typeof method !== 'function') {
      throw new Error(`Store method ${targetMethod} is not available`);
    }

    const waitFor = async (predicate, waitTimeoutMs, waitMessage) => {
      const startedAt = Date.now();
      while ((Date.now() - startedAt) < waitTimeoutMs) {
        if (predicate()) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw new Error(waitMessage);
    };

    method(...methodArgs);

    if (!predicateSource) {
      return;
    }

    const predicate = new Function('state', `return (${predicateSource})(state);`);
    await waitFor(() => predicate(useGameStore.getState()), timeout, message);
  }, {
    methodName,
    args,
    waitPredicateSource,
    timeoutMs,
    timeoutMessage,
  });
}

export async function dispatchScenarioSteps(page, steps, timeoutMs = 10_000) {
  await page.evaluate(async ({ scenarioSteps, timeoutMs: timeout }) => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');

    const waitFor = async (predicate, waitTimeoutMs, waitMessage) => {
      const startedAt = Date.now();
      while ((Date.now() - startedAt) < waitTimeoutMs) {
        if (predicate()) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw new Error(waitMessage);
    };

    for (const action of scenarioSteps) {
      const previousTick = useGameStore.getState().engineSnapshot?.currentTick ?? 0;
      useGameStore.getState().sendAction(action);
      await waitFor(
        () => {
          const currentTick = useGameStore.getState().engineSnapshot?.currentTick ?? 0;
          return currentTick > previousTick;
        },
        timeout,
        `Timed out while waiting for action ${action.type} to advance the runtime`,
      );
    }
  }, { scenarioSteps: steps, timeoutMs });
}

export async function dispatchActionWithTickResult(page, action, timeoutMs = 4_000) {
  return page.evaluate(async ({ storeAction, timeoutMs: timeout }) => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const previousTick = useGameStore.getState().engineSnapshot?.currentTick ?? 0;
    useGameStore.getState().sendAction(storeAction);

    const startedAt = Date.now();
    while ((Date.now() - startedAt) < timeout) {
      const currentTick = useGameStore.getState().engineSnapshot?.currentTick ?? 0;
      if (currentTick > previousTick) {
        return { advanced: true, currentTick };
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return {
      advanced: false,
      currentTick: useGameStore.getState().engineSnapshot?.currentTick ?? previousTick,
    };
  }, { storeAction: action, timeoutMs });
}

export async function dispatchActionWithFallback(
  page,
  action,
  fallbackAction,
  failureMessage = 'Expected delayed action to advance after fallback tick',
  timeoutMs = 4_000,
) {
  const firstAttempt = await dispatchActionWithTickResult(page, action, timeoutMs);
  if (firstAttempt.advanced) {
    return { usedFallback: false, ...firstAttempt };
  }

  for (let fallbackTicks = 1; fallbackTicks <= 2; fallbackTicks += 1) {
    const fallbackAttempt = await dispatchActionWithTickResult(page, fallbackAction, timeoutMs);
    assert(fallbackAttempt.advanced, 'Expected fallback action to advance the runtime');

    const retriedAttempt = await dispatchActionWithTickResult(page, action, timeoutMs);
    if (retriedAttempt.advanced) {
      return { usedFallback: true, fallbackTicks, ...retriedAttempt };
    }
  }

  assert(false, failureMessage);
}

export async function launchSmokeBrowser(browserType) {
  try {
    return await browserType.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Executable doesn't exist")) {
      throw error;
    }

    return browserType.launch({
      channel: 'msedge',
      headless: true,
    });
  }
}
