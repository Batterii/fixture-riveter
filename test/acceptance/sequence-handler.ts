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
