var retryable = require(".."),
    expect = require("expect.js"),
    sinon = require("sinon");

describe("retryable()", function() {
    it("should return a Retryable function", function() {
        var fn = retryable(function() {});

        expect(fn).to.be.a("function");
        expect(fn.retry).to.be.a("function");
        expect(fn.backoff).to.be.a("function");
        expect(fn.forever).to.be.a("function");
    });
});

describe("Retryable", function() {
    it("should retry until success", function(done) {
        var failures = 10,
            fn, spy, retry;
        
        fn = function(done) {
            if (--failures) done(new Error("failure " + failures));
            else done();
        };

        spy = sinon.spy(fn);
        retry = retryable(spy);

        retry(function() {
            expect(spy.callCount).to.be(10);
            done();
        });
    });

    it("should pass results without any err argument", function(done) {
        var spy, retry;

        spy = sinon.spy(function(done) {
            done(null, 42, 13);
        });
        retry = retryable(spy);

        retry(function(a, b) {
            expect(a).to.be(42);
            expect(b).to.be(13);
            done();
        });
    });

    describe("#retry(number)", function() {
        it("should return a new Retryable", function() {
            var fn = retryable(function() {}),
                withRetry = fn.retry(5);

            expect(withRetry).to.be.a("function");
            expect(withRetry).to.not.be(fn);
            expect(withRetry.retry).to.be.a("function");
            expect(withRetry.backoff).to.be.a("function");
            expect(withRetry.forever).to.be.a("function");
        });

        it("should limit the number of retries", function(done) {
            var failures = 10,
                fn, spy, wrapper;

            fn = function(done) {
                if (--failures) done(new Error("failure " + failures));
                else done();
            };

            spy = sinon.spy(fn);
            retry = retryable(spy).retry(4);

            retry(function(err) {
                expect(spy.callCount).to.be(5); // 1 + retries
                expect(err).to.be.ok();
                done();
            });
        });
    });

    describe("#forever()", function() {
        it("should return a new Retryable", function() {
            var fn = retryable(function() {}),
                withForever = fn.forever();

            expect(withForever).to.be.a("function");
            expect(withForever).to.not.be(fn);
            expect(withForever.retry).to.be.a("function");
            expect(withForever.backoff).to.be.a("function");
            expect(withForever.forever).to.be.a("function");
        });

        it("should unlimit retries", function(done) {
            var failures = 10,
                fn, spy, wrapper;

            fn = function(done) {
                if (--failures) done(new Error("failure " + failures));
                else done();
            };

            spy = sinon.spy(fn);
            retry = retryable(spy).retry(4).forever();

            retry(function() {
                expect(spy.callCount).to.be(10);
                done();
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
            expect(withBackoff.forever).to.be.a("function");
        });

        it("should be called before every retry", function(done) {
            var failures = 10,
                fn, spy, wrapper, backoffSpy;

            fn = function(done) {
                if (--failures) done(new Error("failure " + failures));
                else done();
            };

            spy = sinon.spy(fn);
            backoffSpy = sinon.spy(function() {return 0;});
            retry = retryable(spy).retry(4).backoff(backoffSpy);

            retry(function(err) {
                expect(spy.callCount).to.be(5); // 1 + retries
                expect(spy.callCount - 1).to.be(backoffSpy.callCount);
                done();
            });            
        });
    });
});
