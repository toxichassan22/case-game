#!/usr/bin/env node

/**
 * Comprehensive Case Validation Script
 * Validates all case JSON files against schema requirements
 * Checks for missing fields, broken references, and story consistency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const casesDir = path.join(__dirname, '..', 'cases');

// Validation results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

/**
 * Validate a single case file
 */
function validateCase(caseDir) {
  const caseFile = path.join(casesDir, caseDir, `${caseDir}.json`);
  const errors = [];
  const warnings = [];
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📋 Validating ${caseDir}...`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  // Check file exists
  if (!fs.existsSync(caseFile)) {
    errors.push(`Case JSON file not found: ${caseFile}`);
    return { caseDir, errors, warnings, valid: false };
  }
  
  // Parse JSON
  let caseData;
  try {
    const content = fs.readFileSync(caseFile, 'utf8');
    caseData = JSON.parse(content);
  } catch (error) {
    errors.push(`Invalid JSON: ${error.message}`);
    return { caseDir, errors, warnings, valid: false };
  }
  
  // Validate root structure
  const requiredRootFields = [
    'case_id',
    'title',
    'crime_type',
    'victim_name',
    'overview',
    'inbox_brief',
    'evidence_list',
    'suspects',
    'outcome_flags',
    'solution_paths',
    'closure_rules',
    'trinity_hooks',
    'hidden_systems',
    'penalty_rules',
    'transition_context_hooks',
    'next_case_rules'
  ];
  
  requiredRootFields.forEach(field => {
    if (!(field in caseData)) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate case_id format
  if (caseData.case_id && !/^case\d{2}$/.test(caseData.case_id)) {
    errors.push(`Invalid case_id format: ${caseData.case_id} (expected caseXX)`);
  }
  
  // Validate overview structure
  if (caseData.overview) {
    const overviewFields = ['public_summary', 'main_question', 'stakes'];
    overviewFields.forEach(field => {
      if (!caseData.overview[field]) {
        warnings.push(`Missing overview.${field}`);
      }
    });
  }
  
  // Validate evidence_list
  if (Array.isArray(caseData.evidence_list)) {
    console.log(`  📦 Validating ${caseData.evidence_list.length} evidence items...`);
    
    caseData.evidence_list.forEach((evidence, index) => {
      const evidenceErrors = validateEvidence(evidence, index, caseData);
      errors.push(...evidenceErrors);
    });
    
    // Check for duplicate evidence IDs
    const evidenceIds = caseData.evidence_list.map(e => e.evidence_id);
    const duplicates = evidenceIds.filter((id, index) => evidenceIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate evidence IDs: ${duplicates.join(', ')}`);
    }
  } else {
    errors.push('evidence_list must be an array');
  }
  
  // Validate suspects
  if (Array.isArray(caseData.suspects)) {
    console.log(`  👤 Validating ${caseData.suspects.length} suspects...`);
    
    caseData.suspects.forEach((suspect, index) => {
      const suspectErrors = validateCharacter(suspect, index, 'suspect');
      errors.push(...suspectErrors);
    });
  } else {
    errors.push('suspects must be an array');
  }
  
  // Validate witnesses
  if (caseData.witnesses && Array.isArray(caseData.witnesses)) {
    console.log(`  👁️  Validating ${caseData.witnesses.length} witnesses...`);
    
    caseData.witnesses.forEach((witness, index) => {
      const witnessErrors = validateCharacter(witness, index, 'witness');
      errors.push(...witnessErrors);
    });
  }
  
  // Validate Trinity hooks
  if (caseData.trinity_hooks) {
    if (!Array.isArray(caseData.trinity_hooks.awareness_sources)) {
      errors.push('trinity_hooks.awareness_sources must be an array');
    }
    
    if (!Array.isArray(caseData.trinity_hooks.retaliation_rules)) {
      errors.push('trinity_hooks.retaliation_rules must be an array');
    }
  }
  
  // Validate hidden_systems
  if (caseData.hidden_systems) {
    if (caseData.hidden_systems.ui_anomalies) {
      console.log(`  🎭 Validating UI anomalies...`);
      
      if (!Array.isArray(caseData.hidden_systems.ui_anomalies.allowed_events)) {
        errors.push('hidden_systems.ui_anomalies.allowed_events must be an array');
      } else {
        caseData.hidden_systems.ui_anomalies.allowed_events.forEach(anomaly => {
          if (!anomaly.anomaly_id) {
            errors.push('UI anomaly missing anomaly_id');
          }
          if (!anomaly.trigger_flag) {
            errors.push(`UI anomaly ${anomaly.anomaly_id} missing trigger_flag`);
          }
          if (!anomaly.effect_type) {
            errors.push(`UI anomaly ${anomaly.anomaly_id} missing effect_type`);
          }
        });
      }
    }
  }
  
  // Validate outcome_flags
  if (caseData.outcome_flags) {
    ['success', 'partial', 'failure'].forEach(type => {
      if (!Array.isArray(caseData.outcome_flags[type])) {
        errors.push(`outcome_flags.${type} must be an array`);
      }
    });
  }
  
  // Validate solution_paths
  if (caseData.solution_paths) {
    ['timeline', 'forensics', 'behavioral'].forEach(route => {
      if (!caseData.solution_paths[route]) {
        warnings.push(`Missing solution_paths.${route}`);
      }
    });
  }
  
  // Validate next_case_rules
  if (Array.isArray(caseData.next_case_rules)) {
    console.log(`  🔀 Validating ${caseData.next_case_rules.length} next case rules...`);
    
    caseData.next_case_rules.forEach((rule, index) => {
      if (!rule.rule_id) {
        errors.push(`next_case_rules[${index}] missing rule_id`);
      }
      if (!rule.target_case_id) {
        errors.push(`next_case_rules[${index}] missing target_case_id`);
      }
      if (typeof rule.priority !== 'number') {
        errors.push(`next_case_rules[${index}] priority must be a number`);
      }
    });
  }
  
  // Validate transition_context_hooks
  if (Array.isArray(caseData.transition_context_hooks)) {
    console.log(`  🔗 Validating ${caseData.transition_context_hooks.length} transition hooks...`);
    
    caseData.transition_context_hooks.forEach((hook, index) => {
      if (!hook.hook_id) {
        errors.push(`transition_context_hooks[${index}] missing hook_id`);
      }
      if (!hook.effect_type) {
        errors.push(`transition_context_hooks[${index}] missing effect_type`);
      }
    });
  }
  
  const valid = errors.length === 0;
  
  return { caseDir, errors, warnings, valid };
}

