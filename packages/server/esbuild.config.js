const esbuild = require('esbuild');
const path = require('path');

const root = __dirname;

esbuild
  .build({
    entryPoints: [path.join(root, 'src', 'main.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: ['node24'],
    minify: true,
    sourcemap: false,
    outfile: path.join(root, 'dist', 'main.js'),
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
