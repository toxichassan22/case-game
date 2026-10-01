#!/usr/bin/env node

/**
 * Save Migration System
 * Migrates player save files between schema versions
 * Handles Trinity awareness, NPC memory, inventory, and route tracking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const savesDir = path.join(__dirname, '..', 'saves');

// Current save schema version
const CURRENT_SCHEMA_VERSION = 'v2.0';

/**
 * Migration pipeline - ordered by version
 */
const MIGRATIONS = [
  {
    from: 'v1.0',
    to: 'v1.1',
    name: 'Add Trinity Awareness Fields',
    migrate: migrateV10_to_V11
  },
  {
    from: 'v1.1',
    to: 'v1.2',
    name: 'Add NPC Global Memory',
    migrate: migrateV11_to_V12
  },
  {
    from: 'v1.2',
    to: 'v2.0',
    name: 'Add Inventory and Route Tracking',
    migrate: migrateV12_to_V20
  }
];

/**
 * Migration v1.0 → v1.1: Add Trinity Awareness Fields
 */
function migrateV10_to_V11(saveData) {
  console.log('  🔄 Migrating v1.0 → v1.1: Adding Trinity awareness fields...');
  
  const globalMemory = saveData.player_state.globalMemory || {};
  
  // Add Trinity awareness fields with safe defaults
  if (typeof globalMemory.trinity_awareness_score !== 'number') {
    globalMemory.trinity_awareness_score = 0;
  }
  
  if (!globalMemory.vacant_trinity_role) {
    globalMemory.vacant_trinity_role = null;
  }
  
  if (!globalMemory.first_case_closure_route) {
    globalMemory.first_case_closure_route = null;
  }
  
  if (!globalMemory.route_usage_stats) {
    globalMemory.route_usage_stats = {
      timeline: 0,
      forensics: 0,
      behavioral: 0
    };
  }
  
  saveData.player_state.globalMemory = globalMemory;
  
  // Add Trinity flags to completed cases if they're missing
  if (saveData.active_case_state?.outcome_flags) {
    const flags = saveData.active_case_state.outcome_flags;
    
    // Ensure Trinity awareness flags exist
    if (flags.success && !flags.success.includes('is_clockmaker_suspicious_1')) {
      // Don't add it, just ensure structure exists
    }
  }
  
  console.log('  ✅ Trinity awareness fields added');
  return saveData;
}

/**
 * Migration v1.1 → v1.2: Add NPC Global Memory
 */
function migrateV11_to_V12(saveData) {
  console.log('  🔄 Migrating v1.1 → v1.2: Adding NPC global memory...');
  
  const globalMemory = saveData.player_state.globalMemory || {};
  
  // Add NPC global memory structure
  if (!globalMemory.npc_global_memory) {
    globalMemory.npc_global_memory = {};
  }
  
  // Initialize recurring NPCs if they don't exist
  const recurringNPCs = [
    'char_dr_yahya',
    'char_chief_desk',
    'char_magdy',
    'char_marwan',
    'char_mustafa',
    'the_shadow'
  ];
  
  recurringNPCs.forEach(npcId => {
    if (!globalMemory.npc_global_memory[npcId]) {
      globalMemory.npc_global_memory[npcId] = {
        relationship_score: 0,
        trust_level: 0,
        interactions_count: 0,
        last_seen_case: null,
        attitude: 'neutral',
        secrets_revealed: [],
        flags: {}
      };
    }
  });
  
  saveData.player_state.globalMemory = globalMemory;
  
  console.log('  ✅ NPC global memory initialized');
  return saveData;
}

/**
 * Migration v1.2 → v2.0: Add Inventory and Route Tracking
 */
