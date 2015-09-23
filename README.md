retryable
=========
Retry failed asynchronous calls or Promises.

Usage
-----
```js
var fs = require("fs"),
    retryable = require("retryable"),
    open;

// retryable wraps a function so that it retries forever by default
open = retryable(fs.open);

// retries can be limited; final err is passed to callback
open.retry(5)("/tmp/foo", function(err, fd) { /* ... */ });

// forever function retries until success; passes no err to callback
open("/tmp/foo", function(fd) { /* ... */ });

// new function returns a Promise, so callback is optional
open("/tmp/foo").then(function(fd) { /* ... */ });

// customize retry backoff
open = retryable(fs.open).backoff([0,1], function(fibs) {
    fibs.push(fibs[0] + fibs[1]);
    fibs.shift();
    return fibs[1];
});
```

API
---

### Retryable
Wrapped retryable functions implement the Retryable interface.

#### Retryable#backoff([object,] function)
Return a new retryable function with a custom backoff algorithm.  The function is
passed an object each retry and is expected to return a value indictating the
number of milliseconds to wait until the next retry.  The object can be used to
hold state between calls.

#### Retryable#forever()
Return a new retryable function which retries forever.  The callback will not
be passed an `err` object.

#### Retryable#retry(number)
Return a new retryable function which limits the number of retries.  The callback
will ba passed the `err` object from the last retry.

