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
    if (this.retries === null) return true;
    else if (this.retries < 1) return false;
    else {
        --this.retries;
        return true;
    }
};

/** export RetryState class */
module.exports = RetryState;
