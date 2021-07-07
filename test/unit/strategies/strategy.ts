// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {expect} from "chai";
import sinon from "sinon";
import {FixtureRiveter} from "../../../lib/fixture-riveter";
import {Strategy} from "../../../lib/strategies/strategy";

describe("Strategy", function() {
	let fr: FixtureRiveter;

	beforeEach(function() {
		fr = new FixtureRiveter();
	});

	specify("result", async function() {
		const strategy = new Strategy("name", fr, {} as any);
		const assembler = {
			toObject() {
				return "sentinel";
			},
		} as any;
		const result = await strategy.result(assembler);
		expect(result).to.equal("sentinel");
	});

	specify("relation", async function() {
		const strategy = new Strategy("name", fr, {} as any);
		const spy = sinon.spy(strategy, "relation");
		const result = await strategy.relation("stub", []);
		expect(result).to.be.undefined;
		expect(spy).to.be.calledWith("stub", []);
	});
});
