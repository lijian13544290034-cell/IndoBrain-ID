// 向 Vercel 项目写入环境变量（进程内读取 CLI 凭据，绝不打印 token 或密钥值）
// 用法：node scripts/guest-env-set.mjs <PROJECT_ID> <NAME> <ENV> <VALUE> [--git-branch BRANCH]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

function readToken() {
  const candidates = [
    path.join(homedir(), 'AppData', 'Roaming', 'com.vercel.cli', 'Data', 'auth.json'),
    path.join(homedir(), 'AppData', 'Local', 'com.vercel.cli', 'auth.json'),
    path.join(homedir(), '.local', 'share', 'com.vercel.cli', 'auth.json'),
  ];
  for (const file of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8'));
      if (parsed.token) return parsed.token;
    } catch { /* try next */ }
  }
  throw new Error('vercel cli token not found');
}

const [projectId, name, env, value, , branch] = process.argv.slice(2);
if (!projectId || !name || !env || value === undefined) {
  console.error('usage: node scripts/guest-env-set.mjs <PROJECT_ID> <NAME> <ENV> <VALUE> [--git-branch BRANCH]');
  process.exit(2);
}
const token = readToken();
const response = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=team_fDmqGFyhWDrhWQj3b8PVMiYw&upsert=true`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  body: JSON.stringify({
    key: name,
    value,
    type: 'encrypted',
    target: [env],
    ...(branch ? { gitBranch: branch } : {}),
  }),
});
const body = await response.json().catch(() => null);
console.log(response.status === 201 ? `OK ${name} -> ${env}${branch ? ` (${branch})` : ''}` : `FAIL ${response.status} ${JSON.stringify(body?.error?.message || body).slice(0, 200)}`);
process.exitCode = response.status === 201 ? 0 : 1;
