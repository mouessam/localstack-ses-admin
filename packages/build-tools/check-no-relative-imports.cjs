const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..', '..');
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const ignoredDirs = new Set(['node_modules', 'dist', 'coverage', 'lcov-report', '.git']);
const patterns = [
  /from\s+['"](\.\/|\.\.\/)/,
  /import\(\s*['"](\.\/|\.\.\/)/,
  /require\(\s*['"](\.\/|\.\.\/)/,
];

/**
 * @param {string} dir
 * @param {string[]} matches
 */
function scan(dir, matches) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      scan(absolutePath, matches);
      continue;
    }

    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name);
    if (!codeExtensions.has(extension)) continue;

    const relativePath = path.relative(workspaceRoot, absolutePath);
    const content = fs.readFileSync(absolutePath, 'utf8');
    const lines = content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (patterns.some((pattern) => pattern.test(line))) {
        matches.push(`${relativePath}:${index + 1}:${line.trim()}`);
      }
    }
  }
}

const matches = [];
scan(workspaceRoot, matches);

if (matches.length > 0) {
  process.stderr.write(`${matches.join('\n')}\n`);
  process.stderr.write(
    '\nRelative import specifiers are not allowed. Use @ses-admin/* workspace aliases.\n',
  );
  process.exit(1);
}

process.stdout.write('No relative import specifiers found.\n');
