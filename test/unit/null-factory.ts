import {FixtureRiveter} from "../../lib/fixture-riveter";
import {NullFixture} from "../../lib/null-fixture";

import {expect} from "chai";

describe("NullFixture", function() {
	let fixtureRiveter: FixtureRiveter;
	let nullFixture: NullFixture;

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
