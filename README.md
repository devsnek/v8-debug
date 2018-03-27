This module exports a mix of v8's extras and v8's deprecated Mirror interface

```js
const debug = require('v8-debug');

const s = debug.createPrivateSymbol('s');

const x = {
  [s]: 5,
};

const mirror = debug.MakeMirror(new Proxy({ a: 1 }, {}));

const one = mirror.target().property('a').value().value();

console.log(one + x[s]) // 6
```