/**
 * Validate evidence item
 */
function validateEvidence(evidence, index, _caseData) {
  const errors = [];
  const prefix = `evidence_list[${index}]`;
  
  // Required fields
  const requiredFields = [
    'evidence_id',
    'case_id',
    'title',
    'type',
    'evidence_tier',
    'evidence_role',
    'summary',
    'content_ref',
    'state'
  ];
  
  requiredFields.forEach(field => {
    if (!evidence[field]) {
      errors.push(`${prefix} missing required field: ${field}`);
    }
  });
  
  // Validate evidence_id format
  if (evidence.evidence_id && !/^[A-Z]+-[A-Z0-9-]+$/.test(evidence.evidence_id)) {
    errors.push(`${prefix} invalid evidence_id format: ${evidence.evidence_id}`);
  }
  
  // Validate evidence_tier
  const validTiers = ['critical', 'major', 'minor', 'flavor', 'supporting'];
  if (evidence.evidence_tier && !validTiers.includes(evidence.evidence_tier)) {
    errors.push(`${prefix} invalid evidence_tier: ${evidence.evidence_tier} (expected: ${validTiers.join(', ')})`);
  }
  
  // Validate evidence_role
  const validRoles = ['prove', 'mislead', 'carryover', 'support', 'unlock', 'context'];
  if (evidence.evidence_role && !validRoles.includes(evidence.evidence_role)) {
    errors.push(`${prefix} invalid evidence_role: ${evidence.evidence_role}`);
  }
  
  // Check completion_triggers
  if (evidence.completion_triggers && Array.isArray(evidence.completion_triggers)) {
    evidence.completion_triggers.forEach((trigger, triggerIndex) => {
      if (!trigger.trigger_id) {
        errors.push(`${prefix}.completion_triggers[${triggerIndex}] missing trigger_id`);
      }
      if (!Array.isArray(trigger.conditions)) {
        errors.push(`${prefix}.completion_triggers[${triggerIndex}] conditions must be an array`);
      }
    });
  }
  
  // Validate grand_truth_axis (if present)
  if (evidence.grand_truth_axis && Array.isArray(evidence.grand_truth_axis)) {
    const validAxes = ['clockmaker', 'alchemist', 'whisperer', 'trinity', 'none', 'whisperer_seed'];
    evidence.grand_truth_axis.forEach(axis => {
      if (!validAxes.includes(axis)) {
        errors.push(`${prefix} invalid grand_truth_axis: ${axis}`);
      }
    });
  }
  
  return errors;
}

/**
 * Validate character (suspect or witness)
 */
