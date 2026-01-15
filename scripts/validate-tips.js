#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tipsDir = path.join(__dirname, '../tips');

// Define the same schema as zed.tips
const tipsSchema = z.object({
  title: z.string().min(1, 'title is required'),
  subtitle: z.string().min(1, 'subtitle is required'),
  category: z.string().min(1, 'category is required'),
  difficulty: z.string().min(1, 'difficulty is required'),
  tags: z.array(z.string()).min(1, 'tags must have at least 1 item').max(10, 'tags cannot exceed 10 items'),
  mediaType: z.enum(['image', 'video'], { message: 'mediaType must be either "image" or "video"' }),
  mediaUrl: z.string().url('mediaUrl must be a valid URL'),
  publishedAt: z.coerce.date({ message: 'publishedAt must be a valid date in format YYYY-MM-DD' }),
  updatedAt: z.coerce.date({ message: 'updatedAt must be a valid date in format YYYY-MM-DD' }).optional(),
  featured: z.boolean().optional(),
  newInMonth: z.coerce.date({ message: 'newInMonth must be a valid date in format YYYY-MM-DD' }).optional(),
});

// Filename pattern validation: xx-xx-xx format
const filenamePattern = /^[a-z0-9]+(-[a-z0-9]+)*\.(md|mdx)$/;

/**
 * Get changed files from git diff
 */
function getChangedFiles() {
  try {
    // Get files changed between origin/main and current HEAD
    const output = execSync('git diff --name-only origin/main...HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'], // Suppress stderr
    }).trim();

    if (!output) {
      return [];
    }

    return output
      .split('\n')
      .filter(file => file.match(/tips\/.*\.(md|mdx)$/));
  } catch (error) {
    // Fallback: if we can't get git diff, check all files in tips directory
    console.warn('Warning: Could not get git diff, validating all files in tips directory');
    return getAllTipsFiles();
  }
}

/**
 * Get all tips files
 */
function getAllTipsFiles() {
  if (!fs.existsSync(tipsDir)) {
    return [];
  }

  return fs.readdirSync(tipsDir)
    .filter(file => file.match(/\.(md|mdx)$/))
    .map(file => path.join('tips', file));
}

/**
 * Validate filename format
 */
function validateFilename(filepath) {
  const filename = path.basename(filepath);
  if (!filenamePattern.test(filename)) {
    return {
      valid: false,
      error: `Invalid filename format: "${filename}". Use lowercase with hyphens (e.g., "my-tip-name.mdx")`,
    };
  }
  return { valid: true };
}

/**
 * Validate a single tip file
 */
function validateTipFile(filepath) {
  // Check filename
  const filenameValidation = validateFilename(filepath);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  // Read and parse file
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) {
    return {
      valid: false,
      error: `File not found: ${filepath}`,
    };
  }

  let content;
  try {
    content = fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    return {
      valid: false,
      error: `Failed to read file: ${error.message}`,
    };
  }

  // Parse front matter
  let frontMatter;
  try {
    const parsed = matter(content);
    frontMatter = parsed.data;
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse front matter: ${error.message}`,
    };
  }

  // Validate schema
  const validation = tipsSchema.safeParse(frontMatter);
  if (!validation.success) {
    const errors = validation.error.issues
      .map(issue => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    return {
      valid: false,
      error: `Schema validation failed:\n${errors}`,
    };
  }

  return { valid: true };
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating tips format...\n');

  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('✅ No tips files to validate');
    process.exit(0);
  }

  console.log(`Found ${changedFiles.length} tip file(s) to validate:\n`);

  let hasErrors = false;
  const results = [];

  for (const file of changedFiles) {
    const validation = validateTipFile(file);
    results.push({ file, ...validation });

    if (validation.valid) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      console.log(`   ${validation.error.split('\n').join('\n   ')}`);
      hasErrors = true;
    }
  }

  console.log(`\n${'='.repeat(60)}`);

  if (hasErrors) {
    console.log(`❌ Validation failed for ${results.filter(r => !r.valid).length} file(s)`);
    process.exit(1);
  } else {
    console.log(`✅ All ${changedFiles.length} file(s) passed validation`);
    process.exit(0);
  }
}

main();
