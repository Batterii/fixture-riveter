// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {fixtureOptionsParser} from "../../lib/fixture-options-parser";
import {FixtureOptions} from "../../lib/types";

import {expect} from "chai";

describe("fixtureOptionsParser", function() {
	it("returns an array", function() {
		const result = fixtureOptionsParser();
		expect(result).to.be.an.instanceof(Array);
	});

	it("returns an empty object and undefined when given nothing", function() {
		const [resultObj, resultFn] = fixtureOptionsParser();
		expect(resultObj).to.deep.equal({});
		expect(resultFn).to.be.undefined;
	});

	it("accepts an object as the only argument", function() {
		const options = {temp: 1} as FixtureOptions;
		const [result] = fixtureOptionsParser(options);
		expect(result).to.deep.equal(options);
	});

	it("accepts a function as the only argument", function() {
		const options = (x: any) => x;
		const [, resultFn] = fixtureOptionsParser(options);
		expect(resultFn).to.be.a("function");
		expect(resultFn).to.equal(options);
	});

	it("accepts both an object and a function", function() {
		const objOption = {temp: 1} as FixtureOptions;
		const fnOption = (x: any) => x;
		const [resultObj, resultFn] = fixtureOptionsParser(objOption, fnOption);
		expect(resultObj).to.deep.equal(objOption);
		expect(resultFn).to.equal(fnOption);
	});
});
