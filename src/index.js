'use strict';

const { setFlagsFromString } = require('v8');
const { readFileSync } = require('fs');
const { Script } = require('vm');

setFlagsFromString('--allow-natives-syntax');

const { extend } = require('../tools/macros');


const namespace = {
  iterator_symbol: Symbol.iterator,
};
const utils = {};

const expandMacros = (macros, source) => {
  const lines = source.split('\n');
  for (const [k, macro] of Object.entries(macros)) {
    for (var i = 0; i < lines.length; i++) {
      const line = lines[i];
      const index = line.indexOf(`${k}(`);
      if (index === -1 || /^\/\/ MC /.test(line) || /^\/\* MC /.test(line))
        continue;

      let level = 1;
      let end = index + k.length + 1;
      const args = [''];
      let argIndex = 0;
      while (end < line.length && level > 0) {
        const char = line[end];
        if (['(', '[', '{'].includes(char))
          level++;
        else if ([')', '[', '}'].includes(char))
          level--;
        else if (char === ',')
          args[++argIndex] = '';
        else
          args[argIndex] += char;
        end++;
      }
      let body = String(macro.body);
      for (var j = 0; j < args.length; j++)
        body = body.replace(new RegExp(macro.args[j], 'g'), args[j]);

      lines[i] = line.slice(0, index) + expandMacros(macros, body) + line.slice(end, line.length);
    }
  }
  return lines.join('\n');
};

const load = (name) => {
  const filename = require.resolve(name);

  let { defines, macros, source } = extend(readFileSync(filename, 'utf8'));

  source = expandMacros(macros, source);

  for (const [k, v] of Object.entries(defines))
    source = source.replace(new RegExp(`([^_])${k}([^_])`, 'g'), (_, x, y) => `${x}${v}${y}`);

  const fn = new Script(source, { filename }).runInThisContext();
  if (typeof fn === 'function')
    return fn(global, utils, namespace, namespace);
  return fn;
};

load('../vendor/prologue');
load('../vendor/mirrors');

utils.PostNatives(utils);

module.exports = namespace;
