// @flow
'use strict';
const tempDir = require('temp-dir');
const tempy = require('tempy');
const path = require('path');
const fsExtra = require('fs-extra');
const onExit = require('signal-exit');
const globby = require('globby');

/*::
type Opts = {
  glob?: string | Array<string>,
  root?: string,
  cleanup?: boolean,
};
*/

function fixturez(cwd /*: string */, opts /*: Opts */ /*:: = {} */) {
  opts = opts || {};
  let glob = opts.glob || '{fixtures,__fixtures__}/*';
  let autoCleanup = typeof opts.cleanup === 'boolean' ? opts.cleanup : true;
  let rootDir = opts.root || '/';

  function find(name /*: string */) /*: string */ {
    let search = cwd;
    let match;

    do {
      let paths = globby.sync(glob, {
        cwd: search,
        root: search,
        nodir: false,
        realpath: true,
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

  let created = [];

  function temp() /*: string */ {
    let tempDir = fsExtra.realpathSync(tempy.directory());
    created.push(tempDir);
    return tempDir;
  }

  function copy(name /*: string */) /*: string */ {
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