function migrateV12_to_V20(saveData) {
  console.log('  🔄 Migrating v1.2 → v2.0: Adding inventory and route tracking...');
  
  const globalMemory = saveData.player_state.globalMemory || {};
  
  // Add inventory items array
  if (!Array.isArray(globalMemory.inventory_items)) {
    globalMemory.inventory_items = [];
  }
  
  // Migrate carryover evidence from old format to inventory
  if (saveData.active_case_state?.carryover_evidence) {
    const oldCarryover = saveData.active_case_state.carryover_evidence;
    
    oldCarryover.forEach(evidence => {
      // Check if already in inventory
      const exists = globalMemory.inventory_items.find(
        item => item.evidence_id === evidence.evidence_id
      );
      
      if (!exists) {
        globalMemory.inventory_items.push({
          evidence_id: evidence.evidence_id,
          source_case_id: evidence.source_case || 'unknown',
          type: evidence.type || 'carryover',
          retained_reason: evidence.retained_reason || 'Persistent evidence',
          usable_in_future_cases: evidence.usable_in_future_cases !== false
        });
      }
    });
    
    console.log(`  📦 Migrated ${oldCarryover.length} carryover items to inventory`);
  }
  
  // Ensure route usage stats exist
  if (!globalMemory.route_usage_stats) {
    globalMemory.route_usage_stats = {
      timeline: 0,
      forensics: 0,
      behavioral: 0
    };
  }
  
  // Migrate old route tracking if it exists
  if (saveData.player_state.route_preferences) {
    const oldPrefs = saveData.player_state.route_preferences;
    
    if (oldPrefs.timeline) {
      globalMemory.route_usage_stats.timeline += oldPrefs.timeline;
    }
    if (oldPrefs.forensics) {
      globalMemory.route_usage_stats.forensics += oldPrefs.forensics;
    }
    if (oldPrefs.behavioral) {
      globalMemory.route_usage_stats.behavioral += oldPrefs.behavioral;
    }
    
    console.log('  📊 Migrated old route preferences to usage stats');
  }
  
  saveData.player_state.globalMemory = globalMemory;
  
  console.log('  ✅ Inventory and route tracking added');
  return saveData;
}

/**
 * Main migration function
 */
export async function migrateSaveFile(savePath) {
  console.log(`\n🔍 Analyzing save file: ${savePath}`);
  
  // Read save file
  if (!fs.existsSync(savePath)) {
    throw new Error(`Save file not found: ${savePath}`);
  }
  
  const saveContent = fs.readFileSync(savePath, 'utf8');
  let saveData;
  
  try {
    saveData = JSON.parse(saveContent);
  } catch (error) {
    throw new Error(`Invalid JSON in save file: ${error.message}`);
  }
  
  // Check schema version
  const currentVersion = saveData.save_version || 'v1.0';
  console.log(`📋 Current schema version: ${currentVersion}`);
  console.log(`🎯 Target schema version: ${CURRENT_SCHEMA_VERSION}`);
  
  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    console.log('✅ Save file is already up to date');
    return saveData;
  }
  
  // Find applicable migrations
  const applicableMigrations = [];
  let searchVersion = currentVersion;
  
  for (const migration of MIGRATIONS) {
    if (migration.from === searchVersion) {
      applicableMigrations.push(migration);
      searchVersion = migration.to;
      
      if (searchVersion === CURRENT_SCHEMA_VERSION) {
        break;
      }
    }
  }
  
  if (applicableMigrations.length === 0) {
    throw new Error(`No migration path from ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`);
  }
  
  console.log(`\n📦 Running ${applicableMigrations.length} migration(s)...\n`);
  
  // Apply migrations in order
  let migratedData = saveData;
  for (const migration of applicableMigrations) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Migration: ${migration.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      migratedData = migration.migrate(migratedData);
      
      // Update version
      migratedData.save_version = migration.to;
      
      console.log(`✅ Migration to ${migration.to} successful\n`);
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw new Error(`Failed to migrate from ${migration.from} to ${migration.to}: ${error.message}`);
    }
  }
  
  // Validate migrated save
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('🔍 Validating migrated save...');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  validateSaveStructure(migratedData);
  
  console.log(`\n✅ Migration complete: ${currentVersion} → ${CURRENT_SCHEMA_VERSION}`);
  
  return migratedData;
}

/**
 * Validate save structure after migration
 */
