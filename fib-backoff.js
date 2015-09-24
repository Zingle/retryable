/**
 * @returns {number}
 */
function fibBackoff() {
    if (!this.data) this.data = [0,1];
    this.data.push(this.data[0] + this.data[1]);
    return this.data.unshift();
}

/** export fib backoff */
module.exports = fibBackoff;
