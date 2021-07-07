// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Sequence} from "../../lib/sequence";
import {SequenceHandler} from "../../lib/sequence-handler";

import {expect} from "chai";

describe("SequenceHandler", function() {
	it("can be created", function() {
		const seq = new SequenceHandler();

		expect(seq).to.be.an.instanceof(SequenceHandler);
	});

	it("is initialized with an empty list of sequences", function() {
		const seq = new SequenceHandler();

		expect(seq.sequences).to.be.empty;
	});

	describe("#registerSequence", function() {
		it("adds a new sequence to the internal list", function() {
			const seq = new SequenceHandler();
			const name = "email";
			seq.registerSequence(name);

			expect(Array.from(seq.sequences.keys())).to.deep.equal([name]);
			expect(seq.sequences.get(name)).to.be.an.instanceof(Sequence);
		});

		it("returns the new sequence", function() {
			const seq = new SequenceHandler();
			const name = "email";
			const result = seq.registerSequence(name);

			expect(result).to.be.an.instanceof(Sequence);
			expect(result.name).to.equal(name);
		});
	});

	describe("#resetSequences", function() {
		it("resets all sequences", function() {
			const sh = new SequenceHandler();
			const seq1 = sh.registerSequence("email");
			const seq2 = sh.registerSequence("password");
			seq1.next();
			seq2.next();
			seq1.next();
			seq2.next();
			sh.resetSequences();

			expect(seq1.value).to.equal(1);
			expect(seq2.value).to.equal(1);
		});
	});
});
