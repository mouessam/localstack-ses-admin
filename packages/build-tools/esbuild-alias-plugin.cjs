/**
 * Shared esbuild plugin for resolving workspace path aliases.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Creates an alias plugin for esbuild.
 *
 * @param {string} packageDir The package directory using the plugin (e.g. __dirname).
 * @param {{ aliases?: Record<string, string> }} [options]
 * @returns {import('esbuild').Plugin}
 */
function createAliasPlugin(packageDir, options = {}) {
  const {
    aliases = {
      '@ses-admin/shared': '../shared/src',
      '@ses-admin/server': '../server/src',
      '@ses-admin/ui': '../ui/src',
    },
  } = options;

  return {
    name: 'workspace-alias',
    setup(build) {
      build.onResolve({ filter: /^@ses-admin\// }, (args) => {
        const parts = args.path.split('/');
        const packageName = `${parts[0]}/${parts[1]}`;
        const subPath = parts.slice(2).join('/');

        const aliasPath = aliases[packageName];
        if (!aliasPath) return undefined;

        let resolved = path.resolve(packageDir, aliasPath);
        if (subPath) {
          resolved = path.resolve(resolved, subPath);
        }

        const stat = fs.existsSync(resolved) ? fs.statSync(resolved) : null;

        if (stat && stat.isDirectory()) {
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            const indexPath = path.join(resolved, `index${ext}`);
            if (fs.existsSync(indexPath)) {
              return { path: indexPath };
            }
          }
          return { path: resolved, external: false };
        }

        if (!stat) {
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            if (fs.existsSync(resolved + ext)) {
              resolved = resolved + ext;
              break;
            }
          }
        }

        return { path: resolved };
      });
    },
  };
}

module.exports = { createAliasPlugin };