function validateSaveStructure(saveData) {
  const errors = [];
  const warnings = [];
  
  // Check root structure
  if (!saveData.save_version) {
    errors.push('Missing save_version');
  }
  
  if (!saveData.player_state) {
    errors.push('Missing player_state');
  }
  
  // Check global memory structure
  const globalMemory = saveData.player_state?.globalMemory;
  
  if (globalMemory) {
    if (typeof globalMemory.trinity_awareness_score !== 'number') {
      errors.push('trinity_awareness_score must be a number');
    }
    
    if (!Array.isArray(globalMemory.inventory_items)) {
      errors.push('inventory_items must be an array');
    }
    
    if (!globalMemory.route_usage_stats) {
      errors.push('Missing route_usage_stats');
    } else {
      const stats = globalMemory.route_usage_stats;
      if (typeof stats.timeline !== 'number') {
        errors.push('route_usage_stats.timeline must be a number');
      }
      if (typeof stats.forensics !== 'number') {
        errors.push('route_usage_stats.forensics must be a number');
      }
      if (typeof stats.behavioral !== 'number') {
        errors.push('route_usage_stats.behavioral must be a number');
      }
    }
    
    if (!globalMemory.npc_global_memory) {
      errors.push('Missing npc_global_memory');
    }
  } else {
    warnings.push('No globalMemory found - will use defaults');
  }
  
  // Report results
  if (errors.length > 0) {
    console.error('\n❌ Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Save validation failed with ${errors.length} error(s)`);
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Validation warnings:');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
  }
  
  console.log('✅ Save structure is valid');
}

/**
 * Backup save file before migration
 */
function backupSaveFile(savePath) {
  const backupPath = `${savePath}.backup.${Date.now()}`;
  
  try {
    fs.copyFileSync(savePath, backupPath);
    console.log(`💾 Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error.message}`);
    throw error;
  }
}

/**
 * Migrate all save files in saves directory
 */
export async function migrateAllSaves() {
  console.log('═══════════════════════════════════════');
  console.log('📦 Save Migration System');
  console.log('═══════════════════════════════════════\n');
  
  if (!fs.existsSync(savesDir)) {
    console.log('📂 No saves directory found. Creating...');
    fs.mkdirSync(savesDir, { recursive: true });
    console.log('✅ No saves to migrate');
    return;
  }
  
  const saveFiles = fs.readdirSync(savesDir)
    .filter(file => file.endsWith('.json') && !file.includes('.backup.'));
  
  if (saveFiles.length === 0) {
    console.log('✅ No save files found');
    return;
  }
  
  console.log(`🔍 Found ${saveFiles.length} save file(s)\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const saveFile of saveFiles) {
    const savePath = path.join(savesDir, saveFile);
    
    try {
      // Create backup
      backupSaveFile(savePath);
      
      // Migrate
      const migratedData = await migrateSaveFile(savePath);
      
      // Write migrated save
      fs.writeFileSync(savePath, JSON.stringify(migratedData, null, 2), 'utf8');
      console.log(`💾 Saved migrated file: ${saveFile}\n`);
      
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${saveFile}: ${error.message}\n`);
      failCount++;
    }
  }
  
  console.log('═══════════════════════════════════════');
  console.log('📊 Migration Summary');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total: ${saveFiles.length}`);
  console.log('═══════════════════════════════════════\n');
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Save Migration System

Usage:
  node migrate_saves.mjs [options]

Options:
  --all              Migrate all save files in saves/
  --file <path>      Migrate specific save file
  --help, -h         Show this help message

Examples:
  node migrate_saves.mjs --all
  node migrate_saves.mjs --file saves/player1.json
`);
    process.exit(0);
  }
  
  if (args.includes('--all')) {
    migrateAllSaves().catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
  } else if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const savePath = args[fileIndex + 1];
    
    if (!savePath) {
      console.error('Error: --file requires a path argument');
      process.exit(1);
    }
    
    migrateSaveFile(savePath)
      .then(migratedData => {
        const outputPath = savePath.replace('.json', '.migrated.json');
        fs.writeFileSync(outputPath, JSON.stringify(migratedData, null, 2), 'utf8');
        console.log(`\n💾 Migrated save written to: ${outputPath}`);
      })
      .catch(error => {
        console.error('Migration failed:', error.message);
        process.exit(1);
      });
  } else {
    console.log('Error: No action specified. Use --all or --file <path>');
    console.log('Use --help for usage information');
    process.exit(1);
  }
}
