import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { listRegisteredCases, createRegisteredRuntime } from "./cases/registry.js";
import { PLAYER_ACTION_TYPE } from "./engine/constants.js";
import { scenarioDefinitions } from "./case01/scenarios.js";
import type { CoreEngine } from "./engine/runtime.js";
import type { ClosureAttempt, PlayerAction, ProcessedActionResult } from "./types.js";

async function main(): Promise<void> {
  const { caseId, args } = resolveCaseArgs(process.argv.slice(2));

  if (args[0] === "cases") {
    printCases();
    return;
  }

  const runtime = await createRegisteredRuntime(caseId);

  if (args.length === 0 || args[0] === "repl") {
    await runRepl(runtime, caseId);
    return;
  }

  await executeCommand(runtime, args);
}

async function runRepl(runtime: CoreEngine, caseId: string): Promise<void> {
  const rl = readline.createInterface({ input, output });
  output.write(`${caseId} runtime repl\n`);
  output.write("commands: act, state, flags, notices, debug, trace, closure, scenario, cases, exit\n");

  try {
    while (true) {
      const line = (await rl.question("> ")).trim();
      if (!line) {
        continue;
      }
      if (line === "exit" || line === "quit") {
        break;
      }
      await executeCommand(runtime, splitArgs(line));
    }
  } finally {
    rl.close();
  }
}

async function executeCommand(runtime: CoreEngine, args: string[]): Promise<void> {
  const [command, ...rest] = args;

  switch (command) {
    case "act":
      printResult(runtime.processAction(parseAction(rest)));
      return;
    case "state":
      output.write(`${JSON.stringify(runtime.getSnapshot(), null, 2)}\n`);
      return;
    case "flags":
      output.write(`${JSON.stringify(runtime.getSnapshot().flags, null, 2)}\n`);
      return;
    case "notices":
      output.write(`${JSON.stringify(runtime.getSnapshot().notices, null, 2)}\n`);
      return;
    case "debug":
      output.write(`${JSON.stringify(runtime.getSnapshot().debugTrace, null, 2)}\n`);
      return;
    case "trace":
      output.write(`${JSON.stringify(runtime.getSnapshot().eventTrace, null, 2)}\n`);
      return;
    case "closure":
      printResult(runtime.processAction({ type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE, attempt: parseClosureAttempt(rest) }));
      return;
    case "scenario": {
      const scenario = scenarioDefinitions[rest[0] ?? ""];
      if (!scenario) {
        throw new Error(`Unknown scenario: ${rest[0] ?? ""}`);
      }
      for (const step of scenario.steps) {
        printResult(runtime.processAction(step));
      }
      output.write(`${JSON.stringify(runtime.getSnapshot(), null, 2)}\n`);
      return;
    }
    case "cases":
      printCases();
      return;
    default:
      throw new Error(`Unknown command: ${command ?? ""}`);
  }
}

function printResult(result: ProcessedActionResult): void {
  output.write(
    `${JSON.stringify(
      {
        accepted: result.accepted,
        tickConsumed: result.tickConsumed,
        rejectionReason: result.rejectionReason,
        emittedEvents: result.emittedEvents.map((event) => event.event_name),
        changedEvidence: result.changedEvidence,
        debugEntries: result.debugEntries,
        flags: result.snapshot.flags,
        lastClosureDecision: result.snapshot.lastClosureDecision,
      },
      null,
      2,
    )}\n`,
  );
}

function printCases(): void {
  output.write(`${JSON.stringify(listRegisteredCases(), null, 2)}\n`);
}

function parseAction(args: string[]): PlayerAction {
  const [type, arg1, arg2] = args;

  switch (type) {
    case PLAYER_ACTION_TYPE.OPEN_SOURCE:
      return { type, source_ref: required(arg1, "source_ref") };
    case PLAYER_ACTION_TYPE.REVIEW_EVIDENCE:
      return { type, source_ref: required(arg1, "source_ref") };
    case PLAYER_ACTION_TYPE.INSPECT_OBJECT:
      return { type, source_ref: required(arg1, "source_ref") };
    case PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION:
      return { type, source_ref: required(arg1, "source_ref"), interaction_id: required(arg2, "interaction_id") };
    case PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT:
      return { type, interaction_id: required(arg1, "interaction_id") };
    case PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY:
      return { type, source_ref: required(arg1, "source_ref") };
    default:
      throw new Error(`Unsupported act command: ${type ?? ""}`);
  }
}

function parseClosureAttempt(args: string[]): ClosureAttempt {
  const [submitted_suspect, submitted_motive, submitted_method_or_timeline, evidenceList] = args;
  return {
    submitted_suspect: required(submitted_suspect, "submitted_suspect"),
    submitted_motive: required(submitted_motive, "submitted_motive"),
    submitted_method_or_timeline: required(submitted_method_or_timeline, "submitted_method_or_timeline"),
    submitted_evidence_ids: required(evidenceList, "submitted_evidence_ids")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

function splitArgs(line: string): string[] {
  return line
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function resolveCaseArgs(args: string[]): { caseId: string; args: string[] } {
  if (args[0] === "--case") {
    return {
      caseId: required(args[1], "case_id"),
      args: args.slice(2),
    };
  }

  return {
    caseId: "case01",
    args,
  };
}

function required(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`Missing ${label}`);
  }
  return value;
}

void main();
