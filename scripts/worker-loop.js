'use strict';

const { spawn } = require('child_process');
const path = require('path');

const WORKER_INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS ?? 60000);
const WORKER_CMD = process.env.WORKER_CMD ?? 'npm';
const WORKER_ARGS = process.env.WORKER_ARGS
  ? process.env.WORKER_ARGS.split(' ')
  : ['run', 'worker:gmail'];

const serverDir = path.resolve(__dirname, '..', 'server');

let isRunning = false;
let timer;
let currentChild = null;

const runWorker = () => {
  if (isRunning) {
    return;
  }

  isRunning = true;
  currentChild = spawn(WORKER_CMD, WORKER_ARGS, {
    cwd: serverDir,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  currentChild.on('exit', (code, signal) => {
    if (code !== 0) {
      console.warn(`[worker-loop] Worker exited with code ${code ?? 'null'}${signal ? ` (signal ${signal})` : ''}`);
    }
    isRunning = false;
    currentChild = null;
  });

  currentChild.on('error', (error) => {
    console.error('[worker-loop] Failed to spawn worker:', error);
    isRunning = false;
    currentChild = null;
  });
};

const shutdown = () => {
  clearInterval(timer);
  if (currentChild) {
    currentChild.kill('SIGINT');
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`[worker-loop] Starting Gmail worker loop. Interval: ${WORKER_INTERVAL_MS}ms`);
runWorker();
timer = setInterval(runWorker, WORKER_INTERVAL_MS);