function validateCharacter(character, index, type) {
  const errors = [];
  const prefix = `${type}[${index}]`;
  
  // Required fields
  if (!character.character_id) {
    errors.push(`${prefix} missing character_id`);
  }
  if (!character.name) {
    errors.push(`${prefix} missing name`);
  }
  
  // Validate cognitive_profile (if present)
  if (character.cognitive_profile) {
    const profile = character.cognitive_profile;
    const requiredProfileFields = [
      'base_collapse_threshold',
      'base_lawyer_up_threshold',
      'aggression_tolerance',
      'rapport_affinity',
      'evidence_rigidity'
    ];
    
    requiredProfileFields.forEach(field => {
      if (typeof profile[field] !== 'number') {
        errors.push(`${prefix}.cognitive_profile missing or invalid: ${field}`);
      }
    });
  }
  
  // Validate dialogue_options (if present)
  if (character.dialogue_options && Array.isArray(character.dialogue_options)) {
    character.dialogue_options.forEach((option, optionIndex) => {
      if (!option.id) {
        errors.push(`${prefix}.dialogue_options[${optionIndex}] missing id`);
      }
      if (!option.text) {
        errors.push(`${prefix}.dialogue_options[${optionIndex}] missing text`);
      }
    });
  }
  
  return errors;
}

/**
 * Cross-validate all cases
 */
function crossValidateCases(cases) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔍 Cross-validating all cases...`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const errors = [];
  const caseIds = cases.map(c => c.caseDir);
  
  // Check for broken next_case_rules references
  cases.forEach(({ caseDir, caseData }) => {
    if (caseData.next_case_rules) {
      caseData.next_case_rules.forEach(rule => {
        if (rule.target_case_id && !caseIds.includes(rule.target_case_id)) {
          errors.push(`${caseDir}: next_case_rules references non-existent case ${rule.target_case_id}`);
        }
      });
    }
  });
  
  // Check for recurring NPCs
  const recurringNPCs = new Set();
  cases.forEach(({ caseData }) => {
    if (caseData.witnesses) {
      caseData.witnesses.forEach(witness => {
        if (witness.recurring_npc) {
          recurringNPCs.add(witness.character_id);
        }
      });
    }
  });
  
  console.log(`  📊 Found ${recurringNPCs.size} recurring NPCs: ${Array.from(recurringNPCs).join(', ')}`);
  
  return errors;
}

/**
 * Main validation function
 */
async function validateAllCases() {
  console.log('═══════════════════════════════════════');
  console.log('🔍 Comprehensive Case Validation');
  console.log('═══════════════════════════════════════');
  
  // Get all case directories
  const caseDirs = fs.readdirSync(casesDir)
    .filter(dir => fs.statSync(path.join(casesDir, dir)).isDirectory() && /^case\d{2}$/.test(dir))
    .sort();
  
  if (caseDirs.length === 0) {
    console.log('❌ No case directories found');
    process.exit(1);
  }
  
  console.log(`📂 Found ${caseDirs.length} case directories`);
  
  const allCases = [];
  
  // Validate each case
  for (const caseDir of caseDirs) {
    const result = validateCase(caseDir);
    results.total++;
    
    if (result.valid) {
      results.passed++;
      console.log(`  ✅ ${caseDir} is valid`);
    } else {
      results.failed++;
      console.error(`  ❌ ${caseDir} has ${result.errors.length} error(s)`);
    }
    
    results.warnings += result.warnings.length;
    results.errors.push(...result.errors.map(err => ({ caseDir, error: err })));
    results.errors.push(...result.warnings.map(warn => ({ caseDir, warning: warn })));
    
    // Load case data for cross-validation
    const caseFile = path.join(casesDir, caseDir, `${caseDir}.json`);
    if (fs.existsSync(caseFile)) {
      try {
        const caseData = JSON.parse(fs.readFileSync(caseFile, 'utf8'));
        allCases.push({ caseDir, caseData });
      } catch (_error) {
        // Already reported
      }
    }
  }
  
  // Cross-validate
  const crossErrors = crossValidateCases(allCases);
  results.errors.push(...crossErrors.map(err => ({ caseDir: 'cross-validation', error: err })));
  results.failed += crossErrors.length > 0 ? 1 : 0;
  
  // Print summary
  console.log(`\n═══════════════════════════════════════`);
  console.log('📊 Validation Summary');
  console.log(`═══════════════════════════════════════`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📁 Total: ${results.total}`);
  console.log(`═══════════════════════════════════════\n`);
  
  // Print errors
  if (results.errors.length > 0) {
    console.log('📝 Issues Found:\n');
    
    results.errors.forEach((issue, index) => {
      if (issue.error) {
        console.error(`  ${index + 1}. [${issue.caseDir}] ❌ ${issue.error}`);
      } else if (issue.warning) {
        console.warn(`  ${index + 1}. [${issue.caseDir}] ⚠️  ${issue.warning}`);
      }
    });
    
    console.log(`\n`);
  }
  
  // Exit with error code if validation failed
  if (results.failed > 0) {
    console.error('❌ Validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All cases passed validation!');
    process.exit(0);
  }
}

// Run validation
validateAllCases().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
