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
            fn, spy, wrapper;
        
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
});
