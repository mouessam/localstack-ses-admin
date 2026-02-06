const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const root = __dirname;

// Generate version.ts from package.json files
const generateVersionFile = () => {
  const uiPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const serverPkg = JSON.parse(fs.readFileSync(path.join(root, '../server/package.json'), 'utf8'));
  const versionPath = path.join(root, 'src', 'version.ts');
  const content = `export const VERSION = {\n  ui: '${uiPkg.version || '0.0.0'}',\n  server: '${serverPkg.version || '0.0.0'}',\n} as const;\n`;
  fs.writeFileSync(versionPath, content);
};

generateVersionFile();
const outdir = path.join(root, 'dist');
const indexHtml = path.join(root, 'src', 'index.html');
const isWatch = process.argv.includes('--watch');
const isDev = process.env.NODE_ENV === 'development' || isWatch;
const reloadUrl = process.env.RELOAD_URL || `http://localhost:${process.env.PORT ?? 8080}/__reload`;

const devReloadSnippet = [
  '<script>',
  '(() => {',
  '  if (typeof EventSource === "undefined") return;',
  '  const source = new EventSource("/__reload");',
  '  source.addEventListener("reload", () => window.location.reload());',
  '})();',
  '</script>',
].join('\n');

const renderIndexHtml = () => {
  const marker = '<!-- DEV-RELOAD -->';
  let html = fs.readFileSync(indexHtml, 'utf8');
  if (html.includes(marker)) {
    html = html.replace(marker, isDev ? devReloadSnippet : '');
  } else if (isDev) {
    html = html.replace('</body>', `${devReloadSnippet}\n</body>`);
  }
  fs.mkdirSync(outdir, { recursive: true });
  fs.writeFileSync(path.join(outdir, 'index.html'), html);
};

const pingReloadServer = async () => {
  if (!isDev || !isWatch) return;
  if (typeof fetch !== 'function') return;
  try {
    await fetch(reloadUrl, { method: 'POST' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Reload ping failed:', error?.message ?? error);
  }
};

const indexHtmlPlugin = {
  name: 'index-html',
  setup(build) {
    build.onEnd(() => {
      renderIndexHtml();
    });
  },
};

const reloadPlugin = {
  name: 'reload',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;
      await pingReloadServer();
    });
  },
};

// PostCSS plugin for Tailwind CSS
const postcssPlugin = {
  name: 'postcss',
  setup(build) {
    const postcss = require('postcss');
    const tailwindcss = require('tailwindcss');
    const autoprefixer = require('autoprefixer');

    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.promises.readFile(args.path, 'utf8');
      const result = await postcss([tailwindcss, autoprefixer]).process(css, {
        from: args.path,
        to: args.path,
      });
      return {
        contents: result.css,
        loader: 'css',
      };
    });
  },
};

const buildOptions = {
  entryPoints: [path.join(root, 'src', 'main.tsx')],
  bundle: true,
  minify: !isDev,
  sourcemap: isDev,
  outdir,
  entryNames: 'app',
  loader: {
    '.css': 'css',
  },
  format: 'iife',
  target: ['es2019'],
  plugins: [postcssPlugin, indexHtmlPlugin, reloadPlugin],
};

const run = async () => {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    // eslint-disable-next-line no-console
    console.log('UI watcher running.');
  } else {
    await esbuild.build(buildOptions);
  }
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
