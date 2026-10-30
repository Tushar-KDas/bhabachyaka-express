import fs from 'fs';
import path from 'path';
import os from 'os';

const userProfile = os.homedir();
console.log('User home:', userProfile);

const candidates = [
  path.join(userProfile, '.git-credentials'),
  path.join(userProfile, '.config', 'gh', 'hosts.yml'),
  path.join(process.env.APPDATA || '', 'GitHub CLI', 'hosts.yml'),
  path.join(userProfile, '.ssh', 'id_rsa'),
  path.join(userProfile, '.ssh', 'id_ed25519'),
  path.join(userProfile, '.ssh', 'known_hosts'),
];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    console.log('EXISTS:', file);
    try {
      const stats = fs.statSync(file);
      console.log('SIZE:', stats.size);
    } catch {}
  } else {
    console.log('NOT FOUND:', file);
  }
}

if (process.env.GITHUB_TOKEN) {
  console.log('Found process.env.GITHUB_TOKEN');
}
if (process.env.GH_TOKEN) {
  console.log('Found process.env.GH_TOKEN');
}
