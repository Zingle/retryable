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

// can unlimit limited retryable; unlimited passes no err to callback
open.retry(5).retry()("/tmp/foo", function(fd) { /* ... */ });

// new function returns a Promise, so callback is optional
open("/tmp/foo").then(function(fd) { /* ... */ });

// customize retry backoff (default implementation shown)
open = retryable(fs.open).backoff(function(fibs) {
    if (!this.data) this.data = [0,1];
    this.data.push(this.data[0] + this.data[1]);
    return this.data.unshift();
});
```

API
---

### Retryable
Wrapped retryable functions implement the Retryable interface.

#### Retryable#backoff(function)
Return a new retryable function with a custom backoff algorithm.  The function
is bound to a RetryState instance.  To maintaine state between backoff calls,
use something like `this.data = "foo"`.

#### Retryable#retry(number)
Return a new retryable function which limits the number of retries.  The
callback will ba passed the `err` object unless the retries is Inifinity.
Passing a non-positive number will be treated like passing Infinity.

