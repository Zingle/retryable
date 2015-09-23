var slice = Array.prototype.slice,
    prop = require("propertize"),
    fib = require("./fib-backoff"),
    RetryState = require("./retry-state");

/**
 * Retryable object.
 * @constructor
 * @param {function} fn
 * @param {number} [retries]
 * @param {function} [backoff]
 */
function Retryable(fn, retries, backoff) {
    this.fn = fn;
    this.retries = retries;
    this.wait = backoff;

    this.retryable = function() {
        var context = this,
            args = slice.call(arguments, 0),
            state = new RetryState(retries || null, backoff || fib),
            invokeArgs = args.slice(0),
            done = invokeArgs.pop();

        function doneOrRetry(err) {
            // call 'done' on success
            if (!err) done.apply(null, [null].concat(arguments));

            // make another attempt after backoff
            else if (state.attempt()) setTimeout(invoke, state.backoff());

            // or pass final error on to 'done'
            else done(err);
        }

        function invoke() {
            var currentArgs = invokeArgs.slice(0);
            currentArgs.push(doneOrRetry);
            fn.apply(context, currentArgs);
        }

        invoke();
    };

    this.retryable.retry = this.retry.bind(this);
    this.retryable.forever = this.forever.bind(this);
    this.retryable.backoff = this.backoff.bind(this);

    prop.readonly(this, "fn");
    prop.readonly(this, "retries");
    prop.readonly(this, "wait");
    prop.readonly(this, "retryable");
}

/**
 * Return a new Retryable with limited retries.
 * @param {number} retries
 * @returns {Retryable}
 */
Retryable.prototype.retry = function(retries) {
    return new Retyable(this.fn, retries, this.wait);
};

/**
 * Return a new Retryable with no limit to retries.
 * @returns {Retryable}
 */
Retryable.prototype.forever = function() {
    return new Retryable(this.fn, null, this.wait);
};

/**
 * Return a new Retryable with custom backoff.
 * @param {function} wait
 * @returns {Retryable}
 */
Retryable.prototype.backoff = function(wait) {
    return new Retryable(this.fn, this.retries, backoff);
};


/** export Retryable class */
module.exports = Retryable;