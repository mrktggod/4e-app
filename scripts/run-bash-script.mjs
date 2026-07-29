import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const script = process.argv[2];
const args = process.argv.slice(3);

if (!script) {
  console.error('Usage: node scripts/run-bash-script.mjs <script> [...args]');
  process.exit(2);
}

const candidates = [
  process.env.BASH_PATH,
  'bash',
].filter(Boolean);

let lastError = null;
let bashWasMissing = true;

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
  if (result.error.code !== 'ENOENT') {
    bashWasMissing = false;
    break;
  }
}

if (bashWasMissing) {
  const fallback = script.endsWith('.sh')
    ? path.join(path.dirname(script), `${path.basename(script, '.sh')}.mjs`)
    : null;

  if (fallback && existsSync(fallback)) {
    const result = spawnSync(process.execPath, [fallback, ...args], {
      stdio: 'inherit',
      shell: false,
    });
    if (result.error) {
      console.error(`Unable to run ${fallback}: ${result.error.message}`);
      process.exit(127);
    }
    process.exit(result.status ?? 0);
  }
}

console.error(`Unable to run ${script}: ${lastError?.message || 'bash not found'}`);
process.exit(127);
