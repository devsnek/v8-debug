'use strict';

const espree = require('espree');
const walk = require('acorn/dist/walk');
const ruleComposer = require('eslint-rule-composer');
const eslint = require('eslint');

const { extend } = require('./macros');

exports.parse = (code, options) => {
  const replacements = new Set();

  code = extend(code).source;

  code = code.replace(/%(.+?)\(/g, (_, name) => {
    replacements.add(`$${name}`);
    return `$${name}(`;
  });

  const ast = espree.parse(code, options);

  walk.simple(ast, {
    CallExpression(node) {
      if (replacements.has(node.callee.name))
        node.callee.name = `%${node.callee.name.slice(1)}`;
    },
  });

  return ast;
};

exports.rules = {
  'no-undef': ruleComposer.filterReports(new eslint.Linter().getRules().get('no-undef'), ({ node }, metadata) => {
    if (/^%/.test(node.name))
      return false;
    const { macros, defines } = extend(metadata.sourceCode.text);
    const keys = [...Object.keys(macros), ...Object.keys(defines)];
    return !keys.includes(node.name);
  }),
};
