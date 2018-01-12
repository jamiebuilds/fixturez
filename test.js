// @flow
'use strict';
const test = require('ava');
const fixtures = require('./');
const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const NESTED_DIR = path.join(FIXTURES_DIR, 'nested');

let f = fixtures(NESTED_DIR);

test('f.find() in the current dir', t => {
  t.is(f.find('bar'), path.join(NESTED_DIR, '__fixtures__', 'bar'));
});

test('f.find() in the parent dir', t => {
  t.is(f.find('foo'), path.join(FIXTURES_DIR, '__fixtures__', 'foo'));
});

test('f.find() with file name', t => {
  t.is(f.find('baz.txt'), path.join(NESTED_DIR, '__fixtures__', 'baz.txt'));
});

test('f.find() throw on no match', t => {
  t.throws(() => {
    f.find('nope');
  });
});

test('f.temp()', t => {
  console.log(f.temp())
  t.truthy(fs.lstatSync(f.temp()).isDirectory());
});

test('f.copy() with directory', t => {
  let dir = f.copy('bar');
  t.truthy(fs.lstatSync(path.join(dir, 'symlink-to-file')).isSymbolicLink());
  t.truthy(fs.lstatSync(path.join(dir, 'file.txt')).isFile());
  t.truthy(fs.lstatSync(path.join(dir, 'nested')).isDirectory());
  t.truthy(fs.lstatSync(path.join(dir, 'nested', 'nested-file.txt')).isFile());
});

test('f.copy() with file', t => {
  t.truthy(fs.lstatSync(f.copy('baz.txt')).isFile());
});

test('f.copy() with directory returns realpath', t => {
  let dir = f.copy('bar');
  t.is(dir, fs.realpathSync(dir));
});

test('f.copy() with file returns realpath', t => {
  let file = f.copy('baz.txt');
  t.is(file, fs.realpathSync(file));
});

test('f.cleanup()', t => {
  let file = f.copy('baz.txt');
  t.truthy(fs.lstatSync(file).isFile());
  f.cleanup();
  t.pass();
});

test('opts.glob', t => {
  let f = fixtures(NESTED_DIR, { glob: ['other-fixtures/*'] });
  t.is(f.find('file.txt'), path.join(FIXTURES_DIR, 'other-fixtures', 'file.txt'));
});

test('opts.root', t => {
  let f = fixtures(NESTED_DIR, { root: NESTED_DIR });
  t.throws(() => {
    f.find('foo');
  });
});
