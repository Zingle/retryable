/**
 * @constructor
 * @param {number} retries
 * @param {function} backoff
 */
function RetryState(retries, backoff) {
    this.retries = retries;
    this.backoff = backoff;
}

/**
 * If there are retries remaining, decrement the number of retries remaining
 * and return true.  Otherwise, return false.
 * @returns {boolean}
 */
RetryState.prototype.attempt = function() {
    return --this.retries >= 0;
};

/** export RetryState class */
module.exports = RetryState;
