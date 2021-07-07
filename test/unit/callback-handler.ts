// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {CallbackHandler, extractCallback} from "../../lib/callback-handler";
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
		expect(cbh.hooks).to.be.empty;
	});

	describe("registerHook", function() {
		it("adds the callback to the internal list of callbacks", function() {
			const name = "name";
			const callback = (): any => true;
			cbh.registerHook([name], callback);
			expect(cbh.hooks[0].name).to.equal(name);
			expect(cbh.hooks[0].callback).to.equal(callback);
		});

		it("uses the same callback for each name given", function() {
			const name1 = "name1";
			const name2 = "name2";
			const callback = (): any => true;
			cbh.registerHook([name1, name2], callback);
			expect(cbh.hooks[0].name).to.equal(name1);
			expect(cbh.hooks[0].callback).to.equal(callback);
			expect(cbh.hooks[1].name).to.equal(name2);
			expect(cbh.hooks[1].callback).to.equal(callback);
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
			expect(cbh.hooks[0].name).to.equal("beforeName1");
			expect(cbh.hooks[0].callback).to.equal(callback);
			expect(cbh.hooks[1].name).to.equal("beforeHeck");
			expect(cbh.hooks[1].callback).to.equal(callback);
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
			expect(cbh.hooks[0].name).to.equal("afterName1");
			expect(cbh.hooks[0].callback).to.equal(callback);
			expect(cbh.hooks[1].name).to.equal("afterHeck");
			expect(cbh.hooks[1].callback).to.equal(callback);
		});
	});
});

describe("extractCallbackFunction", function() {
	it("returns callback function", function() {
		const callback = () => true;
		const input = ["name", callback];
		const result = extractCallback(input);
		expect(result).to.equal(callback);
	});

	it("returns callback function", function() {
		const name = "name";
		const input = [name, () => true];
		extractCallback(input);
		expect(input).to.deep.equal([name]);
	});

	it("throws if the final arg isn't a function", function() {
		expect(() => extractCallback([{}])).to.throw("Callback needs to be a function");
	});

	it("throws if it doesn't receive any names", function() {
		expect(() => extractCallback([() => true])).to.throw("Callback needs a name");
	});
});
