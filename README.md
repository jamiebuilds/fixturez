# fixturez

> Easily create and maintain test fixtures in the file system

- Place fixtures in any parent directory
- Find them again in your tests by their name
- Searches up the file system to find a match
- Makes it easy to move fixtures around and share between tests
- Copy them into a temporary directory
- Automatically cleanup any temporary files created

## Install

```sh
yarn add --dev fixturez
```

## Example

```
/path/to/project/
  /src/
    /fixtures/
      samples.txt
      examples/...
    /nested/
      /fixtures/
        data.json
      test.js
```

```js
// src/nested/test.js
const test = require('ava');
const fixtures = require('fixturez');
const f = fixtures(__dirname);

test('finding a fixture', t => {
  let filePath = f.find('samples.txt'); // "/path/to/project/src/fixtures/samples.txt"
  // ...
});

test('copying a file', t => {
  let tmpPath = f.copy('data.json'); //
  // "/private/var/folders/3x/jf5977fn79jbglr7rk0tq4d00000gn/T/a9fb0decd08179eb6cf4691568aa2018/data.json"
  // (from /path/to/project/src/nested/fixtures/samples.txt)
});

test('copying a directory', t => {
  let tmpPath = f.copy('examples');
  // "/private/var/folders/3x/jf5977fn79jbglr7rk0tq4d00000gn/T/4f504b9edb5ba0e89451617bf9f971dd/examples"
  // (from /path/to/project/src/fixtures/examples)
});
```

## API

```js
const fixtures = require('fixturez');
```

### `fixtures(dirname, opts)`

Create fixture functions for the current file.

```js
const f = fixtures(__dirname);
```

### `f.find(basename)`

Find and return the path to a fixture by its `basename` (directory or filename
including file extension).

```js
let dirname = f.find('directory');
let filename = f.find('file.txt');
f.find('file'); // Error, not found!
```

### `f.copy(basename)`

Copy a fixture into a temporary directory by its `basename`.

```js
let tempDir = f.copy('directory');
let tempFile = f.copy('file.txt');
```

### `f.temp()`

Create an empty temporary directory.

```js
let tempDir = f.temp();
```

### `f.cleanup()`

Deletes any temporary files you created. This will automatically be called when
the Node process closes.

### `opts.glob`

Which files to match against when searching up the file system.

Default: `{fixtures,__fixtures__}/*`

```js
const f = fixtures(__dirname, { glob: 'mocks/*.json' });
```

### `opts.cleanup`

Automatically cleanup temporary files created

Default: `true`

```js
const f = fixtures(__dirname, { cleanup: false });
```

### `opts.root`

Set the parent directory to stop searching for fixtures.

Default: `"/"`

```js
const f = fixtures(__dirname, { root: 'path/to/project' });
```
