#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { z } from 'zod';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configDir = path.join(__dirname, '../config');

function loadConfigIds(filename) {
  const configPath = path.join(configDir, filename);
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const items = yaml.load(content);
    return items.map(item => item.id);
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error.message);
    process.exit(1);
  }
}

const validCategories = loadConfigIds('categories.yaml');
const validDifficulties = loadConfigIds('difficulties.yaml');

const filenamePattern = /^[a-z0-9]+(-[a-z0-9]+)*\.(md|mdx)$/;

const tipsSchema = z.object({
  title: z.string().min(1, 'title is required'),
  subtitle: z.string().min(1, 'subtitle is required'),
  category: z.enum(validCategories, {
    errorMap: () => ({ message: `category must be one of: ${validCategories.join(', ')}` })
  }),
  difficulty: z.enum(validDifficulties, {
    errorMap: () => ({ message: `difficulty must be one of: ${validDifficulties.join(', ')}` })
  }),

  // Auto-added after merge
  publishedAt: z.coerce.date({ message: 'publishedAt must be a valid date in format YYYY-MM-DD' }).optional(),
  updatedAt: z.coerce.date({ message: 'updatedAt must be a valid date in format YYYY-MM-DD' }).optional(),
  author: z.string().optional(),
  authorUrl: z.string().url('authorUrl must be a valid URL').optional(),

  // Optional
  tags: z.array(z.string()).optional(),
  mediaType: z.enum(['image', 'video'], { message: 'mediaType must be either "image" or "video"' }).optional(),
  mediaUrl: z.string().url('mediaUrl must be a valid URL').optional(),
});

/**
 * Get files from CLI arguments
 * @returns {string[]} Array of file paths to validate
 */
function getFilesToValidate() {
  // Get files from CLI arguments (passed after --)
  const args = process.argv.slice(2);
  return args.filter(file => file.match(/tips\/.*\.(md|mdx)$/));
}

/**
 * Validate filename format
 * @param {string} filepath - Path to the file
 * @returns {{valid: boolean, error?: string}}
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
 * Read and parse a tip file
 * @param {string} filepath - Path to the file
 * @returns {{valid: boolean, frontMatter?: object, error?: string}}
 */
function parseTipFile(filepath) {
  const fullPath = path.join(process.cwd(), filepath);

  if (!fs.existsSync(fullPath)) {
    return { valid: false, error: `File not found: ${filepath}` };
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontMatter } = matter(content);
    return { valid: true, frontMatter };
  } catch (error) {
    return { valid: false, error: `Failed to parse file: ${error.message}` };
  }
}

/**
 * Validate a single tip file
 * @param {string} filepath - Path to the file
 * @returns {{valid: boolean, error?: string}}
 */
function validateTipFile(filepath) {
  // Validate filename
  const filenameValidation = validateFilename(filepath);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  // Parse file
  const parseResult = parseTipFile(filepath);
  if (!parseResult.valid) {
    return parseResult;
  }

  // Validate schema
  const validation = tipsSchema.safeParse(parseResult.frontMatter);
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

  const filesToValidate = getFilesToValidate();

  if (filesToValidate.length === 0) {
    console.log('✅ No tips files to validate');
    process.exit(0);
  }

  console.log(`Found ${filesToValidate.length} tip file(s) to validate:\n`);

  const results = filesToValidate.map(file => ({
    file,
    ...validateTipFile(file)
  }));

  // Display results
  results.forEach(({ file, valid, error }) => {
    if (valid) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      console.log(`   ${error.split('\n').join('\n   ')}`);
    }
  });

  console.log(`\n${'='.repeat(60)}`);

  const failedCount = results.filter(r => !r.valid).length;
  if (failedCount > 0) {
    console.log(`❌ Validation failed for ${failedCount} file(s)`);
    process.exit(1);
  } else {
    console.log(`✅ All ${filesToValidate.length} file(s) passed validation`);
    process.exit(0);
  }
}

main();
