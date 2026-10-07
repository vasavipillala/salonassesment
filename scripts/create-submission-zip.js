/**
 * Packaging Script
 * Creates a clean, lightweight submission ZIP archive excluding node_modules, .expo, dist, and lock files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const scratchRoot = path.resolve(projectRoot, '..');
const zipOutput = path.resolve(scratchRoot, 'salon-booking-app-submission.zip');
const tempStaging = path.resolve(scratchRoot, 'temp_submission_staging');

console.log('[Packaging] Preparing clean submission ZIP archive...');

// Remove existing staging dir if exists
if (fs.existsSync(tempStaging)) {
  fs.rmSync(tempStaging, { recursive: true, force: true });
}
fs.mkdirSync(tempStaging, { recursive: true });

function copyFiltered(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const dirName = path.basename(src);
    if (['node_modules', '.expo', 'dist', '.git', 'data'].includes(dirName)) {
      return;
    }
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyFiltered(path.join(src, child), path.join(dest, child));
    }
  } else {
    const fileName = path.basename(src);
    if (fileName.endsWith('.sqlite') || fileName.endsWith('.log')) {
      return;
    }
    fs.copyFileSync(src, dest);
  }
}

// Copy project directories
console.log('[Packaging] Copying source files to staging...');
copyFiltered(projectRoot, path.join(tempStaging, 'salon-booking-app'));

// Zip using PowerShell Compress-Archive
console.log(`[Packaging] Compressing to ${zipOutput}...`);
const psCommand = `powershell -Command "Compress-Archive -Path '${path.join(tempStaging, 'salon-booking-app')}' -DestinationPath '${zipOutput}' -Force"`;
execSync(psCommand, { stdio: 'inherit' });

// Clean up staging
fs.rmSync(tempStaging, { recursive: true, force: true });

const stats = fs.statSync(zipOutput);
console.log(`[Packaging] Submission ZIP successfully created! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`[Packaging] File path: ${zipOutput}`);
