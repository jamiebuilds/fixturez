'use strict';
const tempDir = require('temp-dir');
const tempy = require('tempy');
const path = require('path');
const fsExtra = require('fs-extra');
const { onExit } = require('signal-exit');
const globby = require('globby');

/**
 * @typedef {Object} Opts
 * @property {string | ReadonlyArray<string>} [glob]
 * @property {string} [root]
 * @property {boolean} [cleanup]
 */

/**
 * @param {string} cwd
 * @param {Opts} [opts]
 */
function fixturez(cwd, opts = {}) {
  let glob = opts.glob || '{fixtures,__fixtures__}/*';
  let autoCleanup = typeof opts.cleanup === 'boolean' ? opts.cleanup : true;
  let rootDir = opts.root || '/';

  /**
   * @param {string} name
   * @returns {string}
   */
  function find(name) {
    let search = cwd;
    let match;

    do {
      let paths = globby.sync(glob, {
        cwd: search,
        onlyFiles: false,
      });

      let matches = paths.filter(filePath => {
        return path.basename(filePath) === name;
      });

      if (matches.length > 1) {
        throw new Error(`Multiple fixtures for "${name}" found: ${matches.join(', ')}`);
      }

      if (matches.length) {
        match = matches[0];
        break;
      }

      if (search === rootDir) {
        break;
      }
    } while (search = path.dirname(search));

    if (!match) {
      throw new Error(`No fixture named "${name}" found searching for ${JSON.stringify(opts.glob)} in "${cwd}" or any parent directory`);
    }

    return match;
  }

  /** @type {string[]} */
  let created = [];

  /**
   * @returns {string}
   */
  function temp() {
    let tempDir = fsExtra.realpathSync(tempy.directory());
    created.push(tempDir);
    return tempDir;
  }

  /**
   * @param {string} name
   * @returns {string}
   */
  function copy(name) {
    let dest = path.join(temp(), name);
    fsExtra.copySync(find(name), dest);
    return dest;
  }

  function cleanup() {
    let err;
    created.forEach(tempDir => {
      try {
        fsExtra.removeSync(tempDir);
      } catch (e) {
        err = e;
      }
    });
    created.length = 0;
    if (err) throw err;
  }

  if (autoCleanup) {
    onExit(cleanup);
  }

  return {
    find,
    temp,
    copy,
    cleanup,
  };
}

module.exports = fixturez;
