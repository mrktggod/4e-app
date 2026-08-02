import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function getStagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  }).trim();
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function getTrackedFiles() {
  const output = execFileSync('git', ['ls-files'], {
    encoding: 'utf8',
  }).trim();
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function runNodeCheck(targetPath, label) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--check', targetPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => resolve({ label, status: 1, stdout, stderr: `${stderr}${error.message}\n` }));
    child.on('close', status => resolve({ label, status: status ?? 1, stdout, stderr }));
  });
}

function isJavaScriptType(attrs) {
  const match = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
  if (!match) return true;
  const type = match[1].trim().toLowerCase();
  return type === 'text/javascript' || type === 'application/javascript' || type === 'module';
}

function collectInlineScripts(htmlPath, tempDir, targets) {
  const source = fs.readFileSync(htmlPath, 'utf8');
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let htmlScriptIndex = 0;

  while ((match = pattern.exec(source)) !== null) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    if (/\bsrc\s*=/i.test(attrs) || !isJavaScriptType(attrs) || !body.trim()) continue;

    htmlScriptIndex += 1;
    const tempPath = path.join(tempDir, `${targets.length}.js`);
    fs.writeFileSync(tempPath, body, 'utf8');
    targets.push({ targetPath: tempPath, label: `${htmlPath} inline-script#${htmlScriptIndex}` });
  }
}

async function runChecks(targets) {
  const workerCount = Math.max(1, Math.min(8, os.availableParallelism?.() || 4, targets.length));
  const failures = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < targets.length) {
      const target = targets[nextIndex];
      nextIndex += 1;
      const result = await runNodeCheck(target.targetPath, target.label);
      if (result.status !== 0) failures.push(result);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  for (const failure of failures) {
    console.error(`JS syntax failed: ${failure.label}`);
    if (failure.stdout) process.stdout.write(failure.stdout);
    if (failure.stderr) process.stderr.write(failure.stderr);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
    return;
  }
  console.log(`JS syntax OK: ${targets.length} scripts checked with ${workerCount} workers`);
}

const checkAll = process.argv.includes('--all');
const candidateFiles = checkAll ? getTrackedFiles() : getStagedFiles();
const jsFiles = candidateFiles.filter(file => /\.(?:js|mjs|cjs)$/i.test(file));
const htmlFiles = candidateFiles.filter(file => /\.(?:html)$/i.test(file));

if (jsFiles.length === 0 && htmlFiles.length === 0) {
  console.log(`JS syntax check: no ${checkAll ? 'tracked' : 'staged'} JS or HTML files`);
  process.exit(0);
}

console.log(`JS syntax check: ${checkAll ? 'all tracked' : 'staged'} files (${jsFiles.length} JS, ${htmlFiles.length} HTML)`);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'four-inline-scripts-'));
const targets = jsFiles.map(file => ({ targetPath: file, label: file }));

for (const file of htmlFiles) {
  collectInlineScripts(file, tempDir, targets);
}

try {
  await runChecks(targets);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
