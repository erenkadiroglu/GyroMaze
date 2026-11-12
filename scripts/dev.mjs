import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const isProd = process.argv.includes('--prod');
const skipShared = process.argv.includes('--skip-shared');
const isWindows = process.platform === 'win32';

/**
 * İşletim sistemine uygun kabuk üzerinden npm komutu argümanlarını hazırlar.
 */
function buildNpmInvocation(npmArgs) {
  if (isWindows) {
    return {
      command: process.env.ComSpec || 'cmd.exe',
      args: ['/d', '/s', '/c', 'npm', ...npmArgs],
    };
  }
  return {
    command: 'npm',
    args: npmArgs,
  };
}

/**
 * Çocuk süreci ağaç olarak sonlandırır (Windows üzerinde alt düğüm süreçlerini de kapatır).
 */
function terminateChild(child) {
  if (!child || child.killed || child.exitCode !== null || !child.pid) {
    return;
  }
  try {
    if (isWindows) {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // Süreç zaten kapanmış olabilir.
  }
}

/**
 * Satır bazlı ön ek ekleyerek sunucu ve istemci çıktılarını okunaklı biçimde aktarır.
 */
function pipeWithPrefix(stream, label, target) {
  let buffered = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffered += chunk;
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() ?? '';
    for (const line of lines) {
      target.write(`${label} ${line}\n`);
    }
  });
  stream.on('end', () => {
    if (buffered.length > 0) {
      target.write(`${label} ${buffered}\n`);
      buffered = '';
    }
  });
}

if (!skipShared) {
  console.log('[kurulum] @gyromaze/shared paketi derleniyor...');
  const buildInvocation = buildNpmInvocation(['run', 'build:shared']);
  const buildResult = spawnSync(buildInvocation.command, buildInvocation.args, {
    cwd: rootDir,
    stdio: 'inherit',
  });
  if (buildResult.status !== 0) {
    process.exit(buildResult.status ?? 1);
  }
}

const processes = [
  {
    label: '[sunucu]',
    npmArgs: isProd
      ? ['run', 'start:prod', '--workspace=@gyromaze/server']
      : ['run', 'dev:server'],
  },
  {
    label: '[istemci]',
    npmArgs: isProd
      ? ['run', 'start', '--workspace=@gyromaze/client']
      : ['run', 'dev:client'],
  },
];

const children = [];
let shuttingDown = false;
let finalExitCode = 0;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  finalExitCode = exitCode;
  for (const child of children) {
    terminateChild(child);
  }
  setTimeout(() => process.exit(finalExitCode), 150).unref();
}

for (const proc of processes) {
  const invocation = buildNpmInvocation(proc.npmArgs);
  const child = spawn(invocation.command, invocation.args, {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);

  if (child.stdout) {
    pipeWithPrefix(child.stdout, proc.label, process.stdout);
  }
  if (child.stderr) {
    pipeWithPrefix(child.stderr, proc.label, process.stderr);
  }

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }
    const status = code ?? (signal ? 1 : 0);
    console.error(
      `${proc.label} beklenmedik biçimde sonlandı (kod: ${status}${signal ? `, sinyal: ${signal}` : ''}). Diğer süreç kapatılıyor.`,
    );
    shutdown(status === 0 ? 1 : status);
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

