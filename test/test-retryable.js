var retryable = require(".."),
    expect = require("expect.js"),
    sinon = require("sinon");

function fail(count) {
    return function() {
        var done = Array.prototype.pop.call(arguments);
        if (--count) done(new Error("failures left " + count));
        else done();
    }
}

describe("retryable()", function() {
    it("should return a Retryable function", function() {
        var fn = retryable(function() {});

        expect(fn).to.be.a("function");
        expect(fn.retry).to.be.a("function");
        expect(fn.backoff).to.be.a("function");
    });
});

describe("Retryable", function() {
    it("should retry until success", function(done) {
        var spy, retry;
        
        spy = sinon.spy(fail(10));
        retry = retryable(spy);

        retry(function() {
            expect(spy.callCount).to.be(10);
            done();
        });
    });

    it("should pass results without any err argument", function(done) {
        var retry;

        retry = retryable(function(done) {
            done(null, 42, 13);
        });
  
        retry(function(a, b) {
            expect(a).to.be(42);
            expect(b).to.be(13);
            done();
        });
    });

    describe("#retry", function() {
        it("should return a new Retryable", function() {
            var fn = retryable(function() {}),
                withRetry = fn.retry(5);

            expect(withRetry).to.be.a("function");
            expect(withRetry).to.not.be(fn);
            expect(withRetry.retry).to.be.a("function");
            expect(withRetry.backoff).to.be.a("function");
        });

        describe("(number)", function() {
            it("should limit the number of retries", function(done) {
                var spy, retry;

                spy = sinon.spy(fail(10));
                retry = retryable(spy).retry(4);

                retry(function(err) {
                    expect(spy.callCount).to.be(5); // 1 + retries
                    expect(err).to.be.ok();
                    done();
                });
            });
        });

        describe("()", function() {
            it("should unlimit retries", function(done) {
                var spy, retry;

                spy = sinon.spy(fail(10));
                retry = retryable(spy).retry(4).retry();

                retry(function() {
                    expect(spy.callCount).to.be(10);
                    done();
                });
            });
        });
    });

    describe("#backoff(function)", function() {
        it("should return a new Retryable", function() {
            var fn = retryable(function() {}),
                withBackoff = fn.backoff(function() {return 0;});

            expect(withBackoff).to.be.a("function");
            expect(withBackoff).to.not.be(fn);
            expect(withBackoff.retry).to.be.a("function");
            expect(withBackoff.backoff).to.be.a("function");
        });

        it("should be called before every retry", function(done) {
            var spy, retry, backoff;

            spy = sinon.spy(fail(10));
            backoff = sinon.spy(function() {return 0;});
            retry = retryable(spy).retry(4).backoff(backoff);

            retry(function(err) {
                expect(spy.callCount).to.be(5); // 1 + retries
                expect(spy.callCount - 1).to.be(backoff.callCount);
                done();
            });            
        });
    });
});
