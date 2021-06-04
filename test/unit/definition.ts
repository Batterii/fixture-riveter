// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Definition} from "../../lib/definition";
import {DummyModel} from "../support/dummy-model";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("Definition", function() {
	const name = "definition";
	let fixtureRiveter: FixtureRiveter;
	let definition: Definition<DummyModel>;

	beforeEach(function() {
		fixtureRiveter = {} as FixtureRiveter;
		definition = new Definition(name, fixtureRiveter);
	});

	it("can be created", function() {
		expect(definition).to.exist;
		expect(definition).to.be.an.instanceof(Definition);
	});
});
