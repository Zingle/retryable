var slice = Array.prototype.slice,
    funk = require("funktional"),
    fib = require("./fib-backoff");

/**
 * Return a retryable function.
 * @param {function} fn
 * @param {number} [retries]
 * @param {function} [backoff]
 */
function retryable(fn, retries, backoff) {
    if (typeof retries === "function") backoff = retries, retries = null;
    retries = retries > 0 ? retries : Infinity;
    backoff = backoff || fib;

    var promiseFn, retryableFn;

    promiseFn = funk.promise(function() {
        var context = this,
            args = slice.call(arguments, 0),
            done = args.pop(),
            attemptsLeft = retries,
            backoffState = {};

        function invoke() {
            fn.apply(context, args.concat(funk.razor(
                funk.ok(done),
                function(err) {
                    if (--attemptsLeft < 0) return done(err);
                    setTimeout(invoke, backoff.call(backoffState));
                }
            )));
        }

        invoke();
    });

    retryableFn = function() {
        var done = arguments[arguments.length-1];

        // check if called with callback and infinite retry
        if (typeof done === "function" && retries === Infinity) {
            // wrap callback to throw out err object
            arguments[arguments.length-1] = function(err) {
                done.apply(null, slice.call(arguments, 1));
            }
        }

        return promiseFn.apply(this, arguments);
    };

    retryableFn.retry = function(retries) {
        return retryable(fn, retries, backoff);
    };

    retryableFn.backoff = function(backoff) {
        return retryable(fn, retries, backoff);
    };

    return retryableFn;
}

/** export retryable function */
module.exports = retryable;
