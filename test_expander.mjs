import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDir = path.join(__dirname, 'runtime', 'test');

const specs = {
  'case03': {
    suspect: 'SUSP-03-01',
    trueMotive: 'motive_adel_debts_extortion',
    falseMotive: 'motive_natural_heart_attack',
    method: 'method_dummy', // Will be ignored by rule if requires_method is less strict, but let's provide one
    crossRoute: ['EVID-03-01'],
    behavioral: []
  },
  'case09': {
    suspect: 'SUSP-09-01',
    trueMotive: 'motive_clockmaker_coverup',
    falseMotive: 'motive_police_corruption_coverup',
    method: 'method_dummy',
    crossRoute: ['EVID-09-01', 'EVID-09-02'],
    behavioral: []
  },
  'case10': {
    suspect: 'SUSP-10-01',
    trueMotive: 'motive_trinity_liquidation',
    falseMotive: 'motive_partner_financial_dispute',
    method: 'method_dummy',
    crossRoute: ['EVID-10-01', 'EVID-10-02'],
    behavioral: ['EVID-10-04']
  },
  'case22': {
    suspect: 'SUSP-22-01',
    trueMotive: 'motive_syndicate_logistics',
    falseMotive: 'motive_random_crime_wave',
    method: 'method_dummy',
    crossRoute: ['EVID-22-01', 'EVID-22-02'],
    behavioral: ['EVID-22-03']
  }
};

for (const [caseId, data] of Object.entries(specs)) {
    const specPath = path.join(testDir, `${caseId}.spec.ts`);
    if (!fs.existsSync(specPath)) {
        console.warn(`Missing ${specPath}`);
        continue;
    }

    let content = fs.readFileSync(specPath, 'utf8');
    
    // Check if we didn't inject setFact yet
    if (!content.includes('setFact')) {
        // Add import
        content = content.replace(
            `import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";`,
            `import { EVENT_NAME, PLAYER_ACTION_TYPE, FACT_TYPE } from "../src/engine/constants.js";\nimport { setFact } from "../src/engine/store.js";`
        );
    }
    
    // Check if we already injected assertions
    if (content.includes('should process a successful closure')) {
        console.log(`Already injected in ${caseId}`);
        continue;
    }

    const testStubs = `
  function verifyEvidence(id: string) {
    setFact(engine.state, FACT_TYPE.EVIDENCE_VERIFIED, id, true);
    engine.state.baseEvidenceStates[id] = 'verified';
    engine.state.evidenceStates[id] = 'verified';
  }

  it('should process a successful closure with true motive', () => {
    // Satisfy cross route
    ${data.crossRoute.map(e => `verifyEvidence('${e}');\n    engine.state.closureBuckets.crossRouteVerified.add('${e}');`).join('\n    ')}
    // Satisfy behavioral
    ${data.behavioral.map(e => `verifyEvidence('${e}');\n    engine.state.closureBuckets.behavioralVerified.add('${e}');`).join('\n    ')}

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: '${data.suspect}',
        submitted_motive: '${data.trueMotive}',
        submitted_method_or_timeline: '${data.method}',
        submitted_evidence_ids: [${[...data.crossRoute, ...data.behavioral].map(e => `'${e}'`).join(', ')}]
      }
    };

    const result = engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    // Should contain true resolve flag usually caseXX_resolved_true
    expect(Array.from(engine.state.flags).some(f => (f as string).includes('_resolved_true') || (f as string).includes('_chain_resolved'))).toBe(true);
  });

  it('should result in false_success when a wrong but plausible motive is chosen', () => {
    ${data.crossRoute.map(e => `verifyEvidence('${e}');\n    engine.state.closureBuckets.crossRouteVerified.add('${e}');`).join('\n    ')}
    ${data.behavioral.map(e => `verifyEvidence('${e}');\n    engine.state.closureBuckets.behavioralVerified.add('${e}');`).join('\n    ')}

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: '${data.suspect}',
        submitted_motive: '${data.falseMotive}',
        submitted_method_or_timeline: '${data.method}',
        submitted_evidence_ids: [${[...data.crossRoute, ...data.behavioral].map(e => `'${e}'`).join(', ')}]
      }
    };

    const result = engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    expect(Array.from(engine.state.flags).some(f => (f as string).includes('_resolved_false'))).toBe(true);
  });

  it('should progress PHS levels returning hint payloads', () => {
    const action1 = { type: PLAYER_ACTION_TYPE.REQUEST_PHS };
    const result1 = engine.processAction(action1 as any);
    
    // Sometimes no authored hint so it falls back to dynamic, but the event is always emitted
    expect(result1.emittedEvents.some(e => e.event_name === EVENT_NAME.PHS_HINT_REVEALED)).toBe(true);
    
    // Depending on the mocked state, level 1 or higher will be given
    const hintEvent = result1.emittedEvents.find(e => e.event_name === EVENT_NAME.PHS_HINT_REVEALED);
    const hint = JSON.parse(hintEvent.result!);
    expect(hint.level).toBeDefined();
    expect(hint.payload).toBeDefined();
  });
`;

    // inject test stub right before the final "});" 
    const injectIndex = content.lastIndexOf('});');
    if (injectIndex !== -1) {
        content = content.slice(0, injectIndex) + testStubs + content.slice(injectIndex);
        fs.writeFileSync(specPath, content, 'utf8');
        console.log(`Injected assertions to ${caseId}.spec.ts`);
    } else {
        console.error(`Could not find end of describe in ${caseId}`);
    }
}
