var Retryable = require("./lib/retryable");

/**
 * Create a new retryable function.
 * @param {function} fn
 * @returns {Retryable}
 */
function retryable(fn) {
    var retryable = new Retryable(fn);
    return retryable.retryable;
}

/** export retryable constructor */
module.exports = retryable;
