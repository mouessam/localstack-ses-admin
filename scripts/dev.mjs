import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let shuttingDown = false;

const run = (args) =>
  spawn(npmCmd, args, {
    stdio: 'inherit',
    env: process.env,
  });

const server = run(['run', 'dev', '-w', '@ses-admin/server']);
const ui = run(['run', 'dev', '-w', '@ses-admin/ui']);

const shutdown = (code) => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill('SIGTERM');
  ui.kill('SIGTERM');
  process.exit(code ?? 0);
};

server.on('exit', (code) => shutdown(code ?? 0));
ui.on('exit', (code) => shutdown(code ?? 0));

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
