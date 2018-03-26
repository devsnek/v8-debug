'use strict';

const { readFileSync } = require('fs');
const path = require('path');

const CONST_PATTERN = /^define\s+([a-zA-Z0-9_]+)\s*=\s*([^;]*);$/mg;
const INLINE_MACRO_PATTERN = /^macro\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*=\s*([^;]*);$/mg;
const MACRO_PATTERN = /^macro\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\n(.*)\nendmacro$/mg;

function parse(source) {
  const defines = {};
  const macros = {};

  CONST_PATTERN.lastIndex = 0;
  source = source.replace(CONST_PATTERN, (_, name, val) => {
    defines[name] = val;
    return `// DEF ${name} = ${val};`;
  });

  INLINE_MACRO_PATTERN.lastIndex = 0;
  source = source.replace(INLINE_MACRO_PATTERN, (_, name, args, body) => {
    args = args.split(', ').map((a) => a.trim());
    macros[name] = {
      args,
      body,
    };
    return `// MC ${name}(${args.join(', ')}) = ${body};`;
  });

  MACRO_PATTERN.lasIndex = 0;
  source = source.replace(MACRO_PATTERN, (_, name, args, body) => {
    args = args.split(', ').map((a) => a.trim());
    macros[name] = {
      args,
      body,
    };
    return `/* MC ${name}(${args.join(', ')})\n${body}\nENDMC */`;
  });

  return { defines, macros, source };
}

const macrosSource = readFileSync(path.resolve(__dirname, '../vendor/macros.py'), 'utf8');
const { defines, macros } = parse(macrosSource);

module.exports = {
  defines, macros,
  extend(source) {
    const out = parse(source);
    return {
      defines: { ...out.defines, ...defines },
      macros: { ...out.macros, ...macros },
      source: out.source,
    };
  },
};
