#!/usr/bin/env node

/**
 * Data Migration Script
 * Helps migrate data between different schema versions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const casesDir = path.join(__dirname, '..', '..', 'cases');

/**
 * Migration: Add missing fields to cases
 */
function addMissingFields() {
  console.log('🔄 Running migration: Add missing fields...\n');

  const caseDirs = fs.readdirSync(casesDir).filter(dir => 
    fs.statSync(path.join(casesDir, dir)).isDirectory() && dir.startsWith('case')
  );

  let migrated = 0;

  for (const caseDir of caseDirs) {
    const caseFile = path.join(casesDir, caseDir, `${caseDir}.json`);
    
    if (!fs.existsSync(caseFile)) continue;

    try {
      const content = fs.readFileSync(caseFile, 'utf8');
      const caseData = JSON.parse(content);
      let modified = false;

      // Add missing description to evidence
      if (caseData.evidence_list && Array.isArray(caseData.evidence_list)) {
        caseData.evidence_list.forEach(evidence => {
          if (!evidence.description) {
            evidence.description = `Evidence: ${evidence.title || evidence.id}`;
            modified = true;
          }
        });
      }

      // Add missing metadata to phs_hints
      if (caseData.phs_hints && Array.isArray(caseData.phs_hints)) {
        caseData.phs_hints.forEach(hint => {
          if (!hint.metadata) {
            hint.metadata = { reason: 'generic_hint' };
            modified = true;
          }
        });
      }

      // Add missing route_weight
      if (caseData.suspects && Array.isArray(caseData.suspects)) {
        caseData.suspects.forEach(suspect => {
          if (typeof suspect.route_weight !== 'number') {
            suspect.route_weight = 1;
            modified = true;
          }
        });
      }

      if (modified) {
        fs.writeFileSync(caseFile, JSON.stringify(caseData, null, 2), 'utf8');
        migrated++;
        console.log(`  ✅ Migrated ${caseDir}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to migrate ${caseDir}:`, error.message);
    }
  }

  console.log(`\n📊 Migration complete: ${migrated} cases updated\n`);
}

/**
 * Migration: Standardize evidence IDs
 */
function standardizeEvidenceIds() {
  console.log('🔄 Running migration: Standardize evidence IDs...\n');

  const caseDirs = fs.readdirSync(casesDir).filter(dir => 
    fs.statSync(path.join(casesDir, dir)).isDirectory() && dir.startsWith('case')
  );

  let standardized = 0;

  for (const caseDir of caseDirs) {
    const caseFile = path.join(casesDir, caseDir, `${caseDir}.json`);
    
    if (!fs.existsSync(caseFile)) continue;

    try {
      const content = fs.readFileSync(caseFile, 'utf8');
      const caseData = JSON.parse(content);
      let modified = false;

      if (caseData.evidence_list && Array.isArray(caseData.evidence_list)) {
        caseData.evidence_list.forEach((evidence, index) => {
          if (evidence.id && !/^[A-Z]{2,4}-\d+$/.test(evidence.id)) {
            const oldId = evidence.id;
            const newId = `EVD-${String(index + 1).padStart(3, '0')}`;
            evidence.id = newId;
            modified = true;
            console.log(`    ${caseDir}: ${oldId} → ${newId}`);
          }
        });
      }

      if (modified) {
        fs.writeFileSync(caseFile, JSON.stringify(caseData, null, 2), 'utf8');
        standardized++;
      }
    } catch (error) {
      console.error(`  ❌ Failed to standardize ${caseDir}:`, error.message);
    }
  }

  console.log(`\n📊 Standardization complete: ${standardized} cases updated\n`);
}

// Run migrations
console.log('═══════════════════════════════════════');
console.log('📦 Data Migration Tool');
console.log('═══════════════════════════════════════\n');

addMissingFields();
standardizeEvidenceIds();

console.log('✅ All migrations completed successfully!');
