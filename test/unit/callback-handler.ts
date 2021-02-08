import {CallbackHandler, extractCallbackFunction} from "../../lib/callback-handler";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("CallbackHandler", function() {
	let fixtureRiveter: FixtureRiveter;
	let cbh: CallbackHandler;

	beforeEach(function() {
		fixtureRiveter = new FixtureRiveter();
		cbh = new CallbackHandler(fixtureRiveter);
	});

	it("can be built", function() {
		expect(cbh).to.exist;
		expect(cbh.callbacks).to.be.empty;
	});

	describe("addCallback", function() {
		it("adds the callback to the internal list of callbacks", function() {
			const name = "name";
			const callback = (): any => true;
			cbh.addCallback([name], callback);
			expect(cbh.callbacks[0].name).to.equal(name);
			expect(cbh.callbacks[0].block).to.equal(callback);
		});

		it("uses the same callback for each name given", function() {
			const name1 = "name1";
			const name2 = "name2";
			const callback = (): any => true;
			cbh.addCallback([name1, name2], callback);
			expect(cbh.callbacks[0].name).to.equal(name1);
			expect(cbh.callbacks[0].block).to.equal(callback);
			expect(cbh.callbacks[1].name).to.equal(name2);
			expect(cbh.callbacks[1].block).to.equal(callback);
		});
	});

	describe("before", function() {
		it("throws if final arg isn't a function", function() {
			expect(() => cbh.before({})).to.throw("Callback needs to be a function");
		});

		it("throws if it doesn't receive any names", function() {
			expect(() => cbh.before(() => true)).to.throw("Callback needs a name");
		});

		it("prepends 'before' to each name given", function() {
			const name1 = "name1";
			const name2 = "heck";
			const callback = (): any => true;
			cbh.before(name1, name2, callback);
			expect(cbh.callbacks[0].name).to.equal("beforeName1");
			expect(cbh.callbacks[0].block).to.equal(callback);
			expect(cbh.callbacks[1].name).to.equal("beforeHeck");
			expect(cbh.callbacks[1].block).to.equal(callback);
		});
	});

	describe("after", function() {
		it("throws if final arg isn't a function", function() {
			expect(() => cbh.after({})).to.throw("Callback needs to be a function");
		});

		it("throws if it doesn't receive any names", function() {
			expect(() => cbh.after(() => true)).to.throw("Callback needs a name");
		});

		it("prepends 'after' to each name given", function() {
			const name1 = "name1";
			const name2 = "heck";
			const callback = (): any => true;
			cbh.after(name1, name2, callback);
			expect(cbh.callbacks[0].name).to.equal("afterName1");
			expect(cbh.callbacks[0].block).to.equal(callback);
			expect(cbh.callbacks[1].name).to.equal("afterHeck");
			expect(cbh.callbacks[1].block).to.equal(callback);
		});
	});
});

describe("extractCallbackFunction", function() {
	it("returns callback function", function() {
		const callback = () => true;
		const input = ["name", callback];
		const result = extractCallbackFunction(input);
		expect(result).to.equal(callback);
	});

	it("returns callback function", function() {
		const name = "name";
		const input = [name, () => true];
		extractCallbackFunction(input);
		expect(input).to.deep.equal([name]);
	});

	it("throws if the final arg isn't a function", function() {
		expect(() => extractCallbackFunction([{}])).to.throw("Callback needs to be a function");
	});

	it("throws if it doesn't receive any names", function() {
		expect(() => extractCallbackFunction([() => true])).to.throw("Callback needs a name");
	});
});
