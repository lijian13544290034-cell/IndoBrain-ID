import { spawnSync } from 'node:child_process';

const steps = [
  ['TypeScript', ['run', 'typecheck']],
  ['Environment contract', ['run', 'verify:env']],
  ['TTS static check', ['run', 'verify:tts:static']],
  ['Vocabulary Chinese coverage', ['run', 'verify:harvest-meanings']],
  ['Vocabulary Chinese semantic quality', ['run', 'verify:harvest-semantics']],
  ['Basic Essentials integrity', ['run', 'verify:basic-essentials']],
  ['Chinese Learning template', ['run', 'verify:chinese-learning']],
  ['Golden Scene integrity', ['run', 'verify:golden']],
  ['Production build', ['run', 'build']],
];

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const [label, args] of steps) {
  console.log(`\n=== ${label} ===`);
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', npmCommand, ...args], { stdio: 'inherit' })
    : spawnSync(npmCommand, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`INDOBRAIN QA: FAIL at ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nINDOBRAIN QA: PASS');
