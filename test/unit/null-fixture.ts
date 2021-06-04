// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {FixtureRiveter} from "../../lib/fixture-riveter";
import {NullFixture} from "../../lib/null-fixture";

import {expect} from "chai";

describe("NullFixture", function() {
	let fixtureRiveter: FixtureRiveter;
	let nullFixture: NullFixture<any>;

	beforeEach(function() {
		fixtureRiveter = new FixtureRiveter();
		nullFixture = new NullFixture(fixtureRiveter);
	});

	it("can be created", function() {
		expect(nullFixture).to.be.an.instanceof(NullFixture);
		expect(nullFixture.name).to.equal("nullFixture");
	});

	it("#getAttributes returns an empty array", function() {
		expect(nullFixture.getAttributes()).to.deep.equal([]);
	});
});
