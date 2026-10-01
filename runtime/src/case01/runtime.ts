import { createRegisteredRuntime } from "../cases/registry.js";

export async function createCase01Runtime() {
  return await createRegisteredRuntime("case01");
}
