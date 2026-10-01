#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates backups of the SQLite database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'server', 'database.sqlite');
const backupDir = path.join(__dirname, '..', '..', 'backups');

/**
 * Create a backup of the database
 */
function createBackup() {
  console.log('📦 Creating database backup...\n');

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('✅ Created backups directory\n');
  }

  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    process.exit(1);
  }

  // Create backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `database-${timestamp}.sqlite`;
  const backupPath = path.join(backupDir, backupFilename);

  try {
    // Copy database file
    fs.copyFileSync(dbPath, backupPath);

    // Get file size
    const stats = fs.statSync(backupPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ Backup created successfully!');
    console.log(`📁 Location: ${backupPath}`);
    console.log(`📊 Size: ${sizeInMB} MB\n`);

    // Clean up old backups (keep last 10)
    cleanupOldBackups();

  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    process.exit(1);
  }
}

/**
 * Clean up old backups, keeping only the most recent ones
 */
function cleanupOldBackups(keep = 10) {
  console.log(`🧹 Cleaning up old backups (keeping last ${keep})...\n`);

  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-') && file.endsWith('.sqlite'))
      .sort()
      .reverse();

    if (files.length > keep) {
      const toDelete = files.slice(keep);
      toDelete.forEach(file => {
        const filePath = path.join(backupDir, file);
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Deleted: ${file}`);
      });
      console.log(`\n✅ Cleaned up ${toDelete.length} old backup(s)\n`);
    } else {
      console.log(`✅ No cleanup needed (${files.length} backup(s) exist)\n`);
    }
  } catch (error) {
    console.error('⚠️  Failed to cleanup old backups:', error.message);
  }
}

/**
 * List all backups
 */
function listBackups() {
  console.log('📋 Available backups:\n');

  if (!fs.existsSync(backupDir)) {
    console.log('No backups found.\n');
    return;
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('database-') && file.endsWith('.sqlite'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('No backups found.\n');
    return;
  }

  files.forEach((file, index) => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    const date = new Date(stats.mtime).toLocaleString();

    console.log(`${index + 1}. ${file}`);
    console.log(`   Size: ${sizeInMB} MB`);
    console.log(`   Date: ${date}\n`);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'backup';

switch (command) {
  case 'backup':
  case 'create':
    createBackup();
    break;
  case 'list':
  case 'show':
    listBackups();
    break;
  case 'help':
    console.log('Usage:');
    console.log('  node backup.mjs [command]\n');
    console.log('Commands:');
    console.log('  backup, create  - Create a new backup (default)');
    console.log('  list, show      - List all backups');
    console.log('  help            - Show this help message\n');
    break;
  default:
    console.error('Unknown command:', command);
    console.log('Run "node backup.mjs help" for usage information');
    process.exit(1);
}

