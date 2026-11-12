import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const clientOnly = process.argv.includes('--client');
const isWindows = process.platform === 'win32';

const IGNORED_DIRS = new Set(['node_modules', '.next', 'dist', '.git']);
const FORBIDDEN_TS_PATTERNS = [
  { regex: /:\s*any\b/, message: 'Açık `: any` tip bildirimi yasaktır' },
  { regex: /\bas\s+any\b/, message: '`as any` tip zorlaması yasaktır' },
  { regex: /<any>/, message: '`<any>` jenerik tip zorlaması yasaktır' },
  { regex: /@ts-ignore\b/, message: '`@ts-ignore` yönergesi yasaktır' },
  { regex: /@ts-expect-error\b/, message: '`@ts-expect-error` yönergesi yasaktır' },
];

/**
 * Bir dizini özyinelemeli tarayarak filtrelenmiş dosyaları döndürür.
 */
function walkFiles(dirPath, collected = []) {
  for (const entry of readdirSync(dirPath)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkFiles(fullPath, collected);
    } else if (stat.isFile()) {
      collected.push(fullPath);
    }
  }
  return collected;
}

const scanRoots = clientOnly
  ? [resolve(rootDir, 'apps/client')]
  : [resolve(rootDir, 'apps'), resolve(rootDir, 'packages'), resolve(rootDir, 'scripts')];

const errors = [];

for (const base of scanRoots) {
  for (const filePath of walkFiles(base)) {
    const relPath = relative(rootDir, filePath).replaceAll('\\', '/');
    const ext = extname(filePath);

    if (ext === '.json') {
      try {
        JSON.parse(readFileSync(filePath, 'utf8'));
      } catch (err) {
        errors.push(`${relPath}: Geçersiz JSON (${err instanceof Error ? err.message : String(err)})`);
      }
      continue;
    }

    if (ext === '.ts' || ext === '.tsx' || ext === '.mjs') {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);

      lines.forEach((line, idx) => {
        if (/^(<{7}|={7}|>{7})(\s|$)/.test(line)) {
          errors.push(`${relPath}:${idx + 1}: Çözülmemiş Git birleştirme işaretçisi bulundu`);
        }
        if (ext === '.ts' || ext === '.tsx') {
          for (const rule of FORBIDDEN_TS_PATTERNS) {
            if (rule.regex.test(line)) {
              errors.push(`${relPath}:${idx + 1}: ${rule.message}`);
            }
          }
        }
      });
    }
  }
}

const typecheckArgs = clientOnly
  ? ['run', 'typecheck', '--workspace=@gyromaze/client']
  : ['run', 'typecheck'];

const tcResult = isWindows
  ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...typecheckArgs], {
      cwd: rootDir,
      stdio: 'inherit',
    })
  : spawnSync('npm', typecheckArgs, { cwd: rootDir, stdio: 'inherit' });

if (tcResult.status !== 0) {
  errors.push('TypeScript katı tip kontrolü başarısız oldu.');
}

if (errors.length > 0) {
  console.error('\n[lint] Hatalar tespit edildi:');
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log(
  `[lint] ${clientOnly ? '@gyromaze/client' : 'Tüm çalışma alanları'} statik kod ve tip denetiminden başarıyla geçti.`,
);

