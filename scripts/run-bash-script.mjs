import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const script = process.argv[2];
const args = process.argv.slice(3);

if (!script) {
  console.error('Usage: node scripts/run-bash-script.mjs <script> [...args]');
  process.exit(2);
}

const candidates = [
  process.env.BASH_PATH,
  'bash',
  'C:\\Program Files\\Git\\bin\\bash.exe',
  'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
].filter(Boolean);

let lastError = null;

for (const candidate of candidates) {
  if (candidate.includes('\\') && !existsSync(candidate)) continue;

  const result = spawnSync(candidate, [script, ...args], {
    stdio: 'inherit',
    shell: false,
  });

  if (!result.error) {
    process.exit(result.status ?? 0);
  }

  lastError = result.error;
  if (result.error.code !== 'ENOENT') break;
}

console.error(`Unable to run ${script}: ${lastError?.message || 'bash not found'}`);
process.exit(127);
