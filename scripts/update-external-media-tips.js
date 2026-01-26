#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tipsDir = path.join(__dirname, '../tips');

function isExternalMediaUrl(url) {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    // Check if it's NOT our cat.zed.tips domain
    return urlObj.hostname !== 'cat.zed.tips';
  } catch {
    return false;
  }
}

function updateTipFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const { data: frontMatter, content: body } = matter(content);

  // Check if mediaUrl exists and is external
  if (!frontMatter.mediaUrl || !isExternalMediaUrl(frontMatter.mediaUrl)) {
    return false;
  }

  // Update updatedAt to current date
  const today = new Date().toISOString().split('T')[0];
  frontMatter.updatedAt = today;

  // Write back to file
  const newContent = matter.stringify(body, frontMatter);
  fs.writeFileSync(filepath, newContent, 'utf-8');

  return true;
}

function main() {
  console.log('🔄 Updating tips with external mediaUrl...\n');

  // Find all tip files
  const tipFiles = globSync('tips/**/*.{md,mdx}', { cwd: path.join(__dirname, '..') });

  let updatedCount = 0;
  const updatedFiles = [];

  for (const file of tipFiles) {
    const fullPath = path.join(__dirname, '..', file);

    try {
      const wasUpdated = updateTipFile(fullPath);
      if (wasUpdated) {
        updatedCount++;
        updatedFiles.push(file);
        console.log(`✅ Updated: ${file}`);
      } else {
        console.log(`⏭️  Skipped: ${file} (no external mediaUrl)`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Updated ${updatedCount} file(s) with external mediaUrl`);

  if (updatedFiles.length > 0) {
    console.log('\nUpdated files:');
    updatedFiles.forEach(file => console.log(`  - ${file}`));
  }
}

main();
