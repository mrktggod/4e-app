import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function getStagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  }).trim();
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function runNodeCheck(targetPath, label) {
  const result = spawnSync(process.execPath, ['--check', targetPath], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  console.log(`JS syntax OK: ${label}`);
}

function isJavaScriptType(attrs) {
  const match = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
  if (!match) return true;
  const type = match[1].trim().toLowerCase();
  return type === 'text/javascript' || type === 'application/javascript' || type === 'module';
}

function checkInlineScripts(htmlPath) {
  const source = fs.readFileSync(htmlPath, 'utf8');
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;

  while ((match = pattern.exec(source)) !== null) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    if (/\bsrc\s*=/i.test(attrs) || !isJavaScriptType(attrs) || !body.trim()) continue;

    index += 1;
    const tempPath = path.join(os.tmpdir(), `codex-inline-script-${process.pid}-${index}.js`);
    fs.writeFileSync(tempPath, body, 'utf8');
    try {
      runNodeCheck(tempPath, `${htmlPath} inline-script#${index}`);
    } finally {
      fs.rmSync(tempPath, { force: true });
    }
  }

  if (index === 0) {
    console.log(`JS syntax check: no inline scripts in ${htmlPath}`);
  }
}

const stagedFiles = getStagedFiles();
const jsFiles = stagedFiles.filter(file => /\.(?:js|mjs|cjs)$/i.test(file));
const htmlFiles = stagedFiles.filter(file => /\.(?:html)$/i.test(file));

if (jsFiles.length === 0 && htmlFiles.length === 0) {
  console.log('JS syntax check: no staged JS or HTML files');
  process.exit(0);
}

for (const file of jsFiles) {
  runNodeCheck(file, file);
}

for (const file of htmlFiles) {
  checkInlineScripts(file);
}
