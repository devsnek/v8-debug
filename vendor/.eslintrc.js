'use strict';

const Module = require('module');
const path = require('path');

require('eslint-plugin-v8')({
  macroFiles: [path.resolve(__dirname, './macros.py')],
});

const ModuleFindPath = Module._findPath;
Module._findPath = (request, paths, isMain) => {
  const r = ModuleFindPath(request, paths, isMain);
  if (!r && request === 'eslint-plugin-v8')
    return require.resolve(`../node_modules/${request}`);
  return r;
};


module.exports = {
  extends: ['../.eslintrc.js'],
  plugins: ['v8'],
  parser: 'eslint-plugin-v8',
  rules: {
    'curly': ['error', 'multi-line', 'consistent'],
    'indent': ['error', 2, {
      ignoredNodes: ['Program > ExpressionStatement > FunctionExpression > BlockStatement > *'],
      FunctionDeclaration: { parameters: 'first' },
      FunctionExpression: { parameters: 'first' },
      ArrayExpression: 'first',
      CallExpression: { arguments: 'first' },
      MemberExpression: 'off',
      ObjectExpression: 'first',
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
    'quotes': 'off',
    'no-unused-expressions': 'off',

    // proper undef
    'no-undef': 'off',
    'v8/no-undef': 'error',
  },
};
