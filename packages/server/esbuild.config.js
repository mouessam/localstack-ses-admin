const esbuild = require('esbuild');
const path = require('path');
const { createAliasPlugin } = require('@ses-admin/build-tools');

const root = __dirname;

esbuild
  .build({
    entryPoints: [path.join(root, 'src', 'main.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: ['node18'],
    minify: true,
    sourcemap: false,
    outfile: path.join(root, 'dist', 'main.js'),
    plugins: [
      createAliasPlugin(root, {
        // Server only needs @ses-admin/shared for external dependencies
        '@ses-admin/shared': '../shared/src',
      }),
    ],
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
