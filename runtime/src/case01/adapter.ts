
import type { RuntimeCaseAdapter } from "../types.js";

// This adapter is currently disabled for the frontend to avoid node:fs dependencies
export function loadCase01Adapter(): RuntimeCaseAdapter {
  throw new Error("Case 01 adapter requires Node.js filesystem which is not available in the browser.");
}
