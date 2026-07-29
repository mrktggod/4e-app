import { spawnSync } from 'node:child_process';

const rootResult = spawnSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
  shell: false,
});

if (rootResult.error || rootResult.status !== 0) {
  if (rootResult.stdout) process.stdout.write(rootResult.stdout);
  if (rootResult.stderr) process.stderr.write(rootResult.stderr);
  console.error(`Portable path check failed to resolve repo root: ${rootResult.error?.message || 'git rev-parse failed'}`);
  process.exit(rootResult.status || 127);
}

const repoRoot = rootResult.stdout.trim();

const args = [
  'grep',
  '-n',
  '-I',
  '-E',
  '[Cc]:\\\\[[:alnum:]_.-]',
  '--',
  '.',
  ':!:docs/**',
  ':!:pm/**',
  ':!:cowork-docs/**',
  ':!:*DEVELOPMENT_HISTORY*.md',
  ':!:*DEVELOPMENT_LOG*.md',
  ':!:*ROADMAP*.md',
];

const result = spawnSync('git', args, {
  encoding: 'utf8',
  shell: false,
  cwd: repoRoot,
});

if (result.error) {
  console.error(`Portable path check failed to run git grep: ${result.error.message}`);
  process.exit(127);
}

if (result.status === 0) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  console.error();
  console.error('Found forbidden absolute C-drive project paths in tracked files.');
  console.error('Use repo-relative paths or PATH-resolved tools instead.');
  process.exit(1);
}

if (result.status === 1) {
  console.log('Portable path check passed.');
  process.exit(0);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
