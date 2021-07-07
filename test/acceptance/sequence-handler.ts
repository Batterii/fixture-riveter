// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {SequenceHandler} from "../../lib/sequence-handler";

import {expect} from "chai";

describe("sequence stuff", function() {
	let SH: SequenceHandler;

	beforeEach(function() {
		SH = new SequenceHandler();
	});

	it("works", function() {
		const seq = SH.registerSequence("test");
		expect(seq.next()).to.equal(1);
		expect(seq.next()).to.equal(2);
	});

	it("works", function() {
		function *g() {
			while (true) {
				yield "a";
			}
		}

		const seq = SH.registerSequence("test", g);
		expect(seq.next()).to.equal("a");
		expect(seq.next()).to.equal("a");
	});
});
