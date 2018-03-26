'use strict';

const Module = require('module');
const path = require('path');

const ModuleFindPath = Module._findPath;
const hacks = ['eslint-plugin-v8'];
Module._findPath = (request, paths, isMain) => {
  const r = ModuleFindPath(request, paths, isMain);
  if (!r && hacks.includes(request))
    return require.resolve(`../tools/${request}`);
  return r;
};

let parent;
let level = 1;
while (!parent) {
  const p = path.resolve(`./${'../'.repeat(level)}`);
  try {
    parent = require.resolve(`${p}/.eslintrc`);
    break;
  } catch (err) {
    if (p === '/')
      break;
    level++;
  }
}

const macros = require('../tools/macros');

const gReduce = (obj) => {
  const g = {};
  for (const k in obj)
    g[k] = false;
  return g;
};

module.exports = {
  extends: [parent],
  plugins: ['v8'],
  parser: '../tools/eslint-plugin-v8.js',
  globals: {
    ...gReduce(macros.macros),
    ...gReduce(macros.defines),
  },
  rules: {
    'curly': ['error', 'multi-line', 'consistent'],
    'indent': ['error', 2, {
      ignoredNodes: ['Program > ExpressionStatement > FunctionExpression > BlockStatement > *'],
      FunctionDeclaration: { parameters: 'first' },
    }],
    'prefer-rest-params': 'off',
    'no-shadow': 'off',
    'strict': 'off',
    'padded-blocks': 'off',
    'func-names': 'off',
    'no-redeclare': 'off',
    'no-unused-var': 'off',
    'valid-jsdoc': 'off',
    'nonblock-statement-body-position': ['error', 'beside'],
    'no-return-assign': 'off',
    'eqeqeq': 'off',
    'no-unmodified-loop-condition': 'off',
    'no-mixed-operators': 'off',
    'no-unused-vars': 'off',
    'func-style': 'off',
    'no-empty-function': 'off',

    // proper undef
    'no-undef': 'off',
    'v8/no-undef': 'error',
  },
};
