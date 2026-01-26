#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import matter from 'gray-matter';
import { Operator } from 'opendal';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'zed-tips-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g., https://media.zed.tips

// Validate required environment variables
function validateEnv() {
  const missing = [];
  if (!R2_ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
  if (!R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
  if (!R2_PUBLIC_URL) missing.push('R2_PUBLIC_URL');

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('\nPlease configure the following in your GitHub secrets:');
    console.error('  - R2_ACCOUNT_ID: Your Cloudflare account ID');
    console.error('  - R2_ACCESS_KEY_ID: Your R2 access key ID');
    console.error('  - R2_SECRET_ACCESS_KEY: Your R2 secret access key');
    console.error('  - R2_PUBLIC_URL: Your R2 bucket public URL (e.g., https://media.zed.tips)');
    console.error('  - R2_BUCKET_NAME (optional): Your R2 bucket name (default: zed-tips-media)');
    process.exit(1);
  }
}

// Initialize OpenDAL operator for R2
// See https://docs.rs/opendal/latest/opendal/services/struct.S3.html#configuration
function createR2Operator() {
  return new Operator('s3', {
    access_key_id: R2_ACCESS_KEY_ID,
    secret_access_key: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET_NAME,
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    root: '/',
    region: 'auto',
    // Disable loading config from ~/.aws/credentials to prevent X-Amz-Security-Token issues
    disable_config_load: 'true',
  });
}

/**
 * Download a file from URL
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        downloadFile(response.headers.location)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Get content type from URL
 */
function getContentType(url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Generate a unique filename for the media file
 */
function generateFilename(originalUrl, tipFilename) {
  const url = new URL(originalUrl);
  const ext = path.extname(url.pathname) || '.jpg';
  const tipName = path.basename(tipFilename, path.extname(tipFilename));
  const hash = crypto.createHash('md5').update(originalUrl).digest('hex').substring(0, 8);

  return `${tipName}-${hash}${ext}`;
}

/**
 * Upload file to R2 using OpenDAL
 */
async function uploadToR2(operator, buffer, filename, contentType) {
  // OpenDAL write method
  await operator.write(filename, buffer);

  return `${R2_PUBLIC_URL}/${filename}`;
}

/**
 * Check if URL is already an R2 URL
 */
function isR2Url(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === new URL(R2_PUBLIC_URL).hostname;
  } catch {
    return false;
  }
}

/**
 * Process a single tip file
 */
async function processFile(operator, filepath) {
  const fullPath = path.join(process.cwd(), filepath);

  console.log(`\nProcessing: ${filepath}`);

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontMatter, content: body } = matter(content);

    // Check if mediaUrl exists and needs uploading
    if (!frontMatter.mediaUrl) {
      console.log('  ⏭️  No mediaUrl found');
      return false;
    }

    if (isR2Url(frontMatter.mediaUrl)) {
      console.log('  ⏭️  Already using R2 URL');
      return false;
    }

    console.log(`  📥 Downloading: ${frontMatter.mediaUrl}`);
    const buffer = await downloadFile(frontMatter.mediaUrl);

    const contentType = getContentType(frontMatter.mediaUrl);
    const filename = generateFilename(frontMatter.mediaUrl, filepath);

    console.log(`  📤 Uploading to R2: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
    const r2Url = await uploadToR2(operator, buffer, filename, contentType);

    // Update frontmatter
    const oldUrl = frontMatter.mediaUrl;
    frontMatter.mediaUrl = r2Url;

    // Write updated file
    const newContent = matter.stringify(body, frontMatter);
    fs.writeFileSync(fullPath, newContent, 'utf-8');

    console.log(`  ✅ Updated mediaUrl:`);
    console.log(`     Old: ${oldUrl}`);
    console.log(`     New: ${r2Url}`);

    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Uploading media files to R2 with OpenDAL...\n');

  // Validate environment
  validateEnv();

  // Get changed files from environment
  let changedFiles = process.env.CHANGED_FILES?.trim().split(/\s+/).filter(Boolean);

  if (!changedFiles || changedFiles.length === 0) {
    console.log('✅ No tip files to process');
    process.exit(0);
  }

  console.log(`Found ${changedFiles.length} file(s) to process`);

  // Create OpenDAL operator for R2
  const operator = createR2Operator();

  let uploadedCount = 0;
  const errors = [];

  // Process each file
  for (const file of changedFiles) {
    try {
      const wasUploaded = await processFile(operator, file);
      if (wasUploaded) {
        uploadedCount++;
      }
    } catch (error) {
      errors.push({ file, error: error.message });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Processed ${changedFiles.length} file(s), uploaded ${uploadedCount} media file(s)`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors encountered:`);
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
    process.exit(1);
  }

  process.exit(0);
}

main();
