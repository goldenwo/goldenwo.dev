// scripts/preview-server.mjs: starts `astro preview` on a port and waits until it answers.
// --ignore-lock: Astro 7 allows one tracked preview per project; this one must coexist with a developer's `npm run preview`.
import { spawn } from 'node:child_process';

export async function startPreview(port) {
  const url = `http://localhost:${port}/`;
  const child = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--port', String(port), '--ignore-lock'], {
    stdio: 'ignore',
  });
  const stop = () => child.kill();
  let spawnError;
  child.on('error', (error) => {
    spawnError = error;
  });
  for (let attempt = 0; attempt < 60; attempt++) {
    if (spawnError) throw new Error(`astro preview failed to spawn: ${spawnError.message}`);
    if (child.exitCode !== null) throw new Error(`astro preview exited early with code ${child.exitCode} on port ${port}`);
    try {
      if ((await fetch(url)).ok) return { url, stop };
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  stop();
  throw new Error(`astro preview did not start on port ${port}`);
}
