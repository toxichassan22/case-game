#!/usr/bin/env node

/**
 * Case Schema Validation Script
 * Validates all case files against the expected schema structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const casesDir = path.join(__dirname, '..', 'cases');

let totalCases = 0;
let validCases = 0;
let errors = [];

function firstString(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim() || '';
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return [...duplicates];
}

function validateCaseFile(filePath) {
  const fileErrors = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const caseData = JSON.parse(content);
    
    // Required fields validation
    const requiredFields = ['case_id', 'title', 'maxPhsLevels', 'phs_hints', 'suspects', 'evidence_list'];
    for (const field of requiredFields) {
      if (!(field in caseData)) {
        fileErrors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate case_id format
    if (caseData.case_id && !/^case\d+$/.test(caseData.case_id)) {
      fileErrors.push(`Invalid case_id format: ${caseData.case_id}`);
    }
    
    // Validate title
    if (!caseData.title || caseData.title.length < 5) {
      fileErrors.push('Title is too short or missing');
    }
    
    // Validate maxPhsLevels
    if (typeof caseData.maxPhsLevels !== 'number' || caseData.maxPhsLevels < 1) {
      fileErrors.push('maxPhsLevels must be a positive number');
    }
    
    // Validate phs_hints
    if (!Array.isArray(caseData.phs_hints)) {
      fileErrors.push('phs_hints must be an array');
    }
    
    // Validate suspects
    if (Array.isArray(caseData.suspects)) {
      const suspectIds = caseData.suspects.map(s => firstString(s.id, s.suspect_id, s.character_id));
      const duplicateSuspectIds = findDuplicates(suspectIds);
      if (duplicateSuspectIds.length > 0) {
        fileErrors.push(`Duplicate suspect IDs: ${duplicateSuspectIds.join(', ')}`);
      }

      const missingSuspectIds = suspectIds.filter(id => !id).length;
      if (missingSuspectIds > 0) {
        fileErrors.push(`${missingSuspectIds} suspects missing id/character_id`);
      }
    }
    
    // Validate evidence_list
    if (Array.isArray(caseData.evidence_list)) {
      const evidenceIds = caseData.evidence_list.map(e => firstString(e.id, e.evidence_id, e.content_ref));
      const duplicateEvidenceIds = findDuplicates(evidenceIds);
      if (duplicateEvidenceIds.length > 0) {
        fileErrors.push(`Duplicate evidence IDs: ${duplicateEvidenceIds.join(', ')}`);
      }

      const missingEvidenceIds = evidenceIds.filter(id => !id).length;
      if (missingEvidenceIds > 0) {
        fileErrors.push(`${missingEvidenceIds} evidence items missing id/evidence_id`);
      }
    }
    
    // Check for missing evidence descriptions
    if (Array.isArray(caseData.evidence_list)) {
      const missingDescriptions = caseData.evidence_list.filter(e => {
        const description = firstString(e.description, e.summary, e.report_body, e.content);
        return description.length < 10;
      });
      if (missingDescriptions.length > 0) {
        fileErrors.push(`${missingDescriptions.length} evidence items missing proper descriptions`);
      }
    }
    
  } catch (error) {
    fileErrors.push(`Failed to parse JSON: ${error.message || String(error)}`);
  }
  
  return fileErrors;
}

// Find all case files
const caseDirs = fs.readdirSync(casesDir).filter(dir => 
  fs.statSync(path.join(casesDir, dir)).isDirectory() && dir.startsWith('case')
);

console.log('🔍 Validating case files...\n');

for (const caseDir of caseDirs) {
  const caseFile = path.join(casesDir, caseDir, `${caseDir}.json`);
  
  if (fs.existsSync(caseFile)) {
    totalCases++;
    console.log(`Checking ${caseDir}...`);
    
    const caseErrors = validateCaseFile(caseFile);
    
    if (caseErrors.length === 0) {
      validCases++;
      console.log(`  ✅ Valid\n`);
    } else {
      errors.push(`${caseDir}: ${caseErrors.join(', ')}`);
      console.log(`  ❌ Errors: ${caseErrors.join(', ')}\n`);
    }
  }
}

// Summary
console.log('═══════════════════════════════════════');
console.log(`📊 Validation Summary:`);
console.log(`   Total cases: ${totalCases}`);
console.log(`   Valid: ${validCases} ✅`);
console.log(`   Invalid: ${totalCases - validCases} ❌`);
console.log('═══════════════════════════════════════\n');

if (errors.length > 0) {
  console.log('❌ Errors found:');
  errors.forEach(err => console.log(`   - ${err}`));
  process.exit(1);
} else {
  console.log('✅ All case files are valid!');
  process.exit(0);
}
