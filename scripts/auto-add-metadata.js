#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract GitHub username from git commit history
 * Supports GitHub noreply email formats
 */
function getGitAuthor(filepath) {
  try {
    const fullPath = path.join(process.cwd(), filepath);
    const email = execSync(
      `git log -1 --format="%ae" -- "${fullPath}"`,
      { encoding: 'utf-8' }
    ).trim();

    // Extract username from GitHub noreply email
    // Format: 123456+username@users.noreply.github.com or username@users.noreply.github.com
    const githubMatch = email.match(/^(\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
    if (githubMatch) {
      return githubMatch[2];
    }

    const username = email.split('@')[0];
    return username || null;
  } catch (error) {
    console.warn(`  Warning: Could not get git author for ${filepath}`);
    return null;
  }
}

/**
 * Construct GitHub profile URL
 */
function getAuthorUrl(username) {
  if (!username) return null;
  return `https://github.com/${username}`;
}

/**
 * Add metadata fields to a single tip file
 * Only adds missing fields, preserves existing values
 */
function addMetadataToFile(filepath) {
  const fullPath = path.join(process.cwd(), filepath);

  console.log(`\nProcessing: ${filepath}`);

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontMatter, content: body } = matter(content);

    let modified = false;
    const changes = [];

    // Add publishedAt only if missing
    if (!frontMatter.publishedAt) {
      frontMatter.publishedAt = getCurrentDate();
      modified = true;
      changes.push(`Added publishedAt: ${frontMatter.publishedAt}`);
    }

    // Always update updatedAt
    const newUpdatedAt = getCurrentDate();
    if (frontMatter.updatedAt !== newUpdatedAt) {
      frontMatter.updatedAt = newUpdatedAt;
      modified = true;
      changes.push(`Updated updatedAt: ${newUpdatedAt}`);
    }

    // Add author only if missing
    if (!frontMatter.author) {
      const author = getGitAuthor(filepath);
      if (author) {
        frontMatter.author = author;
        modified = true;
        changes.push(`Added author: ${author}`);
      }
    }

    // Add authorUrl only if missing
    if (!frontMatter.authorUrl && frontMatter.author) {
      const authorUrl = getAuthorUrl(frontMatter.author);
      if (authorUrl) {
        frontMatter.authorUrl = authorUrl;
        modified = true;
        changes.push(`Added authorUrl: ${authorUrl}`);
      }
    }

    if (modified) {
      const newContent = matter.stringify(body, frontMatter);
      fs.writeFileSync(fullPath, newContent, 'utf-8');

      console.log('  Changes:');
      changes.forEach(change => console.log(`    - ${change}`));
      console.log('  ✅ Updated');
    } else {
      console.log('  ⏭️  No changes needed');
    }

    return modified;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🤖 Auto-adding metadata fields...\n');

  let changedFiles = process.env.CHANGED_FILES?.trim().split(/\s+/).filter(Boolean);

  if (!changedFiles || changedFiles.length === 0) {
    console.log('✅ No tip files to process');
    process.exit(0);
  }

  console.log(`Found ${changedFiles.length} file(s) to process`);

  let modifiedCount = 0;

  changedFiles.forEach(file => {
    if (addMetadataToFile(file)) {
      modifiedCount++;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Processed ${changedFiles.length} file(s), modified ${modifiedCount}`);
  process.exit(0);
}

main();
